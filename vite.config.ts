import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'
import legacy from '@vitejs/plugin-legacy'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    // Plugin personalizado para manejar URLs mal formadas y anti-caché
    {
      name: 'handle-malformed-uri-and-no-cache',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Headers anti-caché para todas las peticiones
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
          res.setHeader('Pragma', 'no-cache')
          res.setHeader('Expires', '0')
          res.setHeader('Surrogate-Control', 'no-store')
          
          try {
            // Intentar decodificar la URL
            if (req.url) {
              decodeURIComponent(req.url)
            }
            next()
          } catch (error) {
            // Si la URL está mal formada, redirigir a la página principal
            res.writeHead(302, { 'Location': '/' })
            res.end()
          }
        })
      }
    },
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['fav-icon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Football Fantasy',
        short_name: 'FootballFantasy',
        description: 'Una aplicación de fantasy football inspirada en el diseño de Laravel Cloud Dashboard',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'img/icons/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'img/icons/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'img/icons/android-chrome-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'img/icons/android-chrome-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Suprimir completamente los warnings de deprecación de SASS
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin'],
        logger: {
          warn: function() {
            // Suprimir warnings
          },
        }
      }
    }
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          icons: ['oh-vue-icons']
        }
      }
    }
  },
  server: {
    port: 8080,
    open: false,  // Deshabilitar apertura automática
    strictPort: false,
    host: 'localhost',
    middlewareMode: false,
    // Configuración adicional para manejar URLs mal formadas
    cors: true,
    fs: {
      strict: false
    },
    // Desactivar caché completamente en desarrollo
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    }
  },
  preview: {
    port: 8080,
    open: false,  // Deshabilitar apertura automática
    strictPort: false,
    host: 'localhost'
  }
})
