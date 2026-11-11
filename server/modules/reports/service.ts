import { rows, decode } from "../../shared/db";
export async function report() {
  const clients = (await rows("SELECT payload FROM clients")).map(decode);
  const payments = await rows(
    "SELECT p.id, p.reference, p.amount_cents, p.paid_at, cr.segment, cr.client_id FROM payments p JOIN credits cr ON cr.id=p.credit_id",
  );
  const totalOverdue = clients.reduce((s, c) => s + c.overdueBalance, 0);
  const recoveredAmount = payments.reduce(
    (s, p) => s + Number(p.amount_cents) / 100,
    0,
  );
  const segments = [...new Set(clients.map((c) => c.segment))].map(
    (segment) => {
      const list = clients.filter((c) => c.segment === segment);
      const balance = list.reduce((s, c) => s + c.overdueBalance, 0);
      const recovered = payments
        .filter((p) => p.segment === segment)
        .reduce((s, p) => s + Number(p.amount_cents) / 100, 0);
      return {
        segment,
        clientsCount: list.length,
        totalBalance: balance,
        recoveredAmount: recovered,
        recoveryPercentage:
          balance + recovered ? (100 * recovered) / (balance + recovered) : 0,
        defaultRate: list.length
          ? (100 * list.filter((c) => c.daysOverdue > 0).length) / list.length
          : 0,
      };
    },
  );
  return {
    payments: payments.map((p) => ({
      id: p.id,
      reference: p.reference,
      clientId: p.client_id,
      amount: Number(p.amount_cents) / 100,
      paidAt: p.paid_at,
    })),
    totalOverdue,
    clientsInArrears: clients.filter(
      (c) => c.daysOverdue > 0 && c.overdueBalance > 0,
    ).length,
    recoveredAmount,
    recoveryRate:
      totalOverdue + recoveredAmount
        ? (100 * recoveredAmount) / (totalOverdue + recoveredAmount)
        : 0,
    segments,
  };
}
