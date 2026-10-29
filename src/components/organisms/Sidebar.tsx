import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ContactRound, 
  FileText, 
  BarChart3, 
  PhoneCall, 
  LogOut,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../atoms/Avatar';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
  onOpenPredictiveEngine?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onCloseMobile,
  onOpenPredictiveEngine,
}) => {
  const { user, logout, hasPermission } = useAuth();

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      module: 'Dashboard' as const,
    },
    {
      to: '/usuarios',
      label: 'Usuarios y permisos',
      icon: Users,
      module: 'Usuarios y permisos' as const,
    },
    {
      to: '/clientes',
      label: 'Gestión de clientes',
      icon: ContactRound,
      module: 'Gestión de clientes' as const,
    },
    {
      to: '/convenios',
      label: 'Convenios de pago',
      icon: FileText,
      module: 'Convenios de pago' as const,
    },
    {
      to: '/reportes',
      label: 'Reportes de cartera vencida',
      icon: BarChart3,
      module: 'Reportes de cartera vencida' as const,
    },
    {
      to: '/gestores',
      label: 'Seguimiento de gestores de cobro',
      icon: PhoneCall,
      module: 'Seguimiento de gestores de cobro' as const,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0F1E36] text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-xs tracking-wider">
              JME
            </div>
            <div className="leading-tight">
              <span className="block text-xs font-bold text-white tracking-wider">CONSULTORÍA</span>
              <span className="block text-[10px] text-slate-400 font-medium tracking-widest">FINANCIERA</span>
            </div>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-300 border border-blue-700/50 uppercase font-mono">
            GT
          </span>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isAllowed = hasPermission(item.module, 'view');
            const Icon = item.icon;

            if (!isAllowed) return null;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600/90 text-white shadow-xs font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}

          {/* Predictive Collection Engine Shortcut Banner */}
          <div className="pt-4 mt-4 border-t border-slate-800">
            <button
              onClick={() => {
                if (onOpenPredictiveEngine) onOpenPredictiveEngine();
                onCloseMobile();
              }}
              className="w-full text-left p-3 rounded-xl bg-gradient-to-br from-blue-950/60 to-slate-900 border border-blue-800/40 hover:border-blue-700/60 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-blue-300 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-12 transition-transform" />
                <span>Cobranza Predictiva</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                4 alertas automáticas de optimización de recupero activas.
              </p>
              <div className="mt-2 text-[10px] font-semibold text-blue-400 flex items-center gap-1">
                <span>Ver alertas y sugerencias</span>
                <span>→</span>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom User Profile */}
        <div className="p-3 border-t border-slate-800 bg-[#0A1526]">
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/60 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar
                initials={user?.avatar || 'AM'}
                size="sm"
                className="bg-blue-600 text-white font-bold"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Ana María López'}</p>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3 h-3 text-blue-400 shrink-0" />
                  <span className="truncate">{user?.role || 'Administrador'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Cerrar sesión"
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md hover:bg-slate-700/50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
