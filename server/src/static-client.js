// En producción Express también entrega la app React (build de Vite), así
// frontend, API y tiempo real comparten una sola URL.
import express from 'express';
import path from 'node:path';

/** Archivos que deben revalidarse siempre para que la PWA se actualice. */
const SIN_CACHE = /(?:^|\/)(?:index\.html|sw\.js|registerSW\.js|manifest\.webmanifest)$/;

export function serveClient(app, distDir) {
  app.use(
    express.static(distDir, {
      index: false,
      setHeaders(res, archivo) {
        const ruta = archivo.replaceAll('\\', '/');
        if (SIN_CACHE.test(ruta)) {
          res.setHeader('Cache-Control', 'no-cache');
        } else if (ruta.includes('/assets/')) {
          // Los archivos de /assets llevan hash en el nombre: se pueden guardar un año
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      },
    }),
  );

  // Rutas del frontend (React Router): siempre index.html. La API y Socket.IO siguen su camino.
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(distDir, 'index.html'));
  });
}
