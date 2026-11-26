// Categorías de un torneo: /api/torneos/:torneoId/categorias y /api/categorias/:id
import { Router } from 'express';
import { body, matchedData } from 'express-validator';
import { optionalAuth, requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { HttpError } from '../../utils/http-error.js';
import { idDeRuta } from '../../utils/params.js';
import { findTorneo } from '../torneos/torneos.repository.js';
import { torneoVisible } from '../torneos/torneos.routes.js';
import {
  countInscripcionesCategoria,
  deleteCategoria,
  findCategoria,
  findCategoriaSolapada,
  insertCategoria,
  listCategoriasDeTorneo,
  updateCategoria,
} from './categorias.repository.js';

export const categoriasRouter = Router();

const soloAdmin = [requireAuth, requireRole('ADMIN')];
const NO_EXISTE = 'La categoría no existe';

const categoriaRules = [
  body('nombre')
    .isString().withMessage('Campo obligatorio')
    .trim()
    .isLength({ min: 2, max: 60 }).withMessage('Debe tener entre 2 y 60 caracteres'),
  body('sexo').isIn(['M', 'F', 'MIXTO']).withMessage('Debe ser M, F o MIXTO'),
  body('edadMin').isInt({ min: 0, max: 120 }).withMessage('Edad entre 0 y 120').toInt(),
  body('edadMax')
    .isInt({ min: 0, max: 120 }).withMessage('Edad entre 0 y 120')
    .bail()
    .toInt()
    .custom((max, { req }) => !Number.isInteger(Number(req.body.edadMin)) || max >= Number(req.body.edadMin))
    .withMessage('La edad máxima no puede ser menor que la mínima'),
];

async function verificarSolapamiento(torneoId, datos, excluirId) {
  const otra = await findCategoriaSolapada(torneoId, datos, excluirId);
  if (otra) {
    throw new HttpError(
      409,
      'CATEGORIA_SOLAPADA',
      `Se cruza con la categoría «${otra.nombre}» (${otra.edad_min}–${otra.edad_max} años). Cada atleta debe caer en una sola categoría.`,
    );
  }
}

/** Traduce el nombre repetido (índice uq_categorias_torneo_nombre) a 409. */
function mapNombreRepetido(err) {
  if (err?.code === 'ER_DUP_ENTRY' && err.message.includes('uq_categorias_torneo_nombre')) {
    return new HttpError(409, 'CATEGORIA_DUPLICADA', 'Ya existe una categoría con ese nombre en el torneo.', [
      { campo: 'nombre', mensaje: 'Ya existe una categoría con ese nombre' },
    ]);
  }
  return err;
}

async function categoriaExistente(idTexto) {
  const categoria = await findCategoria(idDeRuta(idTexto, NO_EXISTE));
  if (!categoria) throw new HttpError(404, 'NOT_FOUND', NO_EXISTE);
  return categoria;
}

// GET /api/torneos/:torneoId/categorias — público si el torneo está publicado
categoriasRouter.get('/torneos/:torneoId/categorias', optionalAuth, async (req, res) => {
  const torneo = await torneoVisible(idDeRuta(req.params.torneoId, 'El torneo no existe'), req.user);
  res.json(await listCategoriasDeTorneo(torneo.id));
});

// POST /api/torneos/:torneoId/categorias
categoriasRouter.post('/torneos/:torneoId/categorias', soloAdmin, validate(categoriaRules), async (req, res) => {
  const torneo = await findTorneo(idDeRuta(req.params.torneoId, 'El torneo no existe'));
  if (!torneo) throw new HttpError(404, 'NOT_FOUND', 'El torneo no existe');

  const datos = matchedData(req, { locations: ['body'] });
  await verificarSolapamiento(torneo.id, datos);
  let id;
  try {
    id = await insertCategoria(torneo.id, datos);
  } catch (err) {
    throw mapNombreRepetido(err);
  }
  res.status(201).json({ categoria: await findCategoria(id) });
});

// PUT /api/categorias/:id — con inscritos solo se puede cambiar el nombre
categoriasRouter.put('/categorias/:id', soloAdmin, validate(categoriaRules), async (req, res) => {
  const categoria = await categoriaExistente(req.params.id);
  const datos = matchedData(req, { locations: ['body'] });

  const cambiaReglas =
    datos.sexo !== categoria.sexo || datos.edadMin !== categoria.edadMin || datos.edadMax !== categoria.edadMax;
  if (cambiaReglas && (await countInscripcionesCategoria(categoria.id, { soloActivas: true })) > 0) {
    throw new HttpError(
      409,
      'TIENE_INSCRIPCIONES',
      'Esta categoría ya tiene inscritos: solo puedes cambiar su nombre (las edades y el sexo definen quién pertenece a ella).',
    );
  }

  await verificarSolapamiento(categoria.torneoId, datos, categoria.id);
  try {
    await updateCategoria(categoria.id, datos);
  } catch (err) {
    throw mapNombreRepetido(err);
  }
  res.json({ categoria: await findCategoria(categoria.id) });
});

// DELETE /api/categorias/:id — solo si nadie la usa
categoriasRouter.delete('/categorias/:id', soloAdmin, async (req, res) => {
  const categoria = await categoriaExistente(req.params.id);
  if ((await countInscripcionesCategoria(categoria.id)) > 0) {
    throw new HttpError(409, 'TIENE_INSCRIPCIONES', 'No se puede eliminar una categoría que tiene inscripciones.');
  }
  await deleteCategoria(categoria.id);
  res.status(204).end();
});
