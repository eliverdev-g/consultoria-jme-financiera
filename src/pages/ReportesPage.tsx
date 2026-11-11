import React, { useState } from "react";
import {
  Users,
  Coins,
  Percent,
  AlertCircle,
  Download,
  Printer,
} from "lucide-react";
import { useData } from "../context/DataContext";
import { Card } from "../components/atoms/Card";
import { StatCard } from "../components/molecules/StatCard";
import { Select } from "../components/atoms/Select";
import { Input } from "../components/atoms/Input";
import { Button } from "../components/atoms/Button";
import { Currency } from "../components/atoms/Currency";
import { exportToCSV, printToPDF } from "../utils/exportUtils";
export const ReportesPage = () => {
  const { clients, payments } = useData();
  const [status, setStatus] = useState("Todos");
  const [range, setRange] = useState("Todos");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const filtered = clients.filter(
    (c) =>
      (status === "Todos" || c.status === status) &&
      (range === "Todos" ||
        (range === "180+"
          ? c.daysOverdue > 180
          : c.daysOverdue >= Number(range.split("-")[0]) &&
            c.daysOverdue <= Number(range.split("-")[1]))),
  );
  const selected = new Set(filtered.map((c) => c.id));
  const receipts = payments.filter(
    (p) =>
      selected.has(p.clientId) &&
      (!from || p.paidAt.slice(0, 10) >= from) &&
      (!to || p.paidAt.slice(0, 10) <= to),
  );
  const balance = filtered.reduce((s, c) => s + c.overdueBalance, 0);
  const recovered = receipts.reduce((s, p) => s + p.amount, 0);
  const rate =
    balance + recovered ? (100 * recovered) / (balance + recovered) : 0;
  const segments = [...new Set(filtered.map((c) => c.segment))].map(
    (segment) => {
      const list = filtered.filter((c) => c.segment === segment);
      const ids = new Set(list.map((c) => c.id));
      return {
        segment,
        count: list.length,
        balance: list.reduce((s, c) => s + c.overdueBalance, 0),
        recovered: receipts
          .filter((p) => ids.has(p.clientId))
          .reduce((s, p) => s + p.amount, 0),
      };
    },
  );
  const ranges = ["1-30", "31-60", "61-90", "91-120", "121-180", "180+"].map(
    (label) => ({
      label,
      amount: filtered
        .filter((c) =>
          label === "180+"
            ? c.daysOverdue > 180
            : c.daysOverdue >= Number(label.split("-")[0]) &&
              c.daysOverdue <= Number(label.split("-")[1]),
        )
        .reduce((s, c) => s + c.overdueBalance, 0),
    }),
  );
  const monthly = Object.entries(
    receipts.reduce(
      (acc, p) => {
        const key = p.paidAt.slice(0, 7);
        acc[key] = (acc[key] || 0) + p.amount;
        return acc;
      },
      {} as Record<string, number>,
    ),
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, amount]) => ({ label, amount }));
  const states = [...new Set(filtered.map((c) => c.status))].map((label) => ({
    label,
    amount: filtered
      .filter((c) => c.status === label)
      .reduce((s, c) => s + c.overdueBalance, 0),
  }));
  const exportCsv = () =>
    exportToCSV(
      "JME_Cartera_Vencida",
      ["Segmento", "Clientes", "Saldo Q", "Recuperado Q"],
      segments.map((s) => [s.segment, s.count, s.balance, s.recovered]),
    );
  const bars = (items: { label: string; amount: number }[], color: string) => (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex justify-between text-xs mb-2">
            <span>{item.label}</span>
            <Currency amount={item.amount} />
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${color}`}
              style={{
                width: `${(100 * item.amount) / Math.max(1, ...items.map((i) => i.amount))}%`,
              }}
            />
          </div>
        </div>
      ))}
      {!items.length && (
        <p className="text-sm text-slate-500 py-8">
          No hay pagos en el período seleccionado.
        </p>
      )}
    </div>
  );
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-4 items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Análisis de cartera
          </p>
          <h2 className="text-2xl font-bold text-slate-900">
            Reportes de cartera vencida
          </h2>
          <p className="text-sm text-slate-500">
            Saldos actuales y recuperación registrada para apoyar sus
            decisiones.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={printToPDF}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Imprimir / PDF
          </Button>
          <Button
            onClick={exportCsv}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Exportar CSV
          </Button>
        </div>
      </div>
      <Card className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          label="Pagos desde"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <Input
          label="Pagos hasta"
          type="date"
          value={to}
          min={from}
          onChange={(e) => setTo(e.target.value)}
        />
        <Select
          label="Estado del cliente"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            "Todos",
            "En gestión",
            "Convenio vigente",
            "Demanda judicial",
            "Castigada",
            "Al día",
          ].map((value) => ({ value, label: value }))}
        />
        <Select
          label="Días de mora"
          value={range}
          onChange={(e) => setRange(e.target.value)}
          options={["Todos", ...ranges.map((r) => r.label)].map((value) => ({
            value,
            label: value,
          }))}
        />
        <p className="sm:col-span-2 lg:col-span-4 text-xs text-slate-500">
          Las fechas filtran los pagos. Los saldos corresponden al estado actual
          de la cartera.
        </p>
      </Card>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Saldo pendiente"
          value={<Currency amount={balance} />}
          icon={<AlertCircle />}
          iconColor="blue"
        />
        <StatCard
          label="Clientes en mora"
          value={
            filtered.filter((c) => c.daysOverdue > 0 && c.overdueBalance > 0)
              .length
          }
          icon={<Users />}
          iconColor="amber"
        />
        <StatCard
          label="Monto recuperado"
          value={<Currency amount={recovered} />}
          icon={<Coins />}
          iconColor="emerald"
        />
        <StatCard
          label="Recuperación"
          value={`${rate.toFixed(2)}%`}
          icon={<Percent />}
          iconColor="purple"
          subtitle="Pagos / (saldo actual + pagos del período)"
        />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <h3 className="font-semibold text-sm mb-6">
            Cartera por rangos de mora
          </h3>
          {bars(ranges, "bg-blue-600")}
        </Card>
        <Card>
          <h3 className="font-semibold text-sm mb-6">Recuperación por mes</h3>
          {bars(monthly, "bg-emerald-500")}
        </Card>
        <Card>
          <h3 className="font-semibold text-sm mb-6">Cartera por estado</h3>
          {bars(states, "bg-indigo-500")}
        </Card>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-auto">
        <h3 className="font-semibold p-5">Resumen por segmento</h3>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              {[
                "Segmento",
                "Clientes",
                "Saldo (Q)",
                "Recuperado (Q)",
                "Recuperación",
              ].map((h) => (
                <th key={h} className="p-4 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {segments.map((s) => (
              <tr key={s.segment} className="border-t border-slate-100">
                <td className="p-4 font-medium">{s.segment}</td>
                <td className="p-4">{s.count}</td>
                <td className="p-4">
                  <Currency amount={s.balance} />
                </td>
                <td className="p-4 text-emerald-700">
                  <Currency amount={s.recovered} />
                </td>
                <td className="p-4">
                  {(s.balance + s.recovered
                    ? (100 * s.recovered) / (s.balance + s.recovered)
                    : 0
                  ).toFixed(2)}
                  %
                </td>
              </tr>
            ))}
            {!segments.length && (
              <tr>
                <td className="p-8 text-center text-slate-500" colSpan={5}>
                  No hay clientes que coincidan con los filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
