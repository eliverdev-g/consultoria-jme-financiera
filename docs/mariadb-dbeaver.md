# Crear la base local con MariaDB y DBeaver

DBeaver es el cliente de administración. El servidor MariaDB debe estar instalado y su servicio iniciado en Windows. No se necesita Docker para este flujo. El proyecto se configura para MariaDB 11.4; el esquema usa InnoDB, UTF-8 y funciones JSON compatibles.

## 1. Conectar DBeaver

Crear una conexión nueva y elegir **MariaDB**:

| Campo         | Valor                                    |
| ------------- | ---------------------------------------- |
| Host          | `127.0.0.1`                              |
| Puerto        | `3306` o el definido al instalar MariaDB |
| Base de datos | Dejar vacía inicialmente                 |
| Usuario       | `root` u otro administrador local        |
| Contraseña    | La definida al instalar MariaDB          |

Pulsar **Probar conexión**, descargar el controlador si DBeaver lo solicita y guardar. Si falla, comprobar el servicio MariaDB y el puerto; instalar DBeaver no instala el servidor.

## 2. Crear la base y sus tablas

Abrir un editor SQL asociado a la conexión. Ejecutar [000-create-database.sql](../database/000-create-database.sql) completo con **Alt+X** (Ejecutar script SQL).

Actualizar el navegador de bases de datos, seleccionar **jme** como base activa y abrir [001-schema.sql](../database/001-schema.sql) en esa misma conexión. Ejecutar todo con **Alt+X**. No es necesario ejecutar después `pnpm db:migrate`: es una alternativa a crear las tablas manualmente.

Verificar:

```sql
USE jme;
SELECT VERSION() AS version_servidor, DATABASE() AS base_actual;
SHOW TABLES;
```

Se crean 11 tablas: users, sessions, clients, credits, agreements, installments, payments, activities, alerts, notification_outbox y audit_log.

## 3. Crear un usuario para la aplicación

En DBeaver, conectado como administrador, ejecutar este ejemplo **después de reemplazar la contraseña**:

```sql
CREATE USER IF NOT EXISTS 'jme'@'127.0.0.1'
  IDENTIFIED BY 'REEMPLAZAR_POR_UNA_CLAVE_PROPIA';
GRANT SELECT, INSERT, UPDATE, DELETE ON jme.* TO 'jme'@'127.0.0.1';
```

Si el usuario ya existe, `IF NOT EXISTS` conserva su contraseña actual. No requiere `FLUSH PRIVILEGES`. Este usuario puede ejecutar la aplicación y la carga inicial; para futuras migraciones DDL, usar la conexión administradora de DBeaver.

## 4. Configurar e iniciar Node.js

Copiar `.env.example` a `.env` si aún no existe. Si ya existe, editarlo sin sobrescribir su configuración:

```dotenv
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=jme
DB_USER=jme
DB_PASSWORD=la_misma_clave_del_usuario_de_MariaDB
SEED_ADMIN_PASSWORD=una_clave_inicial_de_al_menos_12_caracteres
```

`DB_PASSWORD` conecta Node.js con MariaDB. `SEED_ADMIN_PASSWORD` crea la cuenta administradora de la aplicación; son credenciales distintas. `DB_ROOT_PASSWORD` solo se usa con Docker y no es necesario para la instalación local.

Desde la carpeta del proyecto:

```powershell
pnpm install
pnpm db:seed
pnpm dev
```

Ingresar en http://localhost:3000 con `jlopez@jme.com.gt` y la contraseña inicial configurada. La carga inicial no cambia la contraseña de un administrador existente. Opcionalmente, cargar clientes ficticios con `pnpm db:seed --demo`.

Si el puerto 3000 está ocupado, detener el servidor anterior o configurar `PORT=3001` en `.env` antes de arrancar.

## Referencias

- [Ejecución de scripts en DBeaver](https://dbeaver.com/docs/dbeaver/SQL-Execution/).
- [JSON en MariaDB](https://mariadb.com/docs/server/reference/data-types/string-data-types/json): puede mostrarse como LONGTEXT en DBeaver porque es un alias validado; es el comportamiento esperado.
