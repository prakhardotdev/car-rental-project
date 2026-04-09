import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://car-rental-project-1-so2f.onrender.com',
        changeOrigin: true,
      },
    },
  },
})
