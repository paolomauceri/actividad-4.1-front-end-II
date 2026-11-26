// Resultados: el juez registra tiempos; la clasificación es pública.
import { Router } from 'express';
import { body, matchedData } from 'express-validator';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { HttpError } from '../../utils/http-error.js';
import { idDeRuta } from '../../utils/params.js';
import { findResultadosPrueba, listResultadosDeAtleta } from './resultados.repository.js';
import { borrarResultado, guardarResultado } from './resultados.service.js';

export const resultadosRouter = Router();

export const ESTADOS_RESULTADO = ['FINALIZADO', 'DNF', 'DNS', 'DSQ'];
export const TIEMPO_MAX_MS = 86_400_000;
const NO_EXISTE_INSCRIPCION = 'La inscripción no existe';

const vacio = (v) => v === undefined || v === null || v === '';

const resultadoRules = [
  body('estado').isIn(ESTADOS_RESULTADO).withMessage(`Debe ser uno de: ${ESTADOS_RESULTADO.join(', ')}`),
  // FINALIZADO exige tiempo; DNF, DNS y DSQ no llevan tiempo
  body('tiempoMs').custom((valor, { req }) => {
    const finalizado = req.body?.estado === 'FINALIZADO';
    if (finalizado && vacio(valor)) throw new Error('Escribe el tiempo del atleta');
    if (!finalizado && !vacio(valor)) throw new Error('Solo los atletas que terminaron (FINALIZADO) llevan tiempo');
    return true;
  }),
  body('tiempoMs')
    .optional({ values: 'null' })
    .isInt({ min: 1, max: TIEMPO_MAX_MS })
    .withMessage('El tiempo debe ser mayor a 0 y menor a 24 horas')
    .toInt(),
  body('observaciones')
    .optional({ values: 'null' })
    .isString()
    .withMessage('Las observaciones deben ser texto')
    .bail()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Máximo 255 caracteres'),
];

// PUT /api/inscripciones/:id/resultado — { estado, tiempoMs?, observaciones? } (JUEZ, ADMIN)
resultadosRouter.put(
  '/inscripciones/:id/resultado',
  requireAuth,
  requireRole('JUEZ', 'ADMIN'),
  validate(resultadoRules),
  async (req, res) => {
    const inscripcionId = idDeRuta(req.params.id, NO_EXISTE_INSCRIPCION);
    const { estado, tiempoMs, observaciones } = matchedData(req, { locations: ['body'] });
    const resultado = await guardarResultado({
      inscripcionId,
      datos: {
        estado,
        tiempoMs: estado === 'FINALIZADO' ? tiempoMs : null,
        observaciones: observaciones || null,
      },
      usuario: req.user,
    });
    res.json({ resultado });
  },
);

// DELETE /api/inscripciones/:id/resultado — (ADMIN)
resultadosRouter.delete('/inscripciones/:id/resultado', requireAuth, requireRole('ADMIN'), async (req, res) => {
  await borrarResultado({ inscripcionId: idDeRuta(req.params.id, NO_EXISTE_INSCRIPCION), usuario: req.user });
  res.status(204).end();
});

// GET /api/pruebas/:id/resultados — público; los torneos en BORRADOR no existen para el público
resultadosRouter.get('/pruebas/:id/resultados', async (req, res) => {
  const NO_EXISTE = 'La prueba no existe';
  const datos = await findResultadosPrueba(idDeRuta(req.params.id, NO_EXISTE));
  if (!datos || datos.prueba.torneo.estado === 'BORRADOR') throw new HttpError(404, 'NOT_FOUND', NO_EXISTE);
  res.json(datos);
});

// GET /api/resultados/mios — resultados del atleta que inició sesión
resultadosRouter.get('/resultados/mios', requireAuth, requireRole('ATLETA'), async (req, res) => {
  res.json(await listResultadosDeAtleta(req.user.id));
});
