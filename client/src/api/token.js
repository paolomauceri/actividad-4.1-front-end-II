// Guarda el token JWT en localStorage. Todo acceso va protegido con try/catch
// porque localStorage puede fallar (modo privado, almacenamiento bloqueado).
export const TOKEN_KEY = 'torneos.token';
// Último usuario que inició sesión: permite abrir la app sin conexión (juez en el campo)
export const USUARIO_KEY = 'torneos.usuario';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* sin almacenamiento: la sesión dura hasta recargar */
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
  } catch {
    /* nada que limpiar */
  }
}

export function getUsuarioGuardado() {
  try {
    return JSON.parse(localStorage.getItem(USUARIO_KEY) ?? 'null');
  } catch {
    return null;
  }
}

export function setUsuarioGuardado(usuario) {
  try {
    localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
  } catch {
    /* sin almacenamiento: sin conexión habrá que volver a iniciar sesión */
  }
}
