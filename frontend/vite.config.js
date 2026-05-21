import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

const basicAuthPlugin = {
  name: 'basic-auth',
  configureServer(server) {
    const authUser = process.env.AUTH_USER
    const authPass = process.env.AUTH_PASS || ''
    if (!authUser) return
    server.middlewares.use((req, res, next) => {
      const header = req.headers['authorization'] || ''
      if (header.startsWith('Basic ')) {
        const decoded = Buffer.from(header.slice(6), 'base64').toString('utf-8')
        const sep = decoded.indexOf(':')
        if (decoded.slice(0, sep) === authUser && decoded.slice(sep + 1) === authPass) {
          return next()
        }
      }
      res.statusCode = 401
      res.setHeader('WWW-Authenticate', 'Basic realm="MiroFish"')
      res.end('Unauthorized')
    })
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), basicAuthPlugin],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@locales': path.resolve(__dirname, '../locales')
    }
  },
  server: {
    port: parseInt(process.env.PORT) || 8080,
    open: false,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})