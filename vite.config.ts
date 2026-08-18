import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    // basicSsl only runs during local dev (vite dev) — not on Vercel/production build
    ...(command === 'serve' ? [basicSsl()] : []),
  ],
  build: {
    target: 'es2020',
  },
  server: {
    host: true,  // expose on local network (Wi-Fi)
    port: 5173,
  },
}))
