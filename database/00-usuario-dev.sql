-- =====================================================================
--  Usuario de desarrollo para la aplicación (ejecutar UNA sola vez)
--
--    mysql -u root -p -e "source database/00-usuario-dev.sql"
--
--  Crea el usuario `podio` con permisos solo sobre las bases
--  torneos_db (desarrollo) y torneos_test (pruebas automáticas).
--  Contraseña solo para entorno local; NO usar en producción.
-- =====================================================================

CREATE USER IF NOT EXISTS 'podio'@'localhost' IDENTIFIED BY 'podio_dev_2026';
GRANT ALL PRIVILEGES ON `torneos\_db`.*   TO 'podio'@'localhost';
GRANT ALL PRIVILEGES ON `torneos\_test`.* TO 'podio'@'localhost';
FLUSH PRIVILEGES;
