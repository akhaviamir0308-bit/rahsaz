import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages: replace 'rahsaz' with your repository name if needed.
  base: '/rahsaz/',
})
