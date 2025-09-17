import { useState, useCallback } from 'react';
import { useAccount, useWalletClient, useContractWrite, useContractRead } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import { CONTRACT_CONFIG, getContractAddress, getContractABI } from '@/lib/contract';

export interface ProposalData {
  id: string;
  title: string;
  description: string;
  category: string;
  amount: number;
  proposer: string;
  beneficiary: string;
  startTime: number;
  endTime: number;
  executionTime?: number;
  isActive: boolean;
  isExecuted: boolean;
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
}

export interface MemberData {
  address: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  joinTime: number;
  lastActivity: number;
  votingPower: number;
  reputation: number;
}

export const useDaoGovernance = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { toast } = useToast();
  
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [members, setMembers] = useState<MemberData[]>([]);

  // Contract write functions
  const { writeAsync: createProposalWrite } = useContractWrite({
    address: getContractAddress(),
    abi: getContractABI(),
    functionName: 'createProposal',
  });

  const { writeAsync: castVoteWrite } = useContractWrite({
    address: getContractAddress(),
    abi: getContractABI(),
    functionName: 'castVote',
  });

  const { writeAsync: executeProposalWrite } = useContractWrite({
    address: getContractAddress(),
    abi: getContractABI(),
    functionName: 'executeProposal',
  });

  // Contract read functions
  const { data: proposalInfo } = useContractRead({
    address: getContractAddress(),
    abi: getContractABI(),
    functionName: 'getProposalInfo',
    args: [0], // This would be dynamic
  });

  const { data: memberInfo } = useContractRead({
    address: getContractAddress(),
    abi: getContractABI(),
    functionName: 'getMemberInfo',
    args: address ? [address] : undefined,
  });

  // Create a new proposal
  const createProposal = useCallback(async (
    title: string,
    description: string,
    category: string,
    amount: number,
    beneficiary: string,
    duration: number
  ): Promise<ProposalData | null> => {
    if (!address || !walletClient) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create proposals",
        variant: "destructive"
      });
      return null;
    }

    setIsCreatingProposal(true);

    try {
      // Call the smart contract to create proposal
      const tx = await createProposalWrite({
        args: [title, description, category, amount, beneficiary, duration]
      });

      // Wait for transaction confirmation
      const receipt = await walletClient.waitForTransactionReceipt({
        hash: tx.hash,
      });

      if (receipt.status === 'success') {
        // Create proposal data object
        const proposalData: ProposalData = {
          id: Date.now().toString(), // In real implementation, this would come from the contract
          title,
          description,
          category,
          amount,
          proposer: address,
          beneficiary,
          startTime: Date.now(),
          endTime: Date.now() + (duration * 1000),
          isActive: true,
          isExecuted: false,
          votesFor: 0,
          votesAgainst: 0,
          totalVotes: 0
        };

        // Add to proposals list
        setProposals(prev => [...prev, proposalData]);

        toast({
          title: "Proposal Created Successfully",
          description: `Proposal "${title}" has been created and is now open for voting`,
        });

        return proposalData;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast({
        title: "Proposal Creation Failed",
        description: "Failed to create proposal on blockchain",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsCreatingProposal(false);
    }
  }, [address, walletClient, createProposalWrite, toast]);

  // Cast a vote on a proposal
  const castVote = useCallback(async (
    proposalId: string,
    voteChoice: number, // 1 for for, 2 for against
    votingPower: number
  ): Promise<boolean> => {
    if (!address || !walletClient) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to vote",
        variant: "destructive"
      });
      return false;
    }

    setIsVoting(true);

    try {
      // Call the smart contract to cast vote
      const tx = await castVoteWrite({
        args: [parseInt(proposalId), voteChoice, votingPower]
      });

      // Wait for transaction confirmation
      const receipt = await walletClient.waitForTransactionReceipt({
        hash: tx.hash,
      });

      if (receipt.status === 'success') {
        // Update proposal votes in local state
        setProposals(prev => prev.map(proposal => {
          if (proposal.id === proposalId) {
            return {
              ...proposal,
              votesFor: voteChoice === 1 ? proposal.votesFor + votingPower : proposal.votesFor,
              votesAgainst: voteChoice === 2 ? proposal.votesAgainst + votingPower : proposal.votesAgainst,
              totalVotes: proposal.totalVotes + votingPower
            };
          }
          return proposal;
        }));

        toast({
          title: "Vote Cast Successfully",
          description: `Your vote has been recorded for proposal "${proposalId}"`,
        });

        return true;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Error casting vote:', error);
      toast({
        title: "Vote Failed",
        description: "Failed to cast vote on blockchain",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsVoting(false);
    }
  }, [address, walletClient, castVoteWrite, toast]);

  // Execute a proposal
  const executeProposal = useCallback(async (proposalId: string): Promise<boolean> => {
    if (!address || !walletClient) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to execute proposals",
        variant: "destructive"
      });
      return false;
    }

    setIsExecuting(true);

    try {
      // Call the smart contract to execute proposal
      const tx = await executeProposalWrite({
        args: [parseInt(proposalId)]
      });

      // Wait for transaction confirmation
      const receipt = await walletClient.waitForTransactionReceipt({
        hash: tx.hash,
      });

      if (receipt.status === 'success') {
        // Update proposal status in local state
        setProposals(prev => prev.map(proposal => {
          if (proposal.id === proposalId) {
            return {
              ...proposal,
              isExecuted: true,
              isActive: false,
              executionTime: Date.now()
            };
          }
          return proposal;
        }));

        toast({
          title: "Proposal Executed Successfully",
          description: `Proposal "${proposalId}" has been executed and funds allocated`,
        });

        return true;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Error executing proposal:', error);
      toast({
        title: "Execution Failed",
        description: "Failed to execute proposal on blockchain",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsExecuting(false);
    }
  }, [address, walletClient, executeProposalWrite, toast]);

  // Get proposal information from blockchain
  const getProposalInfo = useCallback(async (proposalId: string): Promise<ProposalData | null> => {
    try {
      // This would call the contract's getProposalInfo function
      // For now, we'll return mock data
      const proposal = proposals.find(p => p.id === proposalId);
      return proposal || null;
    } catch (error) {
      console.error('Error getting proposal info:', error);
      return null;
    }
  }, [proposals]);

  // Get member information
  const getMemberInfo = useCallback(async (memberAddress: string): Promise<MemberData | null> => {
    try {
      // This would call the contract's getMemberInfo function
      // For now, we'll return mock data
      const member = members.find(m => m.address === memberAddress);
      return member || null;
    } catch (error) {
      console.error('Error getting member info:', error);
      return null;
    }
  }, [members]);

  // Get active proposals
  const getActiveProposals = useCallback(() => {
    return proposals.filter(proposal => proposal.isActive && !proposal.isExecuted);
  }, [proposals]);

  // Get executed proposals
  const getExecutedProposals = useCallback(() => {
    return proposals.filter(proposal => proposal.isExecuted);
  }, [proposals]);

  // Get proposals by category
  const getProposalsByCategory = useCallback((category: string) => {
    return proposals.filter(proposal => proposal.category === category);
  }, [proposals]);

  // Get user's voting history
  const getUserVotingHistory = useCallback(() => {
    // This would track user's voting history
    // For now, return empty array
    return [];
  }, []);

  return {
    // State
    isCreatingProposal,
    isVoting,
    isExecuting,
    proposals,
    members,
    
    // Actions
    createProposal,
    castVote,
    executeProposal,
    getProposalInfo,
    getMemberInfo,
    
    // Getters
    getActiveProposals,
    getExecutedProposals,
    getProposalsByCategory,
    getUserVotingHistory
  };
};
