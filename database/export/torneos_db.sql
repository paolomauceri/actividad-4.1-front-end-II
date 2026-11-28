/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.2-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: torneos_db
-- ------------------------------------------------------
-- Server version	11.8.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Current Database: `torneos_db`
--

/*!40000 DROP DATABASE IF EXISTS `torneos_db`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `torneos_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `torneos_db`;

--
-- Table structure for table `atletas`
--

DROP TABLE IF EXISTS `atletas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `atletas` (
  `usuario_id` int(10) unsigned NOT NULL,
  `documento` varchar(20) NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `sexo` enum('M','F') NOT NULL,
  `club` varchar(80) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`usuario_id`),
  UNIQUE KEY `uq_atletas_documento` (`documento`),
  CONSTRAINT `fk_atletas_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Perfil deportivo del atleta (extiende a usuarios)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `atletas`
--

LOCK TABLES `atletas` WRITE;
/*!40000 ALTER TABLE `atletas` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `atletas` VALUES
(4,'30111222','2008-03-14','F','Club Delfines','555-0104'),
(5,'31222333','2009-07-02','M','Club Delfines','555-0105'),
(6,'25333444','1998-11-25','F','Tritón Club','555-0106'),
(7,'22444555','1995-01-09','M','Tritón Club','555-0107'),
(8,'27555666','2001-05-30','F','Atlético Costa','555-0108'),
(9,'26666777','2000-09-12','M','Atlético Costa','555-0109'),
(10,'14777888','1982-02-18','F','Club Delfines','555-0110'),
(11,'12888999','1979-06-21','M','Máster Swim','555-0111'),
(12,'29999000','2007-12-03','F','Tritón Club','555-0112'),
(13,'20101010','1990-04-27','M','Independiente',NULL),
(14,'11212121','1976-08-08','F','Máster Swim','555-0114'),
(15,'28323232','2006-10-30','M','Atlético Costa','555-0115');
/*!40000 ALTER TABLE `atletas` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `torneo_id` int(10) unsigned NOT NULL,
  `nombre` varchar(60) NOT NULL,
  `sexo` enum('M','F','MIXTO') NOT NULL,
  `edad_min` tinyint(3) unsigned NOT NULL,
  `edad_max` tinyint(3) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categorias_torneo_nombre` (`torneo_id`,`nombre`),
  CONSTRAINT `fk_categorias_torneo` FOREIGN KEY (`torneo_id`) REFERENCES `torneos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_categorias_edades` CHECK (`edad_min` <= `edad_max`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Categorías por edad y sexo de cada torneo';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `categorias` VALUES
(1,1,'Juvenil Femenino','F',15,19),
(2,1,'Juvenil Masculino','M',15,19),
(3,1,'Adulto Femenino','F',20,39),
(4,1,'Adulto Masculino','M',20,39),
(5,1,'Máster Femenino','F',40,99),
(6,1,'Máster Masculino','M',40,99),
(7,2,'Juvenil Femenino','F',15,19),
(8,2,'Juvenil Masculino','M',15,19),
(9,2,'Adulto Femenino','F',20,39),
(10,2,'Adulto Masculino','M',20,39),
(11,2,'Máster Femenino','F',40,99),
(12,2,'Máster Masculino','M',40,99),
(13,3,'Juvenil Femenino','F',15,19),
(14,3,'Juvenil Masculino','M',15,19),
(15,3,'Adulto Femenino','F',20,39),
(16,3,'Adulto Masculino','M',20,39),
(17,3,'Máster Femenino','F',40,99),
(18,3,'Máster Masculino','M',40,99);
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `deportes`
--

DROP TABLE IF EXISTS `deportes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `deportes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(40) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_deportes_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo de disciplinas deportivas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deportes`
--

LOCK TABLES `deportes` WRITE;
/*!40000 ALTER TABLE `deportes` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `deportes` VALUES
(1,'Aguas abiertas','Natación en lagos, ríos o mar sobre distancias largas'),
(2,'Natación','Pruebas en piscina por estilo y distancia'),
(3,'Acuatlón','Natación seguida de carrera a pie'),
(4,'Triatlón','Natación, ciclismo y carrera a pie de forma continua'),
(5,'Atletismo','Carreras de calle y pista');
/*!40000 ALTER TABLE `deportes` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `inscripciones`
--

DROP TABLE IF EXISTS `inscripciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `inscripciones` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `prueba_id` int(10) unsigned NOT NULL,
  `atleta_id` int(10) unsigned NOT NULL,
  `categoria_id` int(10) unsigned NOT NULL,
  `dorsal` smallint(5) unsigned NOT NULL,
  `estado` enum('PENDIENTE','CONFIRMADA','ANULADA') NOT NULL DEFAULT 'PENDIENTE',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_inscripciones_prueba_atleta` (`prueba_id`,`atleta_id`),
  UNIQUE KEY `uq_inscripciones_prueba_dorsal` (`prueba_id`,`dorsal`),
  KEY `idx_inscripciones_atleta` (`atleta_id`),
  KEY `idx_inscripciones_categoria` (`categoria_id`),
  CONSTRAINT `fk_inscripciones_atleta` FOREIGN KEY (`atleta_id`) REFERENCES `atletas` (`usuario_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_inscripciones_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_inscripciones_prueba` FOREIGN KEY (`prueba_id`) REFERENCES `pruebas` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Inscripción de un atleta a una prueba';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inscripciones`
--

LOCK TABLES `inscripciones` WRITE;
/*!40000 ALTER TABLE `inscripciones` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `inscripciones` VALUES
(1,7,4,13,101,'CONFIRMADA','2026-10-03 10:00:00'),
(2,7,5,14,102,'CONFIRMADA','2026-10-03 10:05:00'),
(3,7,6,15,103,'CONFIRMADA','2026-10-04 11:00:00'),
(4,7,7,16,104,'CONFIRMADA','2026-10-04 11:20:00'),
(5,7,10,17,105,'CONFIRMADA','2026-10-05 09:00:00'),
(6,7,11,18,106,'CONFIRMADA','2026-10-05 09:15:00'),
(7,7,12,13,107,'CONFIRMADA','2026-10-06 18:00:00'),
(8,7,15,14,108,'CONFIRMADA','2026-10-07 19:30:00'),
(9,8,4,13,101,'CONFIRMADA','2026-10-03 10:02:00'),
(10,8,6,15,102,'CONFIRMADA','2026-10-04 11:05:00'),
(11,8,8,15,103,'CONFIRMADA','2026-10-04 15:00:00'),
(12,8,9,16,104,'CONFIRMADA','2026-10-05 08:40:00'),
(13,8,13,16,105,'CONFIRMADA','2026-10-06 12:00:00'),
(14,8,14,17,106,'CONFIRMADA','2026-10-07 07:30:00'),
(15,8,15,14,107,'CONFIRMADA','2026-10-07 19:35:00'),
(16,9,5,14,101,'CONFIRMADA','2026-10-03 10:10:00'),
(17,9,7,16,102,'CONFIRMADA','2026-10-04 11:25:00'),
(18,9,10,17,103,'CONFIRMADA','2026-10-05 09:05:00'),
(19,9,11,18,104,'CONFIRMADA','2026-10-05 09:20:00'),
(20,9,12,13,105,'CONFIRMADA','2026-10-06 18:10:00'),
(21,4,8,9,201,'CONFIRMADA','2026-11-03 08:00:00'),
(22,4,9,10,202,'CONFIRMADA','2026-11-03 08:30:00'),
(23,4,13,10,203,'CONFIRMADA','2026-11-05 20:00:00'),
(24,4,6,9,204,'CONFIRMADA','2026-11-06 07:10:00'),
(25,4,15,10,205,'CONFIRMADA','2026-11-17 14:00:00'),
(26,5,6,9,301,'CONFIRMADA','2026-11-06 07:15:00'),
(27,5,7,10,302,'CONFIRMADA','2026-11-07 21:00:00'),
(28,5,9,10,303,'CONFIRMADA','2026-11-08 06:45:00'),
(29,5,13,10,304,'CONFIRMADA','2026-11-08 20:10:00'),
(30,5,15,10,305,'CONFIRMADA','2026-11-17 14:05:00'),
(31,5,11,12,306,'CONFIRMADA','2026-11-09 06:30:00'),
(32,6,8,9,401,'CONFIRMADA','2026-11-10 09:00:00'),
(33,6,14,11,402,'CONFIRMADA','2026-11-11 10:00:00'),
(34,6,10,11,403,'CONFIRMADA','2026-11-12 17:45:00'),
(35,6,13,10,404,'CONFIRMADA','2026-11-19 22:00:00'),
(36,6,5,8,405,'ANULADA','2026-11-13 16:00:00'),
(37,1,4,1,11,'CONFIRMADA','2026-11-07 18:00:00'),
(38,1,10,5,12,'CONFIRMADA','2026-11-08 17:50:00'),
(39,1,11,6,13,'CONFIRMADA','2026-11-09 06:35:00'),
(40,1,12,1,14,'CONFIRMADA','2026-11-18 19:00:00'),
(41,1,14,5,15,'CONFIRMADA','2026-11-20 08:20:00'),
(42,2,7,4,21,'CONFIRMADA','2026-11-08 21:10:00'),
(43,2,11,6,22,'CONFIRMADA','2026-11-20 06:40:00'),
(44,3,5,2,31,'CONFIRMADA','2026-11-11 16:30:00'),
(45,3,15,4,32,'CONFIRMADA','2026-11-17 14:10:00'),
(46,3,6,3,33,'CONFIRMADA','2026-11-20 07:00:00');
/*!40000 ALTER TABLE `inscripciones` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `pruebas`
--

DROP TABLE IF EXISTS `pruebas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pruebas` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `torneo_id` int(10) unsigned NOT NULL,
  `deporte_id` int(10) unsigned NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `distancia_m` int(10) unsigned NOT NULL,
  `fecha_hora` datetime NOT NULL,
  `cupo` smallint(5) unsigned DEFAULT NULL,
  `estado` enum('PROGRAMADA','EN_CURSO','FINALIZADA','CANCELADA') NOT NULL DEFAULT 'PROGRAMADA',
  PRIMARY KEY (`id`),
  KEY `idx_pruebas_torneo` (`torneo_id`),
  KEY `idx_pruebas_deporte` (`deporte_id`),
  KEY `idx_pruebas_fecha_hora` (`fecha_hora`),
  CONSTRAINT `fk_pruebas_deporte` FOREIGN KEY (`deporte_id`) REFERENCES `deportes` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_pruebas_torneo` FOREIGN KEY (`torneo_id`) REFERENCES `torneos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_pruebas_distancia` CHECK (`distancia_m` > 0)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Pruebas (eventos) de un torneo';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pruebas`
--

LOCK TABLES `pruebas` WRITE;
/*!40000 ALTER TABLE `pruebas` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `pruebas` VALUES
(1,1,1,'Aguas abiertas 1.500 m',1500,'2026-12-14 08:00:00',80,'PROGRAMADA'),
(2,1,1,'Aguas abiertas 5.000 m',5000,'2026-12-14 10:30:00',50,'PROGRAMADA'),
(3,1,3,'Acuatlón sprint (750 m + 5 km)',5750,'2026-12-15 08:00:00',60,'PROGRAMADA'),
(4,2,5,'Atletismo 5 km',5000,'2026-11-24 07:30:00',150,'FINALIZADA'),
(5,2,4,'Triatlón sprint (750 m + 20 km + 5 km)',25750,'2026-11-27 07:00:00',100,'EN_CURSO'),
(6,2,5,'Atletismo 10 km',10000,'2026-11-29 07:30:00',150,'PROGRAMADA'),
(7,3,2,'50 m libre',50,'2026-10-19 09:00:00',40,'FINALIZADA'),
(8,3,2,'100 m libre',100,'2026-10-19 11:00:00',40,'FINALIZADA'),
(9,3,2,'200 m combinado individual',200,'2026-10-20 09:00:00',32,'FINALIZADA'),
(10,4,5,'Media maratón 21 km',21097,'2027-03-16 07:00:00',300,'PROGRAMADA');
/*!40000 ALTER TABLE `pruebas` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `resultados`
--

DROP TABLE IF EXISTS `resultados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `resultados` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `inscripcion_id` int(10) unsigned NOT NULL,
  `tiempo_ms` int(10) unsigned DEFAULT NULL COMMENT 'Tiempo final en milisegundos; NULL si DNF/DNS/DSQ',
  `estado` enum('FINALIZADO','DNF','DNS','DSQ') NOT NULL DEFAULT 'FINALIZADO',
  `registrado_por` int(10) unsigned NOT NULL,
  `registrado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `observaciones` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_resultados_inscripcion` (`inscripcion_id`),
  KEY `idx_resultados_registrado_por` (`registrado_por`),
  CONSTRAINT `fk_resultados_inscripcion` FOREIGN KEY (`inscripcion_id`) REFERENCES `inscripciones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_resultados_juez` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `chk_resultados_tiempo` CHECK (`estado` = 'FINALIZADO' and `tiempo_ms` is not null and `tiempo_ms` > 0 or `estado` <> 'FINALIZADO' and `tiempo_ms` is null)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tiempo final de cada atleta en una prueba';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resultados`
--

LOCK TABLES `resultados` WRITE;
/*!40000 ALTER TABLE `resultados` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `resultados` VALUES
(1,1,29840,'FINALIZADO',2,'2026-10-19 09:20:00',NULL),
(2,2,26120,'FINALIZADO',2,'2026-10-19 09:20:00',NULL),
(3,3,28950,'FINALIZADO',2,'2026-10-19 09:21:00',NULL),
(4,4,25480,'FINALIZADO',2,'2026-10-19 09:21:00',NULL),
(5,5,33700,'FINALIZADO',2,'2026-10-19 09:22:00',NULL),
(6,6,30050,'FINALIZADO',2,'2026-10-19 09:22:00',NULL),
(7,7,30410,'FINALIZADO',2,'2026-10-19 09:23:00',NULL),
(8,8,NULL,'DSQ',2,'2026-10-19 09:23:00','Salida en falso'),
(9,9,65320,'FINALIZADO',3,'2026-10-19 11:30:00',NULL),
(10,10,63870,'FINALIZADO',3,'2026-10-19 11:30:00',NULL),
(11,11,66100,'FINALIZADO',3,'2026-10-19 11:31:00',NULL),
(12,12,57940,'FINALIZADO',3,'2026-10-19 11:31:00',NULL),
(13,13,59210,'FINALIZADO',3,'2026-10-19 11:32:00',NULL),
(14,14,75660,'FINALIZADO',3,'2026-10-19 11:32:00',NULL),
(15,15,58730,'FINALIZADO',3,'2026-10-19 11:33:00',NULL),
(16,16,144550,'FINALIZADO',2,'2026-10-20 09:40:00',NULL),
(17,17,138020,'FINALIZADO',2,'2026-10-20 09:40:00',NULL),
(18,18,178400,'FINALIZADO',2,'2026-10-20 09:41:00',NULL),
(19,19,NULL,'DNF',2,'2026-10-20 09:41:00','Abandonó en el tramo de pecho'),
(20,20,159770,'FINALIZADO',2,'2026-10-20 09:42:00',NULL),
(21,21,1361000,'FINALIZADO',3,'2026-11-24 08:15:00',NULL),
(22,22,1085000,'FINALIZADO',3,'2026-11-24 08:15:00',NULL),
(23,23,1162400,'FINALIZADO',3,'2026-11-24 08:16:00',NULL),
(24,24,1438700,'FINALIZADO',3,'2026-11-24 08:16:00',NULL),
(25,25,NULL,'DNS',3,'2026-11-24 08:17:00','No se presentó a la largada');
/*!40000 ALTER TABLE `resultados` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `torneos`
--

DROP TABLE IF EXISTS `torneos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `torneos` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `sede` varchar(120) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `estado` enum('BORRADOR','ABIERTO','EN_CURSO','FINALIZADO') NOT NULL DEFAULT 'BORRADOR',
  `creado_por` int(10) unsigned NOT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_torneos_fecha_inicio` (`fecha_inicio`),
  KEY `idx_torneos_estado` (`estado`),
  KEY `idx_torneos_creado_por` (`creado_por`),
  CONSTRAINT `fk_torneos_creador` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `chk_torneos_fechas` CHECK (`fecha_inicio` <= `fecha_fin`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Torneos organizados por un administrador';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `torneos`
--

LOCK TABLES `torneos` WRITE;
/*!40000 ALTER TABLE `torneos` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `torneos` VALUES
(1,'Copa Aguas Abiertas Lago Azul 2026','Travesías de 1,5 km y 5 km y acuatlón sprint en el Lago Azul.','Lago Azul, Playa Norte','2026-12-14','2026-12-15','ABIERTO',1,'2026-11-27 21:44:06','2026-11-27 21:44:07'),
(2,'Circuito Costa Triatlón y Atletismo 2026','Semana multideporte en el malecón: 5 km, triatlón sprint y 10 km.','Malecón Costa Azul','2026-11-24','2026-11-29','EN_CURSO',1,'2026-11-27 21:44:06','2026-11-27 21:44:07'),
(3,'Interclubes de Natación Otoño 2026','Torneo de piscina entre clubes, categorías juvenil, adulto y máster.','Complejo Acuático Municipal','2026-10-19','2026-10-20','FINALIZADO',1,'2026-11-27 21:44:06','2026-11-27 21:44:07'),
(4,'Media Maratón Ciudad 2027','Planificación preliminar de la media maratón.','Centro de la ciudad','2027-03-16','2027-03-16','BORRADOR',1,'2026-11-27 21:44:06','2026-11-27 21:44:07');
/*!40000 ALTER TABLE `torneos` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(60) NOT NULL,
  `apellido` varchar(60) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password_hash` char(60) NOT NULL,
  `rol` enum('ADMIN','JUEZ','ATLETA') NOT NULL DEFAULT 'ATLETA',
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_usuarios_email` (`email`),
  KEY `idx_usuarios_rol` (`rol`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cuentas del sistema: administradores, jueces y atletas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `usuarios` VALUES
(1,'Laura','Méndez','admin@podio.local','$2a$10$E9OjedgBnFjih2.UkhbFIOVpXHSTaTNj0EsSuVwSR10zyy7tnk4RO','ADMIN',1,'2026-09-03 09:00:00','2026-11-27 21:44:06'),
(2,'Ricardo','Paredes','juez@podio.local','$2a$10$ptcsMAi3E43i.bFgYfsf8u/PK5gw.m6pH71QMLmu317UwOX6Zz3AG','JUEZ',1,'2026-09-04 10:00:00','2026-11-27 21:44:06'),
(3,'Mariana','Quintero','juez2@podio.local','$2a$10$ptcsMAi3E43i.bFgYfsf8u/PK5gw.m6pH71QMLmu317UwOX6Zz3AG','JUEZ',1,'2026-09-04 10:30:00','2026-11-27 21:44:06'),
(4,'Valentina','Rojas','valentina@podio.local','$2a$10$xb7.x5hXbSjvdkVLph5e1uurRtVtgpaIUZ3t59JqOxKcG7Opz6M06','ATLETA',1,'2026-09-12 18:12:00','2026-11-27 21:44:06'),
(5,'Mateo','Fernández','mateo@podio.local','$2a$10$xb7.x5hXbSjvdkVLph5e1uurRtVtgpaIUZ3t59JqOxKcG7Opz6M06','ATLETA',1,'2026-09-13 19:40:00','2026-11-27 21:44:06'),
(6,'Camila','Torres','camila@podio.local','$2a$10$xb7.x5hXbSjvdkVLph5e1uurRtVtgpaIUZ3t59JqOxKcG7Opz6M06','ATLETA',1,'2026-09-14 07:25:00','2026-11-27 21:44:06'),
(7,'Sebastián','Morales','sebastian@podio.local','$2a$10$xb7.x5hXbSjvdkVLph5e1uurRtVtgpaIUZ3t59JqOxKcG7Opz6M06','ATLETA',1,'2026-09-16 21:05:00','2026-11-27 21:44:06'),
(8,'Isabella','Castro','isabella@podio.local','$2a$10$xb7.x5hXbSjvdkVLph5e1uurRtVtgpaIUZ3t59JqOxKcG7Opz6M06','ATLETA',1,'2026-09-22 12:00:00','2026-11-27 21:44:06'),
(9,'Diego','Ramírez','diego@podio.local','$2a$10$xb7.x5hXbSjvdkVLph5e1uurRtVtgpaIUZ3t59JqOxKcG7Opz6M06','ATLETA',1,'2026-09-24 08:45:00','2026-11-27 21:44:06'),
(10,'Lucía','Herrera','lucia@podio.local','$2a$10$xb7.x5hXbSjvdkVLph5e1uurRtVtgpaIUZ3t59JqOxKcG7Opz6M06','ATLETA',1,'2026-09-27 17:30:00','2026-11-27 21:44:06'),
(11,'Andrés','Navarro','andres@podio.local','$2a$10$xb7.x5hXbSjvdkVLph5e1uurRtVtgpaIUZ3t59JqOxKcG7Opz6M06','ATLETA',1,'2026-10-03 06:50:00','2026-11-27 21:44:06'),
(12,'Sofía','Medina','sofia@podio.local','$2a$10$xb7.x5hXbSjvdkVLph5e1uurRtVtgpaIUZ3t59JqOxKcG7Opz6M06','ATLETA',1,'2026-10-05 16:15:00','2026-11-27 21:44:06'),
(13,'Nicolás','Vargas','nicolas@podio.local','$2a$10$xb7.x5hXbSjvdkVLph5e1uurRtVtgpaIUZ3t59JqOxKcG7Opz6M06','ATLETA',1,'2026-10-22 20:20:00','2026-11-27 21:44:06'),
(14,'Gabriela','Ortiz','gabriela@podio.local','$2a$10$xb7.x5hXbSjvdkVLph5e1uurRtVtgpaIUZ3t59JqOxKcG7Opz6M06','ATLETA',1,'2026-11-04 09:10:00','2026-11-27 21:44:06'),
(15,'Joaquín','Silva','joaquin@podio.local','$2a$10$xb7.x5hXbSjvdkVLph5e1uurRtVtgpaIUZ3t59JqOxKcG7Opz6M06','ATLETA',1,'2026-11-17 13:35:00','2026-11-27 21:44:06');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Temporary table structure for view `vw_clasificacion`
--

DROP TABLE IF EXISTS `vw_clasificacion`;
/*!50001 DROP VIEW IF EXISTS `vw_clasificacion`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `vw_clasificacion` AS SELECT
 1 AS `torneo_id`,
  1 AS `prueba_id`,
  1 AS `categoria_id`,
  1 AS `categoria`,
  1 AS `dorsal`,
  1 AS `atleta_id`,
  1 AS `atleta`,
  1 AS `club`,
  1 AS `estado`,
  1 AS `tiempo_ms`,
  1 AS `posicion` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_clasificacion_general`
--

DROP TABLE IF EXISTS `vw_clasificacion_general`;
/*!50001 DROP VIEW IF EXISTS `vw_clasificacion_general`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `vw_clasificacion_general` AS SELECT
 1 AS `torneo_id`,
  1 AS `prueba_id`,
  1 AS `categoria_id`,
  1 AS `categoria`,
  1 AS `dorsal`,
  1 AS `atleta_id`,
  1 AS `atleta`,
  1 AS `club`,
  1 AS `estado`,
  1 AS `tiempo_ms`,
  1 AS `posicion_general` */;
SET character_set_client = @saved_cs_client;

--
-- Dumping routines for database 'torneos_db'
--

--
-- Current Database: `torneos_db`
--

USE `torneos_db`;

--
-- Final view structure for view `vw_clasificacion`
--

/*!50001 DROP VIEW IF EXISTS `vw_clasificacion`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_uca1400_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`podio`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_clasificacion` AS select `p`.`torneo_id` AS `torneo_id`,`i`.`prueba_id` AS `prueba_id`,`i`.`categoria_id` AS `categoria_id`,`c`.`nombre` AS `categoria`,`i`.`dorsal` AS `dorsal`,`i`.`atleta_id` AS `atleta_id`,concat(`u`.`nombre`,' ',`u`.`apellido`) AS `atleta`,`a`.`club` AS `club`,`r`.`estado` AS `estado`,`r`.`tiempo_ms` AS `tiempo_ms`,case when `r`.`estado` = 'FINALIZADO' then rank() over ( partition by `i`.`prueba_id`,`i`.`categoria_id`,`r`.`estado` order by `r`.`tiempo_ms`) end AS `posicion` from (((((`resultados` `r` join `inscripciones` `i` on(`i`.`id` = `r`.`inscripcion_id`)) join `pruebas` `p` on(`p`.`id` = `i`.`prueba_id`)) join `categorias` `c` on(`c`.`id` = `i`.`categoria_id`)) join `atletas` `a` on(`a`.`usuario_id` = `i`.`atleta_id`)) join `usuarios` `u` on(`u`.`id` = `i`.`atleta_id`)) where `i`.`estado` <> 'ANULADA' */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_clasificacion_general`
--

/*!50001 DROP VIEW IF EXISTS `vw_clasificacion_general`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_uca1400_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`podio`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_clasificacion_general` AS select `p`.`torneo_id` AS `torneo_id`,`i`.`prueba_id` AS `prueba_id`,`i`.`categoria_id` AS `categoria_id`,`c`.`nombre` AS `categoria`,`i`.`dorsal` AS `dorsal`,`i`.`atleta_id` AS `atleta_id`,concat(`u`.`nombre`,' ',`u`.`apellido`) AS `atleta`,`a`.`club` AS `club`,`r`.`estado` AS `estado`,`r`.`tiempo_ms` AS `tiempo_ms`,case when `r`.`estado` = 'FINALIZADO' then rank() over ( partition by `i`.`prueba_id`,`r`.`estado` order by `r`.`tiempo_ms`) end AS `posicion_general` from (((((`resultados` `r` join `inscripciones` `i` on(`i`.`id` = `r`.`inscripcion_id`)) join `pruebas` `p` on(`p`.`id` = `i`.`prueba_id`)) join `categorias` `c` on(`c`.`id` = `i`.`categoria_id`)) join `atletas` `a` on(`a`.`usuario_id` = `i`.`atleta_id`)) join `usuarios` `u` on(`u`.`id` = `i`.`atleta_id`)) where `i`.`estado` <> 'ANULADA' */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed
