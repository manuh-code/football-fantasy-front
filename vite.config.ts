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
          } catch {
            // Si la URL está mal formada, redirigir a la página principal
            res.writeHead(302, { 'Location': '/' })
            res.end()
          }
        })
      }
    },
    VitePWA({
      registerType: 'prompt',
      // Emitir el manifest como /manifest.json (PWABuilder y las tiendas lo esperan en esa URL)
      manifestFilename: 'manifest.json',
      includeAssets: [
        'favicon.ico',
        'img/icons/apple-touch-icon.png',
        'img/icons/safari-pinned-tab.svg'
      ],
      manifest: {
        id: '/',
        lang: 'es',
        dir: 'ltr',
        name: 'Football Fantasy',
        short_name: 'FootballFantasy',
        description: 'Fantasy football de la Liga MX: arma tu equipo, compite en drafts en vivo, quinielas y survivor con tus amigos.',
        theme_color: '#059669',
        // Matches the inline #app-splash background in index.html so Android's
        // native (manifest-driven) splash blends into the HTML splash instead of
        // flashing white → gray on launch.
        background_color: '#f9fafb',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['sports', 'games', 'entertainment'],
        prefer_related_applications: false,
        launch_handler: {
          client_mode: 'navigate-existing'
        },
        icons: [
          {
            src: 'img/icons/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'img/icons/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
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
        ],
        shortcuts: [
          {
            name: 'Mis ligas fantasy',
            short_name: 'Fantasy',
            url: '/my/fantasy/leagues',
            icons: [
              {
                src: 'img/icons/android-chrome-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              }
            ]
          },
          {
            name: 'Quinielas',
            short_name: 'Quinielas',
            url: '/pools',
            icons: [
              {
                src: 'img/icons/android-chrome-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              }
            ]
          },
          {
            name: 'Survivor',
            short_name: 'Survivor',
            url: '/survivor',
            icons: [
              {
                src: 'img/icons/android-chrome-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              }
            ]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // El SW de Firebase (public/firebase-messaging-sw.js) NO debe entrar al
        // precache de Workbox: se registra aparte en usePushNotifications con su
        // propio scope (/firebase-cloud-messaging-push-scope). Excluirlo hace que
        // navigator.serviceWorker.register() siempre resuelva contra el archivo
        // estático y lo desacopla del ciclo de vida del SW de la PWA.
        globIgnores: ['firebase-messaging-sw.js'],
        // Al activarse un SW nuevo, borra los precaches de versiones anteriores.
        cleanupOutdatedCaches: true
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
        // Function form (object form was removed in Vite 8 / rolldown).
        manualChunks(id) {
          if (id.includes('node_modules/oh-vue-icons')) return 'icons'
          if (
            id.includes('node_modules/vue-router') ||
            id.includes('node_modules/pinia') ||
            id.includes('node_modules/vue/') ||
            id.includes('node_modules/@vue/')
          ) {
            return 'vendor'
          }
        }
      }
    }
  },
  server: {
    port: 5174,
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
