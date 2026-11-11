import { Router } from "express";
import { rows, decode } from "../../shared/db";
import { route, permit, HttpError } from "../../shared/http";

export const creditsRouter = Router();
creditsRouter.get(
  "/",
  permit("Gestión de clientes"),
  route(async (req, res) => {
    res.json(
      await rows(`SELECT cr.id, cr.client_id AS clientId, c.name AS clientName,
    cr.principal_cents / 100 AS principal, cr.balance_cents / 100 AS balance,
    cr.days_overdue AS daysOverdue, cr.segment
    FROM credits cr JOIN clients c ON c.id = cr.client_id`),
    );
  }),
);
creditsRouter.get(
  "/:id/statement",
  permit("Gestión de clientes"),
  route(async (req, res) => {
    const [credit] = await rows(
      `SELECT id, client_id AS clientId,
    principal_cents / 100 AS principal, balance_cents / 100 AS balance,
    days_overdue AS daysOverdue, segment FROM credits WHERE id = ?`,
      [req.params.id],
    );
    if (!credit) throw new HttpError(404, "Crédito no encontrado");
    const payments = await rows(
      `SELECT id, amount_cents / 100 AS amount, reference,
    paid_at AS paidAt FROM payments WHERE credit_id = ? ORDER BY paid_at, id`,
      [credit.id],
    );
    const agreements = (
      await rows("SELECT payload FROM agreements WHERE client_id = ?", [
        credit.clientId,
      ])
    ).map(decode);
    res.json({ credit, payments, agreements });
  }),
);
