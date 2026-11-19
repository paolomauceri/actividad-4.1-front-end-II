# Podio — Gestión de torneos multideporte (PWA)

Aplicación web progresiva para administrar torneos de **natación, aguas abiertas, acuatlón, triatlón y atletismo**: inscripción de atletas, registro de tiempos y visualización de resultados con actualización ágil.

**Curso:** Taller Front End 2
**Integrantes:** Brayan Teran · Paolo Mauceri

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite, React Router, vite-plugin-pwa |
| Backend | Node.js + Express, JWT, bcryptjs |
| Base de datos | MySQL 8 (driver `mysql2`) |
| Documentación API | OpenAPI 3 + Swagger UI |
| Gestión | SCRUM, tablero en Jira |

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
