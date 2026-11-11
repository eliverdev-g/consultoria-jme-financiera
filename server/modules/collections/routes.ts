import { Router } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { rows, decode, transaction } from "../../shared/db";
import { route, permit, HttpError, audit } from "../../shared/http";
export const collectionsRouter = Router();
collectionsRouter.get(
  "/",
  permit("Seguimiento de gestores de cobro"),
  route(async (req, res) =>
    res.json((await rows("SELECT payload FROM activities")).map(decode)),
  ),
);
collectionsRouter.post(
  "/",
  permit("Seguimiento de gestores de cobro", "create"),
  route(async (req, res) => {
    const b = z
      .object({
        clientId: z.string(),
        date: z.string().min(1),
        time: z.string().min(1),
        type: z.enum([
          "Llamada telefónica",
          "Mensaje WhatsApp",
          "Visita de campo",
          "Correo electrónico",
        ]),
        result: z.enum([
          "Promesa de pago",
          "Contacto sin acuerdo",
          "No contesta",
          "Convenio acordado",
          "Número equivocado",
        ]),
        notes: z.string().min(1).max(4000),
        nextActionDate: z.string(),
        nextActionTime: z.string().optional(),
        nextActionNote: z.string(),
        status: z.enum(["Completada", "Pendiente", "En seguimiento"]),
        amountPromised: z.number().nonnegative().optional(),
      })
      .parse(req.body);
    const value = await transaction(async (c) => {
      const [row] = await rows(
        "SELECT payload FROM clients WHERE id=? FOR UPDATE",
        [b.clientId],
        c,
      );
      if (!row) throw new HttpError(404, "Cliente no encontrado");
      const client = decode(row);
      const u = res.locals.user;
      const id = randomUUID();
      const value = {
        ...b,
        id,
        refCode: "REF-" + id.slice(0, 8),
        clientName: client.name,
        clientCode: client.code,
        debtAmount: client.overdueBalance,
        collectorId: u.id,
        collectorName: u.name,
        history: [
          {
            date: b.date + " " + b.time,
            channel: b.type,
            summary: b.notes,
            agent: u.name,
          },
        ],
      };
      await c.execute(
        "INSERT INTO activities(id,client_id,collector_id,payload) VALUES(?,?,?,?)",
        [id, b.clientId, u.id, JSON.stringify(value)],
      );
      client.history.unshift({
        id,
        date: b.date + " " + b.time,
        type: b.type,
        notes: b.notes,
        result: b.result,
        user: u.name,
        amountNegotiated: b.amountPromised,
        nextFollowUp: b.nextActionDate,
      });
      await c.execute("UPDATE clients SET payload=? WHERE id=?", [
        JSON.stringify(client),
        client.id,
      ]);
      await audit(c, u, "activity.create", id);
      return value;
    });
    res.status(201).json(value);
  }),
);
