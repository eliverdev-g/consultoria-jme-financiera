import { randomUUID } from "node:crypto";
import { db, transaction } from "../shared/db";
import { hashPassword } from "../shared/security";
import { INITIAL_CLIENTS, INITIAL_USERS } from "../../src/data/mockData";
import { runPredictions } from "../modules/predictions/service";
const password = process.env.SEED_ADMIN_PASSWORD;
if (!password || password.length < 12)
  throw new Error("Configure SEED_ADMIN_PASSWORD con al menos 12 caracteres");
try {
  await transaction(async (c) => {
    const admin = { ...INITIAL_USERS[0], lastAccess: "Nunca" };
    await c.execute(
      "INSERT IGNORE INTO users(id,email,password_hash,role,status,payload) VALUES(?,?,?,?,?,?)",
      [
        admin.id,
        admin.email,
        hashPassword(password),
        admin.role,
        admin.status,
        JSON.stringify(admin),
      ],
    );
    if (process.argv.includes("--demo"))
      for (const client of INITIAL_CLIENTS) {
        const [result]: any = await c.execute(
          "INSERT IGNORE INTO clients(id,code,nit,name,payload) VALUES(?,?,?,?,?)",
          [
            client.id,
            client.code,
            client.nit,
            client.name,
            JSON.stringify({
              ...client,
              history: [],
              lastPaymentAmount: 0,
              lastPaymentDate: "",
            }),
          ],
        );
        if (result.affectedRows)
          await c.execute(
            "INSERT INTO credits(id,client_id,principal_cents,balance_cents,days_overdue,segment) VALUES(?,?,?,?,?,?)",
            [
              randomUUID(),
              client.id,
              Math.round(client.overdueBalance * 100),
              Math.round(client.overdueBalance * 100),
              client.daysOverdue,
              client.segment,
            ],
          );
      }
  });
  if (process.argv.includes("--demo")) await runPredictions();
  console.log(
    "Administrador: jlopez@jme.com.gt. Los datos demo se cargan solo con --demo.",
  );
} finally {
  await db.end();
}
