# Planificación SCRUM — Podio

**Proyecto:** Podio, PWA para la gestión de torneos de natación, aguas abiertas, acuatlón, triatlón y atletismo
**Curso:** Taller Front End 2
**Equipo:** Brayan Teran · Paolo Mauceri
**Fecha de la entrega:** 21 de noviembre de 2026

---

## 1. Visión del producto

> Para **organizadores de torneos, jueces y atletas** de deportes acuáticos y de resistencia, que hoy gestionan inscripciones y tiempos en planillas de papel o Excel, **Podio** es una aplicación web progresiva que **centraliza la inscripción de atletas, el registro de tiempos y la publicación de resultados en tiempo real**. A diferencia de las planillas, Podio calcula la clasificación por categoría automáticamente, funciona en el celular del juez a orillas del agua y se puede instalar como una app.

**Objetivos del producto**

1. Reducir el trabajo manual del organizador: torneos, pruebas y categorías en un solo lugar.
2. Que el atleta se inscriba solo y conozca su dorsal y su categoría.
3. Que el juez registre el tiempo final en segundos, incluso con mala señal.
4. Que el público vea la clasificación por categoría sin esperar al final del torneo.

## 2. Equipo y roles SCRUM

El equipo está formado por **dos integrantes que trabajan todo en conjunto**: ambos diseñan, programan, prueban y documentan. SCRUM exige que existan los roles de Product Owner y Scrum Master; en un equipo de dos personas la guía permite que un integrante combine un rol de responsabilidad con el de Developer, así que los rotamos en cada sprint para que ambos los ejerzan.

| Rol | Responsabilidad | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 |
|---|---|---|---|---|---|
| **Product Owner** | Prioriza el backlog, redacta historias y criterios de aceptación, acepta o rechaza lo terminado | Paolo Mauceri | Brayan Teran | Paolo Mauceri | Brayan Teran |
| **Scrum Master** | Facilita las ceremonias, elimina impedimentos, cuida el tablero y el burndown | Brayan Teran | Paolo Mauceri | Brayan Teran | Paolo Mauceri |
| **Developers** | Diseñan, construyen, prueban y documentan el incremento | Brayan Teran y Paolo Mauceri | ← | ← | ← |
| **Stakeholder (cliente)** | Valida el incremento en la revisión de cada entrega | Docente del curso | ← | ← | ← |

## 3. Cómo aplicamos SCRUM

### 3.1 Duración de los sprints

| Sprint | Fechas | Objetivo |
|---|---|---|
| **Sprint 1** | 19 – 21 nov 2026 (3 días, ajustado a la fecha de entrega) | Base técnica, autenticación, página de inicio, dashboard y documentación |
| Sprint 2 | 23 – 29 nov 2026 | Gestión de torneos, pruebas, categorías e inscripción de atletas |
| Sprint 3 | 30 nov – 6 dic 2026 | Dorsales, cronometraje del juez y resultados en vivo |
| Sprint 4 | 7 – 13 dic 2026 | Modo sin conexión, historial, exportación y pulido (prueba real en la Copa Lago Azul del 12 – 13 dic) |

### 3.2 Ceremonias (adaptadas a un equipo de dos)

| Ceremonia | Cuándo | Duración | Qué hacemos |
|---|---|---|---|
| Sprint Planning | Primer día del sprint | 1 h | Elegimos historias del backlog según la velocidad y las dividimos en tareas con horas |
| Daily Scrum | Cada día, al empezar | 10 min | ¿Qué hice ayer? ¿Qué haré hoy? ¿Qué me bloquea? (por llamada o chat) |
| Sprint Review | Último día del sprint | 30 min | Demostramos el incremento funcionando al stakeholder |
| Retrospectiva | Después de la review | 20 min | Qué salió bien, qué mejorar y una acción concreta para el siguiente sprint |
| Refinamiento | A mitad del sprint | 30 min | Revisamos y estimamos las historias del siguiente sprint |

### 3.3 Artefactos

- **Product Backlog:** lista priorizada de historias de usuario (sección 5), mantenida en Jira.
- **Sprint Backlog:** historias comprometidas y sus tareas (sección 6).
- **Incremento:** software funcionando y probado al final de cada sprint.
- **Tablero:** Jira (proyecto Scrum) con columnas *Por hacer → En curso → En revisión → Hecho*. El archivo [`jira-backlog.csv`](jira-backlog.csv) carga todo el backlog; ver [`importar-en-jira.md`](importar-en-jira.md).

### 3.4 Estimación y priorización

- **Puntos de historia** con la serie de Fibonacci (1, 2, 3, 5, 8, 13), estimados por *Planning Poker* entre los dos integrantes.
- **Prioridad MoSCoW:** *Must* (imprescindible), *Should* (importante), *Could* (deseable) y *Won't* (fuera de alcance por ahora).
- El backlog se ordena por sprint previsto y, dentro de cada sprint, por prioridad.

### 3.5 Definition of Ready (DoR)

Una historia puede entrar a un sprint cuando:

- [ ] Está escrita como "Como … quiero … para …".
- [ ] Tiene criterios de aceptación verificables.
- [ ] Está estimada en puntos.
- [ ] Sus dependencias (por ejemplo, tablas de la base de datos) están resueltas o planificadas en el mismo sprint.

### 3.6 Definition of Done (DoD)

Una historia está terminada cuando:

- [ ] Cumple todos sus criterios de aceptación.
- [ ] Tiene pruebas automáticas que pasan (`npm test` en `server` y `client`).
- [ ] La interfaz funciona en celular (375 px) y escritorio, en tema claro y oscuro.
- [ ] Los endpoints nuevos están documentados en OpenAPI (Swagger).
- [ ] Fue revisada por el otro integrante y está en un commit en el repositorio.
- [ ] El Product Owner la aceptó en la Sprint Review.

## 4. Épicas

| ID | Épica | Descripción |
|---|---|---|
| EP-1 | Autenticación y usuarios | Registro, inicio de sesión, roles (ADMIN, JUEZ, ATLETA) y gestión de cuentas |
| EP-2 | Gestión de torneos | Torneos, pruebas por deporte y categorías por edad y sexo |
| EP-3 | Inscripciones | Inscripción de atletas a pruebas, categorías automáticas y dorsales |
| EP-4 | Cronometraje | Registro de tiempos finales por parte del juez |
| EP-5 | Resultados en vivo | Clasificación por prueba y categoría actualizada en tiempo real |
| EP-6 | PWA y experiencia móvil | App instalable, modo sin conexión, tema claro/oscuro y uso al aire libre |
| EP-7 | Fundamentos y documentación | Entorno, base de datos, API documentada, diseño UI/UX y manual técnico |

## 5. Product Backlog priorizado

| Orden | ID | Historia de usuario | Épica | Prioridad | Puntos | Sprint |
|---|---|---|---|---|---|---|
| 1 | HU-01 | Como **atleta** quiero registrarme con mis datos personales y deportivos para poder inscribirme en torneos. | EP-1 | Must | 5 | 1 |
| 2 | HU-02 | Como **usuario** quiero iniciar sesión con mi correo y contraseña para acceder a las funciones de mi rol. | EP-1 | Must | 3 | 1 |
| 3 | HU-03 | Como **usuario** quiero que mi sesión se mantenga al recargar y expire de forma segura para no tener que iniciar sesión a cada rato. | EP-1 | Must | 2 | 1 |
| 4 | HU-04 | Como **administrador** quiero crear cuentas de juez y de administrador para delegar el cronometraje y la gestión. | EP-1 | Must | 3 | 1 |
| 5 | HU-05 | Como **administrador** quiero ver un dashboard con los indicadores principales para conocer de un vistazo el estado de los torneos. | EP-1 | Must | 5 | 1 |
| 6 | HU-08 | Como **visitante** quiero ver los próximos torneos en la página de inicio para decidir en cuál participar. | EP-2 | Must | 3 | 1 |
| 7 | HU-22 | Como **usuario** quiero instalar la aplicación en mi celular o computador para abrirla como una app nativa. | EP-6 | Must | 3 | 1 |
| 8 | HU-25 | Como **equipo de desarrollo** quiero tener el entorno configurado con React + Vite, Node/Express y MySQL para comenzar a desarrollar. | EP-7 | Must | 3 | 1 |
| 9 | HU-26 | Como **equipo de desarrollo** quiero tener el modelo de base de datos diseñado y documentado para construir sobre una estructura sólida. | EP-7 | Must | 3 | 1 |
| 10 | HU-27 | Como **equipo de desarrollo** quiero documentar la API con OpenAPI y Swagger para probar y compartir los endpoints. | EP-7 | Must | 2 | 1 |
| 11 | HU-28 | Como **docente (stakeholder)** quiero recibir un manual técnico con instalación, diagramas y capturas para evaluar el avance del proyecto. | EP-7 | Must | 3 | 1 |
| 12 | HU-29 | Como **equipo de desarrollo** quiero contar con wireframes y un mapa de navegación para acordar el diseño antes de programar. | EP-7 | Must | 3 | 1 |
| 13 | HU-24 | Como **usuario** quiero elegir tema claro u oscuro y leer bien la interfaz a pleno sol para usar la app en cualquier condición. | EP-6 | Should | 2 | 1 |
| 14 | HU-09 | Como **administrador** quiero crear y editar torneos con sede, fechas y estado para publicar nuevos eventos. | EP-2 | Must | 5 | 2 |
| 15 | HU-10 | Como **administrador** quiero definir las pruebas de un torneo (deporte, distancia, fecha y cupo) para organizar el programa de competencia. | EP-2 | Must | 5 | 2 |
| 16 | HU-11 | Como **administrador** quiero definir categorías por edad y sexo para cada torneo para clasificar a los atletas de forma justa. | EP-2 | Must | 3 | 2 |
| 17 | HU-13 | Como **atleta** quiero inscribirme en una prueba y que se me asigne la categoría automáticamente para competir en el grupo que me corresponde. | EP-3 | Must | 8 | 2 |
| 18 | HU-06 | Como **administrador** quiero activar o desactivar cuentas para bloquear el acceso de usuarios que ya no participan. | EP-1 | Should | 3 | 2 |
| 19 | HU-12 | Como **visitante** quiero ver el detalle de un torneo con sus pruebas y categorías para conocer el programa completo. | EP-2 | Should | 3 | 2 |
| 20 | HU-14 | Como **administrador** quiero confirmar o anular inscripciones y asignar dorsales para preparar la lista de largada. | EP-3 | Must | 5 | 3 |
| 21 | HU-16 | Como **juez** quiero registrar el tiempo final de un atleta por su dorsal desde el celular para publicar resultados al instante. | EP-4 | Must | 8 | 3 |
| 22 | HU-17 | Como **juez** quiero marcar a un atleta como DNF, DNS o DSQ con una observación para reflejar abandonos y descalificaciones. | EP-4 | Must | 2 | 3 |
| 23 | HU-19 | Como **visitante** quiero ver la clasificación por prueba y categoría actualizada en tiempo real para seguir la competencia sin recargar. | EP-5 | Must | 8 | 3 |
| 24 | HU-15 | Como **atleta** quiero ver mis inscripciones y dorsales en mi perfil para saber dónde y cuándo compito. | EP-3 | Should | 3 | 3 |
| 25 | HU-18 | Como **juez** quiero corregir un tiempo registrado para arreglar errores de digitación. | EP-4 | Should | 3 | 3 |
| 26 | HU-23 | Como **juez** quiero registrar tiempos sin conexión y que se sincronicen al volver la señal para no perder datos en playas o lagos. | EP-6 | Should | 8 | 4 |
| 27 | HU-07 | Como **usuario** quiero recuperar mi contraseña por correo para volver a entrar si la olvido. | EP-1 | Could | 5 | 4 |
| 28 | HU-20 | Como **atleta** quiero ver mi historial de resultados para seguir mi progreso. | EP-5 | Could | 3 | 4 |
| 29 | HU-21 | Como **administrador** quiero exportar los resultados de una prueba a CSV para publicarlos o archivarlos. | EP-5 | Could | 3 | 4 |
| 30 | HU-30 | Como **atleta** quiero pagar la inscripción en línea para confirmar mi cupo sin trámites presenciales. | EP-3 | Won't | 8 | — |

### 5.1 Criterios de aceptación

**HU-01** — Como atleta quiero registrarme con mis datos personales y deportivos.
- Dado un formulario completo y válido, cuando lo envío, entonces se crea mi cuenta con rol ATLETA e inicio sesión automáticamente
- Dado un correo o documento ya registrado, cuando envío el formulario, entonces veo el error junto al campo
- La contraseña exige mínimo 8 caracteres con letras y números y se guarda cifrada (bcrypt)

**HU-02** — Como usuario quiero iniciar sesión con mi correo y contraseña.
- Dadas credenciales válidas, entonces recibo un token JWT y soy redirigido según mi rol
- Dadas credenciales inválidas, entonces veo "Correo o contraseña incorrectos" sin revelar cuál falló
- Una cuenta desactivada no puede iniciar sesión

**HU-03** — Como usuario quiero que mi sesión se mantenga al recargar y expire de forma segura.
- Al recargar la página la sesión se recupera con GET /api/auth/me
- Un token vencido o inválido cierra la sesión y lleva a /login
- Las rutas protegidas redirigen según el rol

**HU-04** — Como administrador quiero crear cuentas de juez y de administrador.
- Solo un ADMIN puede crear usuarios ADMIN o JUEZ (POST /api/usuarios)
- Un correo repetido muestra el error en el formulario
- El nuevo usuario aparece en "Usuarios recientes" del dashboard

**HU-05** — Como administrador quiero ver un dashboard con los indicadores principales.
- Muestra torneos activos, atletas, inscripciones y pruebas próximas
- Muestra las 5 próximas pruebas con ocupación de cupo, inscripciones por deporte y usuarios recientes
- Si la API falla, se muestra un error con opción de reintentar

**HU-06** — Como administrador quiero activar o desactivar cuentas.
- Una cuenta desactivada pierde el acceso de inmediato aunque tenga un token vigente
- El listado de usuarios permite filtrar por rol y paginar

**HU-07** — Como usuario quiero recuperar mi contraseña por correo.
- Recibo un enlace de un solo uso que expira en 30 minutos

**HU-08** — Como visitante quiero ver los próximos torneos en la página de inicio.
- Se listan torneos publicados que no han terminado, ordenados por fecha
- Cada tarjeta muestra sede, fechas, estado, número de pruebas y deportes
- Se muestran estados de carga, vacío y error con reintento

**HU-09** — Como administrador quiero crear y editar torneos con sede, fechas y estado.
- La fecha de inicio no puede ser posterior a la de fin
- Un torneo en BORRADOR no es visible al público

**HU-10** — Como administrador quiero definir las pruebas de un torneo (deporte, distancia, fecha y cupo).
- Cada prueba pertenece a un deporte del catálogo y tiene distancia mayor a 0

**HU-11** — Como administrador quiero definir categorías por edad y sexo para cada torneo.
- La edad mínima no puede superar a la máxima
- El nombre de la categoría es único dentro del torneo

**HU-12** — Como visitante quiero ver el detalle de un torneo con sus pruebas y categorías.
- Se muestran las pruebas con fecha, distancia y cupos disponibles

**HU-13** — Como atleta quiero inscribirme en una prueba y que se me asigne la categoría automáticamente.
- La categoría se calcula con mi edad a la fecha del torneo y mi sexo
- No puedo inscribirme dos veces en la misma prueba
- No se permite superar el cupo

**HU-14** — Como administrador quiero confirmar o anular inscripciones y asignar dorsales.
- El dorsal es único dentro de cada prueba
- Las inscripciones anuladas no cuentan para el cupo

**HU-15** — Como atleta quiero ver mis inscripciones y dorsales en mi perfil.
- Veo prueba, fecha, categoría, dorsal y estado de cada inscripción

**HU-16** — Como juez quiero registrar el tiempo final de un atleta por su dorsal desde el celular.
- El registro se hace en dos toques: dorsal y tiempo
- Se guarda quién registró el tiempo y cuándo
- La interfaz tiene alto contraste y botones de al menos 44 px para uso al aire libre

**HU-17** — Como juez quiero marcar a un atleta como DNF, DNS o DSQ con una observación.
- Un resultado DNF/DNS/DSQ no tiene tiempo ni posición

**HU-18** — Como juez quiero corregir un tiempo registrado.
- La clasificación se recalcula automáticamente tras la corrección

**HU-19** — Como visitante quiero ver la clasificación por prueba y categoría actualizada en tiempo real.
- La posición se calcula con la vista vw_clasificacion
- Los nuevos tiempos llegan por Socket.IO en menos de 2 segundos

**HU-20** — Como atleta quiero ver mi historial de resultados.
- Veo tiempo, posición y categoría de cada prueba disputada

**HU-21** — Como administrador quiero exportar los resultados de una prueba a CSV.
- El archivo incluye posición, dorsal, atleta, club, categoría y tiempo

**HU-22** — Como usuario quiero instalar la aplicación en mi celular o computador.
- La app tiene manifest, íconos y service worker
- La interfaz principal abre aunque no haya conexión

**HU-23** — Como juez quiero registrar tiempos sin conexión y que se sincronicen al volver la señal.
- Los tiempos quedan en el dispositivo y se envían automáticamente al recuperar la conexión

**HU-24** — Como usuario quiero elegir tema claro u oscuro y leer bien la interfaz a pleno sol.
- Todos los textos cumplen contraste WCAG AA en ambos temas
- La preferencia de tema se recuerda

**HU-25** — Como equipo de desarrollo quiero tener el entorno configurado con React + Vite, Node/Express y MySQL.
- npm run dev levanta frontend y backend
- Existe una guía de instalación paso a paso

**HU-26** — Como equipo de desarrollo quiero tener el modelo de base de datos diseñado y documentado.
- schema.sql crea 8 tablas con claves y restricciones
- Existe diagrama entidad-relación en Draw.io

**HU-27** — Como equipo de desarrollo quiero documentar la API con OpenAPI y Swagger.
- Swagger UI disponible en /api/docs con autenticación Bearer

**HU-28** — Como docente (stakeholder) quiero recibir un manual técnico con instalación, diagramas y capturas.
- Incluye metodología SCRUM, diagramas de flujo, capturas y tutorial de instalación

**HU-29** — Como equipo de desarrollo quiero contar con wireframes y un mapa de navegación.
- Wireframes de las pantallas principales importables en Figma
- Mapa de navegación por rol

**HU-30** — Como atleta quiero pagar la inscripción en línea.
- Fuera del alcance del proyecto académico

### 5.2 Roadmap de releases

- Sprint 1: HU-01, HU-02, HU-03, HU-04, HU-05, HU-08, HU-22, HU-24, HU-25, HU-26, HU-27, HU-28, HU-29 — 40 puntos
- Sprint 2: HU-06, HU-09, HU-10, HU-11, HU-12, HU-13 — 27 puntos
- Sprint 3: HU-14, HU-15, HU-16, HU-17, HU-18, HU-19 — 29 puntos
- Sprint 4: HU-07, HU-20, HU-21, HU-23 — 19 puntos

## 6. Sprint Planning — Sprint 1

**Fechas:** jueves 19 a sábado 21 de noviembre de 2026
**Product Owner:** Paolo Mauceri · **Scrum Master:** Brayan Teran · **Developers:** Brayan Teran y Paolo Mauceri

**Objetivo del sprint:**
> Entregar la base funcional de Podio: entorno configurado, base de datos diseñada, autenticación con roles, página de inicio con torneos reales, dashboard del administrador y API documentada en OpenAPI, junto con la documentación del proyecto (SCRUM, UI/UX, diagrama de base de datos y manual técnico).

**Capacidad:** 2 integrantes × 3 días × ~10 h de dedicación por persona en total ≈ **60 horas**.

### 6.1 Historias comprometidas

| ID | Historia | Puntos |
|---|---|---|
| HU-01 | Registrarme con mis datos personales y deportivos | 5 |
| HU-02 | Iniciar sesión con mi correo y contraseña | 3 |
| HU-03 | Que mi sesión se mantenga al recargar y expire de forma segura | 2 |
| HU-04 | Crear cuentas de juez y de administrador | 3 |
| HU-05 | Ver un dashboard con los indicadores principales | 5 |
| HU-08 | Ver los próximos torneos en la página de inicio | 3 |
| HU-22 | Instalar la aplicación en mi celular o computador | 3 |
| HU-24 | Elegir tema claro u oscuro y leer bien la interfaz a pleno sol | 2 |
| HU-25 | Tener el entorno configurado con React + Vite, Node/Express y MySQL | 3 |
| HU-26 | Tener el modelo de base de datos diseñado y documentado | 3 |
| HU-27 | Documentar la API con OpenAPI y Swagger | 2 |
| HU-28 | Recibir un manual técnico con instalación, diagramas y capturas | 3 |
| HU-29 | Contar con wireframes y un mapa de navegación | 3 |
| | **Total comprometido** | **40** |

### 6.2 Tareas del Sprint 1

| ID | Historia | Tarea | Horas | Responsables |
|---|---|---|---|---|
| T-01 | HU-25 | Instalar Node.js LTS y MariaDB/MySQL; crear estructura del repositorio | 2 | Brayan y Paolo |
| T-02 | HU-25 | Configurar Vite + React + PWA y Express con scripts de desarrollo | 3 | Brayan y Paolo |
| T-03 | HU-26 | Diseñar entidades, relaciones y restricciones (schema.sql) | 3 | Brayan y Paolo |
| T-04 | HU-26 | Crear datos de prueba (seed.sql) y diagrama ER en Draw.io | 3 | Brayan y Paolo |
| T-05 | HU-27 | Escribir openapi.yaml y publicar Swagger UI en /api/docs | 2 | Brayan y Paolo |
| T-06 | HU-01 | Endpoint POST /api/auth/register con validación y transacción | 3 | Brayan y Paolo |
| T-07 | HU-01 | Formulario de registro con validación en el cliente | 3 | Brayan y Paolo |
| T-08 | HU-01 | Pruebas automáticas de registro (correo y documento duplicados) | 2 | Brayan y Paolo |
| T-09 | HU-02 | Endpoint POST /api/auth/login con JWT y bcrypt | 2 | Brayan y Paolo |
| T-10 | HU-02 | Página de inicio de sesión con redirección por rol | 2 | Brayan y Paolo |
| T-11 | HU-03 | Middleware requireAuth/requireRole y GET /api/auth/me | 2 | Brayan y Paolo |
| T-12 | HU-03 | Contexto de sesión y rutas protegidas en React | 2 | Brayan y Paolo |
| T-13 | HU-04 | Endpoints GET/POST /api/usuarios (solo ADMIN) | 2 | Brayan y Paolo |
| T-14 | HU-04 | Diálogo "Crear juez o administrador" en el dashboard | 2 | Brayan y Paolo |
| T-15 | HU-05 | Endpoint GET /api/dashboard/resumen | 2 | Brayan y Paolo |
| T-16 | HU-05 | Dashboard: indicadores, próximas pruebas, gráfico y usuarios recientes | 4 | Brayan y Paolo |
| T-17 | HU-08 | Endpoint público GET /api/torneos/proximos | 1 | Brayan y Paolo |
| T-18 | HU-08 | Página de inicio con portada, próximos torneos y deportes | 4 | Brayan y Paolo |
| T-19 | HU-22 | Manifest, íconos y service worker con vite-plugin-pwa | 2 | Brayan y Paolo |
| T-20 | HU-24 | Sistema de diseño con tokens, tema claro/oscuro y contraste AA | 3 | Brayan y Paolo |
| T-21 | HU-29 | Wireframes de pantallas principales y mapa de navegación | 4 | Brayan y Paolo |
| T-22 | HU-28 | Manual técnico, diagramas de flujo y capturas | 4 | Brayan y Paolo |
| T-23 | HU-28 | Documento de planificación SCRUM y tablero en Jira | 3 | Brayan y Paolo |
| | | **Total** | **60** | |

### 6.3 Burndown planificado

| Día | Fecha | Puntos restantes (ideal) | Puntos restantes (real) |
|---|---|---|---|
| 0 | 19 nov (inicio) | 40 | 40 |
| 1 | 19 nov (cierre) | 27 | 26 |
| 2 | 20 nov | 13 | 10 |
| 3 | 21 nov (entrega) | 0 | 0 |

### 6.4 Riesgos identificados y respuesta

| Riesgo | Impacto | Respuesta |
|---|---|---|
| Plazo de solo 3 días | Alto | Sprint corto con alcance acotado al 50 % del sistema; código primero y documentación después |
| Descarga de MySQL bloqueada por Oracle en nuestra región (error 403) | Medio | Se usa MariaDB 11.8, compatible con MySQL; los scripts son SQL estándar de MySQL |
| PowerShell bloquea scripts de npm | Bajo | Se documentó la solución en la guía de instalación |
| Proyecto dentro de OneDrive (sincronización de `node_modules`) | Bajo | Advertencia y alternativa en la guía de instalación |

## 7. Retrospectiva del Sprint 1

| Qué salió bien | Qué mejorar | Acción para el Sprint 2 |
|---|---|---|
| Escribir primero las pruebas evitó errores en registro y login | Algunas tareas de documentación quedaron para el final | Incluir una tarea de documentación en cada historia |
| Commits pequeños por tema facilitaron revisar el avance | Instalar el entorno tomó más de lo previsto | Mantener la guía de instalación actualizada desde el día 1 |
| El sistema de diseño (tokens) aceleró las pantallas | — | Diseñar los wireframes del Sprint 2 antes de programar |
