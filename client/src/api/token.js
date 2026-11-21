// Guarda el token JWT en localStorage. Todo acceso va protegido con try/catch
// porque localStorage puede fallar (modo privado, almacenamiento bloqueado).
export const TOKEN_KEY = 'torneos.token';

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
  } catch {
    /* nada que limpiar */
  }
}
