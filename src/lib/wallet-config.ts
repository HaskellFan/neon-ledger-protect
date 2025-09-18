import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Neon Ledger Protect',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || '2ec9743d0d0cd7fb94dee1a7e6d33475',
  chains: [sepolia],
  ssr: false,
});

export const chains = [sepolia];

export const rpcUrls = {
  sepolia: {
    http: [import.meta.env.VITE_RPC_URL || 'https://1rpc.io/sepolia'],
  },
};
