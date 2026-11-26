// Atletas: consulta (ADMIN), alta por el ADMIN y perfil propio (ATLETA).
import { Router } from 'express';
import { body, matchedData } from 'express-validator';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { HttpError } from '../../utils/http-error.js';
import { enteroEnRango, idDeRuta } from '../../utils/params.js';
import { reglaNombre, registerRules } from '../auth/auth.validators.js';
import { registerAtleta } from '../auth/auth.service.js';
import { listInscripciones } from '../inscripciones/inscripciones.repository.js';
import { findAtleta, searchAtletas, updatePerfil } from './atletas.repository.js';

export const atletasRouter = Router();

atletasRouter.use(requireAuth);

const perfilRules = [
  reglaNombre('nombre'),
  reglaNombre('apellido'),
  body('club')
    .optional({ values: 'falsy' })
    .isString().trim()
    .isLength({ max: 80 }).withMessage('Máximo 80 caracteres'),
  body('telefono')
    .optional({ values: 'falsy' })
    .isString().trim()
    .isLength({ max: 20 }).withMessage('Máximo 20 caracteres')
    .matches(/^[0-9+()\-\s]+$/).withMessage('Solo números, espacios y + ( ) -'),
];

// GET /api/atletas/me — perfil del atleta que inició sesión
atletasRouter.get('/me', requireRole('ATLETA'), async (req, res) => {
  res.json({ atleta: await findAtleta(req.user.id) });
});

// PUT /api/atletas/me — solo nombre, apellido, club y teléfono (documento, fecha y sexo definen la categoría)
atletasRouter.put('/me', requireRole('ATLETA'), validate(perfilRules), async (req, res) => {
  await updatePerfil(req.user.id, matchedData(req, { locations: ['body'] }));
  res.json({ atleta: await findAtleta(req.user.id) });
});

// GET /api/atletas?q=&page=&limit= — búsqueda (ADMIN)
atletasRouter.get('/', requireRole('ADMIN'), async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 80) : '';
  res.json(
    await searchAtletas({
      q,
      page: enteroEnRango(req.query.page, 1, 1, 100000),
      limit: enteroEnRango(req.query.limit, 20, 1, 100),
    }),
  );
});

// GET /api/atletas/:id — ficha con inscripciones y resultados (ADMIN)
atletasRouter.get('/:id', requireRole('ADMIN'), async (req, res) => {
  const atleta = await findAtleta(idDeRuta(req.params.id, 'El atleta no existe'));
  if (!atleta) throw new HttpError(404, 'NOT_FOUND', 'El atleta no existe');
  res.json({ atleta, inscripciones: await listInscripciones({ atletaId: atleta.id, incluirAnuladas: true }) });
});

// POST /api/atletas — el ADMIN registra un atleta (mismas reglas que el registro público)
atletasRouter.post('/', requireRole('ADMIN'), validate(registerRules), async (req, res) => {
  const { usuario } = await registerAtleta(matchedData(req, { locations: ['body'] }));
  res.status(201).json({ atleta: await findAtleta(usuario.id) });
});
