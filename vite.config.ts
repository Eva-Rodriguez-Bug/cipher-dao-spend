import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    // Remove CORS headers to avoid conflicts between FHE SDK and Coinbase Wallet
    // FHE SDK will work with default browser behavior
  },
  plugins: [react()],
  define: { 
    global: 'globalThis',
    'process.env': {
      VITE_USE_LOCAL: JSON.stringify(false), // Set to false for Sepolia
      VITE_WALLET_CONNECT_PROJECT_ID: JSON.stringify('2ec9743d0d0cd7fb94dee1a7e6d33475')
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['@zama-fhe/relayer-sdk/bundle'], // Pre-build FHE SDK
  },
});
