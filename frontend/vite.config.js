const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')
const path = require('path')

module.exports = defineConfig({
  plugins: [react()],
  root: path.join(__dirname, 'src'),
  publicDir: '../public',
  build: {
    outDir: '../dist',
    sourcemap: true,
    minify: 'esbuild',
    target: 'esnext'
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})