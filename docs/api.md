# Servicios HTTP

Base `/api`. Excepto salud e ingreso, enviar `Authorization: Bearer <token>`. Los errores contienen `{ "message": "..." }`: 400 validación, 401 sin sesión, 403 sin permiso, 404 ausente y 409 conflicto.

| Método     | Ruta                     | Operación                                    |
| ---------- | ------------------------ | -------------------------------------------- |
| GET        | `/health`                | Verifica MariaDB                             |
| POST       | `/auth/login`            | Email y contraseña; devuelve usuario y token |
| GET        | `/auth/me`               | Sesión actual                                |
| POST       | `/auth/logout`           | Revoca token                                 |
| GET        | `/bootstrap`             | Información inicial según permisos           |
| GET / POST | `/clients`               | Consultar / crear cliente y cuenta inicial   |
| PATCH      | `/clients/:id`           | Actualizar expediente                        |
| GET        | `/credits`               | Consultar créditos y saldos                  |
| GET        | `/credits/:id/statement` | Estado de cuenta con pagos y convenios       |
| GET / POST | `/agreements`            | Consultar / crear convenio y cuotas          |
| GET / POST | `/activities`            | Consultar / registrar gestión                |
| GET / POST | `/users`                 | Consultar / crear cuentas                    |
| PATCH      | `/users/:id/permissions` | Cambiar permisos                             |
| PATCH      | `/users/:id/status`      | Activar/desactivar                           |
| GET / POST | `/payments`              | Consultar / registrar pagos                  |
| GET        | `/reports`               | Indicadores y pagos con fecha                |
| GET        | `/alerts`                | Consultar alertas                            |
| POST       | `/alerts/run`            | Evaluar reglas                               |
| POST       | `/alerts/:id/resolve`    | Resolver alerta                              |
| POST       | `/alerts/:id/queue`      | Registrar entrega pendiente                  |

Crear cuentas y cambiar permisos/estado requiere administrador. No puede desactivar su propia cuenta. Los módulos verifican sus permisos de lectura, creación o edición. No se exponen eliminaciones financieras. Crear pagos requiere editar Gestión de clientes.

## Convenio

```json
{
  "clientId": "id-del-cliente",
  "agreedAmount": 1000,
  "installmentsCount": 3,
  "frequency": "Mensual",
  "startDate": "2026-10-31",
  "responsibleManager": "Juan López",
  "observations": "Convenio autorizado"
}
```

## Pago

```json
{
  "clientId": "id-del-cliente",
  "amount": 333.33,
  "reference": "BANCO-20261031-0001"
}
```

`agreementId` es opcional. La referencia única evita duplicar el abono. Los hashes de contraseña nunca forman parte del usuario retornado.

El límite de ingreso es de diez fallos por IP en quince minutos, mantenido en memoria del proceso. Configurar el tratamiento del proxy según el despliegue.
