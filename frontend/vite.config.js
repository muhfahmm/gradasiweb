import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/gradasiweb/',
  server: {
    port: 1001,
    proxy: {
      '/admin': 'http://localhost:1000',
      '/api': 'http://localhost:1000',
      '/uploads': 'http://localhost:1000'
    }
  }
})
