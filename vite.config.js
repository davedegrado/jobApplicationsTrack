import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' -> funziona sia in locale sia su GitHub Pages
// (anche quando il sito sta in https://utente.github.io/nome-repo/)
export default defineConfig({
  plugins: [react()],
  base: './',
})
