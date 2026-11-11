import React, { createContext, useContext, useEffect, useState } from "react";
import { User, ModuleName } from "../types";
import { api } from "../services/api";
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (
    module: ModuleName,
    action?: "view" | "create" | "edit" | "delete",
  ) => boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    sessionStorage.getItem("jme_token"),
  );
  const [isLoading, setLoading] = useState(true);
  const clear = () => {
    sessionStorage.removeItem("jme_token");
    setUser(null);
    setToken(null);
  };
  useEffect(() => {
    let active = true;
    if (sessionStorage.getItem("jme_token"))
      api<User>("/auth/me")
        .then((u) => {
          if (active) setUser(u);
        })
        .catch(clear)
        .finally(() => {
          if (active) setLoading(false);
        });
    else setLoading(false);
    window.addEventListener("jme:unauthorized", clear);
    return () => {
      active = false;
      window.removeEventListener("jme:unauthorized", clear);
    };
  }, []);
  const login = async (email: string, password = "") => {
    const result = await api<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    sessionStorage.setItem("jme_token", result.token);
    setToken(result.token);
    setUser(result.user);
    return true;
  };
  const logout = () => {
    void api("/auth/logout", { method: "POST" }).catch(() => {});
    clear();
  };
  const hasPermission = (
    module: ModuleName,
    action: "view" | "create" | "edit" | "delete" = "view",
  ) =>
    !!user &&
    (user.role === "Administrador" ||
      !!user.permissions.find((p) => p.module === module)?.[action]);
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error("AuthProvider requerido");
  return c;
};
