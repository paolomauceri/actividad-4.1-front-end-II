import { Router } from 'express';
import { matchedData } from 'express-validator';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { HttpError } from '../../utils/http-error.js';
import { findPublicoById } from '../usuarios/usuarios.repository.js';
import { loginRules, registerRules } from './auth.validators.js';
import { login, registerAtleta } from './auth.service.js';

export const authRouter = Router();

// POST /api/auth/register — registro público de atletas
authRouter.post('/register', validate(registerRules), async (req, res) => {
  // matchedData descarta campos no permitidos (por ejemplo, un "rol" enviado por el cliente)
  const datos = matchedData(req, { locations: ['body'] });
  const resultado = await registerAtleta(datos);
  res.status(201).json(resultado);
});

// POST /api/auth/login
authRouter.post('/login', validate(loginRules), async (req, res) => {
  const { email, password } = matchedData(req, { locations: ['body'] });
  res.json(await login(email, password));
});

// GET /api/auth/me — usuario de la sesión actual
authRouter.get('/me', requireAuth, async (req, res) => {
  const usuario = await findPublicoById(req.user.id);
  if (!usuario) throw new HttpError(401, 'UNAUTHORIZED', 'Tu sesión no es válida o expiró.');
  res.json({ usuario });
});
