import { useState, useEffect } from 'react';
import { createInstance,initSDK,SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';

export function useZamaInstance() {
  const [instance, setInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initZama = async () => {
      try {
        console.log('🔐 Starting FHE initialization...');
        console.log('🌐 Network check - testing relayer connectivity...');
        
        // Test network connectivity first
        try {
          const response = await fetch('https://relayer.testnet.zama.cloud/v1/keyurl', {
            method: 'GET',
            mode: 'cors'
          });
          console.log('✅ Relayer connectivity test passed:', response.status);
        } catch (networkErr) {
          console.warn('⚠️ Relayer connectivity test failed:', networkErr);
          console.log('💡 This might be due to network restrictions or proxy settings');
        }
        
        setIsLoading(true);
        setError(null);
        
        console.log('📡 Initializing FHE SDK...');
        await initSDK();
        console.log('✅ FHE SDK initialized successfully');

        console.log('🏗️ Creating Zama instance with SepoliaConfig...');
        const zamaInstance = await createInstance(SepoliaConfig);
        console.log('✅ Zama instance created successfully');

        if (mounted) {
          setInstance(zamaInstance);
          console.log('🎉 FHE initialization completed successfully!');
        }
      } catch (err) {
        console.error('❌ Failed to initialize Zama instance:', err);
        console.error('Error details:', {
          name: err?.name,
          message: err?.message,
          stack: err?.stack
        });
        
        // Provide specific error guidance
        if (err?.message?.includes('CONNECTION_CLOSED')) {
          console.error('🔧 Network connection issue detected. Possible solutions:');
          console.error('1. Check if you need to configure proxy settings');
          console.error('2. Verify network connectivity to relayer.testnet.zama.cloud');
          console.error('3. Try using a different network or VPN');
        }
        
        if (mounted) {
          setError(`Failed to initialize encryption service: ${err?.message || 'Unknown error'}`);
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
