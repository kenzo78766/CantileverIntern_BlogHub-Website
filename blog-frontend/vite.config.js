import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add this for Render deployment
  server: {
    host: true, // allows Vite dev server to listen on all network interfaces
  },
  preview: {
    allowedHosts: ['cantileverintern-bloghub-frontend.onrender.com'],
  },
})
