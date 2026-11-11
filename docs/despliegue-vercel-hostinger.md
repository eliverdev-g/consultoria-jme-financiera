# Frontend en Vercel y API/base de datos en Hostinger

Arquitectura: navegador → frontend React en Vercel → API Express por HTTPS en Hostinger → MariaDB en Hostinger. Solo el backend utiliza las credenciales de la base de datos.

## Elegir el entorno de Hostinger

La aplicación utiliza Node.js (22.14 o superior), MariaDB 11.4 y tareas periódicas dentro del proceso. Un VPS permite conservar esta configuración e instalar MariaDB. Requiere administrar actualizaciones, proxy HTTPS, reinicio del proceso y respaldos.

Hostinger también ofrece aplicaciones Node.js en planes compatibles. Antes de usar esta opción, confirmar en hPanel el soporte del plan, la versión y el motor de base de datos, el comando de arranque, el acceso para ejecutar migraciones y el comportamiento de procesos/tareas periódicas. No asumir que el servicio MySQL administrado es idéntico a MariaDB 11.4: validar el esquema y las operaciones en una base de prueba.

## 1. Base de datos en Hostinger

Crear una base vacía y un usuario exclusivo. En VPS se puede instalar MariaDB 11.4 y seguir `docs/mariadb-dbeaver.md`, o usar el servicio `db` de `docker-compose.yml` (requiere Docker y contraseñas en `.env`). El volumen conserva los datos; no ejecutar `docker compose down -v`. El puerto publicado se limita a `127.0.0.1`.

Configurar en el backend, con los valores reales del servidor:

```dotenv
NODE_ENV=production
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=jme
DB_USER=jme
DB_PASSWORD=REEMPLAZAR
SEED_ADMIN_PASSWORD=REEMPLAZAR_CON_12_O_MAS_CARACTERES
CORS_ORIGINS=https://TU-FRONTEND.vercel.app
PREDICTION_INTERVAL_MINUTES=60
```

`DB_HOST` debe ser el host asignado por el proveedor si no es una base local. Si Express corre dentro de otro contenedor de la misma red de Docker, el host es el nombre del servicio, no `127.0.0.1`.

Desde la raíz del repositorio, con la base ya creada:

```sh
pnpm install --frozen-lockfile --prod=false
pnpm db:migrate
pnpm db:seed
```

Esto crea el esquema y el administrador `jlopez@jme.com.gt`. No usar `--demo` en producción. Quitar `SEED_ADMIN_PASSWORD` después de inicializar. Si se necesitan los registros locales existentes, respaldar y restaurar esa base antes de abrir el sistema a usuarios; crear el esquema no transfiere datos. No ejecutar restauraciones sobre una base con datos sin revisar su contenido y disponer de respaldo.

## 2. Backend en Hostinger

Subir el repositorio incluyendo `server`, `src/data` (utilizado por el seed), `database`, `package.json` y `pnpm-lock.yaml`. Conservar las variables únicamente en el servidor o panel. El arranque actual utiliza `tsx`, por lo que la instalación debe incluir dependencias de desarrollo.

```sh
pnpm start:api
```

Este comando sirve solo la API, sin iniciar Vite ni requerir `dist`. En VPS configurar systemd o un supervisor para arrancar al reiniciar y recuperar fallos. Publicar mediante proxy inverso con HTTPS, por ejemplo en `https://api.TU-DOMINIO.com`. Mantener el puerto de Express accesible solo al proxy y la base accesible solo al backend. No publicar 3306 a Internet; para administrar con DBeaver usar un túnel SSH.

Comprobar `GET https://api.TU-DOMINIO.com/api/health`: debe responder `{"status":"ok"}`; también verifica la conexión con la base. Ejecutar una sola instancia del backend mientras las alertas dependan del temporizador interno; varias instancias repetirían el trabajo periódico.

## 3. Frontend en Vercel

Importar el repositorio con la raíz actual. `vercel.json` configura Vite, `pnpm build`, salida `dist` y la reescritura para abrir directamente las rutas de React.

Configurar en las variables de Vercel:

```dotenv
VITE_API_URL=https://api.TU-DOMINIO.com/api
```

Es una URL pública compilada en el frontend. Nunca agregar contraseñas o variables `DB_*` a variables `VITE_*`. Si cambia la URL, volver a desplegar para recompilar.

Tras conocer la URL definitiva de Vercel, actualizar `CORS_ORIGINS` en Hostinger y reiniciar el backend. Usar orígenes exactos sin `/` final; separar por comas si se utiliza además un dominio propio. Las URLs de preview solo funcionarán si se autorizan expresamente sus orígenes. La sesión actual usa un token Bearer y no requiere cookies entre dominios.

## 4. Verificación y operación

Validar inicio y cierre de sesión, permisos, consulta de cartera, un flujo de convenio/pago en entorno de prueba y recarga directa de rutas internas. Verificar persistencia después de reiniciar el backend. Configurar respaldos automáticos de la base fuera del servidor y probar una restauración. Mantener las credenciales locales y de producción separadas.

Referencias oficiales:

- https://vercel.com/docs/frameworks/frontend/vite
- https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/
- https://www.hostinger.com/support/which-databases-and-data-tools-are-supported-at-hostinger/
