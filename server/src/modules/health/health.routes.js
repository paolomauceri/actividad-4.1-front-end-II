import { Router } from 'express';
import { query } from '../../db/pool.js';

export const healthRouter = Router();

// GET /api/health — comprueba que la API y la base de datos respondan.
healthRouter.get('/', async (req, res) => {
  await query('SELECT 1');
  res.json({ status: 'ok', db: 'ok' });
});
