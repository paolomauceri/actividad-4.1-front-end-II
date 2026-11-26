import { Router } from 'express';
import { matchedData } from 'express-validator';
import { optionalAuth, requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { HttpError } from '../../utils/http-error.js';
import { enteroEnRango, errorDeCampo, idDeRuta } from '../../utils/params.js';
import { listCategoriasDeTorneo } from '../categorias/categorias.repository.js';
import { listPruebasDeTorneo } from '../pruebas/pruebas.repository.js';
import {
  countInscripciones,
  deleteTorneo,
  findTorneo,
  insertTorneo,
  listProximos,
  listTorneos,
  updateEstadoTorneo,
  updateTorneo,
} from './torneos.repository.js';
import { ESTADOS_TORNEO, estadoTorneoRules, torneoRules } from './torneos.validators.js';

export const torneosRouter = Router();

const soloAdmin = [requireAuth, requireRole('ADMIN')];
const NO_EXISTE = 'El torneo no existe';

/**
 * Busca el torneo visible para quien consulta: los BORRADOR solo existen para el ADMIN.
 * Lanza 404 si no corresponde mostrarlo.
 */
export async function torneoVisible(id, usuario) {
  const torneo = await findTorneo(id);
  if (!torneo || (torneo.estado === 'BORRADOR' && usuario?.rol !== 'ADMIN')) {
    throw new HttpError(404, 'NOT_FOUND', NO_EXISTE);
  }
  return torneo;
}

async function torneoParaEditar(idTexto) {
  const torneo = await findTorneo(idDeRuta(idTexto, NO_EXISTE));
  if (!torneo) throw new HttpError(404, 'NOT_FOUND', NO_EXISTE);
  return torneo;
}

// GET /api/torneos/proximos — público (página de inicio)
torneosRouter.get('/proximos', async (req, res) => {
  res.json(await listProximos());
});

// GET /api/torneos?estado=&page=&limit= — público; el ADMIN ve también los BORRADOR
torneosRouter.get('/', optionalAuth, async (req, res) => {
  const estado = req.query.estado ? String(req.query.estado).toUpperCase() : undefined;
  if (estado && !ESTADOS_TORNEO.includes(estado)) {
    throw errorDeCampo('estado', `Debe ser uno de: ${ESTADOS_TORNEO.join(', ')}`);
  }
  const esAdmin = req.user?.rol === 'ADMIN';
  if (estado === 'BORRADOR' && !esAdmin) {
    return res.json({ datos: [], total: 0, page: 1, limit: 20 });
  }

  res.json(
    await listTorneos({
      page: enteroEnRango(req.query.page, 1, 1, 100000),
      limit: enteroEnRango(req.query.limit, 20, 1, 100),
      estado,
      incluirBorradores: esAdmin,
    }),
  );
});

// GET /api/torneos/:id — detalle con pruebas y categorías
torneosRouter.get('/:id', optionalAuth, async (req, res) => {
  const torneo = await torneoVisible(idDeRuta(req.params.id, NO_EXISTE), req.user);
  const [pruebas, categorias] = await Promise.all([listPruebasDeTorneo(torneo.id), listCategoriasDeTorneo(torneo.id)]);
  res.json({ torneo: { ...torneo, pruebas, categorias } });
});

// POST /api/torneos — crea un torneo en BORRADOR
torneosRouter.post('/', soloAdmin, validate(torneoRules), async (req, res) => {
  const datos = matchedData(req, { locations: ['body'] });
  const id = await insertTorneo(datos, req.user.id);
  res.status(201).json({ torneo: await findTorneo(id) });
});

// PUT /api/torneos/:id — edita los datos (no el estado)
torneosRouter.put('/:id', soloAdmin, validate(torneoRules), async (req, res) => {
  const torneo = await torneoParaEditar(req.params.id);
  const datos = matchedData(req, { locations: ['body'] });

  // La categoría de cada inscrito se calculó con la edad a la fecha de inicio
  if (datos.fechaInicio !== torneo.fechaInicio && (await countInscripciones(torneo.id, { soloActivas: true })) > 0) {
    throw new HttpError(
      409,
      'TIENE_INSCRIPCIONES',
      'No se puede cambiar la fecha de inicio porque ya hay atletas inscritos (su categoría depende de esa fecha).',
    );
  }

  await updateTorneo(torneo.id, datos);
  res.json({ torneo: await findTorneo(torneo.id) });
});

// PATCH /api/torneos/:id/estado — avanza o retrocede un paso
torneosRouter.patch('/:id/estado', soloAdmin, validate(estadoTorneoRules), async (req, res) => {
  const torneo = await torneoParaEditar(req.params.id);
  const { estado } = matchedData(req, { locations: ['body'] });

  const salto = Math.abs(ESTADOS_TORNEO.indexOf(estado) - ESTADOS_TORNEO.indexOf(torneo.estado));
  if (salto !== 1) {
    throw new HttpError(
      409,
      'TRANSICION_INVALIDA',
      `No se puede pasar de ${torneo.estado} a ${estado}: el estado avanza o retrocede de a un paso (${ESTADOS_TORNEO.join(' → ')}).`,
    );
  }

  await updateEstadoTorneo(torneo.id, estado);
  res.json({ torneo: await findTorneo(torneo.id) });
});

// DELETE /api/torneos/:id — solo si no tiene inscripciones
torneosRouter.delete('/:id', soloAdmin, async (req, res) => {
  const torneo = await torneoParaEditar(req.params.id);
  if ((await countInscripciones(torneo.id)) > 0) {
    throw new HttpError(409, 'TIENE_INSCRIPCIONES', 'No se puede eliminar un torneo que tiene inscripciones.');
  }
  await deleteTorneo(torneo.id);
  res.status(204).end();
});
