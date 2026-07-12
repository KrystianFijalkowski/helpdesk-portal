import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Żądania na /api lecą do backendu FastAPI — frontend i backend
    // zachowują się jak jedna aplikacja
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
