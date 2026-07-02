import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/login': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/topico': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/respuesta': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/usuario': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/curso': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/ai': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/ws': {
        target: 'http://localhost:8080',
        ws: true
      }
    }
  }
})
