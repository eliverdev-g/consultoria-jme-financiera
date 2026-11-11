import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock, Mail, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/atoms/Button";
import { Input } from "../components/atoms/Input";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("jlopez@jme.com.gt");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Lockup */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#0F1E36] flex items-center justify-center text-white font-black text-xl shadow-md tracking-wider border border-blue-600/40">
            JME
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
              CONSULTORÍA FINANCIERA
            </h2>
            <p className="text-xs font-semibold text-blue-700 tracking-widest mt-0.5">
              GUATEMALA · SISTEMA DE COBRANZA
            </p>
          </div>
        </div>

        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            Iniciar Sesión
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de créditos en mora y cobranza automatizada mediante alertas
            predictivas
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200/90 sm:px-10">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Correo Electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@jme.com.gt"
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <p className="text-xs text-slate-500 pt-1">
              Sesión protegida de 8 horas. Si necesita recuperar el acceso,
              contacte al administrador.
            </p>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Acceder al Sistema
            </Button>
          </form>
        </div>

        {/* Security and Feature Badges */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Token Auth Seguro</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Alertas por reglas de mora</span>
          </div>
        </div>
      </div>
    </div>
  );
};
