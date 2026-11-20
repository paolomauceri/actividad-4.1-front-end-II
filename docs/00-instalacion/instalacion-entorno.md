# Guía de instalación del entorno de desarrollo (Windows 11)

Esta guía deja listo un computador con Windows 11 para desarrollar y ejecutar **Podio**.

| Herramienta | Versión recomendada | Para qué se usa |
|---|---|---|
| Node.js | LTS (22.x o superior) | Ejecutar Vite (frontend) y Express (backend) |
| MySQL Community Server | 8.4 LTS (o MariaDB 11.8 LTS, ver 2.1) | Base de datos |
| MySQL Workbench | 8.0.x (o HeidiSQL, incluido con MariaDB) | Diseñar y visualizar la base de datos (diagrama EER) |
| Git | Última | Control de versiones |
| Visual Studio Code | Última | Editor de código |

---

## 1. Node.js

1. Entra a **https://nodejs.org** y descarga el instalador **LTS** para Windows (`.msi`).
2. Ejecuta el instalador con las opciones por defecto (deja marcado *Add to PATH*).
3. **Cierra y vuelve a abrir** la terminal (o VS Code) para que tome el nuevo PATH.
4. Verifica:
   ```bash
   node -v
   npm -v
   ```
   Deben mostrar un número de versión (por ejemplo `v22.x.x` y `10.x.x`).

## 2. MySQL Community Server 8.4

1. Entra a **https://dev.mysql.com/downloads/mysql/**, elige *Microsoft Windows* y descarga el **MSI Installer** de la versión **8.4 LTS**.
2. Ejecuta el instalador → tipo **Typical**.
3. Al terminar se abre **MySQL Configurator**:
   - *Type and Networking*: Development Computer, puerto **3306**.
   - *Accounts and Roles*: define la contraseña de **root** (anótala, la usarás en `server/.env`).
   - *Windows Service*: deja marcado **Start the MySQL Server at System Startup**.
   - Aplica la configuración (*Execute*).
4. (Opcional, para usar `mysql` en la terminal) agrega al PATH la carpeta
   `C:\Program Files\MySQL\MySQL Server 8.4\bin`:
   *Inicio → "Editar las variables de entorno del sistema" → Variables de entorno → Path → Nuevo*.
5. Verifica (en una terminal nueva):
   ```bash
   mysql --version
   mysql -u root -p -e "SELECT VERSION();"
   ```

### 2.1 Alternativa si Oracle bloquea la descarga (error 403): MariaDB

En algunos países el sitio de Oracle responde **"403 Oracle Export Error"** y no permite descargar MySQL ni Workbench (restricción de exportación de EE. UU.). En ese caso se usa **MariaDB**, motor creado por los autores originales de MySQL y compatible con él: el mismo SQL, el mismo puerto (3306) y el mismo driver (`mysql2`). Los scripts del proyecto (`database/*.sql`) están escritos en SQL de MySQL estándar y funcionan en ambos.

En una terminal (PowerShell):

```powershell
winget install --id MariaDB.Server -e --version 11.8.2.0 --interactive
```

- En el asistente define la contraseña de **root**, deja marcado **Install as service** y el puerto **3306**.
- El instalador incluye **HeidiSQL**, un cliente gráfico para ver y administrar la base de datos.
- Agrega `C:\Program Files\MariaDB 11.8\bin` al PATH (igual que el paso 4 anterior) para usar `mysql` en la terminal.
- Verifica: `mysql --version` → `... 11.8.2-MariaDB ...`.

> En este proyecto, el equipo de desarrollo usó **MariaDB 11.8 LTS** por este bloqueo regional. El diagrama entidad-relación se entrega en Draw.io (`docs/03-base-de-datos/diagrama-er.drawio`) y el script puede abrirse en MySQL Workbench en cualquier equipo donde esté disponible.

## 3. MySQL Workbench

1. Descarga desde **https://dev.mysql.com/downloads/workbench/** el instalador para Windows.
2. Instálalo con las opciones por defecto.
3. Ábrelo y crea la conexión *Local instance 3306* con el usuario `root`.
   Si aparece un aviso de “versión de servidor no soportada”, presiona **Continue Anyway**: funciona sin problemas con MySQL 8.4.

## 4. Git y Visual Studio Code

- Git: **https://git-scm.com/download/win** (opciones por defecto). Verifica con `git --version`.
- VS Code: **https://code.visualstudio.com**. Extensiones recomendadas: *ES7+ React snippets*, *ESLint*, *Draw.io Integration*, *OpenAPI (Swagger) Editor*.

## 5. Aviso importante: OneDrive

Si el proyecto está dentro de una carpeta sincronizada por **OneDrive** (por ejemplo `Escritorio`), la carpeta `node_modules` (miles de archivos) puede volver lenta la instalación o causar errores de “archivo en uso”. Soluciones:

- Pausar la sincronización de OneDrive mientras trabajas (*icono de OneDrive → Configuración → Pausar sincronización*), **o**
- Mover el proyecto a una carpeta fuera de OneDrive, por ejemplo `C:\proyectos\podio`.

## 6. Clonar / preparar el proyecto

```bash
# dentro de la carpeta del proyecto
npm run install:all          # instala dependencias de raíz, server y client
copy server\.env.example server\.env   # luego edita DB_PASSWORD con tu clave de root
npm run db:reset             # crea la base de datos torneos_db con datos de prueba
npm run dev                  # levanta API (3000) y web (5173)
```

> Los comandos del paso 6 funcionan a medida que se construyen el backend y el frontend; el manual técnico contiene la versión final.

## Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `node no se reconoce como comando` | Terminal abierta antes de instalar | Cierra y abre la terminal / VS Code |
| `npm.ps1 no se puede cargar ... la ejecución de scripts está deshabilitada` | Política de ejecución de PowerShell | Ejecutar una vez `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` (o usar `npm.cmd` en lugar de `npm`) |
| `El operador '<' está reservado para uso futuro` | PowerShell no acepta `<` | Usar `mysql -u root -p -e "source archivo.sql"` |
| `403 Oracle Export Error` al descargar | Bloqueo regional de Oracle | Usar MariaDB (sección 2.1) |
| `ECONNREFUSED 127.0.0.1:3306` | El servicio de base de datos está detenido | *Servicios de Windows → MySQL84 (o MariaDB) → Iniciar* |
| `ER_ACCESS_DENIED_ERROR` | Contraseña de root incorrecta en `.env` | Revisa `DB_PASSWORD` en `server/.env` |
| Puerto 3306 ocupado | Otro MySQL/XAMPP corriendo | Detén el otro servicio o cambia el puerto |
| `EPERM` / `EBUSY` al instalar | OneDrive bloqueando archivos | Ver sección 5 |
