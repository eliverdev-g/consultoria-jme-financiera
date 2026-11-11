import { Router } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { rows, decode, transaction } from "../../shared/db";
import { route, permit, HttpError, audit } from "../../shared/http";
import { assess } from "../predictions/service";
export const clientsRouter = Router();
const input = z.object({
  name: z.string().trim().min(2).max(190),
  nit: z.string().min(1).max(40),
  phone: z.string().min(7).max(30),
  email: z.union([z.email(), z.literal("")]),
  address: z.string().max(500),
  overdueBalance: z.number().nonnegative().max(1e10),
  daysOverdue: z.number().int().nonnegative().max(10000),
  status: z.enum([
    "En gestión",
    "Convenio vigente",
    "Demanda judicial",
    "Castigada",
    "Al día",
  ]),
  segment: z.enum([
    "Consumo",
    "PYME",
    "Tarjeta de crédito",
    "Microcréditos",
    "Hipotecario",
  ]),
  lastPaymentDate: z.string(),
  lastPaymentAmount: z.number().nonnegative(),
  assignedManager: z.string(),
  clientSince: z.string(),
});
clientsRouter.get(
  "/",
  permit("Gestión de clientes"),
  route(async (req, res) =>
    res.json((await rows("SELECT payload FROM clients")).map(decode)),
  ),
);
clientsRouter.post(
  "/",
  permit("Gestión de clientes", "create"),
  route(async (req, res) => {
    const body = input.parse(req.body);
    const id = randomUUID();
    const code = "CLI-" + id.slice(0, 8).toUpperCase();
    const client = {
      ...body,
      id,
      code,
      history: [],
      ...assess(body.daysOverdue, body.overdueBalance),
    };
    await transaction(async (c) => {
      await c.execute(
        "INSERT INTO clients(id,code,nit,name,payload) VALUES(?,?,?,?,?)",
        [id, code, body.nit, body.name, JSON.stringify(client)],
      );
      await c.execute(
        "INSERT INTO credits(id,client_id,principal_cents,balance_cents,days_overdue,segment) VALUES(?,?,?,?,?,?)",
        [
          randomUUID(),
          id,
          Math.round(body.overdueBalance * 100),
          Math.round(body.overdueBalance * 100),
          body.daysOverdue,
          body.segment,
        ],
      );
      await audit(c, res.locals.user, "client.create", id);
    });
    res.status(201).json(client);
  }),
);
clientsRouter.patch(
  "/:id",
  permit("Gestión de clientes", "edit"),
  route(async (req, res) => {
    const body = input
      .omit({
        overdueBalance: true,
        lastPaymentAmount: true,
        lastPaymentDate: true,
      })
      .partial()
      .parse(req.body);
    const client = await transaction(async (c) => {
      const [row] = await rows(
        "SELECT payload FROM clients WHERE id=? FOR UPDATE",
        [req.params.id],
        c,
      );
      if (!row) throw new HttpError(404, "Cliente no encontrado");
      const value = { ...decode(row), ...body };
      await c.execute("UPDATE clients SET name=?,nit=?,payload=? WHERE id=?", [
        value.name,
        value.nit,
        JSON.stringify(value),
        req.params.id,
      ]);
      await c.execute(
        "UPDATE credits SET days_overdue=?,segment=? WHERE client_id=?",
        [value.daysOverdue, value.segment, req.params.id],
      );
      await audit(c, res.locals.user, "client.update", String(req.params.id));
      return value;
    });
    res.json(client);
  }),
);
