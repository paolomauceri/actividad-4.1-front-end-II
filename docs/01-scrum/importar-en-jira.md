# Cómo cargar el backlog en Jira

El archivo [`jira-backlog.csv`](jira-backlog.csv) contiene todo el backlog de Podio listo para importar:

| Tipo | Cantidad | Detalle |
|---|---|---|
| Épicas (*Epic*) | 7 | EP-1 a EP-7 |
| Historias (*Story*) | 30 | HU-01 a HU-30, con puntos, prioridad y criterios de aceptación en la descripción |
| Subtareas (*Subtask*) | 23 | T-01 a T-23, tareas del Sprint 1 con estimación en horas |

Columnas del CSV: `Work item ID`, `Work Type`, `Summary`, `Description`, `Priority`, `Story Points`, `Parent`, `Sprint`, `Labels`.
La columna `Parent` enlaza cada historia con su épica y cada subtarea con su historia.

---

## 1. Crear el proyecto

1. Entra a **https://www.atlassian.com/software/jira/free** y crea un sitio gratuito (por ejemplo `podio-torneos.atlassian.net`).
2. **Crear proyecto → Desarrollo de software → Scrum**.
3. Tipo de proyecto: **Administrado por el equipo** (*team-managed*).
4. Nombre: `Podio`, clave: `POD`.
5. Invita al otro integrante: **Configuración del proyecto → Acceso → Añadir personas**.

## 2. Activar los puntos de historia

En proyectos *team-managed* el campo se llama **Estimación de puntos de historia** (*Story point estimate*):
**Configuración del proyecto → Funciones → Estimación → activar**.

## 3. Importar el CSV

1. Menú **⚙ (Configuración) → Sistema → Importación de sistemas externos → CSV**
   (en algunas versiones: **Filtros → Buscar incidencias → ⋯ → Importar incidencias desde CSV**).
2. Sube `docs/01-scrum/jira-backlog.csv` y elige el proyecto **Podio**.
3. Codificación: **UTF-8**. Separador: **coma**.
4. Mapea las columnas así:

| Columna del CSV | Campo de Jira |
|---|---|
| Work item ID | *Work item ID* (o *Issue ID*) |
| Work Type | *Work type* (o *Issue Type*) |
| Summary | *Summary* (Resumen) |
| Description | *Description* (Descripción) |
| Priority | *Priority* (Prioridad) |
| Story Points | *Story point estimate* |
| Parent | *Parent* (o *Parent ID*) |
| Sprint | *Sprint* |
| Labels | *Labels* (Etiquetas) |

5. Pulsa **Validar** y luego **Comenzar importación**.

> **Si la columna Sprint da error:** primero crea el sprint a mano en **Backlog → Crear sprint** con el nombre exacto `Sprint 1` y vuelve a importar, o importa sin mapear esa columna y arrastra al sprint las subtareas con la etiqueta `sprint-1` y sus historias.

## 4. Preparar el Sprint 1

1. En **Backlog**, verifica que **Sprint 1** tenga las 13 historias (40 puntos).
2. **Editar sprint:** fecha de inicio **19/11/2026**, fin **21/11/2026**.
   Objetivo: *Base funcional de Podio: autenticación, inicio, dashboard, API documentada y documentación del proyecto.*
3. **Iniciar sprint**.
4. En el **Tablero**, mueve las tarjetas a *Hecho* a medida que se completan.

## 5. Capturas para el informe

Toma estas capturas y guárdalas en `docs/04-manual-tecnico/capturas/` con estos nombres:

| Archivo | Qué capturar |
|---|---|
| `jira-01-backlog.png` | Vista **Backlog** con el Sprint 1 y el resto de las historias priorizadas |
| `jira-02-tablero.png` | **Tablero** del Sprint 1 con columnas Por hacer / En curso / Hecho |
| `jira-03-epicas.png` | Panel de **Épicas** (o la vista **Cronograma**) con las 7 épicas |
| `jira-04-historia.png` | Detalle de una historia (por ejemplo HU-01) con criterios de aceptación y subtareas |
| `jira-05-burndown.png` | **Informes → Gráfico de evolución (burndown)** del Sprint 1 |
