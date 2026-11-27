// Estado global de la sesión: usuario actual, login, registro y logout.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api/client.js';
import { clearToken, getToken, getUsuarioGuardado, setToken, setUsuarioGuardado } from '../api/token.js';
import { borrarCopias } from '../offline/copiaLocal.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(() => Boolean(getToken()));

  // Al abrir la app, si hay un token guardado se recupera el usuario
  useEffect(() => {
    if (!getToken()) return undefined;
    const controller = new AbortController();
    apiFetch('/api/auth/me', { signal: controller.signal })
      .then((data) => {
        setUsuario(data.usuario);
        setUsuarioGuardado(data.usuario);
      })
      .catch((err) => {
        // Si el token es inválido o expiró (401), apiFetch ya lo borró.
        // Ante otros errores (sin red, servidor o base de datos caídos) se conserva
        // y se usa el último usuario guardado: el juez puede seguir sin conexión.
        if (err?.name === 'AbortError' || err?.status === 401) return;
        const guardado = getUsuarioGuardado();
        if (guardado && getToken()) setUsuario(guardado);
      })
      .finally(() => {
        if (!controller.signal.aborted) setCargando(false);
      });
    return () => controller.abort();
  }, []);

  // Si cualquier llamada recibe 401, la sesión se cierra en toda la app
  useEffect(() => {
    const alCerrar = () => setUsuario(null);
    window.addEventListener('auth:logout', alCerrar);
    return () => window.removeEventListener('auth:logout', alCerrar);
  }, []);

  const iniciarSesion = useCallback(async (data) => {
    setToken(data.token);
    setUsuario(data.usuario);
    setUsuarioGuardado(data.usuario);
    return data.usuario;
  }, []);

  const login = useCallback(
    async (email, password) =>
      iniciarSesion(await apiFetch('/api/auth/login', { method: 'POST', body: { email, password }, auth: false })),
    [iniciarSesion],
  );

  const register = useCallback(
    async (datos) => iniciarSesion(await apiFetch('/api/auth/register', { method: 'POST', body: datos, auth: false })),
    [iniciarSesion],
  );

  const logout = useCallback(() => {
    clearToken();
    borrarCopias();
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, cargando, login, register, logout }),
    [usuario, cargando, login, register, logout],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
