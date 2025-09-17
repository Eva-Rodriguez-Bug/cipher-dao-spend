import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  History, 
  Zap, 
  Eye, 
  Clock, 
  Trophy, 
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { useBetting } from "@/hooks/useBetting";
import { useAccount } from "wagmi";
import { useToast } from "@/hooks/use-toast";

const BettingHistory = () => {
  const { address } = useAccount();
  const { getUserBets, getTotalBetAmount, getWinRate } = useBetting();
  const { toast } = useToast();
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const userBets = getUserBets();
  const totalBetAmount = getTotalBetAmount();
  const winRate = getWinRate();

  const copyToClipboard = async (text: string, hash: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(null), 2000);
      toast({
        title: "Copied to Clipboard",
        description: "Transaction hash copied successfully",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTeamName = (teamChoice: number, matchId: string) => {
    // In a real implementation, you would get this from match data
    return teamChoice === 1 ? "Team A" : "Team B";
  };

  const getBetStatus = (matchId: string) => {
    // In a real implementation, you would check match resolution status
    return "pending";
  };

  if (!address) {
    return (
      <Card className="p-6 text-center bg-card/30 backdrop-blur-sm border-primary/30">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-neon flex items-center justify-center">
            <History className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Connect Wallet to View History</h3>
            <p className="text-sm text-muted-foreground">
              Connect your wallet to see your encrypted betting history
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-card/30 backdrop-blur-sm border-cyber-green/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyber-green/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyber-green" />
            </div>
            <div>
              <div className="text-2xl font-bold text-cyber-green">{userBets.length}</div>
              <div className="text-sm text-muted-foreground">Total Bets</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card/30 backdrop-blur-sm border-cyber-blue/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyber-blue/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-cyber-blue" />
            </div>
            <div>
              <div className="text-2xl font-bold text-cyber-blue">{totalBetAmount.toFixed(2)} ETH</div>
              <div className="text-sm text-muted-foreground">Total Wagered</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card/30 backdrop-blur-sm border-cyber-purple/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyber-purple/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-cyber-purple" />
            </div>
            <div>
              <div className="text-2xl font-bold text-cyber-purple">{winRate}%</div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Betting History */}
      <Card className="bg-card/30 backdrop-blur-sm border-primary/30">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-gradient-neon flex items-center justify-center">
              <History className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Encrypted Betting History</h2>
          </div>

          {userBets.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted/20 flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No Bets Yet</h3>
              <p className="text-sm text-muted-foreground">
                Start placing encrypted bets to see your history here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {userBets.map((bet, index) => (
                <div
                  key={index}
                  className="p-4 bg-muted/10 rounded-lg border border-primary/20 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyber-green/20 flex items-center justify-center">
                        <Eye className="w-4 h-4 text-cyber-green" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          Match #{bet.matchId}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {getTeamName(bet.teamChoice, bet.matchId)}
                        </div>
                      </div>
                    </div>
                    <Badge 
                      className={
                        getBetStatus(bet.matchId) === 'pending' 
                          ? 'bg-cyber-blue text-white' 
                          : 'bg-cyber-green text-white'
                      }
                    >
                      {getBetStatus(bet.matchId)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Amount</div>
                      <div className="font-medium text-foreground">{bet.amount} ETH</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Encrypted Data</div>
                      <div className="font-mono text-xs text-cyber-green">
                        {bet.encryptedAmount.slice(0, 20)}...
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Time</div>
                      <div className="font-medium text-foreground">
                        {formatTime(bet.timestamp)}
                      </div>
                    </div>
                  </div>

                  {bet.transactionHash && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ExternalLink className="w-3 h-3" />
                          <span>Transaction Hash:</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(bet.transactionHash!, bet.transactionHash!)}
                          className="h-6 px-2 text-xs"
                        >
                          {copiedHash === bet.transactionHash ? (
                            <Check className="w-3 h-3 text-cyber-green" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                      <div className="font-mono text-xs text-foreground mt-1">
                        {bet.transactionHash}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 p-2 bg-cyber-green/5 rounded border border-cyber-green/20">
                    <div className="flex items-center gap-2 text-xs text-cyber-green">
                      <Zap className="w-3 h-3" />
                      <span>FHE Encrypted - Bet details remain private until match resolution</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default BettingHistory;
