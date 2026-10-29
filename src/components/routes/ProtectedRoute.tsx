import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ModuleName } from '../../types';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../atoms/Button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  module?: ModuleName;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, module }) => {
  const { isAuthenticated, isLoading, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Validando sesión segura de JME...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (module && !hasPermission(module, 'view')) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-slate-200">
        <div className="p-4 bg-amber-50 rounded-2xl text-amber-600 mb-4">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Acceso Restringido</h3>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          Su rol actual no cuenta con permisos de lectura para el módulo de <strong>{module}</strong>. Contacte al administrador del sistema.
        </p>
        <Button variant="primary" onClick={() => window.history.back()}>
          Regresar a página anterior
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};
