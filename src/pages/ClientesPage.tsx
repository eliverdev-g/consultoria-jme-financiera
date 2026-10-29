import React, { useState } from 'react';
import { 
  Users, 
  AlertTriangle, 
  Wallet, 
  Clock, 
  Plus, 
  Download, 
  Eye, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import { StatCard } from '../components/molecules/StatCard';
import { SearchBar } from '../components/molecules/SearchBar';
import { Pagination } from '../components/molecules/Pagination';
import { Drawer } from '../components/molecules/Drawer';
import { Modal } from '../components/molecules/Modal';
import { Button } from '../components/atoms/Button';
import { Badge, BadgeVariant } from '../components/atoms/Badge';
import { Currency } from '../components/atoms/Currency';
import { Input } from '../components/atoms/Input';
import { Select } from '../components/atoms/Select';
import { Avatar } from '../components/atoms/Avatar';
import { PredictiveScoreGauge } from '../components/molecules/PredictiveScoreGauge';
import { useData } from '../context/DataContext';
import { Client } from '../types';
import { exportToCSV } from '../utils/exportUtils';

export const ClientesPage: React.FC = () => {
  const { clients, addClient, addActivity } = useData();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [daysFilter, setDaysFilter] = useState('Todos');
  const [managerFilter, setManagerFilter] = useState('Todos');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Drawer & Modal States
  const [selectedClient, setSelectedClient] = useState<Client | null>(clients[0] || null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isNewActivityModalOpen, setIsNewActivityModalOpen] = useState(false);

  // New Client Form State
  const [newClientData, setNewClientData] = useState({
    name: '',
    nit: '',
    phone: '',
    email: '',
    address: '',
    overdueBalance: '',
    daysOverdue: '',
    segment: 'Consumo' as const,
    assignedManager: 'María García',
    status: 'En gestión' as const,
    lastPaymentDate: new Date().toLocaleDateString('es-GT'),
    lastPaymentAmount: 0,
    clientSince: new Date().toLocaleDateString('es-GT'),
  });

  // Quick Activity Form State
  const [activityData, setActivityData] = useState({
    type: 'Llamada telefónica' as const,
    result: 'Promesa de pago' as const,
    notes: '',
    amountPromised: '',
    nextActionDate: '',
    nextActionNote: 'Llamada de confirmación de depósito',
  });

  // Filter clients
  const filteredClients = clients.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm);

    const matchesStatus = statusFilter === 'Todos' || c.status === statusFilter;

    let matchesDays = true;
    if (daysFilter === '1-30') matchesDays = c.daysOverdue <= 30;
    else if (daysFilter === '31-60') matchesDays = c.daysOverdue > 30 && c.daysOverdue <= 60;
    else if (daysFilter === '61-90') matchesDays = c.daysOverdue > 60 && c.daysOverdue <= 90;
    else if (daysFilter === '91+') matchesDays = c.daysOverdue > 90;

    const matchesManager = managerFilter === 'Todos' || c.assignedManager === managerFilter;

    return matchesSearch && matchesStatus && matchesDays && matchesManager;
  });

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage) || 1;
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadgeVariant = (status: Client['status']): BadgeVariant => {
    switch (status) {
      case 'Al día':
        return 'success';
      case 'Convenio vigente':
        return 'cyan';
      case 'En gestión':
        return 'info';
      case 'Demanda judicial':
        return 'warning';
      case 'Castigada':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addClient({
      name: newClientData.name,
      nit: newClientData.nit || 'CF',
      phone: newClientData.phone,
      email: newClientData.email || 'sin-correo@jme.com.gt',
      address: newClientData.address || 'Ciudad de Guatemala',
      overdueBalance: parseFloat(newClientData.overdueBalance) || 0,
      daysOverdue: parseInt(newClientData.daysOverdue, 10) || 0,
      segment: newClientData.segment,
      assignedManager: newClientData.assignedManager,
      status: newClientData.status,
      lastPaymentDate: newClientData.lastPaymentDate,
      lastPaymentAmount: newClientData.lastPaymentAmount,
      clientSince: newClientData.clientSince,
    });
    setIsNewClientModalOpen(false);
    setSelectedClient(created);
    setIsDrawerOpen(true);
  };

  const handleRegisterActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    addActivity({
      date: new Date().toLocaleDateString('es-GT'),
      time: new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }),
      collectorId: 'u-current',
      collectorName: 'María García',
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      clientCode: selectedClient.code,
      debtAmount: selectedClient.overdueBalance,
      type: activityData.type,
      result: activityData.result,
      notes: activityData.notes || 'Gestión realizada satisfactoriamente.',
      nextActionDate: activityData.nextActionDate || '28/05/2025',
      nextActionTime: '10:00',
      nextActionNote: activityData.nextActionNote,
      status: 'Pendiente',
      amountPromised: activityData.amountPromised ? parseFloat(activityData.amountPromised) : undefined,
    });

    setIsNewActivityModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['Código', 'Cliente', 'Teléfono', 'Email', 'Saldo Pendiente (Q)', 'Días de Mora', 'Estado', 'Segmento', 'Último Pago', 'Gestor'];
    const rows = filteredClients.map(c => [
      c.code,
      c.name,
      c.phone,
      c.email,
      c.overdueBalance,
      c.daysOverdue,
      c.status,
      c.segment,
      c.lastPaymentDate,
      c.assignedManager,
    ]);
    exportToCSV('JME_Clientes_Mora', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Gestión de clientes</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administra y consulta clientes con créditos en mora.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewClientModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nuevo cliente
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Exportar
          </Button>
        </div>
      </div>

      {/* Top 4 KPIs matching PDF Page 2 Top */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total de clientes"
          value="1,248"
          icon={<Users className="w-5 h-5" />}
          iconColor="blue"
          subtitle="Padrón crediticio registrado"
        />

        <StatCard
          label="En mora"
          value="842"
          icon={<AlertTriangle className="w-5 h-5" />}
          iconColor="amber"
          subtitle="67.4% de la cartera activa"
        />

        <StatCard
          label="Cartera total"
          value={<Currency amount={12843650.45} />}
          icon={<Wallet className="w-5 h-5" />}
          iconColor="emerald"
          subtitle="Saldo pendiente global en Q"
        />

        <StatCard
          label="En gestión"
          value="356"
          icon={<Clock className="w-5 h-5" />}
          iconColor="purple"
          subtitle="Casos asignados a cobranza hoy"
        />
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por nombre, código o teléfono..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="w-36">
            <Select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              options={[
                { value: 'Todos', label: 'Estado: Todos' },
                { value: 'En gestión', label: 'En gestión' },
                { value: 'Convenio vigente', label: 'Convenio vigente' },
                { value: 'Demanda judicial', label: 'Demanda judicial' },
                { value: 'Castigada', label: 'Castigada' },
                { value: 'Al día', label: 'Al día' },
              ]}
            />
          </div>

          <div className="w-36">
            <Select
              value={daysFilter}
              onChange={e => setDaysFilter(e.target.value)}
              options={[
                { value: 'Todos', label: 'Mora: Todas' },
                { value: '1-30', label: '1 - 30 días' },
                { value: '31-60', label: '31 - 60 días' },
                { value: '61-90', label: '61 - 90 días' },
                { value: '91+', label: '91+ días' },
              ]}
            />
          </div>

          <div className="w-36">
            <Select
              value={managerFilter}
              onChange={e => setManagerFilter(e.target.value)}
              options={[
                { value: 'Todos', label: 'Gestor: Todos' },
                { value: 'María García', label: 'María García' },
                { value: 'Juan López', label: 'Juan López' },
                { value: 'Rodrigo Muñoz', label: 'Rodrigo Muñoz' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Clients Data Table matching PDF Page 2 */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Teléfono</th>
                <th className="py-3 px-4 text-right">Saldo pendiente</th>
                <th className="py-3 px-4 text-center">Días de mora</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Último pago</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No se encontraron clientes con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                paginatedClients.map(client => (
                  <tr
                    key={client.id}
                    onClick={() => {
                      setSelectedClient(client);
                      setIsDrawerOpen(true);
                    }}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {client.code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-700">
                        {client.name}
                      </div>
                      <div className="text-[11px] text-slate-400">{client.segment}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {client.phone}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      <Currency amount={client.overdueBalance} />
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                          client.daysOverdue > 60
                            ? 'text-rose-700 bg-rose-50'
                            : client.daysOverdue > 30
                            ? 'text-amber-700 bg-amber-50'
                            : 'text-slate-700 bg-slate-100'
                        }`}
                      >
                        {client.daysOverdue}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusBadgeVariant(client.status)}>
                        {client.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {client.lastPaymentDate}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setSelectedClient(client);
                            setIsDrawerOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="Ver detalle del cliente"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedClient(client);
                            setIsNewActivityModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="Registrar llamada / gestión"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination matching PDF */}
        <div className="px-4 border-t border-slate-100">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredClients.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemLabel="clientes"
          />
        </div>
      </div>

      {/* Drawer: Detalle del cliente matching PDF Page 2 Top */}
      {selectedClient && (
        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title="Detalle del cliente"
          badge={
            <Badge variant={getStatusBadgeVariant(selectedClient.status)}>
              {selectedClient.status}
            </Badge>
          }
          width="lg"
          footer={
            <div className="w-full flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsDrawerOpen(false);
                  setIsNewActivityModalOpen(true);
                }}
                leftIcon={<PhoneCall className="w-3.5 h-3.5" />}
              >
                Registrar gestión
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsDrawerOpen(false)}
              >
                Cerrar Detalle
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Client Profile Card */}
            <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100">
              <Avatar
                initials={selectedClient.name.slice(0, 2).toUpperCase()}
                size="lg"
                className="bg-blue-700 text-white font-bold"
              />
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">{selectedClient.name}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono">{selectedClient.code}</span>
                  <span>·</span>
                  <span>Cliente desde: {selectedClient.clientSince}</span>
                </div>
                <div className="pt-1 flex flex-col gap-1 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{selectedClient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedClient.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedClient.address}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Overview Cards matching PDF */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Saldo pendiente
                </span>
                <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                  <Currency amount={selectedClient.overdueBalance} />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Último pago: {selectedClient.lastPaymentDate}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Días de mora
                </span>
                <div className="text-lg font-bold text-rose-600 font-mono mt-0.5">
                  {selectedClient.daysOverdue} días
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Crédito: {selectedClient.segment}
                </span>
              </div>
            </div>

            {/* Predictive Intelligence Gauge */}
            <PredictiveScoreGauge
              score={selectedClient.riskScore}
              probability={selectedClient.recoveryProbability}
              riskLevel={selectedClient.predictedDefaultRisk}
            />

            {/* Predictive Action Suggestion */}
            <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-blue-900">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Recomendación del Motor de Cobranza:</span>
              </div>
              <p className="text-blue-950">{selectedClient.suggestedAction}</p>
              <div className="flex items-center gap-3 text-[11px] text-blue-800 pt-1">
                <span>Canal óptimo: <strong>{selectedClient.recommendedChannel}</strong></span>
                <span>·</span>
                <span>Horario sugerido: <strong>{selectedClient.recommendedBestHour}</strong></span>
              </div>
            </div>

            {/* Recent History matching PDF Page 2 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Historial reciente
                </h5>
                <span className="text-[11px] text-slate-400">
                  {selectedClient.history.length} eventos registrados
                </span>
              </div>

              <div className="space-y-2.5">
                {selectedClient.history.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    No hay gestiones recientes registradas para este cliente.
                  </p>
                ) : (
                  selectedClient.history.map(item => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border border-slate-200/80 bg-white text-xs space-y-1 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{item.type}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{item.notes}</p>
                      <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 border-t border-slate-100">
                        <span className="font-medium text-blue-700">{item.result}</span>
                        <span>Gestor: {item.user}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions at bottom of Drawer matching PDF */}
            <div className="pt-2 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Acciones rápidas</span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsNewActivityModalOpen(true)}
                  leftIcon={<Phone className="w-3.5 h-3.5" />}
                >
                  Registrar gestión
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/convenios'}
                  leftIcon={<CreditCard className="w-3.5 h-3.5" />}
                >
                  Ver convenios
                </Button>
              </div>
            </div>
          </div>
        </Drawer>
      )}

      {/* Modal: Nuevo Cliente */}
      <Modal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        title="Nuevo cliente"
        subtitle="Registrar un nuevo cliente en el sistema de créditos en mora"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateClient} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Nombre completo"
              required
              value={newClientData.name}
              onChange={e => setNewClientData({ ...newClientData, name: e.target.value })}
              placeholder="Ej. Roberto Morales"
            />
            <Input
              label="NIT"
              value={newClientData.nit}
              onChange={e => setNewClientData({ ...newClientData, nit: e.target.value })}
              placeholder="Ej. 1234567-8"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Teléfono"
              required
              value={newClientData.phone}
              onChange={e => setNewClientData({ ...newClientData, phone: e.target.value })}
              placeholder="Ej. 5530-9988"
            />
            <Input
              label="Correo electrónico"
              type="email"
              value={newClientData.email}
              onChange={e => setNewClientData({ ...newClientData, email: e.target.value })}
              placeholder="cliente@correo.gt"
            />
          </div>

          <Input
            label="Dirección"
            value={newClientData.address}
            onChange={e => setNewClientData({ ...newClientData, address: e.target.value })}
            placeholder="Zona, Municipio, Departamento"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Saldo pendiente (Q)"
              type="number"
              step="0.01"
              required
              value={newClientData.overdueBalance}
              onChange={e => setNewClientData({ ...newClientData, overdueBalance: e.target.value })}
              placeholder="15000.00"
            />
            <Input
              label="Días de mora"
              type="number"
              required
              value={newClientData.daysOverdue}
              onChange={e => setNewClientData({ ...newClientData, daysOverdue: e.target.value })}
              placeholder="45"
            />
            <Select
              label="Segmento"
              value={newClientData.segment}
              onChange={e => setNewClientData({ ...newClientData, segment: e.target.value as any })}
              options={[
                { value: 'Consumo', label: 'Consumo' },
                { value: 'PYME', label: 'PYME' },
                { value: 'Tarjeta de crédito', label: 'Tarjeta de crédito' },
                { value: 'Microcréditos', label: 'Microcréditos' },
                { value: 'Hipotecario', label: 'Hipotecario' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Estado inicial"
              value={newClientData.status}
              onChange={e => setNewClientData({ ...newClientData, status: e.target.value as any })}
              options={[
                { value: 'En gestión', label: 'En gestión' },
                { value: 'Convenio vigente', label: 'Convenio vigente' },
                { value: 'Demanda judicial', label: 'Demanda judicial' },
                { value: 'Al día', label: 'Al día' },
              ]}
            />
            <Select
              label="Gestor asignado"
              value={newClientData.assignedManager}
              onChange={e => setNewClientData({ ...newClientData, assignedManager: e.target.value })}
              options={[
                { value: 'María García', label: 'María García' },
                { value: 'Juan López', label: 'Juan López' },
                { value: 'Rodrigo Muñoz', label: 'Rodrigo Muñoz' },
              ]}
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewClientModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Guardar cliente
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Registrar Gestión de Cobro */}
      <Modal
        isOpen={isNewActivityModalOpen}
        onClose={() => setIsNewActivityModalOpen(false)}
        title="Registrar gestión de cobro"
        subtitle={`Para: ${selectedClient?.name || 'Cliente'} (${selectedClient?.code || ''})`}
        maxWidth="md"
      >
        <form onSubmit={handleRegisterActivity} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Canal / Tipo de gestión"
              value={activityData.type}
              onChange={e => setActivityData({ ...activityData, type: e.target.value as any })}
              options={[
                { value: 'Llamada telefónica', label: 'Llamada telefónica' },
                { value: 'Mensaje WhatsApp', label: 'Mensaje WhatsApp' },
                { value: 'Visita de campo', label: 'Visita de campo' },
                { value: 'Correo electrónico', label: 'Correo electrónico' },
              ]}
            />

            <Select
              label="Resultado de gestión"
              value={activityData.result}
              onChange={e => setActivityData({ ...activityData, result: e.target.value as any })}
              options={[
                { value: 'Promesa de pago', label: 'Promesa de pago' },
                { value: 'Contacto sin acuerdo', label: 'Contacto sin acuerdo' },
                { value: 'No contesta', label: 'No contesta' },
                { value: 'Convenio acordado', label: 'Convenio acordado' },
                { value: 'Número equivocado', label: 'Número equivocado' },
              ]}
            />
          </div>

          {activityData.result === 'Promesa de pago' && (
            <Input
              label="Monto prometido de abono (Q)"
              type="number"
              step="0.01"
              value={activityData.amountPromised}
              onChange={e => setActivityData({ ...activityData, amountPromised: e.target.value })}
              placeholder="Ej. 2500.00"
            />
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notas y observaciones de la gestión
            </label>
            <textarea
              required
              rows={3}
              value={activityData.notes}
              onChange={e => setActivityData({ ...activityData, notes: e.target.value })}
              placeholder="Detallar comentarios del deudor, compromisos y justificación..."
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F1E36]/20 focus:border-[#0F1E36]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Fecha próxima acción"
              type="date"
              value={activityData.nextActionDate}
              onChange={e => setActivityData({ ...activityData, nextActionDate: e.target.value })}
            />
            <Input
              label="Objetivo próximo"
              value={activityData.nextActionNote}
              onChange={e => setActivityData({ ...activityData, nextActionNote: e.target.value })}
              placeholder="Ej. Confirmar boleta de depósito"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewActivityModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Registrar gestión
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
