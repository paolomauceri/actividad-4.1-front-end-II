import { Router } from 'express';
import { body, matchedData } from 'express-validator';
import { withTransaction } from '../../db/pool.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { HttpError } from '../../utils/http-error.js';
import { enteroEnRango, idDeRuta } from '../../utils/params.js';
import { reglaEmail, reglaNombre, reglaPassword } from '../auth/auth.validators.js';
import { hashPassword } from '../auth/auth.service.js';
import { findPublicoById, insertUsuario, listUsuarios, mapDuplicateError, updateActivo } from './usuarios.repository.js';

export const usuariosRouter = Router();

const ROLES = ['ADMIN', 'JUEZ', 'ATLETA'];

usuariosRouter.use(requireAuth, requireRole('ADMIN'));

// GET /api/usuarios?page=1&limit=20&rol=JUEZ
usuariosRouter.get('/', async (req, res) => {
  const page = enteroEnRango(req.query.page, 1, 1, 100000);
  const limit = enteroEnRango(req.query.limit, 20, 1, 100);
  const rol = req.query.rol ? String(req.query.rol).toUpperCase() : undefined;

  if (rol && !ROLES.includes(rol)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Datos inválidos', [
      { campo: 'rol', mensaje: `Debe ser uno de: ${ROLES.join(', ')}` },
    ]);
  }

  res.json(await listUsuarios({ page, limit, rol }));
});

// POST /api/usuarios — el ADMIN crea jueces y administradores
const crearUsuarioRules = [
  reglaNombre('nombre'),
  reglaNombre('apellido'),
  reglaEmail(),
  reglaPassword(),
  body('rol').isIn(['ADMIN', 'JUEZ']).withMessage('Solo se pueden crear usuarios ADMIN o JUEZ'),
];

usuariosRouter.post('/', validate(crearUsuarioRules), async (req, res) => {
  const datos = matchedData(req, { locations: ['body'] });
  const passwordHash = await hashPassword(datos.password);

  let id;
  try {
    id = await withTransaction((conn) => insertUsuario(conn, { ...datos, passwordHash }));
  } catch (err) {
    throw mapDuplicateError(err);
  }

  res.status(201).json({ usuario: await findPublicoById(id) });
});

// PATCH /api/usuarios/:id/activo — activa o desactiva una cuenta (una cuenta desactivada no puede iniciar sesión)
usuariosRouter.patch(
  '/:id/activo',
  validate([body('activo').isBoolean({ strict: true }).withMessage('Debe ser true o false').toBoolean()]),
  async (req, res) => {
    const id = idDeRuta(req.params.id, 'El usuario no existe');
    if (id === req.user.id) {
      throw new HttpError(403, 'FORBIDDEN', 'No puedes desactivar tu propia cuenta.');
    }
    if (!(await findPublicoById(id))) throw new HttpError(404, 'NOT_FOUND', 'El usuario no existe');

    await updateActivo(id, matchedData(req, { locations: ['body'] }).activo);
    res.json({ usuario: await findPublicoById(id) });
  },
);
