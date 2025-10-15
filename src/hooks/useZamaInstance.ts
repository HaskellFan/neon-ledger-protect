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
        
        // Create fallback instance for development
        console.log('🔄 Creating fallback FHE instance for development...');
        const fallbackInstance = createFallbackInstance();
        
        if (mounted) {
          setInstance(fallbackInstance);
          setError(`Using fallback FHE instance due to network issues: ${err?.message || 'Unknown error'}`);
          console.log('⚠️ Using fallback FHE instance - encryption will be simulated');
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

// Fallback instance for when FHE SDK fails
function createFallbackInstance() {
  console.log('🔧 Creating fallback FHE instance...');
  return {
    createEncryptedInput: (contractAddress: string, userAddress: string) => {
      console.log('🔧 Fallback: Creating encrypted input for', contractAddress, userAddress);
      const values: any[] = [];
      return {
        add32: (value: any) => {
          console.log('🔧 Fallback: Adding uint32 value', value);
          values.push({ type: 'uint32', value });
        },
        add8: (value: any) => {
          console.log('🔧 Fallback: Adding uint8 value', value);
          values.push({ type: 'uint8', value });
        },
        addBool: (value: any) => {
          console.log('🔧 Fallback: Adding bool value', value);
          values.push({ type: 'bool', value });
        },
        encrypt: async () => {
          console.log('🔧 Fallback: Encrypting values', values);
          // Generate simulated encrypted data
          const handles = values.map((_, index) => {
            const randomBytes = new Uint8Array(32);
            crypto.getRandomValues(randomBytes);
            return `0x${Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('')}`;
          });
          
          const proofBytes = new Uint8Array(64);
          crypto.getRandomValues(proofBytes);
          const inputProof = `0x${Array.from(proofBytes).map(b => b.toString(16).padStart(2, '0')).join('')}`;
          
          console.log('🔧 Fallback: Generated', handles.length, 'handles and proof');
          return {
            handles,
            inputProof
          };
        }
      };
    }
  };
}
