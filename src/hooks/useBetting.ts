import { useState, useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { fheEncryption, contractInteraction } from '@/lib/fhe';
import { useToast } from '@/hooks/use-toast';

export interface BetData {
  matchId: string;
  teamChoice: number; // 1 for teamA, 2 for teamB
  amount: number;
  encryptedAmount: string;
  encryptedTeamChoice: string;
  proof: string;
  transactionHash?: string;
  timestamp: number;
}

export interface MatchData {
  id: string;
  game: string;
  tournament: string;
  teamA: string;
  teamB: string;
  startTime: number;
  endTime: number;
  isActive: boolean;
  isResolved: boolean;
  winner?: number;
}

export const useBetting = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { toast } = useToast();
  
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [isCreatingMatch, setIsCreatingMatch] = useState(false);
  const [userBets, setUserBets] = useState<BetData[]>([]);
  const [matches, setMatches] = useState<MatchData[]>([]);

  // Initialize FHE encryption
  const initializeFHE = useCallback(async () => {
    try {
      // In a real implementation, you would get the public key from the FHE network
      const publicKey = 'demo-public-key-for-fhe-encryption';
      await fheEncryption.initialize(publicKey);
      
      if (walletClient) {
        contractInteraction.setWalletClient(walletClient);
      }
    } catch (error) {
      console.error('Failed to initialize FHE:', error);
      toast({
        title: "FHE Initialization Failed",
        description: "Failed to initialize encryption system",
        variant: "destructive"
      });
    }
  }, [walletClient, toast]);

  // Place an encrypted bet
  const placeBet = useCallback(async (
    matchId: string,
    teamChoice: number,
    amount: number
  ): Promise<BetData | null> => {
    if (!address || !walletClient) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to place bets",
        variant: "destructive"
      });
      return null;
    }

    setIsPlacingBet(true);

    try {
      // Encrypt bet data
      const encryptedAmount = fheEncryption.encryptNumber(amount);
      const encryptedTeamChoice = fheEncryption.encryptTeamChoice(teamChoice);
      const proof = fheEncryption.generateProof(encryptedAmount, amount);

      // Create bet data object
      const betData: BetData = {
        matchId,
        teamChoice,
        amount,
        encryptedAmount,
        encryptedTeamChoice,
        proof,
        timestamp: Date.now()
      };

      // Place bet on blockchain
      const transactionHash = await contractInteraction.placeBet(
        parseInt(matchId),
        amount,
        teamChoice,
        address
      );

      betData.transactionHash = transactionHash;

      // Add to user bets
      setUserBets(prev => [...prev, betData]);

      toast({
        title: "Bet Placed Successfully",
        description: `Encrypted bet of ${amount} ETH placed on match ${matchId}`,
      });

      return betData;
    } catch (error) {
      console.error('Error placing bet:', error);
      toast({
        title: "Bet Failed",
        description: "Failed to place bet on blockchain",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsPlacingBet(false);
    }
  }, [address, walletClient, toast]);

  // Create a new match
  const createMatch = useCallback(async (
    game: string,
    tournament: string,
    teamA: string,
    teamB: string,
    startTime: number,
    duration: number
  ): Promise<MatchData | null> => {
    if (!address || !walletClient) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create matches",
        variant: "destructive"
      });
      return null;
    }

    setIsCreatingMatch(true);

    try {
      const transactionHash = await contractInteraction.createMatch(
        game,
        tournament,
        teamA,
        teamB,
        startTime,
        duration,
        address
      );

      const matchData: MatchData = {
        id: Date.now().toString(), // In real implementation, this would come from the contract
        game,
        tournament,
        teamA,
        teamB,
        startTime,
        endTime: startTime + duration,
        isActive: true,
        isResolved: false
      };

      setMatches(prev => [...prev, matchData]);

      toast({
        title: "Match Created",
        description: `Match "${game}" created successfully`,
      });

      return matchData;
    } catch (error) {
      console.error('Error creating match:', error);
      toast({
        title: "Match Creation Failed",
        description: "Failed to create match on blockchain",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsCreatingMatch(false);
    }
  }, [address, walletClient, toast]);

  // Get match information from blockchain
  const getMatchInfo = useCallback(async (matchId: string): Promise<MatchData | null> => {
    try {
      const result = await contractInteraction.getMatchInfo(parseInt(matchId));
      
      const matchData: MatchData = {
        id: matchId,
        game: result[0],
        tournament: result[1],
        teamA: result[2],
        teamB: result[3],
        isActive: result[4],
        isResolved: result[5],
        startTime: Number(result[7]),
        endTime: Number(result[8]),
        winner: result[9] > 0 ? result[9] : undefined
      };

      return matchData;
    } catch (error) {
      console.error('Error getting match info:', error);
      return null;
    }
  }, []);

  // Get user's betting history
  const getUserBets = useCallback(() => {
    return userBets.filter(bet => bet.matchId);
  }, [userBets]);

  // Get active matches
  const getActiveMatches = useCallback(() => {
    return matches.filter(match => match.isActive && !match.isResolved);
  }, [matches]);

  // Get user's total bet amount
  const getTotalBetAmount = useCallback(() => {
    return userBets.reduce((total, bet) => total + bet.amount, 0);
  }, [userBets]);

  // Get user's win rate (placeholder - would need match results)
  const getWinRate = useCallback(() => {
    // This would be calculated based on resolved matches
    return 0; // Placeholder
  }, []);

  return {
    // State
    isPlacingBet,
    isCreatingMatch,
    userBets,
    matches,
    
    // Actions
    initializeFHE,
    placeBet,
    createMatch,
    getMatchInfo,
    
    // Getters
    getUserBets,
    getActiveMatches,
    getTotalBetAmount,
    getWinRate
  };
};
