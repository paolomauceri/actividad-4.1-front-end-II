// A dónde va cada rol después de iniciar sesión (y el botón "Mi panel").
const DESTINOS = { ADMIN: '/admin', JUEZ: '/juez', ATLETA: '/atleta' };

/** Ruta del panel del rol; si el rol no se conoce, el inicio. */
export function destinoPorRol(rol) {
  return DESTINOS[rol] ?? '/';
}
