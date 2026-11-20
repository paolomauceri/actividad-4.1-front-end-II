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
import { docsRouter } from './docs/swagger.js';
import { notFound } from './middleware/not-found.js';
import { errorHandler } from './middleware/error-handler.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json({ limit: '100kb' }));
  if (env.NODE_ENV !== 'test') app.use(morgan('dev'));

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
  app.use('/api/docs', docsRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
