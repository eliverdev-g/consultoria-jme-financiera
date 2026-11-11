import React, { useEffect, useState } from "react";
import { useData } from "../context/DataContext";
import { api } from "../services/api";
import { Button } from "../components/atoms/Button";
import { Input } from "../components/atoms/Input";
import { Select } from "../components/atoms/Select";
import { Currency } from "../components/atoms/Currency";
export const PagosPage = () => {
  const { clients, agreements, registerPayment } = useData();
  const [payments, setPayments] = useState<any[]>([]);
  const [clientId, setClient] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [agreementId, setAgreement] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    api<any[]>("/payments")
      .then(setPayments)
      .catch((e) => setMessage(e.message));
  }, []);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      await registerPayment({
        clientId,
        amount: Number(amount),
        reference,
        ...(agreementId ? { agreementId } : {}),
      });
      setPayments(await api("/payments"));
      setAmount("");
      setReference("");
      setMessage("Pago registrado y saldo actualizado correctamente.");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-blue-600 uppercase font-semibold tracking-wider">
          Control de cartera
        </p>
        <h2 className="text-2xl font-bold text-slate-900">Registro de pagos</h2>
        <p className="text-sm text-slate-500">
          Registre abonos en quetzales y consulte la trazabilidad de cada
          operación.
        </p>
      </div>
      <div className="grid lg:grid-cols-[360px_1fr] gap-6">
        <form
          onSubmit={submit}
          className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 h-fit"
        >
          <h3 className="font-semibold">Nuevo abono</h3>
          <Select
            label="Cliente"
            value={clientId}
            required
            onChange={(e) => {
              setClient(e.target.value);
              setAgreement("");
            }}
            options={[
              { value: "", label: "Seleccione un cliente" },
              ...clients.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          {clientId && (
            <p className="text-sm text-slate-600">
              Saldo pendiente:{" "}
              <Currency
                amount={
                  clients.find((c) => c.id === clientId)?.overdueBalance || 0
                }
              />
            </p>
          )}
          <Select
            label="Aplicar a convenio"
            value={agreementId}
            onChange={(e) => setAgreement(e.target.value)}
            options={[
              { value: "", label: "Abono directo al crédito" },
              ...agreements
                .filter((a) => a.clientId === clientId && a.amountPending > 0)
                .map((a) => ({ value: a.id, label: a.code })),
            ]}
          />
          <Input
            label="Monto (Q)"
            type="number"
            min="0.01"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Input
            label="Referencia bancaria única"
            required
            minLength={3}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
          <Button type="submit" isLoading={busy} className="w-full">
            Registrar pago
          </Button>
          <p role="status" className="text-sm text-blue-700">
            {message}
          </p>
        </form>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-4">Referencia</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Monto</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="p-4 font-medium">{p.reference}</td>
                  <td className="p-4">
                    {new Date(p.paidAt).toLocaleString("es-GT")}
                  </td>
                  <td className="p-4">
                    <Currency amount={p.amount} />
                  </td>
                </tr>
              ))}
              {!payments.length && (
                <tr>
                  <td colSpan={3} className="p-10 text-center text-slate-500">
                    No hay pagos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
