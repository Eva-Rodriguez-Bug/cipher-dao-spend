import { useState } from "react";
import Header from "@/components/Header";
import WalletConnection from "@/components/WalletConnection";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useBetting } from "@/hooks/useBetting";
import { 
  Vote, 
  Users, 
  DollarSign, 
  Shield, 
  Clock, 
  CheckCircle,
  TrendingUp,
  Lock
} from "lucide-react";

const Index = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const { toast } = useToast();
  const { initializeFHE } = useBetting();

  const handleWalletConnect = (address: string) => {
    setIsWalletConnected(true);
    setWalletAddress(address);
    
    // Initialize FHE encryption when wallet connects
    initializeFHE();
    
    toast({
      title: "Wallet Connected",
      description: "Your wallet has been securely connected with FHE encryption ready.",
    });
  };

  const handleVote = (proposalId: string, choice: string) => {
    toast({
      title: "Vote Cast Successfully",
      description: `Your encrypted vote for ${choice} has been recorded. Results will be revealed after voting period ends.`,
    });
  };

  // Mock data for DAO proposals
  const proposals = [
    {
      id: "1",
      title: "Marketing Campaign Q1 2024",
      description: "Allocate funds for comprehensive marketing campaign including social media, influencer partnerships, and community events.",
      category: "Marketing",
      amount: 50000,
      proposer: "0x1234...5678",
      beneficiary: "0x9876...5432",
      startTime: "2024-01-15",
      endTime: "2024-01-22",
      status: "active" as const,
      votesFor: 1250,
      votesAgainst: 320,
      totalVotes: 1570,
    },
    {
      id: "2", 
      title: "Developer Tools Upgrade",
      description: "Invest in new development tools and infrastructure to improve team productivity and code quality.",
      category: "Development",
      amount: 25000,
      proposer: "0x2345...6789",
      beneficiary: "0x8765...4321",
      startTime: "2024-01-10",
      endTime: "2024-01-17",
      status: "executed" as const,
      votesFor: 2100,
      votesAgainst: 150,
      totalVotes: 2250,
    },
    {
      id: "3",
      title: "Community Rewards Program",
      description: "Launch a rewards program for active community members and contributors to the DAO ecosystem.",
      category: "Community",
      amount: 75000,
      proposer: "0x3456...7890",
      beneficiary: "0x7654...3210",
      startTime: "2024-01-20",
      endTime: "2024-01-27",
      status: "upcoming" as const,
      votesFor: 0,
      votesAgainst: 0,
      totalVotes: 0,
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/10 via-cyber-purple/5 to-cyber-green/10" />
      
      {/* Content */}
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Wallet Connection */}
          <div className="max-w-md mx-auto">
            <WalletConnection
              onConnect={handleWalletConnect}
              isConnected={isWalletConnected}
              address={walletAddress}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="p-6 text-center bg-card/30 backdrop-blur-sm border-cyber-green/30">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-cyber-green mr-2" />
                <div className="text-2xl font-bold text-cyber-green">1,247</div>
              </div>
              <div className="text-sm text-muted-foreground">Active Members</div>
            </Card>
            <Card className="p-6 text-center bg-card/30 backdrop-blur-sm border-cyber-blue/30">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="w-6 h-6 text-cyber-blue mr-2" />
                <div className="text-2xl font-bold text-cyber-blue">$2.1M</div>
              </div>
              <div className="text-sm text-muted-foreground">Treasury Balance</div>
            </Card>
            <Card className="p-6 text-center bg-card/30 backdrop-blur-sm border-cyber-purple/30">
              <div className="flex items-center justify-center mb-2">
                <Vote className="w-6 h-6 text-cyber-purple mr-2" />
                <div className="text-2xl font-bold text-cyber-purple">23</div>
              </div>
              <div className="text-sm text-muted-foreground">Active Proposals</div>
            </Card>
            <Card className="p-6 text-center bg-card/30 backdrop-blur-sm border-cyber-pink/30">
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-6 h-6 text-cyber-pink mr-2" />
                <div className="text-2xl font-bold text-cyber-pink">100%</div>
              </div>
              <div className="text-sm text-muted-foreground">FHE Encrypted</div>
            </Card>
          </div>

          {/* Main Content with Tabs */}
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="proposals" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto">
                <TabsTrigger value="proposals">Active Proposals</TabsTrigger>
                <TabsTrigger value="treasury">Treasury</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
              </TabsList>
              
              <TabsContent value="proposals" className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-foreground mb-2">DAO Proposals</h2>
                  <p className="text-muted-foreground">Vote on encrypted proposals with FHE privacy protection</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {proposals.map((proposal) => (
                    <Card key={proposal.id} className="p-6 bg-card/30 backdrop-blur-sm border-primary/20">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground mb-2">{proposal.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{proposal.description}</p>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {proposal.category}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Amount:</span>
                            <div className="font-semibold">${proposal.amount.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <div className="flex items-center gap-1">
                              {proposal.status === 'active' && <Clock className="w-3 h-3 text-cyber-blue" />}
                              {proposal.status === 'executed' && <CheckCircle className="w-3 h-3 text-cyber-green" />}
                              {proposal.status === 'upcoming' && <Lock className="w-3 h-3 text-cyber-purple" />}
                              <span className="capitalize">{proposal.status}</span>
                            </div>
                          </div>
                        </div>
                        
                        {proposal.status === 'active' && (
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span>Votes For: {proposal.votesFor}</span>
                              <span>Votes Against: {proposal.votesAgainst}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleVote(proposal.id, 'for')}
                                disabled={!isWalletConnected}
                              >
                                Vote For
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleVote(proposal.id, 'against')}
                                disabled={!isWalletConnected}
                              >
                                Vote Against
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="treasury" className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Treasury Management</h2>
                  <p className="text-muted-foreground">FHE encrypted treasury with transparent spending</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6 bg-card/30 backdrop-blur-sm border-cyber-green/30">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Treasury Overview</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Funds:</span>
                        <span className="font-semibold">$2,100,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Available:</span>
                        <span className="font-semibold text-cyber-green">$1,850,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Locked:</span>
                        <span className="font-semibold text-cyber-blue">$250,000</span>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6 bg-card/30 backdrop-blur-sm border-cyber-blue/30">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Recent Transactions</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Marketing Campaign</span>
                        <span className="text-cyber-red">-$50,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Developer Tools</span>
                        <span className="text-cyber-red">-$25,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Community Rewards</span>
                        <span className="text-cyber-green">+$10,000</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="members" className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-foreground mb-2">DAO Members</h2>
                  <p className="text-muted-foreground">Community members with encrypted voting power</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: "Alice Johnson", role: "Core Developer", reputation: 95, votingPower: 1000 },
                    { name: "Bob Smith", role: "Community Manager", reputation: 88, votingPower: 800 },
                    { name: "Carol Davis", role: "Marketing Lead", reputation: 92, votingPower: 900 },
                    { name: "David Wilson", role: "Security Expert", reputation: 98, votingPower: 1200 },
                    { name: "Eva Brown", role: "Product Manager", reputation: 90, votingPower: 850 },
                    { name: "Frank Miller", role: "Designer", reputation: 85, votingPower: 750 },
                  ].map((member, index) => (
                    <Card key={index} className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                        <div className="flex justify-between text-xs">
                          <span>Reputation: {member.reputation}</span>
                          <span>Power: {member.votingPower}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* How it works */}
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-center text-foreground">How DAO Spending Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: "1",
                  title: "Propose Spending",
                  description: "Members create encrypted proposals for DAO fund allocation with FHE privacy",
                  color: "cyber-pink",
                  icon: Vote
                },
                {
                  step: "2", 
                  title: "Encrypted Voting",
                  description: "Community votes on proposals with encrypted voting power and private choices",
                  color: "cyber-blue",
                  icon: Shield
                },
                {
                  step: "3",
                  title: "Secure Execution",
                  description: "Approved proposals execute automatically with transparent on-chain records",
                  color: "cyber-green",
                  icon: CheckCircle
                }
              ].map((item) => (
                <Card key={item.step} className="p-6 text-center bg-card/30 backdrop-blur-sm border-primary/20">
                  <div className="flex justify-center mb-4">
                    <div className={`w-12 h-12 rounded-full bg-${item.color} flex items-center justify-center`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;