import { copyFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

function copyManifest() {
  return {
    name: 'copy-manifest',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist')
      mkdirSync(distDir, { recursive: true })
      copyFileSync(resolve(__dirname, 'manifest.json'), resolve(distDir, 'manifest.json'))
    }
  }
}

export default defineConfig({
  plugins: [vue(), tailwindcss(), copyManifest()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html')
      }
    }
  },
  server: {
    fs: {
      allow: [resolve(__dirname, '..')]
    }
  }
})
