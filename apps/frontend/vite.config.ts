import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['03ed-84-54-76-35.ngrok-free.app'],
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
      },
      '/janus': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      },
      '/janus-ws': {
        target: 'ws://localhost:8188',
        ws: true,
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/janus-ws/, ''),
      },
    },
  },
})
