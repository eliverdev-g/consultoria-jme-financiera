import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../app";
import { db, rows } from "../shared/db";
import type { AddressInfo } from "node:net";
// Run only against a dedicated, migrated and seeded test database.
test(
  "MariaDB: autenticación, pago transaccional, duplicados y persistencia",
  { skip: process.env.RUN_DB_TESTS !== "1" },
  async () => {
    const server = createApp().listen(0, "127.0.0.1");
    await new Promise<void>((r) => server.once("listening", r));
    const base = "http://127.0.0.1:" + (server.address() as AddressInfo).port;
    let clientId = "";
    let token = "";
    const request = async (
      path: string,
      body?: any,
      method = body ? "POST" : "GET",
    ) => {
      const res = await fetch(base + "/api" + path, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      return { status: res.status, body: await res.json().catch(() => null) };
    };
    try {
      const login = await request("/auth/login", {
        email: "jlopez@jme.com.gt",
        password: process.env.SEED_ADMIN_PASSWORD,
      });
      assert.equal(login.status, 200);
      token = login.body.token;
      const client = await request("/clients", {
        name: "Prueba integración",
        nit: "TEST-" + Date.now(),
        phone: "55551234",
        email: "test@example.com",
        address: "Guatemala",
        overdueBalance: 100,
        daysOverdue: 45,
        status: "En gestión",
        segment: "Consumo",
        lastPaymentDate: "",
        lastPaymentAmount: 0,
        assignedManager: "Juan López",
        clientSince: "2026-01-01",
      });
      assert.equal(client.status, 201);
      clientId = client.body.id;
      const agreement = await request("/agreements", {
        clientId,
        agreedAmount: 100,
        installmentsCount: 3,
        frequency: "Mensual",
        startDate: "2026-10-31",
        responsibleManager: "Juan López",
        observations: "",
      });
      assert.equal(agreement.status, 201);
      const payment = {
        clientId,
        amount: 33.33,
        reference: "TEST-" + Date.now(),
        agreementId: agreement.body.id,
      };
      assert.equal((await request("/payments", payment)).status, 201);
      assert.equal((await request("/payments", payment)).status, 409);
      assert.equal(
        (
          await request("/payments", {
            ...payment,
            reference: "over-" + Date.now(),
            amount: 1000,
          })
        ).status,
        400,
      );
      const bootstrap = await request("/bootstrap");
      const saved = bootstrap.body.clients.find((c: any) => c.id === clientId);
      assert.equal(saved.overdueBalance, 66.67);
      const savedAgreement = bootstrap.body.agreements.find(
        (a: any) => a.id === agreement.body.id,
      );
      assert.equal(savedAgreement.amountPaid, 33.33);
      assert.equal(savedAgreement.installments[0].status, "Pagado");
      const audit = await rows(
        "SELECT action FROM audit_log WHERE entity_id=?",
        [clientId],
      );
      assert.ok(audit.length);
    } finally {
      // Delete only records created by this test, in foreign-key order.
      if (clientId) {
        await db.execute(
          "DELETE FROM payments WHERE credit_id IN (SELECT id FROM credits WHERE client_id=?)",
          [clientId],
        );
        await db.execute(
          "DELETE FROM installments WHERE agreement_id IN (SELECT id FROM agreements WHERE client_id=?)",
          [clientId],
        );
        await db.execute("DELETE FROM agreements WHERE client_id=?", [
          clientId,
        ]);
        await db.execute("DELETE FROM credits WHERE client_id=?", [clientId]);
        await db.execute("DELETE FROM clients WHERE id=?", [clientId]);
      }
      if (token) await request("/auth/logout", {});
      await new Promise<void>((r) => server.close(() => r()));
      await db.end();
    }
  },
);
