// Copias locales de datos privados que el juez necesita sin conexión (por ejemplo,
// los inscritos de una prueba). Se borran al cerrar sesión.
const PREFIJO = 'podio.copia.';

export function guardarCopia(clave, datos) {
  try {
    localStorage.setItem(PREFIJO + clave, JSON.stringify(datos));
  } catch {
    /* sin almacenamiento: no habrá copia sin conexión */
  }
}

export function leerCopia(clave) {
  try {
    return JSON.parse(localStorage.getItem(PREFIJO + clave) ?? 'null');
  } catch {
    return null;
  }
}

export function borrarCopias() {
  try {
    for (const clave of Object.keys(localStorage)) {
      if (clave.startsWith(PREFIJO)) localStorage.removeItem(clave);
    }
  } catch {
    /* nada que borrar */
  }
}

/**
 * Pide datos con `cargar`; si funcionó guarda una copia y si falla por falta de red
 * devuelve la última copia (o vuelve a lanzar el error si no hay ninguna).
 */
export async function conCopia(clave, cargar) {
  try {
    const datos = await cargar();
    guardarCopia(clave, datos);
    return datos;
  } catch (err) {
    const copia = err?.code === 'NETWORK_ERROR' ? leerCopia(clave) : null;
    if (copia === null) throw err;
    return copia;
  }
}
