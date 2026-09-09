import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules")) {
            if (/react-router|\/react\/|\/react-dom\//.test(id)) return "react-vendor";
            if (/@tanstack|axios|zustand/.test(id)) return "query-vendor";
            if (/framer-motion/.test(id)) return "motion-vendor";
            if (/react-hook-form|zod|@hookform/.test(id)) return "form-vendor";
          }
        },
      },
    },
  },
})
