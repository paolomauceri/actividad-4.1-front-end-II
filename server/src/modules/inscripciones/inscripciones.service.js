// Inscripción de un atleta en una prueba: reglas de estado, cupo, categoría automática y dorsal.
import { withTransaction } from '../../db/pool.js';
import { HttpError } from '../../utils/http-error.js';

/** Estados del torneo en que cada rol puede inscribir. El ADMIN admite inscripciones tardías. */
const ESTADOS_PERMITIDOS = { ATLETA: ['ABIERTO'], ADMIN: ['ABIERTO', 'EN_CURSO'] };

async function una(conn, sql, params) {
  const [filas] = await conn.execute(sql, params);
  return filas[0] ?? null;
}

/**
 * Inscribe (o reactiva una inscripción anulada) dentro de una transacción.
 * La fila de la prueba se bloquea con FOR UPDATE: dos inscripciones simultáneas
 * a la misma prueba se atienden en fila y nunca reciben el mismo dorsal.
 *
 * @param {{ pruebaId: number, atletaId: number, rol: 'ATLETA'|'ADMIN' }} datos
 * @returns {Promise<number>} id de la inscripción
 */
export function inscribir({ pruebaId, atletaId, rol }) {
  return withTransaction(async (conn) => {
    // 1. Prueba y torneo (bloqueo)
    const prueba = await una(
      conn,
      `SELECT p.id, p.cupo, p.estado AS prueba_estado, t.id AS torneo_id, t.estado AS torneo_estado, t.fecha_inicio
       FROM pruebas p JOIN torneos t ON t.id = p.torneo_id
       WHERE p.id = ? FOR UPDATE`,
      [pruebaId],
    );
    if (!prueba) {
      throw new HttpError(404, 'NOT_FOUND', 'La prueba no existe');
    }

    // 2. Estado del torneo y de la prueba
    if (!ESTADOS_PERMITIDOS[rol].includes(prueba.torneo_estado)) {
      throw new HttpError(409, 'TORNEO_NO_ABIERTO', 'Las inscripciones de este torneo no están abiertas.');
    }
    if (prueba.prueba_estado === 'CANCELADA' || prueba.prueba_estado === 'FINALIZADA') {
      throw new HttpError(
        409,
        'TORNEO_NO_ABIERTO',
        `No se puede inscribir: la prueba está ${prueba.prueba_estado === 'CANCELADA' ? 'cancelada' : 'finalizada'}.`,
      );
    }

    // 3. Atleta y su edad al inicio del torneo
    const atleta = await una(
      conn,
      'SELECT sexo, TIMESTAMPDIFF(YEAR, fecha_nacimiento, ?) AS edad FROM atletas WHERE usuario_id = ?',
      [prueba.fecha_inicio, atletaId],
    );
    if (!atleta) throw new HttpError(404, 'NOT_FOUND', 'El atleta no existe');

    // 4. ¿Ya estaba inscrito?
    const previa = await una(
      conn,
      'SELECT id, estado FROM inscripciones WHERE prueba_id = ? AND atleta_id = ? FOR UPDATE',
      [pruebaId, atletaId],
    );
    if (previa && previa.estado !== 'ANULADA') {
      throw new HttpError(409, 'YA_INSCRITO', 'Ya estás inscrito en esta prueba.');
    }

    // 5. Cupo (las anuladas no ocupan lugar)
    if (prueba.cupo != null) {
      const { activas } = await una(
        conn,
        "SELECT COUNT(*) AS activas FROM inscripciones WHERE prueba_id = ? AND estado <> 'ANULADA'",
        [pruebaId],
      );
      if (Number(activas) >= prueba.cupo) {
        throw new HttpError(409, 'CUPO_LLENO', `La prueba no tiene cupos disponibles (máximo ${prueba.cupo}).`);
      }
    }

    // 6. Categoría por edad y sexo (se prefiere la del mismo sexo antes que una MIXTO)
    const edad = Number(atleta.edad);
    const categoria = await una(
      conn,
      `SELECT id FROM categorias
       WHERE torneo_id = ? AND ? BETWEEN edad_min AND edad_max AND sexo IN (?, 'MIXTO')
       ORDER BY sexo = 'MIXTO', id LIMIT 1`,
      [prueba.torneo_id, edad, atleta.sexo],
    );
    if (!categoria) {
      const quien = rol === 'ATLETA' ? 'tu edad' : 'la edad del atleta';
      const sexo = rol === 'ATLETA' ? 'tu sexo' : 'su sexo';
      throw new HttpError(
        409,
        'SIN_CATEGORIA',
        `No hay una categoría para ${quien} (${edad} años) y ${sexo} en este torneo.`,
      );
    }

    // 7. Reactivar la anulada (conserva dorsal) o crear con el siguiente dorsal libre
    if (previa) {
      await conn.execute("UPDATE inscripciones SET estado = 'CONFIRMADA', categoria_id = ? WHERE id = ?", [
        categoria.id,
        previa.id,
      ]);
      return previa.id;
    }
    const { siguiente } = await una(
      conn,
      'SELECT COALESCE(MAX(dorsal), 0) + 1 AS siguiente FROM inscripciones WHERE prueba_id = ?',
      [pruebaId],
    );
    const [res] = await conn.execute(
      "INSERT INTO inscripciones (prueba_id, atleta_id, categoria_id, dorsal, estado) VALUES (?, ?, ?, ?, 'CONFIRMADA')",
      [pruebaId, atletaId, categoria.id, Number(siguiente)],
    );
    return res.insertId;
  });
}
