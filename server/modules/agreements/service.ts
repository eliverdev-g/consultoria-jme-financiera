export function schedule(
  amount: number,
  count: number,
  frequency: string,
  start: string,
) {
  const parts = start.includes("/")
    ? start.split("/").reverse()
    : start.split("-");
  const [y, m, d] = parts.map(Number);
  const base = new Date(Date.UTC(y, m - 1, d));
  if (
    !Number.isFinite(base.getTime()) ||
    base.toISOString().slice(0, 10) !==
      [y, String(m).padStart(2, "0"), String(d).padStart(2, "0")].join("-")
  )
    throw new Error("Fecha inválida");
  const cents = Math.round(amount * 100);
  const unit = Math.floor(cents / count);
  return Array.from({ length: count }, (_, i) => {
    let due = new Date(base);
    if (frequency === "Mensual") {
      due = new Date(Date.UTC(y, m - 1 + i, 1));
      due.setUTCDate(Math.min(d, new Date(Date.UTC(y, m + i, 0)).getUTCDate()));
    } else due.setUTCDate(d + i * (frequency === "Semanal" ? 7 : 15));
    return {
      number: i + 1,
      dueDate: due.toISOString().slice(0, 10),
      amount: (i === count - 1 ? cents - unit * (count - 1) : unit) / 100,
      status: "Pendiente",
    };
  });
}
