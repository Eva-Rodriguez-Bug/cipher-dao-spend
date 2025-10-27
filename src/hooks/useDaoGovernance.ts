import { useState, useCallback, useEffect } from 'react';
import { useAccount, useWalletClient, useContractWrite, useContractRead, usePublicClient } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import { useZamaInstance } from '@/hooks/useZamaInstance';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { CONTRACT_CONFIG, getContractAddress, getContractABI } from '@/lib/contract';
import { contractInteraction } from '@/lib/fhe';

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
  const publicClient = usePublicClient();
  const { toast } = useToast();
  const { instance: zamaInstance } = useZamaInstance();
  const signerPromise = useEthersSigner();
  
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [treasuryData, setTreasuryData] = useState<any>(null);

  // Fetch data from contract on component mount
  useEffect(() => {
    if (address) {
      fetchProposalsFromContract();
      fetchMembersFromContract();
      fetchTreasuryFromContract();
    }
  }, [address]);

  const fetchProposalsFromContract = useCallback(async () => {
    if (!address || !publicClient) return;

    try {
      const contract = {
        address: CONTRACT_CONFIG.address,
        abi: CONTRACT_CONFIG.abi,
        client: publicClient
      };

      // Get proposal counter to know how many proposals exist
      const proposalCounter = await publicClient.readContract({
        address: CONTRACT_CONFIG.address,
        abi: CONTRACT_CONFIG.abi,
        functionName: 'proposalCounter'
      });
      const fetchedProposals: ProposalData[] = [];

      // Fetch all proposals
      for (let i = 0; i < Number(proposalCounter); i++) {
        try {
          // Get basic proposal data
          const proposalData = await publicClient.readContract({
            address: CONTRACT_CONFIG.address,
            abi: CONTRACT_CONFIG.abi,
            functionName: 'getProposalData',
            args: [i]
          });
          const [proposalId, totalVotes, isActive, isExecuted, title, description, category, proposer, beneficiary, startTime, endTime, executionTime] = proposalData;

          // Get encrypted data
          const encryptedData = await publicClient.readContract({
            address: CONTRACT_CONFIG.address,
            abi: CONTRACT_CONFIG.abi,
            functionName: 'getProposalEncryptedData',
            args: [i]
          });
          const [encryptedAmount, encryptedVotesFor, encryptedVotesAgainst] = encryptedData;

          // Decrypt data if FHE instance is available
          let amount = 0;
          let votesFor = 0;
          let votesAgainst = 0;

          if (zamaInstance && !zamaInstance.isLocalDev) {
            try {
              const decryptedAmount = await zamaInstance.decryptEuint32(CONTRACT_CONFIG.address, encryptedAmount);
              const decryptedVotesFor = await zamaInstance.decryptEuint32(CONTRACT_CONFIG.address, encryptedVotesFor);
              const decryptedVotesAgainst = await zamaInstance.decryptEuint32(CONTRACT_CONFIG.address, encryptedVotesAgainst);
              amount = Number(decryptedAmount);
              votesFor = Number(decryptedVotesFor);
              votesAgainst = Number(decryptedVotesAgainst);
            } catch (error) {
              console.log('Failed to decrypt proposal data:', error);
            }
          }
          
          fetchedProposals.push({
            id: proposalId.toString(),
            title,
            description,
            category,
            amount,
            proposer,
            beneficiary,
            votesFor,
            votesAgainst,
            totalVotes: Number(totalVotes),
            isActive,
            isExecuted,
            startTime: Number(startTime) * 1000,
            endTime: Number(endTime) * 1000,
            executionTime: Number(executionTime) * 1000
          });
        } catch (error) {
          console.log(`Proposal ${i} not found:`, error);
        }
      }

      setProposals(fetchedProposals);
    } catch (error) {
      console.error('Error fetching proposals from contract:', error);
    }
  }, [address, publicClient]);

  const fetchMembersFromContract = useCallback(async () => {
    if (!address || !publicClient) return;

    try {
      // For now, we'll use a predefined list of member addresses
      // In a real implementation, you would track member addresses in the contract
      const memberAddresses = [
        "0x405D14066c01B7f8D53497Ff2597d081A02850dF",
        "0x4139E2023da5F9dC10941596DCbDD2e8e003DcAe",
        "0x415C708dc46B10A81E9Fc752aBF5f5BA8aB0a728",
        "0x43B37bA4b27E113A98Ced7e62D046DEB0385c610",
        "0x447Ec8423140E2e89b5Db658cF0362F67A3502C0",
        "0x44a34dE9cd7Decd2500140d1d511D9223a6e3Ac3",
        "0x44A390045603958A98D0515bED5D9e6a84c6B819",
        "0x454456B945C161Dc018d507a1402EBd7FfF2d043",
        "0x217edde31E42FE76c4F0d0FFeabEcDA56D02C6f0"
      ];

      const fetchedMembers: MemberData[] = [];

      for (const memberAddress of memberAddresses) {
        try {
          // Get basic member data
          const memberData = await publicClient.readContract({
            address: CONTRACT_CONFIG.address,
            abi: CONTRACT_CONFIG.abi,
            functionName: 'getMemberData',
            args: [memberAddress]
          });
          const [memberId, reputation, isActive, isVerified, role, wallet, joinTime, lastActivity] = memberData;

          // Get encrypted voting power
          const encryptedData = await publicClient.readContract({
            address: CONTRACT_CONFIG.address,
            abi: CONTRACT_CONFIG.abi,
            functionName: 'getMemberEncryptedData',
            args: [memberAddress]
          });
          const [encryptedVotingPower] = encryptedData;

          // Decrypt voting power if FHE instance is available
          let votingPower = 0;
          if (zamaInstance && !zamaInstance.isLocalDev) {
            try {
              const decryptedVotingPower = await zamaInstance.decryptEuint32(CONTRACT_CONFIG.address, encryptedVotingPower);
              votingPower = Number(decryptedVotingPower);
            } catch (error) {
              console.log('Failed to decrypt member voting power:', error);
            }
          }
          
          fetchedMembers.push({
            address: memberAddress,
            role,
            isActive,
            isVerified,
            joinTime: Number(joinTime) * 1000,
            lastActivity: Number(lastActivity) * 1000,
            votingPower,
            reputation: Number(reputation)
          });
        } catch (error) {
          console.log(`Member ${memberAddress} not found:`, error);
        }
      }

      setMembers(fetchedMembers);
    } catch (error) {
      console.error('Error fetching members from contract:', error);
    }
  }, [address, publicClient]);

  const fetchTreasuryFromContract = useCallback(async () => {
    if (!address || !publicClient) return;

    try {
      const treasuryData = await publicClient.readContract({
        address: CONTRACT_CONFIG.address,
        abi: CONTRACT_CONFIG.abi,
        functionName: 'getTreasuryData'
      });
      
      setTreasuryData(treasuryData);
    } catch (error) {
      console.error('Error fetching treasury from contract:', error);
    }
  }, [address, publicClient]);

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

  // Create a new proposal with FHE encryption
  const createProposal = useCallback(async (
    title: string,
    description: string,
    category: string,
    amount: number,
    beneficiary: string,
    duration: number
  ): Promise<ProposalData | null> => {
    if (!address || !walletClient || !zamaInstance) {
      toast({
        title: "Missing Requirements",
        description: "Please connect your wallet and ensure FHE service is ready",
        variant: "destructive"
      });
      return null;
    }

    setIsCreatingProposal(true);

    try {
      // Set wallet client for contract interaction
      contractInteraction.setWalletClient(walletClient);
      
      // Create encrypted proposal using FHE
      const txHash = await contractInteraction.createProposal(
        title,
        description,
        category,
        amount,
        beneficiary,
        duration,
        address,
        zamaInstance
      );

      // Wait for transaction confirmation
      const receipt = await walletClient.waitForTransactionReceipt({
        hash: txHash as `0x${string}`,
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
          description: `Proposal "${title}" has been created with FHE encryption and is now open for voting`,
        });

        return proposalData;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast({
        title: "Proposal Creation Failed",
        description: "Failed to create encrypted proposal on blockchain",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsCreatingProposal(false);
    }
  }, [address, walletClient, zamaInstance, toast]);

  // Cast an encrypted vote on a proposal
  const castVote = useCallback(async (
    proposalId: string,
    voteChoice: number // 1 for for, 2 for against
  ): Promise<boolean> => {
    if (!address || !walletClient || !zamaInstance) {
      toast({
        title: "Missing Requirements",
        description: "Please connect your wallet and ensure FHE service is ready",
        variant: "destructive"
      });
      return false;
    }

    setIsVoting(true);

    try {
      // Set wallet client for contract interaction
      contractInteraction.setWalletClient(walletClient);
      
      // Cast encrypted vote using FHE (simplified to single parameter)
      const txHash = await contractInteraction.castVote(
        parseInt(proposalId),
        voteChoice,
        address,
        zamaInstance
      );

      // Wait for transaction confirmation
      const receipt = await walletClient.waitForTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      if (receipt.status === 'success') {
        // Update proposal votes in local state (using fixed voting power)
        const fixedVotingPower = 100; // Fixed voting power for demo
        setProposals(prev => prev.map(proposal => {
          if (proposal.id === proposalId) {
            return {
              ...proposal,
              votesFor: voteChoice === 1 ? proposal.votesFor + fixedVotingPower : proposal.votesFor,
              votesAgainst: voteChoice === 2 ? proposal.votesAgainst + fixedVotingPower : proposal.votesAgainst,
              totalVotes: proposal.totalVotes + fixedVotingPower
            };
          }
          return proposal;
        }));

        toast({
          title: "Vote Cast Successfully",
          description: `Your encrypted vote has been recorded for proposal "${proposalId}"`,
        });

        return true;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Error casting vote:', error);
      toast({
        title: "Vote Failed",
        description: "Failed to cast encrypted vote on blockchain",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsVoting(false);
    }
  }, [address, walletClient, zamaInstance, toast]);

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
    treasuryData,
    
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
    getUserVotingHistory,
    fetchProposalsFromContract,
    fetchMembersFromContract,
    fetchTreasuryFromContract
  };
};
