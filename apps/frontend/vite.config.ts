import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: true,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
      },
      '/nats': {
        target: process.env.VITE_NATS_WS_URL || 'ws://localhost:9222',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
