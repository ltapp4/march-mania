import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const NCAA_PROXY_PREFIX = '/api/ncaa'
const NCAA_API_ORIGIN = 'https://ncaa-api.henrygd.me'

const ncaaProxy = {
  [NCAA_PROXY_PREFIX]: {
    target: NCAA_API_ORIGIN,
    changeOrigin: true,
    rewrite: (requestPath) =>
      requestPath.replace(new RegExp(`^${NCAA_PROXY_PREFIX}`), ''),
  },
}

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: ncaaProxy,
  },
  preview: {
    proxy: ncaaProxy,
  },
})
