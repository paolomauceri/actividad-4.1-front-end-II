// Inscripciones: el atleta se inscribe a sí mismo; el ADMIN inscribe a cualquiera y corrige dorsales.
import { Router } from 'express';
import { body, matchedData } from 'express-validator';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { HttpError } from '../../utils/http-error.js';
import { enteroEnRango, errorDeCampo, idDeRuta } from '../../utils/params.js';
import { findInscripcion, listInscripciones, updateInscripcion } from './inscripciones.repository.js';
import { inscribir } from './inscripciones.service.js';

export const inscripcionesRouter = Router();

inscripcionesRouter.use(requireAuth);

const NO_EXISTE = 'La inscripción no existe';

// POST /api/inscripciones — { pruebaId, atletaId? }
inscripcionesRouter.post(
  '/',
  requireRole('ATLETA', 'ADMIN'),
  validate([
    body('pruebaId').isInt({ min: 1 }).withMessage('Indica la prueba').toInt(),
    body('atletaId').optional({ values: 'null' }).isInt({ min: 1 }).withMessage('Atleta inválido').toInt(),
  ]),
  async (req, res) => {
    const { pruebaId, atletaId } = matchedData(req, { locations: ['body'] });
    const esAdmin = req.user.rol === 'ADMIN';
    if (esAdmin && !atletaId) throw errorDeCampo('atletaId', 'Indica el atleta a inscribir');

    const id = await inscribir({ pruebaId, atletaId: esAdmin ? atletaId : req.user.id, rol: req.user.rol });
    res.status(201).json({ inscripcion: await findInscripcion(id) });
  },
);

// GET /api/inscripciones/mias — inscripciones del atleta que inició sesión
inscripcionesRouter.get('/mias', requireRole('ATLETA'), async (req, res) => {
  res.json(await listInscripciones({ atletaId: req.user.id, incluirAnuladas: true }));
});

// GET /api/inscripciones?pruebaId=&torneoId=&incluirAnuladas=1 — ADMIN y JUEZ
inscripcionesRouter.get('/', requireRole('ADMIN', 'JUEZ'), async (req, res) => {
  const pruebaId = enteroEnRango(req.query.pruebaId, 0, 0, 4294967295);
  const torneoId = enteroEnRango(req.query.torneoId, 0, 0, 4294967295);
  if (!pruebaId && !torneoId) throw errorDeCampo('pruebaId', 'Indica pruebaId o torneoId');

  res.json(
    await listInscripciones({
      pruebaId: pruebaId || undefined,
      torneoId: torneoId || undefined,
      incluirAnuladas: req.query.incluirAnuladas === '1' || req.query.incluirAnuladas === 'true',
    }),
  );
});

// PATCH /api/inscripciones/:id — { dorsal?, estado? }
inscripcionesRouter.patch(
  '/:id',
  requireRole('ATLETA', 'ADMIN'),
  validate([
    // Tope 9999: deja lugar para el dorsal automático (MAX + 1) dentro del SMALLINT de la base
    body('dorsal').optional().isInt({ min: 1, max: 9999 }).withMessage('Dorsal entre 1 y 9999').toInt(),
    body('estado').optional().isIn(['CONFIRMADA', 'ANULADA']).withMessage('Debe ser CONFIRMADA o ANULADA'),
  ]),
  async (req, res) => {
    const inscripcion = await findInscripcion(idDeRuta(req.params.id, NO_EXISTE));
    if (!inscripcion) throw new HttpError(404, 'NOT_FOUND', NO_EXISTE);
    const cambios = matchedData(req, { locations: ['body'] });

    if (req.user.rol === 'ATLETA') {
      // El atleta solo puede anular su propia inscripción mientras el torneo está abierto
      const soloAnula = cambios.estado === 'ANULADA' && cambios.dorsal === undefined;
      if (inscripcion.atletaId !== req.user.id || !soloAnula) {
        throw new HttpError(403, 'FORBIDDEN', 'Solo puedes anular tus propias inscripciones.');
      }
      if (inscripcion.torneoEstado !== 'ABIERTO') {
        throw new HttpError(409, 'TORNEO_NO_ABIERTO', 'El torneo ya no admite cambios en las inscripciones.');
      }
    }

    try {
      await updateInscripcion(inscripcion.id, cambios);
    } catch (err) {
      if (err?.code === 'ER_DUP_ENTRY' && err.message.includes('uq_inscripciones_prueba_dorsal')) {
        throw new HttpError(409, 'DORSAL_TAKEN', `El dorsal ${cambios.dorsal} ya está asignado en esta prueba.`, [
          { campo: 'dorsal', mensaje: 'Ese dorsal ya está asignado' },
        ]);
      }
      throw err;
    }
    res.json({ inscripcion: await findInscripcion(inscripcion.id) });
  },
);
