import { Router } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { rows, decode, transaction } from "../../shared/db";
import { route, permit, HttpError, audit } from "../../shared/http";
import { schedule } from "./service";
export const agreementsRouter = Router();
agreementsRouter.get(
  "/",
  permit("Convenios de pago"),
  route(async (req, res) =>
    res.json((await rows("SELECT payload FROM agreements")).map(decode)),
  ),
);
agreementsRouter.post(
  "/",
  permit("Convenios de pago", "create"),
  route(async (req, res) => {
    const b = z
      .object({
        clientId: z.string(),
        agreedAmount: z.number().positive().max(1e10),
        installmentsCount: z.number().int().min(1).max(360),
        frequency: z.enum(["Mensual", "Quincenal", "Semanal"]),
        startDate: z
          .string()
          .regex(/^(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})$/),
        responsibleManager: z.string(),
        observations: z.string().max(4000).default(""),
      })
      .parse(req.body);
    let installments;
    try {
      installments = schedule(
        b.agreedAmount,
        b.installmentsCount,
        b.frequency,
        b.startDate,
      );
    } catch {
      throw new HttpError(400, "Fecha de inicio inválida");
    }
    if (installments.some((i) => i.amount <= 0))
      throw new HttpError(
        400,
        "El monto es insuficiente para el número de cuotas",
      );
    const result = await transaction(async (c) => {
      const [row] = await rows(
        "SELECT payload FROM clients WHERE id=? FOR UPDATE",
        [b.clientId],
        c,
      );
      if (!row) throw new HttpError(404, "Cliente no encontrado");
      const client = decode(row);
      const [existing] = await rows(
        "SELECT id FROM agreements WHERE client_id=? AND JSON_UNQUOTE(JSON_EXTRACT(payload,'$.status')) IN ('Al día','Activo','Atrasado')",
        [b.clientId],
        c,
      );
      if (existing)
        throw new HttpError(409, "El cliente ya tiene un convenio vigente");
      if (b.agreedAmount > client.overdueBalance)
        throw new HttpError(
          400,
          "El convenio no puede superar el saldo pendiente",
        );
      const id = randomUUID();
      const value = {
        ...b,
        id,
        code: "COV-" + new Date().getFullYear() + "-" + id.slice(0, 8),
        clientName: client.name,
        clientNit: client.nit,
        totalDebt: client.overdueBalance,
        initialBalance: client.overdueBalance,
        amountPaid: 0,
        amountPending: b.agreedAmount,
        status: "Al día",
        installments,
        nextPaymentDate: installments[0].dueDate,
        createdAt: new Date().toISOString(),
        createdBy: res.locals.user.name,
      };
      await c.execute(
        "INSERT INTO agreements(id,client_id,amount_cents,payload) VALUES(?,?,?,?)",
        [
          id,
          b.clientId,
          Math.round(b.agreedAmount * 100),
          JSON.stringify(value),
        ],
      );
      for (const i of installments)
        await c.execute(
          "INSERT INTO installments(agreement_id,number,due_date,amount_cents) VALUES(?,?,?,?)",
          [id, i.number, i.dueDate, Math.round(i.amount * 100)],
        );
      client.status = "Convenio vigente";
      await c.execute("UPDATE clients SET payload=? WHERE id=?", [
        JSON.stringify(client),
        b.clientId,
      ]);
      await audit(c, res.locals.user, "agreement.create", id);
      return value;
    });
    res.status(201).json(result);
  }),
);
