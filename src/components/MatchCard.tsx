import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Zap, Clock, Users, Trophy, Eye } from "lucide-react";
import { useBetting } from "@/hooks/useBetting";
import { useToast } from "@/hooks/use-toast";

interface Team {
  name: string;
  logo: string;
  odds: number;
}

interface Match {
  id: string;
  game: string;
  tournament: string;
  teamA: Team;
  teamB: Team;
  startTime: string;
  status: "upcoming" | "live" | "finished";
}

interface MatchCardProps {
  match: Match;
  onBet: (matchId: string, team: string, amount: number) => void;
  isWalletConnected: boolean;
}

const MatchCard = ({ match, onBet, isWalletConnected }: MatchCardProps) => {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState("");
  const [encryptionStatus, setEncryptionStatus] = useState<'idle' | 'encrypting' | 'encrypted'>('idle');
  
  const { placeBet, isPlacingBet, initializeFHE } = useBetting();
  const { toast } = useToast();

  // Initialize FHE when component mounts
  useEffect(() => {
    if (isWalletConnected) {
      initializeFHE();
    }
  }, [isWalletConnected, initializeFHE]);

  const handlePlaceBet = async () => {
    if (!selectedTeam || !betAmount || !isWalletConnected) return;
    
    setEncryptionStatus('encrypting');
    
    try {
      // Determine team choice (1 for teamA, 2 for teamB)
      const teamChoice = selectedTeam === match.teamA.name ? 1 : 2;
      const amount = parseFloat(betAmount);
      
      // Place encrypted bet on blockchain
      const betResult = await placeBet(match.id, teamChoice, amount);
      
      if (betResult) {
        setEncryptionStatus('encrypted');
        
        // Call the original onBet callback for UI updates
        onBet(match.id, selectedTeam, amount);
        
        // Reset form
        setSelectedTeam(null);
        setBetAmount("");
        
        // Show success message
        toast({
          title: "Encrypted Bet Placed",
          description: `Your bet of ${amount} ETH has been encrypted and placed on-chain`,
        });
        
        // Reset encryption status after a delay
        setTimeout(() => setEncryptionStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Error placing bet:', error);
      setEncryptionStatus('idle');
      toast({
        title: "Bet Failed",
        description: "Failed to place encrypted bet",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live": return "bg-cyber-green";
      case "upcoming": return "bg-cyber-blue";
      case "finished": return "bg-muted";
      default: return "bg-muted";
    }
  };

  return (
    <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-primary/30 shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">{match.game}</h3>
            <p className="text-sm text-muted-foreground">{match.tournament}</p>
          </div>
          <Badge className={`${getStatusColor(match.status)} text-white`}>
            {match.status === "live" && <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1" />}
            {match.status.toUpperCase()}
          </Badge>
        </div>

        {/* Teams */}
        <div className="space-y-3">
          {[match.teamA, match.teamB].map((team, index) => (
            <div
              key={team.name}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                selectedTeam === team.name
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSelectedTeam(team.name)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-neon flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-foreground">{team.name}</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-cyber-green">{team.odds.toFixed(2)}x</div>
                <div className="text-xs text-muted-foreground">odds</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bet Input */}
        {isWalletConnected && selectedTeam && (
          <div className="space-y-3 p-4 bg-muted/20 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="w-4 h-4 text-cyber-green" />
              <span>FHE Encrypted bet on {selectedTeam}</span>
              {encryptionStatus === 'encrypting' && (
                <div className="flex items-center gap-1 text-cyber-blue">
                  <div className="w-2 h-2 bg-cyber-blue rounded-full animate-pulse" />
                  <span className="text-xs">Encrypting...</span>
                </div>
              )}
              {encryptionStatus === 'encrypted' && (
                <div className="flex items-center gap-1 text-cyber-green">
                  <Zap className="w-3 h-3" />
                  <span className="text-xs">Encrypted & On-Chain</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Amount (ETH)"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="flex-1"
                disabled={isPlacingBet || encryptionStatus === 'encrypting'}
              />
              <Button
                onClick={handlePlaceBet}
                disabled={!betAmount || isPlacingBet || encryptionStatus === 'encrypting'}
                variant="cyber"
                className="min-w-[120px]"
              >
                {isPlacingBet ? "Processing..." : encryptionStatus === 'encrypting' ? "Encrypting..." : "Place Bet"}
              </Button>
            </div>
            {encryptionStatus === 'encrypted' && (
              <div className="text-xs text-cyber-green bg-cyber-green/10 p-2 rounded border border-cyber-green/20">
                ✅ Your bet has been encrypted with FHE and submitted to the blockchain. 
                The bet details remain private until match resolution.
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{match.startTime}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>1.2k bets</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-cyber-green" />
              <span>FHE Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MatchCard;