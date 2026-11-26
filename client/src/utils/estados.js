// Textos y colores de los estados que devuelve la API.

export const ESTADO_TORNEO = {
  BORRADOR: { texto: 'Borrador', tono: 'neutral' },
  ABIERTO: { texto: 'Abierto', tono: 'success' },
  EN_CURSO: { texto: 'En curso', tono: 'warning' },
  FINALIZADO: { texto: 'Finalizado', tono: 'info' },
};

export const ESTADO_PRUEBA = {
  PROGRAMADA: { texto: 'Programada', tono: 'neutral' },
  EN_CURSO: { texto: 'En curso', tono: 'warning' },
  FINALIZADA: { texto: 'Finalizada', tono: 'info' },
  CANCELADA: { texto: 'Cancelada', tono: 'danger' },
};

export const ESTADO_INSCRIPCION = {
  PENDIENTE: { texto: 'Pendiente', tono: 'warning' },
  CONFIRMADA: { texto: 'Confirmada', tono: 'success' },
  ANULADA: { texto: 'Anulada', tono: 'danger' },
};

export const ESTADO_RESULTADO = {
  FINALIZADO: { texto: 'Finalizó', tono: 'success' },
  DNF: { texto: 'No terminó (DNF)', tono: 'warning' },
  DNS: { texto: 'No largó (DNS)', tono: 'neutral' },
  DSQ: { texto: 'Descalificado (DSQ)', tono: 'danger' },
};

export const SEXO_CATEGORIA = { F: 'Femenino', M: 'Masculino', MIXTO: 'Mixto' };

/**
 * Botones para mover el torneo de a un paso (la API rechaza saltos).
 * Para cada estado: el paso siguiente (principal) y el anterior (para corregir).
 */
export const PASOS_TORNEO = {
  BORRADOR: { siguiente: { estado: 'ABIERTO', texto: 'Abrir inscripciones' } },
  ABIERTO: {
    siguiente: { estado: 'EN_CURSO', texto: 'Iniciar torneo' },
    anterior: { estado: 'BORRADOR', texto: 'Volver a borrador' },
  },
  EN_CURSO: {
    siguiente: { estado: 'FINALIZADO', texto: 'Finalizar torneo' },
    anterior: { estado: 'ABIERTO', texto: 'Reabrir inscripciones' },
  },
  FINALIZADO: { anterior: { estado: 'EN_CURSO', texto: 'Volver a en curso' } },
};
