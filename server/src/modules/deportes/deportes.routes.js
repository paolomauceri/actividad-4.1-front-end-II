import { Router } from 'express';
import { query } from '../../db/pool.js';

export const deportesRouter = Router();

// GET /api/deportes — catálogo público (aguas abiertas, natación, acuatlón, triatlón, atletismo)
deportesRouter.get('/', async (req, res) => {
  res.json(await query('SELECT id, nombre, descripcion FROM deportes ORDER BY nombre'));
});
