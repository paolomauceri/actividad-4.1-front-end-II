import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'icon.svg'],
      manifest: {
        name: 'Podio — Torneos multideporte',
        short_name: 'Podio',
        description:
          'Gestión de torneos de natación, aguas abiertas, acuatlón, triatlón y atletismo: inscripciones, tiempos y resultados.',
        lang: 'es',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0b2545',
        background_color: '#f6f8fb',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/socket\.io/],
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        runtimeCaching: [
          {
            // Próximos torneos: se muestran aunque no haya conexión (última copia guardada)
            urlPattern: ({ url }) => url.pathname === '/api/torneos/proximos',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-torneos',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            // Datos públicos ya visitados (torneos, detalle, resultados, deportes): sin
            // conexión se muestra la última copia. Siempre se intenta la red primero.
            urlPattern: ({ url, request }) =>
              request.method === 'GET' &&
              /^\/api\/(torneos(\/\d+)?|pruebas\/\d+\/resultados|deportes)$/.test(url.pathname),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-publica',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
      // Socket.IO (tiempos en vivo) usa WebSocket hacia la API
      '/socket.io': { target: 'http://localhost:3000', changeOrigin: true, ws: true },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
      // Socket.IO (tiempos en vivo) usa WebSocket hacia la API
      '/socket.io': { target: 'http://localhost:3000', changeOrigin: true, ws: true },
    },
  },
});
