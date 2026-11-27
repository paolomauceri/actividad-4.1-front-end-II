# Podio — Gestión de torneos multideporte (PWA)

Aplicación web progresiva para administrar torneos de **natación, aguas abiertas, acuatlón, triatlón y atletismo**: inscripción de atletas, registro de tiempos y visualización de resultados con actualización ágil.

**Curso:** Taller Front End 2
**Integrantes:** Brayan Teran · Paolo Mauceri

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite, React Router, vite-plugin-pwa (Workbox), IndexedDB (`idb-keyval`) |
| Backend | Node.js + Express, JWT, bcryptjs, express-validator, helmet, rate limit |
| Tiempo real | Socket.IO (mismo servidor que la API) |
| Base de datos | MySQL 8 (driver `mysql2`) |
| Pruebas | Jest + Testing Library (cliente), Vitest + Supertest (API) |
| Documentación API | OpenAPI 3 + Swagger UI |
| Gestión | SCRUM, tablero en Jira |

## Funcionalidades

- **Administrador** (`/admin`): torneos con su estado (borrador → abierto → en curso → finalizado), pruebas, categorías por edad y sexo, inscritos (inscribir, anular, cambiar dorsal), consulta y alta de atletas, usuarios (jueces y administradores) y corrección de resultados.
- **Juez** (`/juez`): registro de tiempos por dorsal (o DNF / DNS / DSQ). Sin conexión, los tiempos quedan en el dispositivo y se envían solos al volver la red.
- **Atleta** (`/atleta`): inscripción en pruebas con categoría y dorsal automáticos, sus inscripciones, sus resultados y su perfil.
- **Público**: torneos, detalle de cada torneo y resultados por prueba con podio, clasificación general y por categoría, actualizados en vivo.
- **PWA**: se instala en el teléfono y muestra los últimos datos públicos visitados aunque no haya conexión.

## Estructura del repositorio

```
├─ client/      Frontend React + Vite (PWA)
├─ server/      API REST Node.js + Express
├─ database/    Scripts MySQL (schema.sql, seed.sql)
├─ docs/
│  ├─ 00-instalacion/      Guía de instalación del entorno
│  ├─ 01-scrum/            Planificación SCRUM y backlog para Jira
│  ├─ 02-ui-ux/            Wireframes, mapa de navegación, guía de estilo
│  ├─ 03-base-de-datos/    Diagrama entidad-relación
│  ├─ 04-manual-tecnico/   Manual técnico, diagramas de flujo, capturas
│  └─ entrega/             Documento PDF final
└─ scripts/     Utilidades (capturas, generación del PDF)
```

## Documentación de la entrega

| Entregable | Archivo |
|---|---|
| **Documento final (PDF)** | [docs/entrega/Entrega-Podio.pdf](docs/entrega/Entrega-Podio.pdf) — se regenera con `npm run pdf` |
| Planificación SCRUM y backlog para Jira | [docs/01-scrum/](docs/01-scrum/) |
| Wireframes, mapa de navegación y guía de estilo | [docs/02-ui-ux/](docs/02-ui-ux/) |
| Diagrama de base de datos | [docs/03-base-de-datos/](docs/03-base-de-datos/) |
| Manual técnico (diagramas de flujo, capturas, instalación) | [docs/04-manual-tecnico/manual-tecnico.md](docs/04-manual-tecnico/manual-tecnico.md) |
| Informe de pruebas y errores corregidos | [docs/05-pruebas/informe-pruebas.md](docs/05-pruebas/informe-pruebas.md) — colección Postman en [docs/05-pruebas/postman/](docs/05-pruebas/postman/) |
| Guía de despliegue (Render + Aiven) | [docs/06-despliegue/despliegue-render-aiven.md](docs/06-despliegue/despliegue-render-aiven.md) |

## Inicio rápido

1. Instala el entorno siguiendo [docs/00-instalacion/instalacion-entorno.md](docs/00-instalacion/instalacion-entorno.md).
2. Instala dependencias:
   ```bash
   npm run install:all
   ```
3. Configura `server/.env` (copia de `server/.env.example`) y crea la base de datos:
   ```bash
   npm run db:reset
   ```
4. Levanta frontend y backend:
   ```bash
   npm run dev
   ```
   - Web: http://localhost:5173
   - API: http://localhost:3000/api
   - Documentación API: http://localhost:3000/api/docs
5. Pruebas:
   ```bash
   npm test               # Jest (cliente) + Vitest (API)
   npm run test:postman   # colección Postman con Newman → docs/05-pruebas/reportes/
   ```

Usuarios de demostración: `admin@podio.local / Admin123!`, `juez@podio.local / Juez123!`, `valentina@podio.local / Atleta123!`.
