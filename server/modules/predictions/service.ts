import { randomUUID } from "node:crypto";
import { rows, decode, transaction } from "../../shared/db";
export function assess(days: number, balance: number) {
  const score = Math.min(
    98,
    Math.round(days * 0.65 + (balance > 25000 ? 15 : 5)),
  );
  return {
    riskScore: score,
    recoveryProbability: 100 - score,
    predictedDefaultRisk:
      score >= 80
        ? "Crítico"
        : score >= 60
          ? "Alto"
          : score >= 30
            ? "Medio"
            : "Bajo",
    recommendedChannel: score >= 60 ? "Llamada" : "WhatsApp",
    recommendedBestHour: "09:00 - 12:00",
    suggestedAction:
      score >= 60
        ? "Revisar el caso y proponer un convenio de pago"
        : "Programar recordatorio preventivo",
  };
}
export async function runPredictions() {
  return transaction(async (c) => {
    const clients = await rows(
      "SELECT c.payload,cr.balance_cents,cr.days_overdue FROM clients c JOIN credits cr ON cr.client_id=c.id",
      [],
      c,
    );
    let created = 0;
    for (const row of clients) {
      const client = decode(row);
      const amount = Number(row.balance_cents) / 100;
      const days = Number(row.days_overdue);
      const prediction = assess(days, amount);
      await c.execute("UPDATE clients SET payload=? WHERE id=?", [
        JSON.stringify({
          ...client,
          ...prediction,
          overdueBalance: amount,
          daysOverdue: days,
        }),
        client.id,
      ]);
      if (days < 30 || amount <= 0) continue;
      const id = randomUUID();
      const severity =
        prediction.predictedDefaultRisk === "Crítico"
          ? "Crítico"
          : prediction.predictedDefaultRisk === "Alto"
            ? "Alto"
            : "Medio";
      const alert = {
        id,
        clientId: client.id,
        clientCode: client.code,
        clientName: client.name,
        amount,
        daysOverdue: days,
        severity,
        alertType: "Incumplimiento Inminente",
        title: "Seguimiento prioritario por mora",
        description: `Regla explicable v1: ${days} días en mora y saldo Q ${amount.toFixed(2)}. Puntaje orientativo; no es una probabilidad estadística calibrada.`,
        predictedProbability: prediction.riskScore,
        suggestedAction: prediction.suggestedAction,
        recommendedChannel: prediction.recommendedChannel,
        bestContactWindow: prediction.recommendedBestHour,
        status: "Nueva",
        createdAt: new Date().toISOString(),
      };
      const [result]: any = await c.execute(
        "INSERT IGNORE INTO alerts(id,client_id,status,rule_key,payload) VALUES(?,?,?,?,?)",
        [
          id,
          client.id,
          "Nueva",
          `${client.id}:${new Date().toISOString().slice(0, 10)}`,
          JSON.stringify(alert),
        ],
      );
      created += result.affectedRows;
    }
    return { created };
  });
}
