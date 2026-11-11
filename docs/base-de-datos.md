# Modelo de datos

MariaDB 11.4. [Esquema SQL](../database/001-schema.sql). La migración inicial crea tablas ausentes. Cambios futuros de columnas necesitan nuevas migraciones explícitas.

| Tabla                 | Claves y relaciones                          | Contenido                                          |
| --------------------- | -------------------------------------------- | -------------------------------------------------- |
| `users`               | PK id, email único                           | Rol, estado, hash de contraseña, perfil y permisos |
| `sessions`            | PK hash de token, FK usuario                 | Expiración                                         |
| `clients`             | PK id, código y NIT únicos                   | Expediente                                         |
| `credits`             | PK id, FK cliente única                      | Capital, saldo en centavos, mora y segmento        |
| `agreements`          | PK id, FK cliente                            | Importe y condiciones                              |
| `installments`        | PK convenio/número, FK convenio              | Fecha e importes de cuota y abonos                 |
| `payments`            | PK id, FK crédito, convenio opcional y autor | Referencia única, fecha e importe                  |
| `activities`          | PK id, FK cliente y usuario                  | Contactos y seguimiento                            |
| `alerts`              | PK id, FK cliente, regla única               | Puntaje y estado                                   |
| `notification_outbox` | PK id, FK alerta única                       | Canal y entrega pendiente                          |
| `audit_log`           | PK id, FK usuario                            | Acción, entidad y fecha                            |

Un cliente tiene un crédito y muchos convenios, gestiones y alertas. Un convenio tiene muchas cuotas y pagos. Una alerta tiene como máximo una acción en la bandeja. Los registros financieros no se eliminan en cascada.

Los pagos bloquean saldos y actualizan pago, crédito, cliente, convenio, cuotas y auditoría en la misma transacción. Un fallo revierte todo; una referencia duplicada devuelve 409. Se aplica al convenio indicado o al activo si se omite. Las cuotas admiten abonos parciales en orden. La última cuota recibe el residuo de centavos. Las fechas mensuales conservan el día de origen o el último día válido del mes.

Las columnas `payload` conservan el contrato de la interfaz (dirección, historial, etiquetas y recomendaciones). Relaciones, credenciales, saldos, cuotas y pagos tienen columnas específicas. Los servicios mantienen ambas representaciones dentro de las transacciones; evitar editar directamente los JSON.

El NIT es obligatorio y único; identificadores CF compartidos requieren un identificador individual antes de importar. Un descuento de convenio no condona automáticamente el saldo restante del crédito.
