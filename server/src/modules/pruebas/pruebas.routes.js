// Pruebas (competencias) de un torneo: /api/torneos/:torneoId/pruebas y /api/pruebas/:id
import { Router } from 'express';
import { body, matchedData } from 'express-validator';
import { optionalAuth, requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { HttpError } from '../../utils/http-error.js';
import { errorDeCampo, idDeRuta } from '../../utils/params.js';
import { findTorneo } from '../torneos/torneos.repository.js';
import { torneoVisible } from '../torneos/torneos.routes.js';
import {
  countInscripcionesPrueba,
  deletePrueba,
  existeDeporte,
  findPrueba,
  insertPrueba,
  listPruebasDeTorneo,
  updateEstadoPrueba,
  updatePrueba,
} from './pruebas.repository.js';

export const pruebasRouter = Router();

export const ESTADOS_PRUEBA = ['PROGRAMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA'];
const soloAdmin = [requireAuth, requireRole('ADMIN')];
const NO_EXISTE = 'La prueba no existe';

const FECHA_HORA = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/;

const pruebaRules = [
  body('deporteId').isInt({ min: 1 }).withMessage('Selecciona un deporte').toInt(),
  body('nombre')
    .isString().withMessage('Campo obligatorio')
    .trim()
    .isLength({ min: 3, max: 120 }).withMessage('Debe tener entre 3 y 120 caracteres'),
  body('distanciaM')
    .isInt({ min: 1, max: 1000000 }).withMessage('La distancia debe ser un número entero de metros mayor que 0')
    .toInt(),
  body('fechaHora')
    .isString().withMessage('Indica fecha y hora')
    .bail()
    .custom((v) => {
      const m = FECHA_HORA.exec(v);
      if (!m) return false;
      const [, fecha, hh, mm, ss = '00'] = m;
      return !Number.isNaN(Date.parse(`${fecha}T${hh}:${mm}:${ss}Z`)) && Number(hh) < 24 && Number(mm) < 60;
    })
    .withMessage('Usa el formato AAAA-MM-DDTHH:MM')
    .bail()
    // Se guarda como 'YYYY-MM-DD HH:mm:ss'
    .customSanitizer((v) => {
      const [, fecha, hh, mm, ss = '00'] = FECHA_HORA.exec(v);
      return `${fecha} ${hh}:${mm}:${ss}`;
    }),
  body('cupo')
    .optional({ values: 'null' })
    .isInt({ min: 1, max: 10000 }).withMessage('El cupo debe ser un número entre 1 y 10000')
    .toInt(),
];

const estadoRules = [body('estado').isIn(ESTADOS_PRUEBA).withMessage(`Debe ser uno de: ${ESTADOS_PRUEBA.join(', ')}`)];

/** Reglas que dependen de la base: el deporte existe y la fecha cae dentro del torneo. */
async function validarContraTorneo(torneo, datos) {
  if (!(await existeDeporte(datos.deporteId))) throw errorDeCampo('deporteId', 'El deporte no existe');
  const dia = datos.fechaHora.slice(0, 10);
  if (dia < torneo.fechaInicio || dia > torneo.fechaFin) {
    throw errorDeCampo('fechaHora', `Debe estar entre el ${torneo.fechaInicio} y el ${torneo.fechaFin} (fechas del torneo)`);
  }
}

async function pruebaExistente(idTexto) {
  const prueba = await findPrueba(idDeRuta(idTexto, NO_EXISTE));
  if (!prueba) throw new HttpError(404, 'NOT_FOUND', NO_EXISTE);
  return prueba;
}

// GET /api/torneos/:torneoId/pruebas — público si el torneo está publicado
pruebasRouter.get('/torneos/:torneoId/pruebas', optionalAuth, async (req, res) => {
  const torneo = await torneoVisible(idDeRuta(req.params.torneoId, 'El torneo no existe'), req.user);
  res.json(await listPruebasDeTorneo(torneo.id));
});

// POST /api/torneos/:torneoId/pruebas
pruebasRouter.post('/torneos/:torneoId/pruebas', soloAdmin, validate(pruebaRules), async (req, res) => {
  const torneo = await findTorneo(idDeRuta(req.params.torneoId, 'El torneo no existe'));
  if (!torneo) throw new HttpError(404, 'NOT_FOUND', 'El torneo no existe');

  const datos = matchedData(req, { locations: ['body'] });
  await validarContraTorneo(torneo, datos);
  const id = await insertPrueba(torneo.id, datos);
  res.status(201).json({ prueba: await findPrueba(id) });
});

// PUT /api/pruebas/:id
pruebasRouter.put('/pruebas/:id', soloAdmin, validate(pruebaRules), async (req, res) => {
  const prueba = await pruebaExistente(req.params.id);
  const datos = matchedData(req, { locations: ['body'] });
  await validarContraTorneo(await findTorneo(prueba.torneoId), datos);

  if (datos.cupo != null && datos.cupo < prueba.inscritos) {
    throw new HttpError(
      409,
      'CUPO_LLENO',
      `El cupo no puede ser menor que los ${prueba.inscritos} atletas ya inscritos.`,
    );
  }

  await updatePrueba(prueba.id, datos);
  res.json({ prueba: await findPrueba(prueba.id) });
});

// PATCH /api/pruebas/:id/estado
pruebasRouter.patch('/pruebas/:id/estado', soloAdmin, validate(estadoRules), async (req, res) => {
  const prueba = await pruebaExistente(req.params.id);
  await updateEstadoPrueba(prueba.id, matchedData(req, { locations: ['body'] }).estado);
  res.json({ prueba: await findPrueba(prueba.id) });
});

// DELETE /api/pruebas/:id — solo si no tiene inscripciones
pruebasRouter.delete('/pruebas/:id', soloAdmin, async (req, res) => {
  const prueba = await pruebaExistente(req.params.id);
  if ((await countInscripcionesPrueba(prueba.id)) > 0) {
    throw new HttpError(409, 'TIENE_INSCRIPCIONES', 'No se puede eliminar una prueba que tiene inscripciones.');
  }
  await deletePrueba(prueba.id);
  res.status(204).end();
});
