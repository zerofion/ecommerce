import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@firebase/app',
      '@firebase/auth',
      '@firebase/firestore',
      '@firebase/storage'
    ]
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true
  }
})
