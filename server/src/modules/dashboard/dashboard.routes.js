import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { getResumen } from './dashboard.repository.js';

export const dashboardRouter = Router();

// GET /api/dashboard/resumen — indicadores del panel de administración
dashboardRouter.get('/resumen', requireAuth, requireRole('ADMIN'), async (req, res) => {
  res.json(await getResumen());
});
