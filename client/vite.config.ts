import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',                // keep this
  server: {
    port: 80,
    allowedHosts: ['julietlessons.com', 'www.julietlessons.com'],
    proxy: { '/api': 'http://localhost:3001' },
  },
  optimizeDeps: { exclude: ['lucide-react'] },
  // ❌ remove build.outDir / emptyOutDir so Vite writes to client/dist
})
