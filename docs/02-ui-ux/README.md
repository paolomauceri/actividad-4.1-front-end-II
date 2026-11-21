# Wireframes y diseño UI/UX — Podio

## Contenido

| Archivo | Descripción |
|---|---|
| [`wireframes/`](wireframes/) | 10 wireframes en SVG (escritorio 1440 px y móvil 390 px) |
| [`mapa-navegacion.drawio`](mapa-navegacion.drawio) | Mapa de navegación por rol (Draw.io) |
| [`guia-de-estilo.md`](guia-de-estilo.md) | Colores, tipografía, componentes y reglas de accesibilidad |

## Pantallas

| # | Wireframe | Formato | Rol | Estado |
|---|---|---|---|---|
| 01 | `01-inicio.svg` — Página de inicio | Escritorio | Público | Implementado (Sprint 1) |
| 02 | `02-login.svg` — Iniciar sesión | Escritorio | Público | Implementado (Sprint 1) |
| 03 | `03-registro.svg` — Registro de atleta | Escritorio | Público | Implementado (Sprint 1) |
| 04 | `04-dashboard-admin.svg` — Dashboard | Escritorio | Administrador | Implementado (Sprint 1) |
| 05 | `05-torneo-detalle.svg` — Detalle de torneo | Escritorio | Público | Sprint 2 |
| 06 | `06-inscripcion.svg` — Inscripción a una prueba | Escritorio | Atleta | Sprint 2 |
| 07 | `07-panel-juez-movil.svg` — Registro de tiempos | **Móvil** | Juez | Sprint 3 |
| 08 | `08-resultados-en-vivo.svg` — Resultados en vivo | **Móvil** | Público | Sprint 3 |
| 09 | `09-perfil-atleta.svg` — Perfil del atleta | Escritorio | Atleta | Sprint 3 |
| 10 | `10-gestion-torneos.svg` — Gestión de torneos | Escritorio | Administrador | Sprint 2 |

## Cómo abrir los wireframes en Figma

1. Abre o crea un archivo en **Figma**.
2. Arrastra los archivos `.svg` de la carpeta `wireframes/` al lienzo, o usa **Menú → File → Import…**.
3. Cada pantalla se importa como un *frame* con **capas agrupadas y con nombre** (por ejemplo `barra-de-navegacion`, `proximos-torneos`, `tarjeta-torneo-1`, `boton-inscribete`), así que se pueden editar, mover y reutilizar.
4. Si quieres usar las fuentes reales, instala **Inter** y **Barlow Semi Condensed** desde Google Fonts.

## Cómo abrir el mapa de navegación

- Web: **https://app.diagrams.net** → *Open Existing Diagram* → `mapa-navegacion.drawio`.
- VS Code: extensión **Draw.io Integration**.
- Para el informe: **File → Export as → PNG**.

## Decisiones de UX

| Decisión | Por qué |
|---|---|
| **Mobile-first** con menú hamburguesa y barra lateral plegable | La mayoría de jueces y atletas usarán el celular |
| **Panel del juez en dos pasos** (dorsal → tiempo) con teclado numérico grande | Registrar un tiempo a pleno sol, con prisa y con una mano |
| Botones **DNF / DNS / DSQ** separados del teclado | Evitar errores al marcar abandonos o descalificaciones |
| Aviso **"Sin conexión"** y contador de tiempos pendientes | El juez sabe que sus datos están guardados aunque no haya señal |
| Clasificación con **podio de colores** (oro, plata, bronce) y tiempos tabulares | Lectura rápida de las posiciones |
| **Categoría asignada automáticamente** al inscribirse | El atleta no tiene que conocer las reglas de categorías |
| Errores **junto al campo** y foco en el primero | El usuario ve exactamente qué corregir |
| Secciones futuras marcadas **"Pronto"** en el panel | El administrador ve el alcance completo sin enlaces rotos |
