import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Usar base relativa para máxima compatibilidad entre hostings
  base: './'
})
