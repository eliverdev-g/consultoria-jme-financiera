import React from 'react';
import { Menu, Bell, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  onOpenAlerts: () => void;
  pageTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  onOpenAlerts,
  pageTitle = 'Consultoría Financiera JME Guatemala',
}) => {
  const { user, logout } = useAuth();
  const { alerts } = useData();

  const pendingAlertsCount = alerts.filter(a => a.status === 'Nueva').length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-600 hidden sm:block" />
          <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight whitespace-nowrap">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Predictive Alerts Notification button */}
        <button
          onClick={onOpenAlerts}
          className="relative p-2 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer group"
          title="Alertas predictivas de cobranza"
        >
          <Bell className="w-5 h-5" />
          {pendingAlertsCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-[10px] font-bold text-white flex items-center justify-center font-mono">
              {pendingAlertsCount}
            </span>
          )}
        </button>

        {/* Quick Predictive Action trigger */}
        <button
          onClick={onOpenAlerts}
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Alertas Predictivas ({pendingAlertsCount})</span>
        </button>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* User quick role tag */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <span className="font-medium text-slate-700">{user?.name}</span>
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium">
            {user?.role}
          </span>
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Cerrar sesión</span>
        </button>
      </div>
    </header>
  );
};
