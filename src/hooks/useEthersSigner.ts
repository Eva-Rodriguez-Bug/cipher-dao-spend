import { useAccount, useWalletClient } from 'wagmi';
import { useState, useEffect } from 'react';

export function useEthersSigner() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [signerPromise, setSignerPromise] = useState<Promise<any> | null>(null);

  useEffect(() => {
    if (walletClient && address) {
      const getSigner = async () => {
        try {
          // Convert viem wallet client to ethers signer
          const signer = await walletClient.getAccount();
          return signer;
        } catch (error) {
          console.error('Error getting signer:', error);
          throw error;
        }
      };
      
      setSignerPromise(getSigner());
    } else {
      setSignerPromise(null);
    }
  }, [walletClient, address]);

  return signerPromise;
}
