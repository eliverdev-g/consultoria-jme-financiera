import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Client,
  PaymentAgreement,
  CollectorActivity,
  User,
  PredictiveAlert,
  PortfolioSegmentSummary,
} from "../types";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";
interface Snapshot {
  payments: {
    id: string;
    reference: string;
    clientId: string;
    amount: number;
    paidAt: string;
  }[];
  clients: Client[];
  agreements: PaymentAgreement[];
  activities: CollectorActivity[];
  users: User[];
  alerts: PredictiveAlert[];
  segments: PortfolioSegmentSummary[];
  totalOverdue: number;
  clientsInArrears: number;
  recoveredAmount: number;
  recoveryRate: number;
}
const empty: Snapshot = {
  payments: [],
  clients: [],
  agreements: [],
  activities: [],
  users: [],
  alerts: [],
  segments: [],
  totalOverdue: 0,
  clientsInArrears: 0,
  recoveredAmount: 0,
  recoveryRate: 0,
};
interface DataContextType extends Snapshot {
  setUserStatus: (id: string, status: "Activo" | "Inactivo") => Promise<void>;
  addClient: (data: any) => Promise<Client>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  addAgreement: (data: any) => Promise<PaymentAgreement>;
  addActivity: (data: any) => Promise<CollectorActivity>;
  addUser: (data: any) => Promise<User>;
  updateUserPermissions: (
    id: string,
    data: User["permissions"],
  ) => Promise<void>;
  resolveAlert: (id: string) => Promise<void>;
  queueAlert: (id: string) => Promise<void>;
  triggerPredictiveBatch: () => Promise<void>;
  registerPayment: (data: any) => Promise<void>;
}
const DataContext = createContext<DataContextType | undefined>(undefined);
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token } = useAuth();
  const [data, setData] = useState(empty);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const refresh = async () => setData(await api<Snapshot>("/bootstrap"));
  useEffect(() => {
    let active = true;
    setData(empty);
    if (!token) return;
    setLoading(true);
    api<Snapshot>("/bootstrap")
      .then((s) => {
        if (active) setData(s);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);
  const mutate = async <T,>(
    path: string,
    body: any,
    method = "POST",
  ): Promise<T> => {
    try {
      setError("");
      const value = await api<T>(path, { method, body: JSON.stringify(body) });
      await refresh();
      return value;
    } catch (e) {
      setError((e as Error).message);
      throw e;
    }
  };
  // React event handlers may ignore promises; expose errors visibly and suppress duplicate unhandled rejections.
  const action = <T,>(promise: Promise<T>) => {
    void promise.catch(() => {});
    return promise;
  };
  const value: DataContextType = {
    ...data,
    setUserStatus: (id, status) =>
      action(mutate("/users/" + id + "/status", { status }, "PATCH")),
    addClient: (b) => action(mutate("/clients", b)),
    updateClient: (id, b) => action(mutate("/clients/" + id, b, "PATCH")),
    addAgreement: (b) => action(mutate("/agreements", b)),
    addActivity: (b) => action(mutate("/activities", b)),
    addUser: (b) => action(mutate("/users", b)),
    updateUserPermissions: (id, permissions) =>
      action(mutate("/users/" + id + "/permissions", { permissions }, "PATCH")),
    resolveAlert: (id) => action(mutate("/alerts/" + id + "/resolve", {})),
    queueAlert: (id) => action(mutate("/alerts/" + id + "/queue", {})),
    triggerPredictiveBatch: () => action(mutate("/alerts/run", {})),
    registerPayment: (b) => action(mutate("/payments", b)),
  };
  return (
    <DataContext.Provider value={value}>
      {error && (
        <div
          role="alert"
          className="fixed bottom-5 left-5 right-5 z-[100] rounded-xl bg-rose-50 border border-rose-300 text-rose-800 p-4 shadow-lg flex justify-between"
        >
          <span>{error}</span>
          <button onClick={() => setError("")}>Cerrar</button>
        </div>
      )}
      {loading && (
        <div
          role="status"
          className="fixed top-0 z-[100] w-full text-center bg-blue-600 text-white text-xs p-1"
        >
          Cargando información…
        </div>
      )}
      {children}
    </DataContext.Provider>
  );
};
export const useData = () => {
  const c = useContext(DataContext);
  if (!c) throw new Error("DataProvider requerido");
  return c;
};
