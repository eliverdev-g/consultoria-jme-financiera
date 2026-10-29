import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import { DashboardLayout } from './components/templates/DashboardLayout';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClientesPage } from './pages/ClientesPage';
import { ConveniosPage } from './pages/ConveniosPage';
import { ReportesPage } from './pages/ReportesPage';
import { GestoresPage } from './pages/GestoresPage';
import { UsuariosPage } from './pages/UsuariosPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Enterprise Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              
              <Route
                path="clientes"
                element={
                  <ProtectedRoute module="Gestión de clientes">
                    <ClientesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="convenios"
                element={
                  <ProtectedRoute module="Convenios de pago">
                    <ConveniosPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="reportes"
                element={
                  <ProtectedRoute module="Reportes de cartera vencida">
                    <ReportesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="gestores"
                element={
                  <ProtectedRoute module="Seguimiento de gestores de cobro">
                    <GestoresPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="usuarios"
                element={
                  <ProtectedRoute module="Usuarios y permisos">
                    <UsuariosPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
