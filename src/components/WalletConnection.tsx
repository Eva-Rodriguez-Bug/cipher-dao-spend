import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, Zap, Eye } from "lucide-react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

interface WalletConnectionProps {
  onConnect: (address: string) => void;
  isConnected: boolean;
  address?: string;
}

const WalletConnection = ({ onConnect, isConnected, address }: WalletConnectionProps) => {
  const { address: walletAddress, isConnected: walletConnected } = useAccount();

  useEffect(() => {
    if (walletConnected && walletAddress) {
      onConnect(walletAddress);
    }
  }, [walletConnected, walletAddress, onConnect]);

  if (isConnected && address) {
    return (
      <Card className="p-4 bg-card/50 backdrop-blur-sm border-primary/30 shadow-lg shadow-primary/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-neon flex items-center justify-center">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Wallet Connected</p>
            <p className="text-xs text-muted-foreground font-mono">{address}</p>
          </div>
          <div className="flex items-center gap-1 text-cyber-green">
            <Eye className="w-4 h-4" />
            <span className="text-xs font-medium">Private</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card/30 backdrop-blur-sm border-primary/30 shadow-xl">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-neon flex items-center justify-center animate-pulse-glow">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Connect Your Wallet</h3>
          <p className="text-sm text-muted-foreground">
            Secure your DAO participation with end-to-end encryption
          </p>
        </div>
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-cyber-green" />
            <span>Private</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyber-blue" />
            <span>Fast</span>
          </div>
        </div>
        <div className="w-full">
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              authenticationStatus,
              mounted,
            }) => {
              const ready = mounted && authenticationStatus !== 'loading';
              const connected =
                ready &&
                account &&
                chain &&
                (!authenticationStatus ||
                  authenticationStatus === 'authenticated');

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    'style': {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <Button 
                          onClick={openConnectModal}
                          variant="neon"
                          className="w-full"
                        >
                          Connect Wallet
                        </Button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <div className="space-y-3">
                          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-sm text-red-400 font-medium">⚠️ Wrong Network</p>
                            <p className="text-xs text-red-300 mt-1">
                              Please switch to Sepolia testnet to use FHE encryption
                            </p>
                          </div>
                          <Button 
                            onClick={openChainModal}
                            variant="destructive"
                            className="w-full"
                          >
                            Switch to Sepolia Network
                          </Button>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <p className="text-sm text-green-400 font-medium">✅ Connected to Sepolia</p>
                          <p className="text-xs text-green-300 mt-1">
                            FHE encryption is ready
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={openChainModal}
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            {chain.hasIcon && (
                              <div
                                style={{
                                  background: chain.iconBackground,
                                  width: 12,
                                  height: 12,
                                  borderRadius: 999,
                                  overflow: 'hidden',
                                  marginRight: 4,
                                }}
                              >
                                {chain.iconUrl && (
                                  <img
                                    alt={chain.name ?? 'Chain icon'}
                                    src={chain.iconUrl}
                                    style={{ width: 12, height: 12 }}
                                  />
                                )}
                              </div>
                            )}
                            {chain.name}
                          </Button>

                          <Button onClick={openAccountModal} variant="outline">
                            {account.displayName}
                            {account.displayBalance
                              ? ` (${account.displayBalance})`
                              : ''}
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </Card>
  );
};

export default WalletConnection;