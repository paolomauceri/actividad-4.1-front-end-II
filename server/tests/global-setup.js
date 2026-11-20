// Recrea la base torneos_test (schema + seed) antes de ejecutar las pruebas.
export default async function setup() {
  process.env.NODE_ENV = 'test';
  const { resetDatabase } = await import('../scripts/db-reset.js');
  await resetDatabase('torneos_test');
}
