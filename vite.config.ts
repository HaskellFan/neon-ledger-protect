import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    // Remove CORS headers that conflict with Coinbase Wallet
    // The FHE SDK will work without these headers in development
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
})
