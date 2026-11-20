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

export const ADMIN = { email: 'admin@podio.local', password: 'Admin123!' };
export const ATLETA = { email: 'valentina@podio.local', password: 'Atleta123!' };
export const JUEZ = { email: 'juez@podio.local', password: 'Juez123!' };
