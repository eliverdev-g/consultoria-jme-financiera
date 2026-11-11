import { Router } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { rows, decode, transaction } from "../../shared/db";
import { route, permit, HttpError, audit } from "../../shared/http";
export const paymentsRouter = Router();
paymentsRouter.get(
  "/",
  permit("Gestión de clientes"),
  route(async (req, res) =>
    res.json(
      await rows(
        "SELECT id,credit_id AS creditId,agreement_id AS agreementId,amount_cents/100 AS amount,reference,paid_at AS paidAt FROM payments ORDER BY paid_at DESC",
      ),
    ),
  ),
);
paymentsRouter.post(
  "/",
  permit("Gestión de clientes", "edit"),
  route(async (req, res) => {
    const b = z
      .object({
        clientId: z.string(),
        amount: z
          .number()
          .positive()
          .max(1e10)
          .refine(
            (v) => Math.abs(v * 100 - Math.round(v * 100)) < 0.00001,
            "Use un máximo de dos decimales",
          ),
        reference: z.string().trim().min(3).max(190),
        agreementId: z.string().optional(),
      })
      .parse(req.body);
    const cents = Math.round(b.amount * 100);
    const payment = await transaction(async (c) => {
      const [clientRow] = await rows(
        "SELECT payload FROM clients WHERE id=? FOR UPDATE",
        [b.clientId],
        c,
      );
      if (!clientRow) throw new HttpError(404, "Cliente no encontrado");
      const [credit] = await rows(
        "SELECT * FROM credits WHERE client_id=? FOR UPDATE",
        [b.clientId],
        c,
      );
      if (!credit || cents > Number(credit.balance_cents))
        throw new HttpError(400, "El pago supera el saldo pendiente");
      const [activeAgreement] = await rows(
        "SELECT id FROM agreements WHERE client_id=? AND JSON_UNQUOTE(JSON_EXTRACT(payload,'$.status')) IN ('Activo','Al día','Atrasado')",
        [b.clientId],
        c,
      );
      const agreementId = b.agreementId || activeAgreement?.id;
      const id = randomUUID();
      await c.execute(
        "INSERT INTO payments(id,credit_id,agreement_id,amount_cents,reference,created_by) VALUES(?,?,?,?,?,?)",
        [
          id,
          credit.id,
          agreementId || null,
          cents,
          b.reference,
          res.locals.user.id,
        ],
      );
      if (agreementId) {
        const [ar] = await rows(
          "SELECT payload FROM agreements WHERE id=? AND client_id=? FOR UPDATE",
          [agreementId, b.clientId],
          c,
        );
        if (!ar) throw new HttpError(400, "Convenio inválido");
        const a = decode(ar);
        if (cents > Math.round(a.amountPending * 100))
          throw new HttpError(400, "El pago supera el saldo del convenio");
        let remaining = cents;
        const installments = await rows(
          "SELECT * FROM installments WHERE agreement_id=? ORDER BY number FOR UPDATE",
          [agreementId],
          c,
        );
        for (const i of installments) {
          const applied = Math.min(
            remaining,
            Number(i.amount_cents) - Number(i.paid_cents),
          );
          remaining -= applied;
          await c.execute(
            "UPDATE installments SET paid_cents=paid_cents+? WHERE agreement_id=? AND number=?",
            [applied, agreementId, i.number],
          );
          const item = a.installments.find((x: any) => x.number === i.number);
          if (
            item &&
            Number(i.paid_cents) + applied === Number(i.amount_cents)
          ) {
            item.status = "Pagado";
            item.paidDate = new Date().toISOString().slice(0, 10);
          }
        }
        a.amountPaid = (Math.round(a.amountPaid * 100) + cents) / 100;
        a.amountPending = (Math.round(a.amountPending * 100) - cents) / 100;
        a.status = a.amountPending === 0 ? "Liquidado" : a.status;
        a.nextPaymentDate =
          a.installments.find((i: any) => i.status !== "Pagado")?.dueDate || "";
        await c.execute("UPDATE agreements SET payload=? WHERE id=?", [
          JSON.stringify(a),
          agreementId,
        ]);
      }
      const balance = Number(credit.balance_cents) - cents;
      await c.execute(
        "UPDATE credits SET balance_cents=?,days_overdue=IF(?=0,0,days_overdue) WHERE id=?",
        [balance, balance, credit.id],
      );
      const client = decode(clientRow);
      client.overdueBalance = balance / 100;
      client.lastPaymentAmount = b.amount;
      client.lastPaymentDate = new Date().toISOString().slice(0, 10);
      if (balance === 0) {
        client.status = "Al día";
        client.daysOverdue = 0;
      }
      await c.execute("UPDATE clients SET payload=? WHERE id=?", [
        JSON.stringify(client),
        b.clientId,
      ]);
      await audit(c, res.locals.user, "payment.create", id);
      return { id, ...b };
    });
    res.status(201).json(payment);
  }),
);
