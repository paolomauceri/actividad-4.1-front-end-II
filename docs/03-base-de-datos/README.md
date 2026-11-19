# Diagrama de Base de Datos — Podio

Base de datos relacional **MySQL 8** (`torneos_db`, motor InnoDB, `utf8mb4`).
En el entorno de desarrollo se utilizó **MariaDB 11.8 LTS**, compatible con MySQL, por el bloqueo regional de descargas de Oracle (ver guía de instalación). Los scripts usan SQL estándar de MySQL y funcionan en ambos motores.

## Archivos

| Archivo | Contenido |
|---|---|
| [`database/schema.sql`](../../database/schema.sql) | Crea la base `torneos_db`: 8 tablas, claves, restricciones y la vista `vw_clasificacion` |
| [`database/seed.sql`](../../database/seed.sql) | Datos de prueba: deportes, usuarios, 4 torneos, pruebas, categorías, inscripciones y resultados |
| [`database/00-usuario-dev.sql`](../../database/00-usuario-dev.sql) | Crea el usuario local `podio` que usa la API (ejecutar una vez) |
| [`diagrama-er.drawio`](diagrama-er.drawio) | Diagrama entidad-relación (Draw.io, notación pata de gallo) |

## Entidades

| Tabla | Descripción | Claves y restricciones principales |
|---|---|---|
| **usuarios** | Toda cuenta del sistema. El campo `rol` distingue `ADMIN`, `JUEZ` y `ATLETA`. | PK `id`; `email` único; contraseña guardada como hash bcrypt (`CHAR(60)`) |
| **atletas** | Perfil deportivo de un usuario atleta: documento, fecha de nacimiento, sexo, club. | PK/FK `usuario_id` → usuarios (1:1); `documento` único |
| **deportes** | Catálogo: Aguas abiertas, Natación, Acuatlón, Triatlón, Atletismo. | PK `id`; `nombre` único |
| **torneos** | Evento con sede, fechas y estado (`BORRADOR`, `ABIERTO`, `EN_CURSO`, `FINALIZADO`). | PK `id`; FK `creado_por` → usuarios; `CHECK fecha_inicio <= fecha_fin` |
| **pruebas** | Competencia dentro de un torneo (p. ej. "Aguas abiertas 1.500 m"), de un deporte, con distancia, fecha/hora y cupo. | FK `torneo_id`, FK `deporte_id`; `CHECK distancia_m > 0` |
| **categorias** | Grupos por sexo y rango de edad de cada torneo (Juvenil, Adulto, Máster). | FK `torneo_id`; único (`torneo_id`, `nombre`); `CHECK edad_min <= edad_max` |
| **inscripciones** | Un atleta inscrito en una prueba dentro de una categoría, con número de **dorsal**. | FK prueba, atleta, categoría; únicos (`prueba_id`, `atleta_id`) y (`prueba_id`, `dorsal`) |
| **resultados** | Tiempo final de una inscripción registrado por un juez; estado `FINALIZADO`, `DNF`, `DNS` o `DSQ`. | FK `inscripcion_id` único (1:0..1); FK `registrado_por` → usuarios; `CHECK` tiempo obligatorio solo si `FINALIZADO` |

### Vista `vw_clasificacion`

Calcula la **posición** de cada atleta por prueba y categoría con `RANK() OVER (PARTITION BY prueba, categoría ORDER BY tiempo_ms)`. La posición no se guarda: se obtiene siempre actualizada a partir de los tiempos registrados, lo que evita inconsistencias cuando un juez corrige un tiempo.

## Relaciones (cardinalidades)

| Relación | Cardinalidad | Significado |
|---|---|---|
| usuarios — atletas | 1 : 0..1 | Un usuario con rol ATLETA tiene un perfil deportivo |
| usuarios — torneos | 1 : N | Un administrador crea muchos torneos |
| usuarios — resultados | 1 : N | Un juez registra muchos resultados |
| torneos — pruebas | 1 : N | Un torneo contiene varias pruebas |
| torneos — categorias | 1 : N | Cada torneo define sus categorías |
| deportes — pruebas | 1 : N | Cada prueba pertenece a un deporte |
| pruebas — inscripciones | 1 : N | Una prueba recibe muchas inscripciones |
| atletas — inscripciones | 1 : N | Un atleta se inscribe en varias pruebas (una vez por prueba) |
| categorias — inscripciones | 1 : N | La inscripción ubica al atleta en una categoría |
| inscripciones — resultados | 1 : 0..1 | Cada inscripción tiene como máximo un tiempo final |

**Decisión de diseño:** se guarda un **único tiempo final** por atleta y prueba (en milisegundos). Los tiempos parciales por tramo (natación, T1, bici, T2, carrera) quedan fuera del alcance.

## Cómo cargar la base de datos

### Opción A — Terminal

Funciona en PowerShell, CMD y Git Bash (desde la carpeta raíz del proyecto):

```bash
mysql -u root -p -e "source database/00-usuario-dev.sql"   # solo la primera vez
mysql -u root -p -e "source database/schema.sql"
mysql -u root -p -e "source database/seed.sql"
```

> En CMD o Git Bash también sirve la forma `mysql -u root -p < database/schema.sql`.
> En **PowerShell** el operador `<` no existe; usa la forma con `source`.

Verificación rápida:

```sql
USE torneos_db;
SELECT COUNT(*) FROM usuarios;          -- 15
SELECT * FROM vw_clasificacion WHERE prueba_id = 8 ORDER BY categoria_id, posicion;
```

### Opción B — MySQL Workbench (genera el diagrama EER)

1. Abrir la conexión *Local instance 3306*.
2. **File → Open SQL Script…** → `database/schema.sql` → ejecutar (icono de rayo).
3. Repetir con `database/seed.sql`.
4. **Database → Reverse Engineer…** → seleccionar `torneos_db` → *Next* hasta finalizar.
   Workbench dibuja el diagrama EER con todas las tablas y relaciones.
5. **File → Export → Export as PNG** para incluirlo en el informe.

### Opción C — HeidiSQL (incluido con MariaDB)

1. Abrir HeidiSQL → nueva sesión `127.0.0.1`, usuario `root`.
2. **Archivo → Ejecutar archivo SQL…** → `schema.sql` y luego `seed.sql`.

## Cómo abrir el diagrama Draw.io

- Web: entrar a **https://app.diagrams.net** → *Open Existing Diagram* → `diagrama-er.drawio`.
- Escritorio / VS Code: extensión **Draw.io Integration** y abrir el archivo.
- Exportar imagen: **File → Export as → PNG**.
