import { Router } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { rows, decode, transaction } from "../../shared/db";
import { hashPassword } from "../../shared/security";
import { route, permit, HttpError, audit } from "../../shared/http";
export const usersRouter = Router();
const permissions = z
  .array(
    z.object({
      module: z.enum([
        "Dashboard",
        "Gestión de clientes",
        "Convenios de pago",
        "Reportes de cartera vencida",
        "Seguimiento de gestores de cobro",
        "Usuarios y permisos",
      ]),
      view: z.boolean(),
      create: z.boolean(),
      edit: z.boolean(),
      delete: z.boolean(),
    }),
  )
  .max(6);
usersRouter.get(
  "/",
  permit("Usuarios y permisos"),
  route(async (req, res) =>
    res.json((await rows("SELECT payload FROM users")).map(decode)),
  ),
);
usersRouter.post(
  "/",
  permit("Usuarios y permisos", "create"),
  route(async (req, res) => {
    const { password, ...b } = z
      .object({
        username: z.string().min(3),
        name: z.string().min(2),
        email: z.email(),
        role: z.enum([
          "Administrador",
          "Gestor de Cobro",
          "Supervisor",
          "Consultor",
          "Consulta",
        ]),
        status: z.enum(["Activo", "Inactivo"]),
        permissions,
        password: z.string().min(12).max(128),
      })
      .parse(req.body);
    if (res.locals.user.role !== "Administrador")
      throw new HttpError(403, "Solo un administrador puede crear usuarios");
    const id = randomUUID();
    const value = { ...b, id, lastAccess: "Nunca" };
    await transaction(async (c) => {
      await c.execute(
        "INSERT INTO users(id,email,password_hash,role,status,payload) VALUES(?,?,?,?,?,?)",
        [
          id,
          b.email,
          hashPassword(password),
          b.role,
          b.status,
          JSON.stringify(value),
        ],
      );
      await audit(c, res.locals.user, "user.create", id);
    });
    res.status(201).json(value);
  }),
);
usersRouter.patch(
  "/:id/permissions",
  permit("Usuarios y permisos", "edit"),
  route(async (req, res) => {
    if (res.locals.user.role !== "Administrador")
      throw new HttpError(
        403,
        "Solo un administrador puede modificar permisos",
      );
    const b = permissions.parse(req.body.permissions);
    const value = await transaction(async (c) => {
      const [row] = await rows(
        "SELECT payload FROM users WHERE id=? FOR UPDATE",
        [req.params.id],
        c,
      );
      if (!row) throw new HttpError(404, "Usuario no encontrado");
      const value = { ...decode(row), permissions: b };
      await c.execute("UPDATE users SET payload=? WHERE id=?", [
        JSON.stringify(value),
        req.params.id,
      ]);
      await audit(
        c,
        res.locals.user,
        "user.permissions",
        String(req.params.id),
      );
      return value;
    });
    res.json(value);
  }),
);

usersRouter.patch(
  "/:id/status",
  permit("Usuarios y permisos", "edit"),
  route(async (req, res) => {
    if (res.locals.user.role !== "Administrador")
      throw new HttpError(403, "Solo un administrador puede cambiar el estado");
    const { status } = z
      .object({ status: z.enum(["Activo", "Inactivo"]) })
      .parse(req.body);
    if (req.params.id === res.locals.user.id && status === "Inactivo")
      throw new HttpError(400, "No puede desactivar su propia cuenta");
    const value = await transaction(async (c) => {
      const [row] = await rows(
        "SELECT payload FROM users WHERE id=? FOR UPDATE",
        [req.params.id],
        c,
      );
      if (!row) throw new HttpError(404, "Usuario no encontrado");
      const value = { ...decode(row), status };
      await c.execute("UPDATE users SET status=?,payload=? WHERE id=?", [
        status,
        JSON.stringify(value),
        req.params.id,
      ]);
      if (status === "Inactivo")
        await c.execute("DELETE FROM sessions WHERE user_id=?", [
          req.params.id,
        ]);
      await audit(c, res.locals.user, "user.status", String(req.params.id));
      return value;
    });
    res.json(value);
  }),
);
