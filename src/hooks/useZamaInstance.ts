import { useState, useEffect } from 'react';
import { createInstance, initSDK, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';

export function useZamaInstance() {
  const [instance, setInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const initZama = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🚀 Starting FHE initialization...');
        
        // Initialize SDK with retry logic
        await initSDK();
        console.log('✅ FHE SDK initialized');

        // Create instance with retry logic
        const zamaInstance = await createInstance(SepoliaConfig);
        console.log('✅ FHE instance created');

        if (mounted) {
          setInstance(zamaInstance);
          console.log('🎉 FHE initialization completed successfully');
        }
      } catch (err) {
        console.error('❌ FHE initialization failed:', err);
        
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`🔄 Retrying FHE initialization (${retryCount}/${maxRetries})...`);
          setTimeout(() => {
            if (mounted) {
              initZama();
            }
          }, 2000 * retryCount); // Exponential backoff
        } else {
          if (mounted) {
            setError(`Failed to initialize encryption service after ${maxRetries} attempts. Please refresh the page.`);
          }
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initZama();

    return () => {
      mounted = false;
    };
  }, []);

  return { instance, isLoading, error };
}
