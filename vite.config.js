import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  // --- START OF ADDED CONFIGURATION ---
  server: {
    // This tells the dev server to redirect all requests to index.html,
    // which allows React Router to handle client-side routing.
    historyApiFallback: true,
  }
  // --- END OF ADDED CONFIGURATION ---
})
