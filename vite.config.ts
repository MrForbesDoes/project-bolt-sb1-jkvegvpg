import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Changed to root for custom domain
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
