// Toma las capturas de pantalla del manual técnico recorriendo la app con un navegador real.
//
// Requisitos: API y web levantadas (`npm run dev`) y la base con datos de prueba (`npm run db:reset`).
// Uso:        npm run capturas
// Resultado:  docs/04-manual-tecnico/capturas/*.png
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SALIDA = path.join(RAIZ, 'docs', '04-manual-tecnico', 'capturas');
const WEB = process.env.WEB_URL ?? 'http://localhost:5173';
const API = process.env.API_URL ?? 'http://localhost:3000';
const ADMIN = { email: 'admin@podio.local', password: 'Admin123!' };

mkdirSync(SALIDA, { recursive: true });

async function abrirNavegador() {
  // Usa el Edge o Chrome instalado en el equipo (no descarga navegadores)
  for (const channel of ['msedge', 'chrome']) {
    try {
      return await chromium.launch({ channel, args: ['--no-proxy-server'] });
    } catch {
      /* probar el siguiente */
    }
  }
  throw new Error('No se encontró Microsoft Edge ni Google Chrome instalado.');
}

async function verificarServidores() {
  for (const url of [`${API}/api/health`, WEB]) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      throw new Error(`No responde ${url} (${err.message}). Ejecuta "npm run dev" antes de tomar las capturas.`);
    }
  }
}

const archivo = (nombre) => path.join(SALIDA, `${nombre}.png`);

async function nuevaPagina(browser, { ancho = 1440, alto = 900, tema = 'light' } = {}) {
  const contexto = await browser.newContext({ viewport: { width: ancho, height: alto }, colorScheme: tema, locale: 'es-ES' });
  return contexto.newPage();
}

async function iniciarSesion(page) {
  await page.goto(`${WEB}/login`);
  await page.getByLabel(/Correo electrónico/).fill(ADMIN.email);
  await page.getByLabel(/^Contraseña/).fill(ADMIN.password);
  await page.getByRole('button', { name: /^Iniciar sesión$/ }).last().click();
  await page.waitForURL('**/admin');
  await page.getByRole('list', { name: 'Indicadores' }).waitFor();
}

const CAPTURAS = [
  ['01-inicio-escritorio', 'Página de inicio (escritorio)', async (b) => {
    const p = await nuevaPagina(b);
    await p.goto(WEB);
    await p.getByRole('heading', { name: 'Copa Aguas Abiertas Lago Azul 2026' }).waitFor();
    await p.screenshot({ path: archivo('01-inicio-escritorio'), fullPage: true });
  }],
  ['02-inicio-movil', 'Página de inicio (celular, 390 px)', async (b) => {
    const p = await nuevaPagina(b, { ancho: 390, alto: 844 });
    await p.goto(WEB);
    await p.getByRole('heading', { name: 'Copa Aguas Abiertas Lago Azul 2026' }).waitFor();
    await p.screenshot({ path: archivo('02-inicio-movil') });
  }],
  ['03-inicio-modo-oscuro', 'Página de inicio en modo oscuro', async (b) => {
    const p = await nuevaPagina(b, { tema: 'dark' });
    await p.goto(WEB);
    await p.getByRole('heading', { name: 'Copa Aguas Abiertas Lago Azul 2026' }).waitFor();
    await p.screenshot({ path: archivo('03-inicio-modo-oscuro') });
  }],
  ['04-login', 'Inicio de sesión', async (b) => {
    const p = await nuevaPagina(b);
    await p.goto(`${WEB}/login`);
    await p.screenshot({ path: archivo('04-login') });
  }],
  ['05-login-error', 'Inicio de sesión con contraseña incorrecta', async (b) => {
    const p = await nuevaPagina(b);
    await p.goto(`${WEB}/login`);
    await p.getByLabel(/Correo electrónico/).fill(ADMIN.email);
    await p.getByLabel(/^Contraseña/).fill('incorrecta1');
    await p.getByRole('button', { name: /^Iniciar sesión$/ }).last().click();
    await p.getByRole('alert').waitFor();
    await p.screenshot({ path: archivo('05-login-error') });
  }],
  ['06-registro-validacion', 'Registro de atleta con errores de validación', async (b) => {
    const p = await nuevaPagina(b);
    await p.goto(`${WEB}/registro`);
    await p.getByLabel(/^Nombre/).fill('A');
    await p.getByLabel(/Correo electrónico/).fill('correo-invalido');
    await p.getByRole('button', { name: /Crear mi cuenta/ }).click();
    await p.getByText('Este campo es obligatorio').first().waitFor();
    await p.screenshot({ path: archivo('06-registro-validacion'), fullPage: true });
  }],
  ['07-dashboard-admin', 'Dashboard del administrador', async (b) => {
    const p = await nuevaPagina(b);
    await iniciarSesion(p);
    await p.screenshot({ path: archivo('07-dashboard-admin'), fullPage: true });
  }],
  ['08-dashboard-movil', 'Dashboard en celular', async (b) => {
    const p = await nuevaPagina(b, { ancho: 390, alto: 844 });
    await iniciarSesion(p);
    await p.screenshot({ path: archivo('08-dashboard-movil') });
  }],
  ['09-crear-usuario', 'Diálogo para crear juez o administrador', async (b) => {
    const p = await nuevaPagina(b);
    await iniciarSesion(p);
    await p.getByRole('button', { name: /Crear juez o administrador/ }).click();
    await p.getByRole('dialog').waitFor();
    await p.screenshot({ path: archivo('09-crear-usuario') });
  }],
  ['10-seccion-proximamente', 'Sección del panel planificada para el Sprint 2', async (b) => {
    const p = await nuevaPagina(b);
    await iniciarSesion(p);
    await p.getByRole('link', { name: /Torneos/ }).first().click();
    await p.getByText('Disponible en el Sprint 2').waitFor();
    await p.screenshot({ path: archivo('10-seccion-proximamente') });
  }],
  ['11-swagger', 'Documentación OpenAPI en Swagger UI', async (b) => {
    const p = await nuevaPagina(b, { alto: 1100 });
    await p.goto(`${API}/api/docs/`);
    await p.locator('.opblock').first().waitFor();
    await p.screenshot({ path: archivo('11-swagger') });
  }],
  ['12-swagger-login', 'Prueba de POST /api/auth/login desde Swagger', async (b) => {
    const p = await nuevaPagina(b, { alto: 1300 });
    await p.goto(`${API}/api/docs/`);
    const bloque = p.locator('.opblock-post', { hasText: '/api/auth/login' });
    await bloque.locator('.opblock-summary').click();
    await bloque.getByRole('button', { name: 'Try it out' }).click();
    await bloque.getByRole('button', { name: 'Execute' }).click();
    // Recorta desde el inicio del bloque hasta el cuerpo de la respuesta real (antes de los headers)
    const corte = bloque.getByText('Response headers', { exact: true }).first();
    await corte.waitFor();
    const caja = await bloque.boundingBox();
    const limite = await corte.boundingBox();
    await p.screenshot({
      path: archivo('12-swagger-login'),
      clip: { x: caja.x, y: caja.y, width: caja.width, height: limite.y - caja.y - 4 },
      fullPage: true,
    });
  }],
  ['13-api-health', 'Respuesta de GET /api/health', async (b) => {
    const p = await nuevaPagina(b, { ancho: 900, alto: 300 });
    await p.goto(`${API}/api/health`);
    await p.screenshot({ path: archivo('13-api-health') });
  }],
  ['14-pagina-404', 'Página no encontrada', async (b) => {
    const p = await nuevaPagina(b);
    await p.goto(`${WEB}/no-existe`);
    await p.getByText('Esta página no existe').waitFor();
    await p.screenshot({ path: archivo('14-pagina-404') });
  }],
];

await verificarServidores();
const browser = await abrirNavegador();
let errores = 0;
for (const [nombre, descripcion, tomar] of CAPTURAS) {
  try {
    await tomar(browser);
    console.log(`✔ ${nombre}.png — ${descripcion}`);
  } catch (err) {
    errores += 1;
    console.error(`✘ ${nombre}.png — ${err.message.split('\n')[0]}`);
  }
}
await browser.close();
console.log(`\nCapturas guardadas en ${path.relative(RAIZ, SALIDA)}`);
process.exitCode = errores ? 1 : 0;
