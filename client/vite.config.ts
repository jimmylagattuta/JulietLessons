import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',                 // ✅ assets load from /assets/... on deep links
  server: {
    port: 80,
    allowedHosts: ['julietlessons.com', 'www.julietlessons.com'],
    proxy: { '/api': 'http://localhost:3001' },
  },
  optimizeDeps: { exclude: ['lucide-react'] },
  // ❌ remove the outDir override to ../public (it was wiping/odd paths)
  // build: { outDir: resolve(__dirname, '../public'), emptyOutDir: true }
});
