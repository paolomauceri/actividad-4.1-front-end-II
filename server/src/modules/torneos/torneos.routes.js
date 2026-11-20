import { Router } from 'express';
import { listProximos } from './torneos.repository.js';

export const torneosRouter = Router();

// GET /api/torneos/proximos — público (página de inicio)
torneosRouter.get('/proximos', async (req, res) => {
  res.json(await listProximos());
});
