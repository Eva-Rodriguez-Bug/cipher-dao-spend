import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import { defineChain } from 'viem';

// Define local hardhat chain
const hardhat = defineChain({
  id: 31337,
  name: 'Hardhat Local',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
    public: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  blockExplorers: {
    default: { name: 'Local', url: 'http://localhost:8545' },
  },
});

// Check if we're in local development mode
const isLocalDev = import.meta.env.VITE_USE_LOCAL === 'true' || 
                   import.meta.env.DEV && window.location.hostname === 'localhost';

export const config = getDefaultConfig({
  appName: 'Cipher DAO Spend',
  projectId: '2ec9743d0d0cd7fb94dee1a7e6d33475',
  chains: isLocalDev ? [hardhat] : [sepolia],
  ssr: false,
  // Disable analytics to reduce CORS issues
  analytics: {
    disabled: true
  }
});

export const chainId = isLocalDev ? 31337 : 11155111;
export const rpcUrl = isLocalDev ? 'http://127.0.0.1:8545' : 'https://1rpc.io/sepolia';
