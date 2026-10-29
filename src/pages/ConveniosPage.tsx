import React, { useState } from 'react';
import { 
  FileText, 
  Coins, 
  CalendarClock, 
  Percent, 
  Plus, 
  Download, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Building,
  User,
  Calendar,
  CreditCard,
  Printer
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
import { PaymentAgreement } from '../types';
import { exportToCSV, printToPDF } from '../utils/exportUtils';

export const ConveniosPage: React.FC = () => {
  const { agreements, clients, addAgreement } = useData();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [managerFilter, setManagerFilter] = useState('Todos');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Drawer & Modal States
  const [selectedAgreement, setSelectedAgreement] = useState<PaymentAgreement | null>(
    agreements[0] || null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNewAgreementModalOpen, setIsNewAgreementModalOpen] = useState(false);

  // New Agreement Form
  const [newAgreementData, setNewAgreementData] = useState({
    clientId: '',
    clientName: '',
    clientNit: '',
    totalDebt: '',
    agreedAmount: '',
    initialBalance: '',
    installmentsCount: '10',
    frequency: 'Mensual' as const,
    startDate: new Date().toLocaleDateString('es-GT'),
    nextPaymentDate: '25/05/2025',
    responsibleManager: 'María García',
    observations: 'Convenio formalizado tras negociación de facilidades de pago.',
    createdBy: 'María García',
  });

  // Filter agreements
  const filteredAgreements = agreements.filter(cov => {
    const matchesSearch =
      cov.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cov.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cov.clientNit.includes(searchTerm);

    const matchesStatus = statusFilter === 'Todos' || cov.status === statusFilter;
    const matchesManager = managerFilter === 'Todos' || cov.responsibleManager === managerFilter;

    return matchesSearch && matchesStatus && matchesManager;
  });

  const totalPages = Math.ceil(filteredAgreements.length / itemsPerPage) || 1;
  const paginatedAgreements = filteredAgreements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: PaymentAgreement['status']): BadgeVariant => {
    switch (status) {
      case 'Al día':
        return 'success';
      case 'Activo':
        return 'info';
      case 'Atrasado':
        return 'warning';
      case 'Incumplido':
        return 'danger';
      case 'Liquidado':
        return 'purple';
      default:
        return 'neutral';
    }
  };

  const handleCreateAgreement = (e: React.FormEvent) => {
    e.preventDefault();
    const agreedAmountNum = parseFloat(newAgreementData.agreedAmount) || 0;
    const created = addAgreement({
      clientId: newAgreementData.clientId || 'c-custom',
      clientName: newAgreementData.clientName,
      clientNit: newAgreementData.clientNit || 'CF',
      totalDebt: parseFloat(newAgreementData.totalDebt) || agreedAmountNum,
      agreedAmount: agreedAmountNum,
      initialBalance: parseFloat(newAgreementData.initialBalance) || agreedAmountNum,
      installmentsCount: parseInt(newAgreementData.installmentsCount, 10) || 10,
      frequency: newAgreementData.frequency,
      startDate: newAgreementData.startDate,
      nextPaymentDate: newAgreementData.nextPaymentDate,
      responsibleManager: newAgreementData.responsibleManager,
      observations: newAgreementData.observations,
      createdBy: newAgreementData.createdBy,
      status: 'Al día',
      installments: [],
    });

    setIsNewAgreementModalOpen(false);
    setSelectedAgreement(created);
    setIsDrawerOpen(true);
  };

  const handleSelectClient = (clientId: string) => {
    const found = clients.find(c => c.id === clientId);
    if (found) {
      setNewAgreementData({
        ...newAgreementData,
        clientId: found.id,
        clientName: found.name,
        clientNit: found.nit,
        totalDebt: found.overdueBalance.toString(),
        agreedAmount: found.overdueBalance.toString(),
        initialBalance: found.overdueBalance.toString(),
      });
    }
  };

  const handleExportCSV = () => {
    const headers = ['Convenio', 'Cliente', 'NIT', 'Saldo Inicial', 'Monto Convenido', 'Cuotas', 'Próximo Pago', 'Estado', 'Gestor'];
    const rows = filteredAgreements.map(cov => [
      cov.code,
      cov.clientName,
      cov.clientNit,
      cov.initialBalance,
      cov.agreedAmount,
      cov.installmentsCount,
      cov.nextPaymentDate,
      cov.status,
      cov.responsibleManager,
    ]);
    exportToCSV('JME_Convenios_Pago', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Convenios de pago</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registra, consulta y da seguimiento a los convenios de pago acordados con tus clientes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewAgreementModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nuevo convenio
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

      {/* Top 4 KPIs matching PDF Page 1 Bottom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Convenios activos"
          value="64"
          icon={<FileText className="w-5 h-5" />}
          iconColor="blue"
          subtitle="Planes de refinanciamiento vigentes"
        />

        <StatCard
          label="Monto financiado"
          value={<Currency amount={1245680.00} />}
          icon={<Coins className="w-5 h-5" />}
          iconColor="emerald"
          subtitle="Capital pactado en cuotas"
        />

        <StatCard
          label="Convenios al día"
          value="18"
          icon={<CalendarClock className="w-5 h-5" />}
          iconColor="amber"
          subtitle="Sin atrasos en cuotas programadas"
        />

        <StatCard
          label="% Cumplimiento"
          value="78%"
          icon={<Percent className="w-5 h-5" />}
          iconColor="purple"
          subtitle="Tasa de pago sobre compromisos"
        />
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por código de convenio, cliente o NIT..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="w-40">
            <Select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              options={[
                { value: 'Todos', label: 'Estado: Todos' },
                { value: 'Al día', label: 'Al día' },
                { value: 'Atrasado', label: 'Atrasado' },
                { value: 'Incumplido', label: 'Incumplido' },
                { value: 'Liquidado', label: 'Liquidado' },
              ]}
            />
          </div>

          <div className="w-40">
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

      {/* Convenios Data Table matching PDF Page 1 */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Convenio</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4 text-right">Saldo inicial</th>
                <th className="py-3 px-4 text-right">Monto convenido</th>
                <th className="py-3 px-4 text-center">Cuotas</th>
                <th className="py-3 px-4">Próximo pago</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedAgreements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No se encontraron convenios registrados.
                  </td>
                </tr>
              ) : (
                paginatedAgreements.map(cov => (
                  <tr
                    key={cov.id}
                    onClick={() => {
                      setSelectedAgreement(cov);
                      setIsDrawerOpen(true);
                    }}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">
                      {cov.code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-700">
                        {cov.clientName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">NIT: {cov.clientNit}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      <Currency amount={cov.initialBalance} />
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      <Currency amount={cov.agreedAmount} />
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {cov.installmentsCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {cov.nextPaymentDate}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusBadge(cov.status)}>
                        {cov.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setSelectedAgreement(cov);
                            setIsDrawerOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="Ver detalle del convenio"
                        >
                          <Eye className="w-4 h-4" />
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
            totalItems={filteredAgreements.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemLabel="convenios"
          />
        </div>
      </div>

      {/* Drawer: Convenio COV-2025-0012 matching PDF Page 1 Bottom Right Panel */}
      {selectedAgreement && (
        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title={`Convenio ${selectedAgreement.code}`}
          badge={<Badge variant={getStatusBadge(selectedAgreement.status)}>{selectedAgreement.status}</Badge>}
          width="lg"
          footer={
            <div className="w-full flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={printToPDF}
                leftIcon={<Printer className="w-3.5 h-3.5" />}
              >
                Imprimir Convenio
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
            {/* Agreement Info Section matching PDF */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Información del convenio
              </h4>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Cliente:</span>
                  <strong className="text-slate-900 block">{selectedAgreement.clientName}</strong>
                  <span className="text-slate-500 font-mono text-[11px]">NIT: {selectedAgreement.clientNit}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Monto convenido:</span>
                  <strong className="text-slate-900 font-mono text-sm block">
                    <Currency amount={selectedAgreement.agreedAmount} />
                  </strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Fecha de inicio:</span>
                  <span className="text-slate-800 font-mono">{selectedAgreement.startDate}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Cuotas acordadas:</span>
                  <span className="text-slate-800 font-mono font-semibold">{selectedAgreement.installmentsCount} cuotas</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Frecuencia de pago:</span>
                  <span className="text-slate-800">{selectedAgreement.frequency}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Próximo pago:</span>
                  <span className="text-blue-700 font-mono font-semibold">{selectedAgreement.nextPaymentDate}</span>
                </div>

                <div className="col-span-2 pt-1 border-t border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Gestor responsable:</span>
                  <span className="text-slate-800 font-medium">{selectedAgreement.responsibleManager}</span>
                </div>
              </div>
            </div>

            {/* Financial Overview Cards matching PDF (Q 10,000 paid vs Q 15,000 pending) */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Resumen financiero
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                  <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                    Monto pagado
                  </span>
                  <div className="text-lg font-bold text-emerald-900 font-mono mt-0.5">
                    <Currency amount={selectedAgreement.amountPaid} />
                  </div>
                  <span className="text-[11px] text-emerald-700 mt-1 block">
                    {selectedAgreement.agreedAmount > 0 
                      ? ((selectedAgreement.amountPaid / selectedAgreement.agreedAmount) * 100).toFixed(1)
                      : 0}% del total
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Saldo pendiente
                  </span>
                  <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                    <Currency amount={selectedAgreement.amountPending} />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Resta por amortizar
                  </span>
                </div>
              </div>
            </div>

            {/* Installment Schedule matching PDF */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Cronograma de cuotas
                </h4>
                <span className="text-[11px] text-slate-400">
                  {selectedAgreement.installments.length} cuotas programadas
                </span>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white text-xs">
                {selectedAgreement.installments.map(inst => (
                  <div key={inst.number} className="p-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px] flex items-center justify-center font-semibold">
                        {inst.number}
                      </span>
                      <span className="font-semibold text-slate-800">Cuota {inst.number}</span>
                      <span className="text-slate-400 font-mono text-[11px]">· {inst.dueDate}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-900">
                        <Currency amount={inst.amount} />
                      </span>
                      {inst.status === 'Pagado' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Pagado
                        </span>
                      ) : inst.status === 'Atrasado' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-medium border border-rose-200">
                          <AlertCircle className="w-3 h-3 text-rose-600" /> Atrasado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium border border-slate-200">
                          <Clock className="w-3 h-3 text-slate-400" /> Pendiente
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Observations matching PDF */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1.5">
              <span className="font-bold text-slate-800 block">Observaciones:</span>
              <p className="text-slate-600 leading-relaxed italic">
                "{selectedAgreement.observations}"
              </p>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200">
                Creado por {selectedAgreement.createdBy} · {selectedAgreement.createdAt}
              </div>
            </div>
          </div>
        </Drawer>
      )}

      {/* Modal: Nuevo Convenio */}
      <Modal
        isOpen={isNewAgreementModalOpen}
        onClose={() => setIsNewAgreementModalOpen(false)}
        title="Nuevo convenio de pago"
        subtitle="Registrar un acuerdo formal de refinanciamiento con cuotas calculadas"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateAgreement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Seleccionar cliente con saldo en mora
            </label>
            <select
              required
              value={newAgreementData.clientId}
              onChange={e => handleSelectClient(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg text-sm text-slate-900 px-3 py-2 focus:ring-2 focus:ring-[#0F1E36]/20"
            >
              <option value="">-- Seleccionar cliente --</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code}) - Deuda: Q {c.overdueBalance.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Nombre del cliente"
              required
              value={newAgreementData.clientName}
              onChange={e => setNewAgreementData({ ...newAgreementData, clientName: e.target.value })}
              placeholder="Ej. Distribuidora del Norte, S.A."
            />
            <Input
              label="NIT del cliente"
              value={newAgreementData.clientNit}
              onChange={e => setNewAgreementData({ ...newAgreementData, clientNit: e.target.value })}
              placeholder="123456-7"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Deuda total (Q)"
              type="number"
              step="0.01"
              required
              value={newAgreementData.totalDebt}
              onChange={e => setNewAgreementData({ ...newAgreementData, totalDebt: e.target.value })}
            />
            <Input
              label="Monto pactado (Q)"
              type="number"
              step="0.01"
              required
              value={newAgreementData.agreedAmount}
              onChange={e => setNewAgreementData({ ...newAgreementData, agreedAmount: e.target.value })}
            />
            <Input
              label="Número de cuotas"
              type="number"
              min="1"
              max="48"
              required
              value={newAgreementData.installmentsCount}
              onChange={e => setNewAgreementData({ ...newAgreementData, installmentsCount: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Frecuencia de cuotas"
              value={newAgreementData.frequency}
              onChange={e => setNewAgreementData({ ...newAgreementData, frequency: e.target.value as any })}
              options={[
                { value: 'Mensual', label: 'Mensual' },
                { value: 'Quincenal', label: 'Quincenal' },
                { value: 'Semanal', label: 'Semanal' },
              ]}
            />
            <Input
              label="Fecha de inicio"
              value={newAgreementData.startDate}
              onChange={e => setNewAgreementData({ ...newAgreementData, startDate: e.target.value })}
            />
            <Select
              label="Gestor responsable"
              value={newAgreementData.responsibleManager}
              onChange={e => setNewAgreementData({ ...newAgreementData, responsibleManager: e.target.value })}
              options={[
                { value: 'María García', label: 'María García' },
                { value: 'Juan López', label: 'Juan López' },
                { value: 'Rodrigo Muñoz', label: 'Rodrigo Muñoz' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observaciones y condiciones del acuerdo
            </label>
            <textarea
              rows={3}
              value={newAgreementData.observations}
              onChange={e => setNewAgreementData({ ...newAgreementData, observations: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F1E36]/20"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewAgreementModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Crear convenio formal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
