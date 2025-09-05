import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './', // GitHub Pages用にbaseパスを設定
  server: {
    watch: {
      usePolling: true
    }
  }
})
