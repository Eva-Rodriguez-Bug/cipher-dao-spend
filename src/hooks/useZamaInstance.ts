import { useState, useEffect } from 'react';
import { createInstance, initSDK, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';

export function useZamaInstance() {
  const [instance, setInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeZama = async () => {
    if (isLoading || isInitialized) return;

    try {
      setIsLoading(true);
      setError(null);

      // Check if ethereum provider is available
      if (!(window as any).ethereum) {
        throw new Error('Ethereum provider not found. Please connect a wallet.');
      }

      // Check current network
      const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' });
      const sepoliaChainId = '0xaa36a7'; // 11155111 in hex
      const localhostChainId = '0x7a69'; // 31337 in hex
      
      const isLocalDev = import.meta.env.VITE_USE_LOCAL === 'true' || 
                        import.meta.env.DEV && window.location.hostname === 'localhost';
      
      if (isLocalDev) {
        // For local development, we'll skip FHE initialization
        // and use demo functions instead
        console.log('Local development mode: Skipping FHE initialization');
        setInstance({ isLocalDev: true });
        setIsInitialized(true);
        return;
      }
      
      if (chainId !== sepoliaChainId) {
        console.warn(`Current network: ${chainId}, Required: ${sepoliaChainId} (Sepolia)`);
        throw new Error('Please switch to Sepolia network. FHE SDK requires Sepolia testnet.');
      }

      console.log('Initializing FHE SDK...');
      await initSDK();

      console.log('Creating FHE instance...');
      const config = {
        ...SepoliaConfig,
        network: (window as any).ethereum
      };

      const zamaInstance = await createInstance(config);
      setInstance(zamaInstance);
      setIsInitialized(true);
      console.log('FHE instance initialized successfully');

    } catch (err) {
      console.error('Failed to initialize Zama instance:', err);
      setError(`Failed to initialize encryption service: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeZama();
  }, []);

  return {
    instance,
    isLoading,
    error,
    isInitialized,
    initializeZama
  };
}
