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
        
        console.log('Initializing FHE SDK...');
        await initSDK();
        console.log('FHE SDK initialized successfully');

        console.log('Creating Zama instance...');
        const zamaInstance = await createInstance(SepoliaConfig);
        console.log('Zama instance created successfully');

        if (mounted) {
          setInstance(zamaInstance);
        }
      } catch (err) {
        console.error('Failed to initialize Zama instance:', err);
        
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying FHE initialization (${retryCount}/${maxRetries})...`);
          setTimeout(() => {
            if (mounted) {
              initZama();
            }
          }, 2000 * retryCount); // 递增延迟
        } else {
          if (mounted) {
            setError('Failed to initialize encryption service after multiple attempts');
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
