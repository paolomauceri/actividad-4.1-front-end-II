// Genera el documento único de entrega en PDF a partir de la documentación del repositorio.
//
// Uso:       npm run pdf
// Resultado: docs/entrega/Entrega-Podio.pdf
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { marked } from 'marked';
import { chromium } from 'playwright-core';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = path.join(RAIZ, 'docs');
const SALIDA = path.join(DOCS, 'entrega', 'Entrega-Podio.pdf');

const leer = (rel) => readFileSync(path.join(DOCS, rel), 'utf8');

/**
 * Prepara un Markdown para insertarlo en el informe:
 * - quita el título principal del documento (el título de la sección lo pone el informe),
 * - convierte rutas de imágenes en rutas absolutas,
 * - quita los enlaces a archivos locales (en papel no sirven) dejando su texto.
 */
function preparar(md, carpetaRel, { quitarTitulo = true } = {}) {
  const base = path.join(DOCS, carpetaRel);
  let texto = md.replace(/\r\n/g, '\n');
  if (quitarTitulo) texto = texto.replace(/^# .*\n/, '');
  texto = texto.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) =>
    /^https?:/.test(src) ? `![${alt}](${src})` : `![${alt}](${pathToFileURL(path.resolve(base, src)).href})`);
  texto = texto.replace(/(?<!!)\[([^\]]+)\]\((?!https?:|#)[^)]+\)/g, '$1');
  return texto;
}

const wireframes = readdirSync(path.join(DOCS, '02-ui-ux', 'wireframes'))
  .filter((f) => f.endsWith('.svg'))
  .map((f) => {
    const titulo = readFileSync(path.join(DOCS, '02-ui-ux', 'wireframes', f), 'utf8').match(/<title>([^<]+)<\/title>/)?.[1] ?? f;
    return `### ${titulo.replace(/^Wireframe \d+ — /, '')}\n\n![${titulo}](wireframes/${f})\n`;
  })
  .join('\n');

const DESARROLLO = `
## Alcance implementado (50 % inicial)

| Requisito | Estado | Dónde verlo |
|---|---|---|
| Configuración del entorno con React, Vite y Node.js/Express | Completo | Manual técnico §3, §4 y §11 |
| Implementación inicial de autenticación de usuarios | Completo: registro, login, sesión, roles ADMIN / JUEZ / ATLETA | Manual técnico §5.1, §5.2 y §8 |
| Página de inicio | Completa, con próximos torneos desde la base de datos | Capturas 01 a 03 |
| Dashboard administrativo | Completo: indicadores, próximas pruebas, gráfico por deporte, usuarios recientes y creación de jueces | Capturas 07 a 10 |
| Endpoints en OpenAPI para autenticación y registro de usuarios | Completo: 8 endpoints documentados y probables en Swagger UI | Manual técnico §7 y capturas 11 y 12 |
| Aplicación web progresiva (PWA) | Manifest, íconos, service worker y caché sin conexión | Manual técnico §9 |
| Pruebas automáticas | 91 pruebas (50 de la API y 41 del frontend) | Manual técnico §12 |

## Endpoints de autenticación y registro (OpenAPI)

| Método | Ruta | Descripción |
|---|---|---|
| POST | \`/api/auth/register\` | Registro público de atleta |
| POST | \`/api/auth/login\` | Inicio de sesión (JWT) |
| GET | \`/api/auth/me\` | Usuario de la sesión |
| GET / POST | \`/api/usuarios\` | Listar y crear usuarios (solo administrador) |

El detalle completo de la arquitectura, la API, la seguridad, la PWA, las capturas y la instalación está en la sección 5, *Manual técnico*.
`;

const SECCIONES = [
  ['1. Planificación SCRUM', [
    preparar(leer('01-scrum/planificacion-scrum.md'), '01-scrum'),
    '## Tablero en Jira\n\n' + preparar(leer('01-scrum/importar-en-jira.md'), '01-scrum').replace(/^## /gm, '### ').replace(/^### 5\. Capturas para el informe[\s\S]*$/m, ''),
  ]],
  ['2. Wireframes y diseño UI/UX', [
    preparar(leer('02-ui-ux/README.md'), '02-ui-ux'),
    `## Mapa de navegación\n\n![Mapa de navegación](${pathToFileURL(path.join(DOCS, '02-ui-ux', 'mapa-navegacion.svg')).href})\n`,
    '## Wireframes de las pantallas\n\n' + preparar(wireframes, '02-ui-ux', { quitarTitulo: false }),
    '## Guía de estilo\n\n' + preparar(leer('02-ui-ux/guia-de-estilo.md'), '02-ui-ux').replace(/^## /gm, '### '),
  ]],
  ['3. Diagrama de base de datos', [
    `## Diagrama entidad-relación\n\n![Diagrama entidad-relación](${pathToFileURL(path.join(DOCS, '03-base-de-datos', 'diagrama-er.svg')).href})\n`,
    preparar(leer('03-base-de-datos/README.md'), '03-base-de-datos'),
    '## Script de creación (extracto de `database/schema.sql`)\n\n```sql\n' +
      readFileSync(path.join(RAIZ, 'database', 'schema.sql'), 'utf8').split('-- inscripciones:')[0].split('USE torneos_db;')[1].trim().slice(0, 4200) +
      '\n-- … (continúa con inscripciones, resultados y la vista vw_clasificacion)\n```\n',
  ]],
  ['4. Desarrollo inicial (50 %)', [DESARROLLO]],
  ['5. Manual técnico inicial', [preparar(leer('04-manual-tecnico/manual-tecnico.md'), '04-manual-tecnico')]],
];

// Evidencias tomadas a mano en las herramientas (Jira, Figma, Workbench/HeidiSQL), si existen
const HERRAMIENTAS = { jira: 'Tablero en Jira', figma: 'Wireframes en Figma', workbench: 'Diagrama EER en MySQL Workbench', heidisql: 'Base de datos en HeidiSQL' };
const carpetaCapturas = path.join(DOCS, '04-manual-tecnico', 'capturas');
const evidencias = readdirSync(carpetaCapturas)
  .filter((f) => /^(jira|figma|workbench|heidisql)-.*\.(png|jpe?g)$/i.test(f))
  .sort();
if (evidencias.length) {
  const md = evidencias
    .map((f) => {
      const herramienta = HERRAMIENTAS[f.split('-')[0].toLowerCase()];
      const nombre = f.replace(/\.[^.]+$/, '');
      return `### ${herramienta} — ${nombre}\n\n![${f}](${pathToFileURL(path.join(carpetaCapturas, f)).href})\n`;
    })
    .join('\n');
  SECCIONES.push([
    '6. Evidencias en las herramientas de gestión y diseño',
    [`Capturas tomadas por el equipo en las herramientas utilizadas.\n\n${md}`],
  ]);
}

// ---------- HTML ----------
marked.setOptions({ gfm: true, breaks: true });
let idSeccion = 0;
const indice = [];
const cuerpo = SECCIONES.map(([titulo, partes]) => {
  idSeccion += 1;
  const id = `s${idSeccion}`;
  const subtitulos = [];
  let html = marked.parse(partes.join('\n\n'));
  let n = 0;
  html = html.replace(/<h2>(.*?)<\/h2>/g, (_, t) => {
    n += 1;
    const sid = `${id}-${n}`;
    subtitulos.push([sid, t.replace(/<[^>]+>/g, '')]);
    return `<h2 id="${sid}">${t}</h2>`;
  });
  indice.push([id, titulo, subtitulos]);
  return `<section class="seccion"><h1 id="${id}">${titulo}</h1>${html}</section>`;
}).join('\n');

const css = `
@page { size: A4; margin: 18mm 16mm 20mm; }
* { box-sizing: border-box; }
body { font-family: 'Segoe UI', Inter, Arial, sans-serif; font-size: 10.5pt; line-height: 1.5; color: #1b2633; margin: 0; }
h1 { font-size: 22pt; color: #0b2545; border-bottom: 3px solid #0c6b80; padding-bottom: 6px; margin: 0 0 14px; }
h2 { font-size: 15pt; color: #0b2545; margin: 22px 0 8px; break-after: avoid; }
h3 { font-size: 12pt; color: #0c6b80; margin: 16px 0 6px; break-after: avoid; }
h4 { font-size: 11pt; margin: 12px 0 4px; break-after: avoid; }
p, li { orphans: 3; widows: 3; }
.seccion { break-before: page; }
table { width: 100%; border-collapse: collapse; margin: 8px 0 14px; font-size: 9pt; }
th { background: #0b2545; color: #fff; text-align: left; padding: 5px 7px; }
td { border-bottom: 1px solid #d5dde8; padding: 4px 7px; vertical-align: top; }
tr { break-inside: avoid; }
tr:nth-child(even) td { background: #f6f8fb; }
code { font-family: Consolas, 'Courier New', monospace; font-size: 8.8pt; background: #eef2f7; padding: 1px 4px; border-radius: 3px; }
pre { background: #0f1b2d; color: #e8eef7; padding: 10px 12px; border-radius: 6px; font-size: 8pt; line-height: 1.4; white-space: pre-wrap; word-break: break-word; }
pre code { background: none; color: inherit; padding: 0; }
blockquote { margin: 10px 0; padding: 8px 14px; background: #e0f4f8; border-left: 4px solid #0c6b80; border-radius: 4px; }
img { display: block; max-width: 100%; max-height: 235mm; margin: 8px auto 14px; border: 1px solid #d5dde8; border-radius: 4px; break-inside: avoid; }
img[src*="movil"] { max-width: 48%; }
img[src*="flujo-"] { max-height: 225mm; }
ul.contains-task-list, li.task-list-item { list-style: none; }
.portada { height: 250mm; display: flex; flex-direction: column; justify-content: space-between; padding: 26mm 16mm 16mm;
  background: linear-gradient(160deg, #0b2545 0%, #0e3a5c 60%, #0c6b80 100%); color: #fff; border-radius: 10px; }
.portada .logo { display: flex; align-items: center; gap: 14px; font-size: 34pt; font-weight: 800; }
.portada h1 { color: #fff; border: 0; font-size: 30pt; line-height: 1.15; margin: 0 0 12px; }
.portada .sub { font-size: 14pt; color: #cfe3f2; max-width: 150mm; }
.portada .meta { font-size: 12pt; line-height: 1.8; color: #e8eef7; }
.portada .meta b { color: #7fe0ee; }
.indice { break-before: page; }
.indice ol { padding-left: 0; list-style: none; }
.indice > ol > li { margin: 10px 0 4px; font-weight: 700; font-size: 12pt; }
.indice ol ol { font-weight: 400; font-size: 10pt; padding-left: 16px; }
.indice ol ol li { margin: 2px 0; }
.indice a { color: #1b2633; text-decoration: none; }
`;

const logo = readFileSync(path.join(RAIZ, 'client', 'public', 'icon.svg'), 'utf8').replace(/<\?xml[^>]*>/, '');
const portada = `
<div class="portada">
  <div class="logo"><span style="width:64px;height:64px;display:inline-block">${logo.replace('<svg ', '<svg width="64" height="64" ')}</span> Podio</div>
  <div>
    <h1>Aplicación web progresiva para la administración de torneos multideporte</h1>
    <p class="sub">Natación · Aguas abiertas · Acuatlón · Triatlón · Atletismo — inscripción de atletas, registro de tiempos y resultados</p>
  </div>
  <div class="meta">
    <b>Curso:</b> Taller Front End 2<br>
    <b>Integrantes:</b> Brayan Teran · Paolo Mauceri<br>
    <b>Entrega:</b> Sprint 1 — avance del 50 %<br>
    <b>Fecha:</b> 21 de noviembre de 2026
  </div>
</div>`;

const htmlIndice = `<section class="indice"><h1>Contenido</h1><ol>${indice.map(([id, t, subs]) =>
  `<li><a href="#${id}">${t}</a><ol>${subs.map(([sid, st]) => `<li><a href="#${sid}">${st}</a></li>`).join('')}</ol></li>`).join('')}</ol></section>`;

const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Podio — Entrega Sprint 1</title><style>${css}</style></head>
<body>${portada}${htmlIndice}${cuerpo}</body></html>`;

const tmpHtml = path.join(tmpdir(), 'podio-entrega.html');
writeFileSync(tmpHtml, html, 'utf8');

// ---------- PDF ----------
async function abrirNavegador() {
  for (const channel of ['msedge', 'chrome']) {
    try {
      return await chromium.launch({ channel });
    } catch {
      /* probar el siguiente */
    }
  }
  throw new Error('No se encontró Microsoft Edge ni Google Chrome instalado.');
}

mkdirSync(path.dirname(SALIDA), { recursive: true });
const browser = await abrirNavegador();
const page = await browser.newPage();
await page.goto(pathToFileURL(tmpHtml).href, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const rotas = await page.evaluate(() => [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.alt));
if (rotas.length) console.warn('Imágenes que no cargaron:', rotas);
await page.pdf({
  path: SALIDA,
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate: `<div style="width:100%;font-size:8px;color:#5b6878;padding:0 16mm;display:flex;justify-content:space-between;font-family:Segoe UI,Arial">
    <span>Podio — Taller Front End 2 · Brayan Teran y Paolo Mauceri</span><span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>`,
  margin: { top: '18mm', bottom: '20mm', left: '16mm', right: '16mm' },
});
await browser.close();
console.log(`PDF generado: ${path.relative(RAIZ, SALIDA)}`);
