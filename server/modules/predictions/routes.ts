import { Router } from "express";
import { randomUUID } from "node:crypto";
import { rows, decode, transaction } from "../../shared/db";
import { route, permit, HttpError, audit } from "../../shared/http";
import { runPredictions } from "./service";
export const predictionsRouter = Router();
predictionsRouter.get(
  "/",
  permit("Dashboard"),
  route(async (req, res) =>
    res.json((await rows("SELECT payload FROM alerts")).map(decode)),
  ),
);
predictionsRouter.post(
  "/run",
  permit("Dashboard", "create"),
  route(async (req, res) => res.json(await runPredictions())),
);
predictionsRouter.post(
  "/:id/resolve",
  permit("Seguimiento de gestores de cobro", "edit"),
  route(async (req, res) => {
    await transaction(async (c) => {
      const [row] = await rows(
        "SELECT payload FROM alerts WHERE id=? FOR UPDATE",
        [req.params.id],
        c,
      );
      if (!row) throw new HttpError(404, "Alerta no encontrada");
      const a = decode(row);
      a.status = "Resuelta";
      await c.execute(
        "UPDATE alerts SET status='Resuelta',payload=? WHERE id=?",
        [JSON.stringify(a), req.params.id],
      );
      await audit(c, res.locals.user, "alert.resolve", String(req.params.id));
    });
    res.sendStatus(204);
  }),
);
predictionsRouter.post(
  "/:id/queue",
  permit("Seguimiento de gestores de cobro", "create"),
  route(async (req, res) => {
    await transaction(async (c) => {
      const [row] = await rows(
        "SELECT payload FROM alerts WHERE id=? FOR UPDATE",
        [req.params.id],
        c,
      );
      if (!row) throw new HttpError(404, "Alerta no encontrada");
      const a = decode(row);
      if (a.status === "Resuelta")
        throw new HttpError(409, "La alerta ya fue resuelta");
      await c.execute(
        "INSERT IGNORE INTO notification_outbox(id,alert_id,channel) VALUES(?,?,?)",
        [randomUUID(), a.id, a.recommendedChannel],
      );
      a.status = "En proceso";
      await c.execute(
        "UPDATE alerts SET status='En proceso',payload=? WHERE id=?",
        [JSON.stringify(a), a.id],
      );
      await audit(c, res.locals.user, "notification.queue", a.id);
    });
    res
      .status(202)
      .json({
        message:
          "Acción pendiente de envío. El proveedor de mensajería aún no está configurado.",
      });
  }),
);
