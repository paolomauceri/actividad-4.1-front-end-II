// Construye la aplicación Express (sin levantar el puerto: eso lo hace server.js).
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { healthRouter } from './modules/health/health.routes.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { usuariosRouter } from './modules/usuarios/usuarios.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { torneosRouter } from './modules/torneos/torneos.routes.js';
import { deportesRouter } from './modules/deportes/deportes.routes.js';
import { pruebasRouter } from './modules/pruebas/pruebas.routes.js';
import { categoriasRouter } from './modules/categorias/categorias.routes.js';
import { atletasRouter } from './modules/atletas/atletas.routes.js';
import { inscripcionesRouter } from './modules/inscripciones/inscripciones.routes.js';
import { docsRouter } from './docs/swagger.js';
import { notFound } from './middleware/not-found.js';
import { errorHandler } from './middleware/error-handler.js';
import { authLimiter } from './middleware/rate-limit.js';
import { serveClient } from './static-client.js';

/**
 * @param {{ authRateLimit?: number, serveClient?: boolean, clientDist?: string }} [opciones]
 *   authRateLimit: intentos de login/registro por IP cada 15 min.
 *   serveClient:   entregar también la app React (producción).
 */
export function createApp({
  authRateLimit = env.AUTH_RATE_LIMIT,
  serveClient: entregarCliente = env.NODE_ENV === 'production',
  clientDist = env.CLIENT_DIST,
} = {}) {
  const app = express();
  const produccion = env.NODE_ENV === 'production';

  app.disable('x-powered-by');
  // Render (y cualquier proxy) agrega X-Forwarded-For: se necesita para limitar por IP real
  if (produccion) app.set('trust proxy', 1);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          // Socket.IO usa WebSocket hacia el mismo servidor
          'connect-src': ["'self'", 'ws:', 'wss:'],
          // En local (http) no se fuerza https para los recursos
          'upgrade-insecure-requests': produccion ? [] : null,
        },
      },
    }),
  );
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json({ limit: '100kb' }));
  if (env.NODE_ENV !== 'test') app.use(morgan(produccion ? 'combined' : 'dev'));

  const limitarAuth = authLimiter(authRateLimit);
  app.use('/api/auth/login', limitarAuth);
  app.use('/api/auth/register', limitarAuth);

  // GET /api — índice de la API con enlaces útiles
  app.get('/api', (req, res) => {
    res.json({
      nombre: 'Podio API',
      version: '0.1.0',
      descripcion: 'Gestión de torneos de natación, aguas abiertas, acuatlón, triatlón y atletismo',
      enlaces: { health: '/api/health', docs: '/api/docs' },
    });
  });
  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/usuarios', usuariosRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/torneos', torneosRouter);
  app.use('/api/deportes', deportesRouter);
  app.use('/api', pruebasRouter);
  app.use('/api', categoriasRouter);
  app.use('/api/atletas', atletasRouter);
  app.use('/api/inscripciones', inscripcionesRouter);
  app.use('/api/docs', docsRouter);

  if (entregarCliente) serveClient(app, clientDist);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
