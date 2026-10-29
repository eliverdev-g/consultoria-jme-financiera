import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../organisms/Sidebar';
import { Header } from '../organisms/Header';
import { PredictiveAlertsPanel } from '../organisms/PredictiveAlertsPanel';

const routeTitleMap: Record<string, string> = {
  '/dashboard': 'Consultoría Financiera JME Guatemala',
  '/usuarios': 'Usuarios y permisos',
  '/clientes': 'Gestión de clientes',
  '/convenios': 'Convenios de pago',
  '/reportes': 'Reportes de cartera vencida',
  '/gestores': 'Seguimiento de gestores de cobro',
};

export const DashboardLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const location = useLocation();

  const currentTitle = routeTitleMap[location.pathname] || 'Consultoría Financiera JME Guatemala';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenPredictiveEngine={() => setIsAlertsOpen(true)}
      />

      {/* Main Viewport Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 min-h-screen">
        {/* Sticky Header */}
        <Header
          pageTitle={currentTitle}
          onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
          onOpenAlerts={() => setIsAlertsOpen(true)}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>
      </div>

      {/* Predictive Collections Engine Drawer */}
      <PredictiveAlertsPanel
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
      />
    </div>
  );
};
