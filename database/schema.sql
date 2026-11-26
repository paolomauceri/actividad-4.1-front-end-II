-- =====================================================================
--  Podio — Gestión de torneos multideporte
--  Esquema de base de datos (MySQL 8.0+ / compatible MariaDB 10.6+)
--
--  Ejecutar:   mysql -u root -p -e "source database/schema.sql"
--  Workbench:  File > Open SQL Script > ejecutar (rayo)
--              Database > Reverse Engineer > torneos_db  (genera el EER)
-- =====================================================================

SET NAMES utf8mb4;

DROP DATABASE IF EXISTS torneos_db;
CREATE DATABASE torneos_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE torneos_db;

-- ---------------------------------------------------------------------
-- usuarios: toda persona con cuenta en el sistema
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre          VARCHAR(60)  NOT NULL,
  apellido        VARCHAR(60)  NOT NULL,
  email           VARCHAR(120) NOT NULL,
  password_hash   CHAR(60)     NOT NULL,
  rol             ENUM('ADMIN','JUEZ','ATLETA') NOT NULL DEFAULT 'ATLETA',
  activo          TINYINT(1)   NOT NULL DEFAULT 1,
  creado_en       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_email (email),
  KEY idx_usuarios_rol (rol)
) ENGINE=InnoDB COMMENT='Cuentas del sistema: administradores, jueces y atletas';

-- ---------------------------------------------------------------------
-- atletas: datos deportivos de los usuarios con rol ATLETA (1:1)
-- ---------------------------------------------------------------------
CREATE TABLE atletas (
  usuario_id        INT UNSIGNED NOT NULL,
  documento         VARCHAR(20)  NOT NULL,
  fecha_nacimiento  DATE         NOT NULL,
  sexo              ENUM('M','F') NOT NULL,
  club              VARCHAR(80)  NULL,
  telefono          VARCHAR(20)  NULL,
  PRIMARY KEY (usuario_id),
  UNIQUE KEY uq_atletas_documento (documento),
  CONSTRAINT fk_atletas_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Perfil deportivo del atleta (extiende a usuarios)';

-- ---------------------------------------------------------------------
-- deportes: catálogo (aguas abiertas, natación, acuatlón, triatlón, atletismo)
-- ---------------------------------------------------------------------
CREATE TABLE deportes (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre       VARCHAR(40)  NOT NULL,
  descripcion  VARCHAR(255) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_deportes_nombre (nombre)
) ENGINE=InnoDB COMMENT='Catálogo de disciplinas deportivas';

-- ---------------------------------------------------------------------
-- torneos: evento que agrupa pruebas y categorías
-- ---------------------------------------------------------------------
CREATE TABLE torneos (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre          VARCHAR(120) NOT NULL,
  descripcion     TEXT         NULL,
  sede            VARCHAR(120) NOT NULL,
  fecha_inicio    DATE         NOT NULL,
  fecha_fin       DATE         NOT NULL,
  estado          ENUM('BORRADOR','ABIERTO','EN_CURSO','FINALIZADO') NOT NULL DEFAULT 'BORRADOR',
  creado_por      INT UNSIGNED NOT NULL,
  creado_en       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_torneos_fecha_inicio (fecha_inicio),
  KEY idx_torneos_estado (estado),
  KEY idx_torneos_creado_por (creado_por),
  CONSTRAINT chk_torneos_fechas CHECK (fecha_inicio <= fecha_fin),
  CONSTRAINT fk_torneos_creador
    FOREIGN KEY (creado_por) REFERENCES usuarios (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Torneos organizados por un administrador';

-- ---------------------------------------------------------------------
-- pruebas: cada competencia dentro de un torneo (ej. 1.500 m aguas abiertas)
-- ---------------------------------------------------------------------
CREATE TABLE pruebas (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  torneo_id    INT UNSIGNED NOT NULL,
  deporte_id   INT UNSIGNED NOT NULL,
  nombre       VARCHAR(120) NOT NULL,
  distancia_m  INT UNSIGNED NOT NULL,
  fecha_hora   DATETIME     NOT NULL,
  cupo         SMALLINT UNSIGNED NULL,
  estado       ENUM('PROGRAMADA','EN_CURSO','FINALIZADA','CANCELADA') NOT NULL DEFAULT 'PROGRAMADA',
  PRIMARY KEY (id),
  KEY idx_pruebas_torneo (torneo_id),
  KEY idx_pruebas_deporte (deporte_id),
  KEY idx_pruebas_fecha_hora (fecha_hora),
  CONSTRAINT chk_pruebas_distancia CHECK (distancia_m > 0),
  CONSTRAINT fk_pruebas_torneo
    FOREIGN KEY (torneo_id) REFERENCES torneos (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_pruebas_deporte
    FOREIGN KEY (deporte_id) REFERENCES deportes (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Pruebas (eventos) de un torneo';

-- ---------------------------------------------------------------------
-- categorias: grupos por edad y sexo definidos para cada torneo
-- ---------------------------------------------------------------------
CREATE TABLE categorias (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  torneo_id  INT UNSIGNED NOT NULL,
  nombre     VARCHAR(60)  NOT NULL,
  sexo       ENUM('M','F','MIXTO') NOT NULL,
  edad_min   TINYINT UNSIGNED NOT NULL,
  edad_max   TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categorias_torneo_nombre (torneo_id, nombre),
  CONSTRAINT chk_categorias_edades CHECK (edad_min <= edad_max),
  CONSTRAINT fk_categorias_torneo
    FOREIGN KEY (torneo_id) REFERENCES torneos (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Categorías por edad y sexo de cada torneo';

-- ---------------------------------------------------------------------
-- inscripciones: un atleta inscrito en una prueba, con su dorsal
-- ---------------------------------------------------------------------
CREATE TABLE inscripciones (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  prueba_id     INT UNSIGNED NOT NULL,
  atleta_id     INT UNSIGNED NOT NULL,
  categoria_id  INT UNSIGNED NOT NULL,
  dorsal        SMALLINT UNSIGNED NOT NULL,
  estado        ENUM('PENDIENTE','CONFIRMADA','ANULADA') NOT NULL DEFAULT 'PENDIENTE',
  creado_en     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_inscripciones_prueba_atleta (prueba_id, atleta_id),
  UNIQUE KEY uq_inscripciones_prueba_dorsal (prueba_id, dorsal),
  KEY idx_inscripciones_atleta (atleta_id),
  KEY idx_inscripciones_categoria (categoria_id),
  CONSTRAINT fk_inscripciones_prueba
    FOREIGN KEY (prueba_id) REFERENCES pruebas (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_inscripciones_atleta
    FOREIGN KEY (atleta_id) REFERENCES atletas (usuario_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_inscripciones_categoria
    FOREIGN KEY (categoria_id) REFERENCES categorias (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Inscripción de un atleta a una prueba';

-- ---------------------------------------------------------------------
-- resultados: tiempo final de una inscripción (registrado por un juez)
-- ---------------------------------------------------------------------
CREATE TABLE resultados (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  inscripcion_id  INT UNSIGNED NOT NULL,
  tiempo_ms       INT UNSIGNED NULL COMMENT 'Tiempo final en milisegundos; NULL si DNF/DNS/DSQ',
  estado          ENUM('FINALIZADO','DNF','DNS','DSQ') NOT NULL DEFAULT 'FINALIZADO',
  registrado_por  INT UNSIGNED NOT NULL,
  registrado_en   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  observaciones   VARCHAR(255) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_resultados_inscripcion (inscripcion_id),
  KEY idx_resultados_registrado_por (registrado_por),
  CONSTRAINT chk_resultados_tiempo CHECK (
    (estado = 'FINALIZADO' AND tiempo_ms IS NOT NULL AND tiempo_ms > 0)
    OR (estado <> 'FINALIZADO' AND tiempo_ms IS NULL)
  ),
  CONSTRAINT fk_resultados_inscripcion
    FOREIGN KEY (inscripcion_id) REFERENCES inscripciones (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_resultados_juez
    FOREIGN KEY (registrado_por) REFERENCES usuarios (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Tiempo final de cada atleta en una prueba';

-- ---------------------------------------------------------------------
-- Vista: clasificación por prueba y categoría (la posición se calcula,
-- no se guarda). Solo los FINALIZADO reciben posición. Las inscripciones
-- ANULADA no participan.
-- ---------------------------------------------------------------------
CREATE VIEW vw_clasificacion AS
SELECT
  p.torneo_id,
  i.prueba_id,
  i.categoria_id,
  c.nombre                           AS categoria,
  i.dorsal,
  i.atleta_id,
  CONCAT(u.nombre, ' ', u.apellido)  AS atleta,
  a.club,
  r.estado,
  r.tiempo_ms,
  CASE WHEN r.estado = 'FINALIZADO'
       THEN RANK() OVER (PARTITION BY i.prueba_id, i.categoria_id, r.estado
                         ORDER BY r.tiempo_ms)
  END                                AS posicion
FROM resultados r
JOIN inscripciones i ON i.id = r.inscripcion_id
JOIN pruebas p       ON p.id = i.prueba_id
JOIN categorias c    ON c.id = i.categoria_id
JOIN atletas a       ON a.usuario_id = i.atleta_id
JOIN usuarios u      ON u.id = i.atleta_id
WHERE i.estado <> 'ANULADA';

-- ---------------------------------------------------------------------
-- Vista: clasificación general de cada prueba (todas las categorías
-- juntas). Sirve para los "ganadores generales".
-- ---------------------------------------------------------------------
CREATE VIEW vw_clasificacion_general AS
SELECT
  p.torneo_id,
  i.prueba_id,
  i.categoria_id,
  c.nombre                           AS categoria,
  i.dorsal,
  i.atleta_id,
  CONCAT(u.nombre, ' ', u.apellido)  AS atleta,
  a.club,
  r.estado,
  r.tiempo_ms,
  CASE WHEN r.estado = 'FINALIZADO'
       THEN RANK() OVER (PARTITION BY i.prueba_id, r.estado
                         ORDER BY r.tiempo_ms)
  END                                AS posicion_general
FROM resultados r
JOIN inscripciones i ON i.id = r.inscripcion_id
JOIN pruebas p       ON p.id = i.prueba_id
JOIN categorias c    ON c.id = i.categoria_id
JOIN atletas a       ON a.usuario_id = i.atleta_id
JOIN usuarios u      ON u.id = i.atleta_id
WHERE i.estado <> 'ANULADA';
