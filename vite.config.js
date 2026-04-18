import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
    host: true
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        manualChunks: {
          vue: ['vue', 'vue-router'],
          elementPlus: ['element-plus', '@element-plus/icons-vue'],
          echarts: ['echarts']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true
  },
  css: {
    preprocessorOptions: {
      css: {
        charset: false
      }
    }
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'element-plus', 'echarts', 'axios'],
    exclude: []
  }
})
