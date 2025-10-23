import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    }
  },
  plugins: [react()],
  define: { 
    global: 'globalThis',  // 关键：解决 global 未定义问题
    'process.env': {}  // 解决 process 未定义问题
  },
  optimizeDeps: { 
    include: ['@zama-fhe/relayer-sdk/bundle'],
    exclude: ['@zama-fhe/relayer-sdk']
  },
  build: {
    rollupOptions: {
      external: ['@zama-fhe/relayer-sdk/bundle']
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
