import React, { useState } from 'react';
import { 
  UserCheck, 
  PhoneCall, 
  Handshake, 
  Clock, 
  Plus, 
  Download, 
  Eye, 
  Phone, 
  MessageSquare, 
  Mail, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  MapPin,
  TrendingUp
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
import { useData } from '../context/DataContext';
import { CollectorActivity } from '../types';
import { exportToCSV } from '../utils/exportUtils';

export const GestoresPage: React.FC = () => {
  const { activities, clients, addActivity } = useData();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [managerFilter, setManagerFilter] = useState('Todos');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [dateFilter, setDateFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Drawer & Modal States
  const [selectedActivity, setSelectedActivity] = useState<CollectorActivity | null>(
    activities[0] || null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNewActivityModalOpen, setIsNewActivityModalOpen] = useState(false);

  // New Activity Form State
  const [formData, setFormData] = useState({
    collectorName: 'María García',
    clientName: 'Juan Carlos Pérez',
    clientCode: 'CLI-000210',
    debtAmount: '5040.00',
    type: 'Llamada telefónica' as const,
    result: 'Promesa de pago' as const,
    notes: 'Se acordó depósito bancario en 48 horas.',
    nextActionDate: '23/05/2025',
    nextActionTime: '10:00',
    nextActionNote: 'Llamada de confirmación de pago',
    amountPromised: '2000.00',
  });

  // Filter activities
  const filteredActivities = activities.filter(act => {
    const matchesSearch =
      act.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.collectorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.refCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.notes.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesManager = managerFilter === 'Todos' || act.collectorName === managerFilter;
    const matchesType = typeFilter === 'Todos' || act.type === typeFilter;
    const matchesDate = !dateFilter || act.date.includes(dateFilter);

    return matchesSearch && matchesManager && matchesType && matchesDate;
  });

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage) || 1;
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getResultBadge = (result: CollectorActivity['result']): BadgeVariant => {
    switch (result) {
      case 'Promesa de pago':
        return 'success';
      case 'Convenio acordado':
        return 'cyan';
      case 'Contacto sin acuerdo':
        return 'warning';
      case 'No contesta':
        return 'danger';
      case 'Número equivocado':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  const getChannelIcon = (type: CollectorActivity['type']) => {
    switch (type) {
      case 'Llamada telefónica':
        return <Phone className="w-3.5 h-3.5 text-blue-600" />;
      case 'Mensaje WhatsApp':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Visita de campo':
        return <MapPin className="w-3.5 h-3.5 text-purple-600" />;
      case 'Correo electrónico':
        return <Mail className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addActivity({
      date: new Date().toLocaleDateString('es-GT'),
      time: new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }),
      collectorId: 'u-1',
      collectorName: formData.collectorName,
      clientId: 'c-manual',
      clientName: formData.clientName,
      clientCode: formData.clientCode,
      debtAmount: parseFloat(formData.debtAmount) || 5000,
      type: formData.type,
      result: formData.result,
      notes: formData.notes,
      nextActionDate: formData.nextActionDate,
      nextActionTime: formData.nextActionTime,
      nextActionNote: formData.nextActionNote,
      status: 'Pendiente',
      amountPromised: formData.amountPromised ? parseFloat(formData.amountPromised) : undefined,
    });

    setIsNewActivityModalOpen(false);
    setSelectedActivity(created);
    setIsDrawerOpen(true);
  };

  const handleExportCSV = () => {
    const headers = ['Ref', 'Fecha', 'Hora', 'Gestor', 'Cliente', 'Deuda (Q)', 'Tipo', 'Resultado', 'Próxima Acción', 'Estado'];
    const rows = filteredActivities.map(act => [
      act.refCode,
      act.date,
      act.time,
      act.collectorName,
      act.clientName,
      act.debtAmount,
      act.type,
      act.result,
      `${act.nextActionDate} - ${act.nextActionNote}`,
      act.status,
    ]);
    exportToCSV('JME_Seguimiento_Gestores', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header matching PDF Page 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Seguimiento de gestores de cobro
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registra y monitorea llamadas, visitas, mensajes y resultados de cada gestión realizada.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewActivityModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nueva gestión
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

      {/* 4 KPIs matching PDF Page 3 Top */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Gestores hoy"
          value="24"
          icon={<UserCheck className="w-5 h-5" />}
          iconColor="blue"
          subtitle="Personal de cobranza activo"
        />

        <StatCard
          label="Contactos efectivos"
          value="16"
          icon={<PhoneCall className="w-5 h-5" />}
          iconColor="emerald"
          subtitle="Gestiones con respuesta directa"
          trend={{ value: '18% vs ayer', isPositive: true }}
        />

        <StatCard
          label="Promesas de pago"
          value="7"
          icon={<Handshake className="w-5 h-5" />}
          iconColor="amber"
          subtitle="Compromisos en fecha acordada"
          trend={{ value: '45% efectivas', isPositive: true }}
        />

        <StatCard
          label="Casos pendientes"
          value="23"
          icon={<Clock className="w-5 h-5" />}
          iconColor="purple"
          subtitle="Gestiones de seguimiento programadas"
          trend={{ value: '8 hoy', isPositive: false }}
        />
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por gestor, cliente o detalle de gestión..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

          <div className="w-40">
            <Select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              options={[
                { value: 'Todos', label: 'Tipo: Todos' },
                { value: 'Llamada telefónica', label: 'Llamada telefónica' },
                { value: 'Mensaje WhatsApp', label: 'Mensaje WhatsApp' },
                { value: 'Visita de campo', label: 'Visita de campo' },
                { value: 'Correo electrónico', label: 'Correo electrónico' },
              ]}
            />
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setManagerFilter('Todos');
              setTypeFilter('Todos');
              setDateFilter('');
            }}
            className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Gestiones Data Table matching PDF Page 3 */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Gestor</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Tipo de gestión</th>
                <th className="py-3 px-4">Resultado</th>
                <th className="py-3 px-4">Próxima acción</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedActivities.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No se encontraron gestiones con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                paginatedActivities.map(act => (
                  <tr
                    key={act.id}
                    onClick={() => {
                      setSelectedActivity(act);
                      setIsDrawerOpen(true);
                    }}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 font-mono text-slate-600">
                      <div>{act.date}</div>
                      <div className="text-[10px] text-slate-400">{act.time}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {act.collectorName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-700">
                        {act.clientName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{act.clientCode}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        {getChannelIcon(act.type)}
                        <span>{act.type}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getResultBadge(act.result)}>
                        {act.result}
                      </Badge>
                      {act.amountPromised && (
                        <div className="text-[10px] text-emerald-700 font-mono font-bold mt-0.5">
                          Q {act.amountPromised.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-800">{act.nextActionDate} {act.nextActionTime || ''}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">
                        {act.nextActionNote}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={act.status === 'Completada' ? 'success' : 'warning'}>
                        {act.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedActivity(act);
                          setIsDrawerOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-md transition-colors"
                        title="Ver detalle de la gestión"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
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
            totalItems={filteredActivities.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemLabel="gestiones"
          />
        </div>
      </div>

      {/* Drawer: Detalle de la gestión matching PDF Page 3 Right Panel */}
      {selectedActivity && (
        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title="Detalle de la gestión"
          badge={<Badge variant="success">Activa</Badge>}
          width="lg"
          footer={
            <div className="w-full flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  alert(`Confirmando reprogramación de próxima acción para ${selectedActivity.clientName}`);
                }}
                leftIcon={<Calendar className="w-3.5 h-3.5" />}
              >
                Reprogramar acción
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
            {/* Header Client Card */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
                  {selectedActivity.clientName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{selectedActivity.clientName}</h4>
                  <span className="text-xs text-slate-500 font-mono">{selectedActivity.refCode}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Deuda total:</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  <Currency amount={selectedActivity.debtAmount} />
                </span>
              </div>
            </div>

            {/* Quick summary grid matching PDF */}
            <div className="grid grid-cols-2 gap-3 text-xs p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
              <div>
                <span className="text-slate-400 block text-[11px]">Analista asignado:</span>
                <strong className="text-slate-800">{selectedActivity.collectorName}</strong>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Última gestión:</span>
                <span className="text-slate-800 font-mono font-semibold">{selectedActivity.date} {selectedActivity.time}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Canal preferido:</span>
                <span className="text-slate-800 font-medium">{selectedActivity.type}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Días de mora:</span>
                <span className="text-rose-600 font-mono font-bold">45 días</span>
              </div>
            </div>

            {/* Management Chronological History matching PDF Page 3 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Historial de gestiones
                </h4>
                <span className="text-[11px] text-slate-400">
                  {selectedActivity.history?.length || 1} registros
                </span>
              </div>

              <div className="space-y-3">
                {selectedActivity.history && selectedActivity.history.length > 0 ? (
                  selectedActivity.history.map((hist, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                          {hist.channel}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{hist.date}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{hist.summary}</p>
                      <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                        Gestor: <span className="text-slate-700 font-medium">{hist.agent}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-xl border border-slate-200 bg-white text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{selectedActivity.type}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{selectedActivity.date} {selectedActivity.time}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{selectedActivity.notes}</p>
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                      Gestor: <span className="text-slate-700 font-medium">{selectedActivity.collectorName}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Scheduled Next Action Box matching PDF Page 3 */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" /> Próxima acción
                </span>
                <span className="text-xs font-bold text-blue-800 font-mono">
                  {selectedActivity.nextActionDate} {selectedActivity.nextActionTime || '10:00'}
                </span>
              </div>
              <p className="text-xs text-blue-950 font-medium">
                {selectedActivity.nextActionNote}
              </p>
            </div>
          </div>
        </Drawer>
      )}

      {/* Modal: Nueva Gestión */}
      <Modal
        isOpen={isNewActivityModalOpen}
        onClose={() => setIsNewActivityModalOpen(false)}
        title="Nueva gestión de cobro"
        subtitle="Registrar contacto y resultado de gestión en tiempo real"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateActivity} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cliente a gestionar
              </label>
              <select
                required
                value={formData.clientName}
                onChange={e => {
                  const c = clients.find(cl => cl.name === e.target.value);
                  setFormData({
                    ...formData,
                    clientName: e.target.value,
                    clientCode: c?.code || 'CLI-000000',
                    debtAmount: c ? c.overdueBalance.toString() : '5000',
                  });
                }}
                className="w-full bg-white border border-slate-300 rounded-lg text-sm text-slate-900 px-3 py-2"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <Select
              label="Gestor responsable"
              value={formData.collectorName}
              onChange={e => setFormData({ ...formData, collectorName: e.target.value })}
              options={[
                { value: 'María García', label: 'María García' },
                { value: 'Juan López', label: 'Juan López' },
                { value: 'Rodrigo Muñoz', label: 'Rodrigo Muñoz' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Tipo / Canal"
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value as any })}
              options={[
                { value: 'Llamada telefónica', label: 'Llamada telefónica' },
                { value: 'Mensaje WhatsApp', label: 'Mensaje WhatsApp' },
                { value: 'Visita de campo', label: 'Visita de campo' },
                { value: 'Correo electrónico', label: 'Correo electrónico' },
              ]}
            />

            <Select
              label="Resultado del contacto"
              value={formData.result}
              onChange={e => setFormData({ ...formData, result: e.target.value as any })}
              options={[
                { value: 'Promesa de pago', label: 'Promesa de pago' },
                { value: 'Contacto sin acuerdo', label: 'Contacto sin acuerdo' },
                { value: 'No contesta', label: 'No contesta' },
                { value: 'Convenio acordado', label: 'Convenio acordado' },
                { value: 'Número equivocado', label: 'Número equivocado' },
              ]}
            />
          </div>

          {formData.result === 'Promesa de pago' && (
            <Input
              label="Monto prometido de pago (Q)"
              type="number"
              step="0.01"
              value={formData.amountPromised}
              onChange={e => setFormData({ ...formData, amountPromised: e.target.value })}
              placeholder="2000.00"
            />
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notas y bitácora de la gestión
            </label>
            <textarea
              required
              rows={3}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F1E36]/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Fecha próxima acción"
              value={formData.nextActionDate}
              onChange={e => setFormData({ ...formData, nextActionDate: e.target.value })}
            />
            <Input
              label="Objetivo próximo"
              value={formData.nextActionNote}
              onChange={e => setFormData({ ...formData, nextActionNote: e.target.value })}
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
              Guardar gestión
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
