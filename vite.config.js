import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import config from './config/index.js'

export default defineConfig(({ command, mode }) => {
  const isDev = mode === 'development'
  
  return {
    plugins: [vue()],
    server: {
      host: config.client.host,
      port: config.client.port,
      proxy: {
        '/api': {
          target: `http://${config.server.host}:${config.server.port}`,
          changeOrigin: true,
          secure: false,
          ws: true
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: isDev,
      minify: !isDev,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['vue', 'vue-router', 'axios']
          }
        }
      }
    },
    define: {
      __API_URL__: JSON.stringify(config.client.apiUrl)
    }
  }
}) 