# Arquitectura y relación con los documentos

Fuentes: las tres páginas de imágenes de **prototipo consultoria JME.pdf** y el contenido de **EliverGalicia_Cap123.docx**. El prototipo define reportes, usuarios, clientes, convenios y seguimiento. El anteproyecto exige centralizar cartera, pagos, saldos y gestiones con trazabilidad.

El capítulo 3 propone Node.js, TypeScript, Express y MySQL; menciona Vue y TypeORM como herramientas propuestas. Por la preferencia del proyecto se utiliza MariaDB local y administración con DBeaver. Se conserva React por la implementación existente y `mysql2` como cliente del protocolo compatible, con consultas parametrizadas en lugar del ORM opcional.

| Carpeta                      | Responsabilidad                         |
| ---------------------------- | --------------------------------------- |
| `src/pages`                  | Pantallas, filtros y formularios        |
| `src/context`                | Sesión y datos obtenidos de la API      |
| `src/services`               | Cliente HTTP                            |
| `server/modules/auth`        | Credenciales y sesiones                 |
| `server/modules/users`       | Cuentas, permisos y activación          |
| `server/modules/clients`     | Expedientes y cuenta inicial de crédito |
| `server/modules/credits`     | Créditos y estados de cuenta            |
| `server/modules/agreements`  | Convenios y cuotas                      |
| `server/modules/payments`    | Abonos transaccionales                  |
| `server/modules/collections` | Gestiones e historial                   |
| `server/modules/predictions` | Reglas, alertas y bandeja de salida     |
| `server/modules/reports`     | Indicadores persistidos                 |
| `server/shared`              | Conexión, transacciones y seguridad     |
| `server/database`            | Migración y carga inicial               |
| `server/tests`               | Dominio, HTTP y MariaDB                 |

Los módulos comparten proceso y base de datos. Vite actúa como middleware durante desarrollo; Express entrega React compilado en producción.

| Necesidad             | Implementación                                                                |
| --------------------- | ----------------------------------------------------------------------------- |
| Centralizar cartera   | Clientes y créditos en MariaDB                                                |
| Pagos y saldos        | Referencias únicas y actualización transaccional de crédito, cliente y cuotas |
| Seguimiento           | Autor autenticado e historial del cliente                                     |
| Convenios             | Calendario mensual, semanal o quincenal y distribución exacta de centavos     |
| Control de acceso     | scrypt, sesiones con expiración y permisos en servidor                        |
| Activación de cuentas | Cambio de estado y revocación de sesiones                                     |
| Reportes              | Estado, segmento, mora y pagos por mes; filtros, CSV e impresión PDF          |
| Trazabilidad          | Auditoría de autor, acción, entidad y fecha                                   |
| Alertas               | Reglas explicables y lote periódico/manual deduplicado por cliente/día        |

El servidor determina al autor de las gestiones y consulta estado y permisos actuales en cada solicitud. Los tokens aleatorios vencen en ocho horas; se guarda su hash en MariaDB y el token en `sessionStorage`. Se eliminó el ingreso automático y la selección de roles sin contraseña.

Los datos demo se cargan explícitamente. Un fallo de conexión no sustituye datos por ejemplos y los formularios esperan la respuesta del servidor antes de confirmar el guardado.

La versión maneja una cuenta consolidada por cliente con restricción única. Varios contratos independientes requieren selección de contrato en pagos y reportes. Datos de presentación permanecen en JSON; relaciones e importes financieros tienen columnas propias.

El motor inicial no es aprendizaje automático. Una alerta en proceso indica una acción registrada en la bandeja, no un mensaje entregado. Entrega externa y entrenamiento con históricos son integraciones pendientes.
