-- =====================================================================
--  Podio — Datos de prueba (seed)
--  Ejecutar DESPUÉS de schema.sql:
--    mysql -u root -p -e "source database/seed.sql"
--
--  Las fechas son relativas al día en que se carga (ver bloque final).
--
--  Credenciales de prueba (solo desarrollo):
--    admin@podio.local   / Admin123!   (ADMIN)
--    juez@podio.local    / Juez123!    (JUEZ)
--    juez2@podio.local   / Juez123!    (JUEZ)
--    <atleta>@podio.local / Atleta123! (ATLETA)
-- =====================================================================

SET NAMES utf8mb4;
USE torneos_db;

-- ---------------------------------------------------------------------
-- Deportes
-- ---------------------------------------------------------------------
INSERT INTO deportes (id, nombre, descripcion) VALUES
  (1, 'Aguas abiertas', 'Natación en lagos, ríos o mar sobre distancias largas'),
  (2, 'Natación',       'Pruebas en piscina por estilo y distancia'),
  (3, 'Acuatlón',       'Natación seguida de carrera a pie'),
  (4, 'Triatlón',       'Natación, ciclismo y carrera a pie de forma continua'),
  (5, 'Atletismo',      'Carreras de calle y pista');

-- ---------------------------------------------------------------------
-- Usuarios (contraseñas con bcrypt, costo 10)
-- ---------------------------------------------------------------------
INSERT INTO usuarios (id, nombre, apellido, email, password_hash, rol, activo, creado_en) VALUES
  (1,  'Laura',     'Méndez',    'admin@podio.local',      '$2a$10$E9OjedgBnFjih2.UkhbFIOVpXHSTaTNj0EsSuVwSR10zyy7tnk4RO', 'ADMIN',  1, '2026-09-01 09:00:00'),
  (2,  'Ricardo',   'Paredes',   'juez@podio.local',       '$2a$10$ptcsMAi3E43i.bFgYfsf8u/PK5gw.m6pH71QMLmu317UwOX6Zz3AG', 'JUEZ',   1, '2026-09-02 10:00:00'),
  (3,  'Mariana',   'Quintero',  'juez2@podio.local',      '$2a$10$ptcsMAi3E43i.bFgYfsf8u/PK5gw.m6pH71QMLmu317UwOX6Zz3AG', 'JUEZ',   1, '2026-09-02 10:30:00'),
  (4,  'Valentina', 'Rojas',     'valentina@podio.local',  '$2a$10$xb7.x5hXbSjvdkVLph5e1uurRtVtgpaIUZ3t59JqOxKcG7Opz6M06', 'ATLETA', 1, '2026-09-10 18:12:00'),
  (5,  'Mateo',     'Fernández', 'mateo@podio.local',      '$2a$10$xb7.x5hXbSjvdkVLph5e1uurRtVtgpaIUZ3t59JqOxKcG7Opz6M06', 'ATLETA', 1, '2026-09-11 19:40:00'),
  (6,  'Camila',    'Torres',    'camila@podio.local',     '$2a$10$xb7.x5hXbSjvdkVLph5e1uurRtVtgpaIUZ3t59JqOxKcG7Opz6M06', 'ATLETA', 1, '2026-09-12 07:25:00'),
  (7,  'Sebastián', 'Morales',   'sebastian@podio.local',  '$2a$10$xb7.x5hXbSjvdkVLph5e1uurRtVtgpaIUZ3t59JqOxKcG7Opz6M06', 'ATLETA', 1, '2026-09-14 21:05:00'),
  (8,  'Isabella',  'Castro',    'isabella@podio.local',   '$2a$10$xb7.x5hXbSjvdkVLph5e1uurRtVtgpaIUZ3t59JqOxKcG7Opz6M06', 'ATLETA', 1, '2026-09-20 12:00:00'),
  (9,  'Diego',     'Ramírez',   'diego@podio.local',      '$2a$10$xb7.x5hXbSjvdkVLph5e1uurRtVtgpaIUZ3t59JqOxKcG7Opz6M06', 'ATLETA', 1, '2026-09-22 08:45:00'),
  (10, 'Lucía',     'Herrera',   'lucia@podio.local',      '$2a$10$xb7.x5hXbSjvdkVLph5e1uurRtVtgpaIUZ3t59JqOxKcG7Opz6M06', 'ATLETA', 1, '2026-09-25 17:30:00'),
  (11, 'Andrés',    'Navarro',   'andres@podio.local',     '$2a$10$xb7.x5hXbSjvdkVLph5e1uurRtVtgpaIUZ3t59JqOxKcG7Opz6M06', 'ATLETA', 1, '2026-10-01 06:50:00'),
  (12, 'Sofía',     'Medina',    'sofia@podio.local',      '$2a$10$xb7.x5hXbSjvdkVLph5e1uurRtVtgpaIUZ3t59JqOxKcG7Opz6M06', 'ATLETA', 1, '2026-10-03 16:15:00'),
  (13, 'Nicolás',   'Vargas',    'nicolas@podio.local',    '$2a$10$xb7.x5hXbSjvdkVLph5e1uurRtVtgpaIUZ3t59JqOxKcG7Opz6M06', 'ATLETA', 1, '2026-10-20 20:20:00'),
  (14, 'Gabriela',  'Ortiz',     'gabriela@podio.local',   '$2a$10$xb7.x5hXbSjvdkVLph5e1uurRtVtgpaIUZ3t59JqOxKcG7Opz6M06', 'ATLETA', 1, '2026-11-02 09:10:00'),
  (15, 'Joaquín',   'Silva',     'joaquin@podio.local',    '$2a$10$xb7.x5hXbSjvdkVLph5e1uurRtVtgpaIUZ3t59JqOxKcG7Opz6M06', 'ATLETA', 1, '2026-11-15 13:35:00');

INSERT INTO atletas (usuario_id, documento, fecha_nacimiento, sexo, club, telefono) VALUES
  (4,  '30111222', '2008-03-14', 'F', 'Club Delfines',   '555-0104'),
  (5,  '31222333', '2009-07-02', 'M', 'Club Delfines',   '555-0105'),
  (6,  '25333444', '1998-11-25', 'F', 'Tritón Club',     '555-0106'),
  (7,  '22444555', '1995-01-09', 'M', 'Tritón Club',     '555-0107'),
  (8,  '27555666', '2001-05-30', 'F', 'Atlético Costa',  '555-0108'),
  (9,  '26666777', '2000-09-12', 'M', 'Atlético Costa',  '555-0109'),
  (10, '14777888', '1982-02-18', 'F', 'Club Delfines',   '555-0110'),
  (11, '12888999', '1979-06-21', 'M', 'Máster Swim',     '555-0111'),
  (12, '29999000', '2007-12-03', 'F', 'Tritón Club',     '555-0112'),
  (13, '20101010', '1990-04-27', 'M', 'Independiente',   NULL),
  (14, '11212121', '1976-08-08', 'F', 'Máster Swim',     '555-0114'),
  (15, '28323232', '2006-10-30', 'M', 'Atlético Costa',  '555-0115');

-- ---------------------------------------------------------------------
-- Torneos
-- ---------------------------------------------------------------------
INSERT INTO torneos (id, nombre, descripcion, sede, fecha_inicio, fecha_fin, estado, creado_por) VALUES
  (1, 'Copa Aguas Abiertas Lago Azul 2026',
      'Travesías de 1,5 km y 5 km y acuatlón sprint en el Lago Azul.',
      'Lago Azul, Playa Norte', '2026-12-12', '2026-12-13', 'ABIERTO', 1),
  (2, 'Circuito Costa Triatlón y Atletismo 2026',
      'Semana multideporte en el malecón: 5 km, triatlón sprint y 10 km.',
      'Malecón Costa Azul', '2026-11-22', '2026-11-27', 'EN_CURSO', 1),
  (3, 'Interclubes de Natación Otoño 2026',
      'Torneo de piscina entre clubes, categorías juvenil, adulto y máster.',
      'Complejo Acuático Municipal', '2026-10-17', '2026-10-18', 'FINALIZADO', 1),
  (4, 'Media Maratón Ciudad 2027',
      'Planificación preliminar de la media maratón.',
      'Centro de la ciudad', '2027-03-14', '2027-03-14', 'BORRADOR', 1);

-- ---------------------------------------------------------------------
-- Pruebas
-- ---------------------------------------------------------------------
INSERT INTO pruebas (id, torneo_id, deporte_id, nombre, distancia_m, fecha_hora, cupo, estado) VALUES
  (1,  1, 1, 'Aguas abiertas 1.500 m',                   1500,  '2026-12-12 08:00:00',  80, 'PROGRAMADA'),
  (2,  1, 1, 'Aguas abiertas 5.000 m',                   5000,  '2026-12-12 10:30:00',  50, 'PROGRAMADA'),
  (3,  1, 3, 'Acuatlón sprint (750 m + 5 km)',           5750,  '2026-12-13 08:00:00',  60, 'PROGRAMADA'),
  (4,  2, 5, 'Atletismo 5 km',                           5000,  '2026-11-22 07:30:00', 150, 'FINALIZADA'),
  (5,  2, 4, 'Triatlón sprint (750 m + 20 km + 5 km)',  25750,  '2026-11-25 07:00:00', 100, 'EN_CURSO'),
  (6,  2, 5, 'Atletismo 10 km',                         10000,  '2026-11-27 07:30:00', 150, 'PROGRAMADA'),
  (7,  3, 2, '50 m libre',                                  50,  '2026-10-17 09:00:00',  40, 'FINALIZADA'),
  (8,  3, 2, '100 m libre',                                100,  '2026-10-17 11:00:00',  40, 'FINALIZADA'),
  (9,  3, 2, '200 m combinado individual',                 200,  '2026-10-18 09:00:00',  32, 'FINALIZADA'),
  (10, 4, 5, 'Media maratón 21 km',                      21097,  '2027-03-14 07:00:00', 300, 'PROGRAMADA');

-- ---------------------------------------------------------------------
-- Categorías (por torneo): Juvenil 15-19, Adulto 20-39, Máster 40+
-- ---------------------------------------------------------------------
INSERT INTO categorias (id, torneo_id, nombre, sexo, edad_min, edad_max) VALUES
  (1,  1, 'Juvenil Femenino', 'F', 15, 19),
  (2,  1, 'Juvenil Masculino','M', 15, 19),
  (3,  1, 'Adulto Femenino',  'F', 20, 39),
  (4,  1, 'Adulto Masculino', 'M', 20, 39),
  (5,  1, 'Máster Femenino',  'F', 40, 99),
  (6,  1, 'Máster Masculino', 'M', 40, 99),
  (7,  2, 'Juvenil Femenino', 'F', 15, 19),
  (8,  2, 'Juvenil Masculino','M', 15, 19),
  (9,  2, 'Adulto Femenino',  'F', 20, 39),
  (10, 2, 'Adulto Masculino', 'M', 20, 39),
  (11, 2, 'Máster Femenino',  'F', 40, 99),
  (12, 2, 'Máster Masculino', 'M', 40, 99),
  (13, 3, 'Juvenil Femenino', 'F', 15, 19),
  (14, 3, 'Juvenil Masculino','M', 15, 19),
  (15, 3, 'Adulto Femenino',  'F', 20, 39),
  (16, 3, 'Adulto Masculino', 'M', 20, 39),
  (17, 3, 'Máster Femenino',  'F', 40, 99),
  (18, 3, 'Máster Masculino', 'M', 40, 99);

-- ---------------------------------------------------------------------
-- Inscripciones
-- ---------------------------------------------------------------------
INSERT INTO inscripciones (id, prueba_id, atleta_id, categoria_id, dorsal, estado, creado_en) VALUES
  -- Torneo 3 · 50 m libre
  (1,  7, 4,  13, 101, 'CONFIRMADA', '2026-10-01 10:00:00'),
  (2,  7, 5,  14, 102, 'CONFIRMADA', '2026-10-01 10:05:00'),
  (3,  7, 6,  15, 103, 'CONFIRMADA', '2026-10-02 11:00:00'),
  (4,  7, 7,  16, 104, 'CONFIRMADA', '2026-10-02 11:20:00'),
  (5,  7, 10, 17, 105, 'CONFIRMADA', '2026-10-03 09:00:00'),
  (6,  7, 11, 18, 106, 'CONFIRMADA', '2026-10-03 09:15:00'),
  (7,  7, 12, 13, 107, 'CONFIRMADA', '2026-10-04 18:00:00'),
  (8,  7, 15, 14, 108, 'CONFIRMADA', '2026-10-05 19:30:00'),
  -- Torneo 3 · 100 m libre
  (9,  8, 4,  13, 101, 'CONFIRMADA', '2026-10-01 10:02:00'),
  (10, 8, 6,  15, 102, 'CONFIRMADA', '2026-10-02 11:05:00'),
  (11, 8, 8,  15, 103, 'CONFIRMADA', '2026-10-02 15:00:00'),
  (12, 8, 9,  16, 104, 'CONFIRMADA', '2026-10-03 08:40:00'),
  (13, 8, 13, 16, 105, 'CONFIRMADA', '2026-10-04 12:00:00'),
  (14, 8, 14, 17, 106, 'CONFIRMADA', '2026-10-05 07:30:00'),
  (15, 8, 15, 14, 107, 'CONFIRMADA', '2026-10-05 19:35:00'),
  -- Torneo 3 · 200 m combinado
  (16, 9, 5,  14, 101, 'CONFIRMADA', '2026-10-01 10:10:00'),
  (17, 9, 7,  16, 102, 'CONFIRMADA', '2026-10-02 11:25:00'),
  (18, 9, 10, 17, 103, 'CONFIRMADA', '2026-10-03 09:05:00'),
  (19, 9, 11, 18, 104, 'CONFIRMADA', '2026-10-03 09:20:00'),
  (20, 9, 12, 13, 105, 'CONFIRMADA', '2026-10-04 18:10:00'),
  -- Torneo 2 · 5 km
  (21, 4, 8,  9,  201, 'CONFIRMADA', '2026-11-01 08:00:00'),
  (22, 4, 9,  10, 202, 'CONFIRMADA', '2026-11-01 08:30:00'),
  (23, 4, 13, 10, 203, 'CONFIRMADA', '2026-11-03 20:00:00'),
  (24, 4, 6,  9,  204, 'CONFIRMADA', '2026-11-04 07:10:00'),
  (25, 4, 15, 10, 205, 'CONFIRMADA', '2026-11-15 14:00:00'),
  -- Torneo 2 · Triatlón sprint
  (26, 5, 6,  9,  301, 'CONFIRMADA', '2026-11-04 07:15:00'),
  (27, 5, 7,  10, 302, 'CONFIRMADA', '2026-11-05 21:00:00'),
  (28, 5, 9,  10, 303, 'CONFIRMADA', '2026-11-06 06:45:00'),
  (29, 5, 13, 10, 304, 'CONFIRMADA', '2026-11-06 20:10:00'),
  (30, 5, 15, 10, 305, 'CONFIRMADA', '2026-11-15 14:05:00'),
  (31, 5, 11, 12, 306, 'CONFIRMADA', '2026-11-07 06:30:00'),
  -- Torneo 2 · 10 km
  (32, 6, 8,  9,  401, 'CONFIRMADA', '2026-11-08 09:00:00'),
  (33, 6, 14, 11, 402, 'CONFIRMADA', '2026-11-09 10:00:00'),
  (34, 6, 10, 11, 403, 'CONFIRMADA', '2026-11-10 17:45:00'),
  (35, 6, 13, 10, 404, 'CONFIRMADA', '2026-11-17 22:00:00'),
  (36, 6, 5,  8,  405, 'ANULADA',    '2026-11-11 16:00:00'),
  -- Torneo 1 · Aguas abiertas 1.500 m
  (37, 1, 4,  1,  11,  'CONFIRMADA', '2026-11-05 18:00:00'),
  (38, 1, 10, 5,  12,  'CONFIRMADA', '2026-11-06 17:50:00'),
  (39, 1, 11, 6,  13,  'CONFIRMADA', '2026-11-07 06:35:00'),
  (40, 1, 12, 1,  14,  'CONFIRMADA', '2026-11-16 19:00:00'),
  (41, 1, 14, 5,  15,  'CONFIRMADA', '2026-11-18 08:20:00'),
  -- Torneo 1 · Aguas abiertas 5.000 m
  (42, 2, 7,  4,  21,  'CONFIRMADA', '2026-11-06 21:10:00'),
  (43, 2, 11, 6,  22,  'CONFIRMADA', '2026-11-18 06:40:00'),
  -- Torneo 1 · Acuatlón sprint
  (44, 3, 5,  2,  31,  'CONFIRMADA', '2026-11-09 16:30:00'),
  (45, 3, 15, 4,  32,  'CONFIRMADA', '2026-11-15 14:10:00'),
  (46, 3, 6,  3,  33,  'CONFIRMADA', '2026-11-18 07:00:00');

-- ---------------------------------------------------------------------
-- Resultados (tiempos en milisegundos)
-- ---------------------------------------------------------------------
INSERT INTO resultados (inscripcion_id, tiempo_ms, estado, registrado_por, registrado_en, observaciones) VALUES
  -- 50 m libre
  (1,  29840, 'FINALIZADO', 2, '2026-10-17 09:20:00', NULL),
  (2,  26120, 'FINALIZADO', 2, '2026-10-17 09:20:00', NULL),
  (3,  28950, 'FINALIZADO', 2, '2026-10-17 09:21:00', NULL),
  (4,  25480, 'FINALIZADO', 2, '2026-10-17 09:21:00', NULL),
  (5,  33700, 'FINALIZADO', 2, '2026-10-17 09:22:00', NULL),
  (6,  30050, 'FINALIZADO', 2, '2026-10-17 09:22:00', NULL),
  (7,  30410, 'FINALIZADO', 2, '2026-10-17 09:23:00', NULL),
  (8,  NULL,  'DSQ',        2, '2026-10-17 09:23:00', 'Salida en falso'),
  -- 100 m libre
  (9,  65320, 'FINALIZADO', 3, '2026-10-17 11:30:00', NULL),
  (10, 63870, 'FINALIZADO', 3, '2026-10-17 11:30:00', NULL),
  (11, 66100, 'FINALIZADO', 3, '2026-10-17 11:31:00', NULL),
  (12, 57940, 'FINALIZADO', 3, '2026-10-17 11:31:00', NULL),
  (13, 59210, 'FINALIZADO', 3, '2026-10-17 11:32:00', NULL),
  (14, 75660, 'FINALIZADO', 3, '2026-10-17 11:32:00', NULL),
  (15, 58730, 'FINALIZADO', 3, '2026-10-17 11:33:00', NULL),
  -- 200 m combinado
  (16, 144550, 'FINALIZADO', 2, '2026-10-18 09:40:00', NULL),
  (17, 138020, 'FINALIZADO', 2, '2026-10-18 09:40:00', NULL),
  (18, 178400, 'FINALIZADO', 2, '2026-10-18 09:41:00', NULL),
  (19, NULL,   'DNF',        2, '2026-10-18 09:41:00', 'Abandonó en el tramo de pecho'),
  (20, 159770, 'FINALIZADO', 2, '2026-10-18 09:42:00', NULL),
  -- 5 km
  (21, 1361000, 'FINALIZADO', 3, '2026-11-22 08:15:00', NULL),
  (22, 1085000, 'FINALIZADO', 3, '2026-11-22 08:15:00', NULL),
  (23, 1162400, 'FINALIZADO', 3, '2026-11-22 08:16:00', NULL),
  (24, 1438700, 'FINALIZADO', 3, '2026-11-22 08:16:00', NULL),
  (25, NULL,    'DNS',        3, '2026-11-22 08:17:00', 'No se presentó a la largada');

-- ---------------------------------------------------------------------
-- Fechas relativas: los datos están escritos como si hoy fuera 2026-11-25.
-- Este bloque corre todas las fechas los días que hayan pasado desde entonces,
-- así siempre hay un torneo EN CURSO (con una prueba hoy), uno ABIERTO en
-- el futuro y uno FINALIZADO en el pasado, sin importar cuándo se carguen.
-- ---------------------------------------------------------------------
SET @desfase := DATEDIFF(CURDATE(), '2026-11-25');

UPDATE usuarios      SET creado_en = DATE_ADD(creado_en, INTERVAL @desfase DAY);
UPDATE torneos       SET fecha_inicio = DATE_ADD(fecha_inicio, INTERVAL @desfase DAY),
                         fecha_fin    = DATE_ADD(fecha_fin,    INTERVAL @desfase DAY);
UPDATE pruebas       SET fecha_hora = DATE_ADD(fecha_hora, INTERVAL @desfase DAY);
UPDATE inscripciones SET creado_en = DATE_ADD(creado_en, INTERVAL @desfase DAY);
UPDATE resultados    SET registrado_en = DATE_ADD(registrado_en, INTERVAL @desfase DAY);
