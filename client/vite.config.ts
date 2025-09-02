import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/',                 // <-- make asset URLs root-absolute
  server: {
    port: 80,
    allowedHosts: ['julietlessons.com', 'www.julietlessons.com'],
    proxy: { '/api': 'http://localhost:3001' },
  },
  optimizeDeps: { exclude: ['lucide-react'] },
  build: {
    outDir: resolve(__dirname, '../public'),
    emptyOutDir: true,
  },
});
