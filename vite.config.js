import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    svgr({ svgrOptions: { exportType: 'default' } }),
    react(),
  ],
  build: { outDir: 'build' },
  server: { port: 3000, open: true },
})
