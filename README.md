# Consultoría Financiera JME Guatemala

Gestión de cartera en mora con React, TypeScript, Node.js, Express y MariaDB 11.4. Interfaz y API se ejecutan en un proceso: un monolito modular.

## Inicio local

Requisitos: Node.js 22.14 o superior, pnpm y un servidor MariaDB local. DBeaver permite crear y administrar la base.

Seguir la [guía de MariaDB con DBeaver](docs/mariadb-dbeaver.md) para crear la base `jme`, ejecutar el esquema y configurar el usuario de conexión. Docker es opcional.

```powershell
pnpm install
Copy-Item .env.example .env
```

Completar `DB_PASSWORD` y `SEED_ADMIN_PASSWORD` (mínimo 12 caracteres) en `.env`. Si el archivo ya existe, editarlo sin sobrescribirlo.

```powershell
pnpm db:seed
pnpm dev
```

Abrir http://localhost:3000. Usuario: `jlopez@jme.com.gt`; contraseña: la configurada. Para un MariaDB existente, omitir Docker y configurar las variables `DB_*`.

Como alternativa a crear las tablas en DBeaver, `pnpm db:migrate` ejecuta el esquema en una base existente con permisos de creación. Para usar Docker, configurar también `DB_ROOT_PASSWORD` y ejecutar `docker compose up -d --wait` antes de migrar. El contenedor MariaDB usa un volumen distinto al anterior de MySQL; no convierte volúmenes existentes.

Clientes ficticios opcionales: `pnpm db:seed --demo`. La carga es idempotente, conserva cuentas existentes y no crea pagos ficticios.

## Verificación

```powershell
pnpm lint
pnpm test
pnpm build
```

Las pruebas ordinarias cubren calendarios, centavos, puntajes, contraseñas, permisos y rechazos HTTP. La prueba MariaDB requiere una **base exclusiva de pruebas**, migrada y con administrador inicial:

```powershell
$env:RUN_DB_TESTS = '1'
pnpm test
$env:RUN_DB_TESTS = '0'
```

Comprueba cliente, convenio, pago, duplicados, sobrepago y persistencia. Elimina sus registros de cartera; conserva su auditoría.

## Producción

```powershell
pnpm build
pnpm start
```

Express entrega `/api` y React compilado. Este arranque requiere `tsx`: instalar también las dependencias de desarrollo. Configurar HTTPS en el proxy inverso y respaldos de MariaDB. `pnpm dev:frontend` sirve solo la interfaz; los flujos reales requieren `pnpm dev`.

## Documentación

- [Desplegar en Vercel y Hostinger](docs/despliegue-vercel-hostinger.md)
- [Arquitectura y anteproyecto](docs/arquitectura.md)
- [Modelo de datos](docs/base-de-datos.md)
- [Servicios HTTP](docs/api.md)
- [Esquema SQL](database/001-schema.sql)
- [Crear MariaDB desde DBeaver](docs/mariadb-dbeaver.md)

## Alcance y límites

Clientes con una cuenta de crédito por cliente, convenios y cuotas, pagos parciales, gestiones, usuarios y permisos, activación de cuentas, reportes, CSV e impresión PDF. Importes operativos en centavos y operaciones financieras con transacciones y bloqueos.

Alertas periódicas o bajo demanda basadas en saldo y días de mora. Sus puntajes **no son probabilidades estadísticas** ni un modelo entrenado. Canal y horario son recomendaciones operativas. Las acciones quedan pendientes: falta integrar proveedor de mensajería y proceso de entrega. No se registran envíos ni promesas ficticias.

No se integran bancos, pagos en línea, firma ni almacenamiento documental. Un descuento no condona automáticamente el remanente del crédito. Los días de mora son datos del expediente; el motor no reconstruye el calendario original del préstamo.
