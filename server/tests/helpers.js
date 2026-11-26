import request from 'supertest';

/** Inicia sesión y devuelve el token JWT. */
export async function loginAs(app, email, password) {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  if (res.status !== 200) {
    throw new Error(`Login fallido para ${email}: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.token;
}

/** Datos válidos de registro de atleta; `overrides` reemplaza campos. */
export function datosRegistro(overrides = {}) {
  const sufijo = Math.random().toString(36).slice(2, 8);
  return {
    nombre: 'Ana',
    apellido: 'Prueba',
    email: `ana.${sufijo}@test.local`,
    password: 'Segura123',
    documento: `DOC${sufijo}`,
    fechaNacimiento: '2000-05-20',
    sexo: 'F',
    club: 'Club Test',
    telefono: '555-0000',
    ...overrides,
  };
}

/** Fecha 'YYYY-MM-DD' (hora local) a `dias` de hoy. */
export function fechaEnDias(dias) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  const dos = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

const auth = (token) => ({ Authorization: `Bearer ${token}` });

/** Crea un torneo (BORRADOR) como ADMIN y lo devuelve. */
export async function crearTorneo(app, token, overrides = {}) {
  const sufijo = Math.random().toString(36).slice(2, 7);
  const res = await request(app)
    .post('/api/torneos')
    .set(auth(token))
    .send({
      nombre: `Torneo de prueba ${sufijo}`,
      descripcion: 'Creado por las pruebas automáticas',
      sede: 'Piscina de pruebas',
      fechaInicio: fechaEnDias(30),
      fechaFin: fechaEnDias(31),
      ...overrides,
    });
  if (res.status !== 201) throw new Error(`crearTorneo: ${res.status} ${JSON.stringify(res.body)}`);
  return res.body.torneo;
}

/** Cambia el estado del torneo pasando por cada estado indicado, en orden. */
export async function cambiarEstado(app, token, torneoId, ...estados) {
  for (const estado of estados) {
    const res = await request(app).patch(`/api/torneos/${torneoId}/estado`).set(auth(token)).send({ estado });
    if (res.status !== 200) throw new Error(`cambiarEstado ${estado}: ${res.status} ${JSON.stringify(res.body)}`);
  }
}

export const ADMIN = { email: 'admin@podio.local', password: 'Admin123!' };
export const ATLETA = { email: 'valentina@podio.local', password: 'Atleta123!' };
export const JUEZ = { email: 'juez@podio.local', password: 'Juez123!' };

/** Crea una prueba en el torneo (fecha y hora dentro del torneo) y la devuelve. */
export async function crearPrueba(app, token, torneoId, overrides = {}) {
  const res = await request(app)
    .post(`/api/torneos/${torneoId}/pruebas`)
    .set(auth(token))
    .send({ deporteId: 2, nombre: '100 m libre', distanciaM: 100, fechaHora: `${fechaEnDias(30)}T09:00`, ...overrides });
  if (res.status !== 201) throw new Error(`crearPrueba: ${res.status} ${JSON.stringify(res.body)}`);
  return res.body.prueba;
}

/** Crea una categoría en el torneo y la devuelve. */
export async function crearCategoria(app, token, torneoId, overrides = {}) {
  const res = await request(app)
    .post(`/api/torneos/${torneoId}/categorias`)
    .set(auth(token))
    .send({ nombre: 'Adulto Femenino', sexo: 'F', edadMin: 20, edadMax: 39, ...overrides });
  if (res.status !== 201) throw new Error(`crearCategoria: ${res.status} ${JSON.stringify(res.body)}`);
  return res.body.categoria;
}
