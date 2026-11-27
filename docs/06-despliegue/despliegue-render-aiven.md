# Publicar Podio en internet (Render + Aiven)

La app queda en **una sola URL** (por ejemplo `https://podio-xxxx.onrender.com`). Desde ella se sirven la página, la API y las actualizaciones en vivo.

| Pieza | Dónde | Plan |
|---|---|---|
| App + API + Socket.IO | [Render](https://render.com), un servicio web | Gratis |
| Base de datos MySQL 8 | [Aiven](https://aiven.io), MySQL | Gratis |

> **Tiempo estimado:** 30 a 40 minutos la primera vez.
> **Necesitas:** cuenta de GitHub con el repositorio subido, y cuentas en Aiven y Render (las dos se crean con la cuenta de GitHub).

---

## Paso 1 · Crear la base de datos en Aiven

1. Entra a <https://console.aiven.io> e inicia sesión con GitHub.
2. **Create service** → elige **MySQL** → plan **Free** → cualquier región cercana → **Create service**.
3. Espera a que el estado diga **Running**, entre 2 y 5 minutos.
4. En la pestaña **Overview**, sección *Connection information*, anota estos datos:
   - **Host** (algo como `mysql-xxxx.aivencloud.com`)
   - **Port** (un número como `12345`)
   - **User**: `avnadmin`
   - **Password**: botón del ojo para verla.
5. En la misma sección, **CA certificate** → **Download**. Se descarga `ca.pem`; guárdalo en la carpeta `server/` del proyecto. No se sube a GitHub, porque `*.pem` queda fuera por el `.gitignore`.

📸 *Captura sugerida para el informe: la pantalla Overview con el servicio en Running (tapa la contraseña).*

## Paso 2 · Cargar las tablas y los datos de demostración

Esto se hace **una vez** desde tu computadora y crea la base `torneos_db` en Aiven con los datos de ejemplo.

1. En la carpeta `server/` crea el archivo **`.env.produccion`**. Ya está excluido en `.gitignore`, así que no se sube. Contenido:

   ```ini
   NODE_ENV=production
   DB_HOST=mysql-xxxx.aivencloud.com
   DB_PORT=12345
   DB_USER=avnadmin
   DB_PASSWORD=la-contraseña-de-aiven
   DB_NAME=torneos_db
   DB_SSL=true
   JWT_SECRET=cualquier-texto-largo-solo-para-este-paso
   ```

2. Agrega el certificado en una sola línea. En **PowerShell**, dentro de `server/`:

   ```powershell
   $ca = (Get-Content .\ca.pem -Raw).Trim() -replace "`r?`n", '\n'
   Add-Content -Path .\.env.produccion -Value "DB_SSL_CA=$ca" -Encoding utf8
   ```

3. Carga la base, también en PowerShell y dentro de `server/`:

   ```powershell
   $env:ENV_FILE = '.env.produccion'; npm.cmd run db:reset; Remove-Item Env:ENV_FILE
   ```

   Debe decir: `Base de datos "torneos_db" recreada con datos de prueba.`

4. **Guarda el valor de `DB_SSL_CA`.** Copia todo el texto después de `DB_SSL_CA=` en `.env.produccion`; lo vas a pegar en Render.

> Para dejar la demo como nueva antes de presentar, repite el punto 3. Borra todo lo creado y vuelve a cargar los datos de ejemplo con fechas relativas al día de hoy, así siempre hay un torneo **en curso**.

## Paso 3 · Subir el código a GitHub

Si el repositorio todavía no está en GitHub:

1. En GitHub: **New repository**, nombre `podio`, **sin** README.
2. En VS Code: **Source Control** → **Publish Branch** → elige el repositorio, o sigue las instrucciones que muestra GitHub para "push an existing repository".

Verifica en GitHub que **no** aparezcan `server/.env`, `server/.env.produccion` ni `server/ca.pem`.

## Paso 4 · Crear el servicio en Render

1. Entra a <https://dashboard.render.com> con GitHub y autoriza el acceso al repositorio `podio`.
2. **New +** → **Blueprint** → elige el repositorio. Render lee el archivo `render.yaml` y propone el servicio **podio**.
3. Completa las variables que pide:

   | Variable | Valor |
   |---|---|
   | `DB_HOST` | host de Aiven |
   | `DB_PORT` | puerto de Aiven |
   | `DB_USER` | `avnadmin` |
   | `DB_PASSWORD` | contraseña de Aiven |
   | `DB_SSL_CA` | el texto largo del paso 2.4 (empieza con `-----BEGIN CERTIFICATE-----\n`) |

   `JWT_SECRET` lo genera Render solo. `NODE_ENV`, `DB_NAME` y `DB_SSL` ya vienen del `render.yaml`.
4. **Apply**. El primer despliegue tarda entre 5 y 10 minutos: instala dependencias, compila la app React y arranca el servidor. Puedes seguirlo en **Logs**. Al final debe aparecer `API de Podio lista` y el estado **Live**.

📸 *Captura sugerida: el servicio en estado Live con su URL.*

## Paso 5 · Comprobar que funciona

Con la URL de Render (`https://podio-xxxx.onrender.com`):

1. `https://podio-xxxx.onrender.com/api/health` debe mostrar `{"status":"ok","db":"ok"}`.
2. Abre la URL principal e inicia sesión con cada rol:

   | Rol | Correo | Contraseña |
   |---|---|---|
   | Administrador | `admin@podio.local` | `Admin123!` |
   | Juez | `juez@podio.local` | `Juez123!` |
   | Atleta | `valentina@podio.local` | `Atleta123!` |

3. Abre la misma URL en el teléfono:
   - **Instalar:** en Chrome, menú → «Instalar aplicación»; en Safari, «Compartir» → «Agregar a inicio».
   - **Tiempos en vivo:** registra un tiempo como juez en una ventana y mira cómo se actualiza `/resultados/5` en otra.
4. La documentación de la API queda en `https://podio-xxxx.onrender.com/api/docs`.

## Antes de la presentación

- **Abre la URL 1 o 2 minutos antes.** En el plan gratis, Render apaga el servicio tras 15 minutos sin visitas y la primera carga tarda entre 30 y 60 segundos en despertar.
- Si quieres los datos limpios, repite el **Paso 2.3**.

## Problemas comunes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `/api/health` responde `db: error` o 503 | Datos de conexión mal copiados | Revisa `DB_HOST`, `DB_PORT` y `DB_PASSWORD` en Render → **Environment** y luego **Manual Deploy** |
| En los logs: `self-signed certificate` o `unable to verify` | `DB_SSL_CA` incompleto | Vuelve a copiar el texto completo del paso 2.4, que incluye `-----BEGIN` y `-----END CERTIFICATE-----` |
| `ER_ACCESS_DENIED_ERROR` | Contraseña de Aiven equivocada | Cópiala de nuevo desde Aiven, botón del ojo |
| `Unknown database 'torneos_db'` | No se hizo el Paso 2 | Ejecuta el Paso 2.3 |
| `sql_require_primary_key` | Aiven exige clave primaria en todas las tablas | Ya está cumplido en `database/schema.sql`. Si aparece, revisa que se usó ese archivo |
| La página tarda casi un minuto en abrir | El servicio gratis estaba dormido | Normal: espera y recarga. Ábrela antes de la demo |
| El build falla con `npm ci` | `package-lock.json` desactualizado | Corre `npm.cmd install` en `server` y `client`, haz commit de los `package-lock.json` y vuelve a desplegar |
| No llegan los tiempos en vivo | Navegador o red que bloquea WebSocket | La app usa *polling* como respaldo. Recarga la página; el resultado igual se guarda |

## Cómo se arma la URL única

- `render.yaml` compila la app React (`client/dist`) y arranca `server/src/server.js`.
- En producción (`NODE_ENV=production`) Express sirve la API en `/api`, Socket.IO en `/socket.io` y la app React en todas las demás rutas. Por eso no hace falta configurar CORS ni otra URL para el frontend.
- La conexión a MySQL usa SSL con el certificado de Aiven (`DB_SSL=true`, `DB_SSL_CA`).
- `helmet` agrega las cabeceras de seguridad y fuerza HTTPS para los recursos. El límite de intentos de inicio de sesión cuenta las IP reales gracias a `trust proxy`.
