import { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { useDaoGovernance } from "@/hooks/useDaoGovernance";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Vote, CheckCircle, XCircle, Clock, User, DollarSign } from "lucide-react";

interface Proposal {
  id: string;
  title: string;
  description: string;
  category: string;
  amount: number;
  proposer: string;
  beneficiary: string;
  startTime: number;
  endTime: number;
  isActive: boolean;
  isExecuted: boolean;
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
}

interface VoteModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: Proposal | null;
}

export const VoteModal = ({ isOpen, onOpenChange, proposal }: VoteModalProps) => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { castVote, isVoting } = useDaoGovernance();
  const { toast } = useToast();

  const [selectedVote, setSelectedVote] = useState<"for" | "against" | null>(null);
  const [votingPower, setVotingPower] = useState(100); // This would come from user's reputation/stake
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (proposal && address) {
      // Check if user has already voted (this would be a contract call in real implementation)
      // For now, we'll simulate this
      setHasVoted(false);
    }
  }, [proposal, address]);

  const handleVote = async () => {
    if (!proposal || !selectedVote || !isConnected || !address) {
      toast({
        title: "Vote Failed",
        description: "Please connect your wallet and select a vote option",
        variant: "destructive"
      });
      return;
    }

    if (hasVoted) {
      toast({
        title: "Already Voted",
        description: "You have already voted on this proposal",
        variant: "destructive"
      });
      return;
    }

    try {
      const voteChoice = selectedVote === "for" ? 1 : 2;
      const success = await castVote(proposal.id, voteChoice, votingPower);

      if (success) {
        setHasVoted(true);
        onOpenChange(false);
        setSelectedVote(null);

        toast({
          title: "Vote Cast Successfully",
          description: `Your encrypted vote for ${selectedVote} has been recorded on-chain`,
        });
      }
    } catch (error) {
      console.error("Error casting vote:", error);
      toast({
        title: "Vote Failed",
        description: "Failed to cast vote. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTimeRemaining = (endTime: number) => {
    const now = Date.now();
    const remaining = endTime - now;
    
    if (remaining <= 0) {
      return "Voting ended";
    }

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  const getVotePercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  if (!proposal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Vote on Proposal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Proposal Details */}
          <Card className="p-6 bg-card/30 backdrop-blur-sm border-primary/20">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-semibold text-foreground">{proposal.title}</h3>
                <Badge variant="secondary" className="capitalize">
                  {proposal.category}
                </Badge>
              </div>

              <p className="text-muted-foreground">{proposal.description}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-cyber-green" />
                  <span>Amount: {proposal.amount.toLocaleString()} USDC</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-cyber-blue" />
                  <span>Proposer: {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Ends: {formatTime(proposal.endTime)}</span>
              </div>
            </div>
          </Card>

          {/* Voting Status */}
          <Card className="p-6 bg-card/30 backdrop-blur-sm border-primary/20">
            <h4 className="font-semibold text-foreground mb-4">Voting Status</h4>
            
            <div className="space-y-4">
              {/* Vote Progress Bars */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Votes For: {proposal.votesFor}
                  </span>
                  <span>{getVotePercentage(proposal.votesFor, proposal.totalVotes)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getVotePercentage(proposal.votesFor, proposal.totalVotes)}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    Votes Against: {proposal.votesAgainst}
                  </span>
                  <span>{getVotePercentage(proposal.votesAgainst, proposal.totalVotes)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getVotePercentage(proposal.votesAgainst, proposal.totalVotes)}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Total Votes: {proposal.totalVotes} | {getTimeRemaining(proposal.endTime)}
              </div>
            </div>
          </Card>

          {/* Voting Options */}
          {!hasVoted && proposal.isActive && (
            <Card className="p-6 bg-card/30 backdrop-blur-sm border-primary/20">
              <h4 className="font-semibold text-foreground mb-4">Cast Your Vote</h4>
              
              <div className="space-y-4">
                {/* Vote Options */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={selectedVote === "for" ? "default" : "outline"}
                    className={`h-20 flex flex-col items-center justify-center space-y-2 ${
                      selectedVote === "for" 
                        ? "bg-green-500 hover:bg-green-600 text-white" 
                        : "hover:bg-green-50 hover:border-green-500"
                    }`}
                    onClick={() => setSelectedVote("for")}
                  >
                    <CheckCircle className="w-6 h-6" />
                    <span>Vote For</span>
                  </Button>

                  <Button
                    variant={selectedVote === "against" ? "default" : "outline"}
                    className={`h-20 flex flex-col items-center justify-center space-y-2 ${
                      selectedVote === "against" 
                        ? "bg-red-500 hover:bg-red-600 text-white" 
                        : "hover:bg-red-50 hover:border-red-500"
                    }`}
                    onClick={() => setSelectedVote("against")}
                  >
                    <XCircle className="w-6 h-6" />
                    <span>Vote Against</span>
                  </Button>
                </div>

                {/* Voting Power */}
                <div className="text-center text-sm text-muted-foreground">
                  Your Voting Power: {votingPower} points
                </div>

                {/* Submit Vote Button */}
                <Button
                  onClick={handleVote}
                  disabled={!selectedVote || !isConnected || isVoting}
                  className="w-full bg-gradient-to-r from-cyber-green to-cyber-blue"
                >
                  {isVoting ? (
                    <>
                      <Vote className="w-4 h-4 mr-2 animate-pulse" />
                      Casting Vote...
                    </>
                  ) : (
                    <>
                      <Vote className="w-4 h-4 mr-2" />
                      Cast Vote
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Already Voted Message */}
          {hasVoted && (
            <Card className="p-6 bg-card/30 backdrop-blur-sm border-primary/20">
              <div className="text-center space-y-2">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                <h4 className="font-semibold text-foreground">Vote Cast Successfully</h4>
                <p className="text-sm text-muted-foreground">
                  Your encrypted vote has been recorded on-chain. Results will be revealed after the voting period ends.
                </p>
              </div>
            </Card>
          )}

          {/* Wallet Connection Status */}
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Wallet Status</p>
                <p className="text-sm text-muted-foreground">
                  {isConnected ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}` : "Not connected"}
                </p>
              </div>
              {isConnected && (
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              )}
            </div>
          </Card>

          {/* Close Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isVoting}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
