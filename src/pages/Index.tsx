import { useState } from "react";
import Header from "@/components/Header";
import WalletConnection from "@/components/WalletConnection";
import { CreateProposalModal } from "@/components/CreateProposalModal";
import { VoteModal } from "@/components/VoteModal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useDaoGovernance } from "@/hooks/useDaoGovernance";
import { useZamaInstance } from "@/hooks/useZamaInstance";
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
  const [isCreateProposalOpen, setIsCreateProposalOpen] = useState(false);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const { toast } = useToast();
  const { instance: zamaInstance, isLoading: isFHELoading, error: fheError } = useZamaInstance();
  const { 
    createProposal, 
    castVote, 
    executeProposal,
    getActiveProposals,
    isCreatingProposal,
    isVoting,
    isExecuting,
    proposals,
    members,
    treasuryData,
    transactions,
    fetchProposalsFromContract,
    fetchMembersFromContract,
    fetchTreasuryFromContract,
    fetchTransactionsFromContract
  } = useDaoGovernance();

  const handleWalletConnect = (address: string) => {
    if (!isWalletConnected || walletAddress !== address) {
      setIsWalletConnected(true);
      setWalletAddress(address);
      
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been securely connected and ready for DAO governance.",
      });
    }
  };

  const handleVote = async (proposalId: string, choice: string) => {
    const voteChoice = choice === 'for' ? 1 : 2;
    const votingPower = 100; // This would be based on user's reputation/stake
    
    const success = await castVote(proposalId, voteChoice, votingPower);
    
    if (success) {
      toast({
        title: "Vote Cast Successfully",
        description: `Your encrypted vote for ${choice} has been recorded on-chain.`,
      });
    }
  };

  const handleOpenVoteModal = (proposal: any) => {
    setSelectedProposal(proposal);
    setIsVoteModalOpen(true);
  };

  // Use real data from contract instead of mock data

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

          {/* FHE Status */}
          <div className="max-w-md mx-auto">
            <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-cyber-green" />
                  <span className="text-sm font-medium">FHE Encryption</span>
                </div>
                <div className="flex items-center space-x-2">
                  {isFHELoading ? (
                    <div className="w-3 h-3 bg-cyber-blue rounded-full animate-pulse" />
                  ) : fheError ? (
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                  ) : zamaInstance ? (
                    <div className="w-3 h-3 bg-cyber-green rounded-full" />
                  ) : (
                    <div className="w-3 h-3 bg-gray-400 rounded-full" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {isFHELoading ? 'Initializing...' : fheError ? 'Error' : zamaInstance ? 'Ready' : 'Not Ready'}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="p-6 text-center bg-card/30 backdrop-blur-sm border-cyber-green/30">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-cyber-green mr-2" />
                <div className="text-2xl font-bold text-cyber-green">{members.filter(m => m.isActive).length}</div>
              </div>
              <div className="text-sm text-muted-foreground">Active Members</div>
            </Card>
            <Card className="p-6 text-center bg-card/30 backdrop-blur-sm border-cyber-blue/30">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="w-6 h-6 text-cyber-blue mr-2" />
                <div className="text-2xl font-bold text-cyber-blue">
                  {treasuryData ? `${(Number(treasuryData[0]) / 1e18).toFixed(3)} ETH` : 'Loading...'}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">Treasury Balance</div>
            </Card>
            <Card className="p-6 text-center bg-card/30 backdrop-blur-sm border-cyber-purple/30">
              <div className="flex items-center justify-center mb-2">
                <Vote className="w-6 h-6 text-cyber-purple mr-2" />
                <div className="text-2xl font-bold text-cyber-purple">{proposals.filter(p => p.isActive && !p.isExecuted).length}</div>
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
                  {isWalletConnected && zamaInstance && (
                    <div className="mt-4">
                      <Button 
                        onClick={() => setIsCreateProposalOpen(true)}
                        disabled={isCreatingProposal || !zamaInstance}
                        className="bg-gradient-to-r from-cyber-green to-cyber-blue"
                      >
                        {isCreatingProposal ? 'Creating...' : 'Create New Proposal'}
                      </Button>
                    </div>
                  )}
                  {isWalletConnected && !zamaInstance && (
                    <div className="mt-4">
                      <Button 
                        disabled={true}
                        className="bg-gray-500"
                      >
                        Waiting for FHE Service...
                      </Button>
                    </div>
                  )}
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
                            <div className="font-semibold">Demo Amount (FHE Encrypted)</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <div className="flex items-center gap-1">
                              {proposal.isActive && !proposal.isExecuted && <Clock className="w-3 h-3 text-cyber-blue" />}
                              {proposal.isExecuted && <CheckCircle className="w-3 h-3 text-cyber-green" />}
                              {!proposal.isActive && !proposal.isExecuted && <Lock className="w-3 h-3 text-cyber-purple" />}
                              <span className="capitalize">
                                {proposal.isExecuted ? 'executed' : proposal.isActive ? 'active' : 'inactive'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {proposal.isActive && !proposal.isExecuted && (
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span>Total Votes: {proposal.totalVotes}</span>
                              <span>Total Voters: {proposal.totalVoters}</span>
                            </div>
                            <div className="text-xs text-muted-foreground text-center">
                              Vote results are encrypted during voting period
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleOpenVoteModal(proposal)}
                              disabled={!isWalletConnected || !zamaInstance}
                            >
                              <Vote className="w-4 h-4 mr-2" />
                              {!zamaInstance ? 'FHE Not Ready' : 'Vote on Proposal'}
                            </Button>
                          </div>
                        )}
                        
                        {proposal.isExecuted && (
                          <div className="space-y-3">
                            <div className="text-sm font-semibold text-center text-cyber-green">
                              Voting Completed
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Votes For: {proposal.votesFor}</span>
                              <span>Votes Against: {proposal.votesAgainst}</span>
                            </div>
                            <div className="text-xs text-muted-foreground text-center">
                              Total Votes: {proposal.totalVotes} | Total Voters: {proposal.totalVoters}
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
                        <span className="font-semibold">
                          {treasuryData ? `${(Number(treasuryData[0]) / 1e18).toFixed(3)} ETH` : 'Loading...'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Available:</span>
                        <span className="font-semibold text-cyber-green">
                          {treasuryData ? `${(Number(treasuryData[1]) / 1e18).toFixed(3)} ETH` : 'Loading...'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Locked:</span>
                        <span className="font-semibold text-cyber-blue">
                          {treasuryData ? `${(Number(treasuryData[2]) / 1e18).toFixed(3)} ETH` : 'Loading...'}
                        </span>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6 bg-card/30 backdrop-blur-sm border-cyber-blue/30">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Recent Transactions</h3>
                    <div className="space-y-2 text-sm">
                      {transactions.length > 0 ? (
                        transactions.slice(0, 5).map((tx) => (
                          <div key={tx.id} className="flex justify-between">
                            <span>{tx.description}</span>
                            <span className={tx.isInflow ? "text-cyber-green" : "text-cyber-red"}>
                              {tx.isInflow ? "+" : "-"}${(tx.amount / 1e18).toLocaleString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-4">
                          No transactions yet
                        </div>
                      )}
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
                  {members.filter(m => m.isActive).map((member, index) => (
                    <Card key={index} className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground">{member.address.slice(0, 6)}...{member.address.slice(-4)}</h4>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                        <div className="flex justify-between text-xs">
                          <span>Reputation: {member.reputation}</span>
                          <span>Power: FHE Encrypted</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-cyber-green">
                          <Shield className="w-3 h-3" />
                          <span>Verified</span>
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

      {/* Modals */}
      <CreateProposalModal 
        isOpen={isCreateProposalOpen} 
        onOpenChange={setIsCreateProposalOpen} 
      />
      
      <VoteModal 
        isOpen={isVoteModalOpen} 
        onOpenChange={setIsVoteModalOpen}
        proposal={selectedProposal}
      />
    </div>
  );
};

export default Index;