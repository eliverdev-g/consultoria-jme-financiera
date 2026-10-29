import React, { useState } from 'react';
import { 
  FileDown, 
  FileSpreadsheet, 
  BarChart3, 
  Users, 
  Coins, 
  Percent, 
  TrendingUp, 
  PieChart as PieIcon,
  Calendar,
  Filter
} from 'lucide-react';
import { StatCard } from '../components/molecules/StatCard';
import { Card } from '../components/atoms/Card';
import { Button } from '../components/atoms/Button';
import { Currency } from '../components/atoms/Currency';
import { Select } from '../components/atoms/Select';
import { 
  PORTFOLIO_SEGMENTS, 
  DELINQUENCY_RANGES, 
  MONTHLY_RECOVERY, 
  PORTFOLIO_STATUS_DISTRIBUTION 
} from '../data/mockData';
import { exportToCSV, printToPDF } from '../utils/exportUtils';

export const ReportesPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('01/01/2024 - 22/05/2025');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [delinquencyFilter, setDelinquencyFilter] = useState('Todos');
  const [exportFormat, setExportFormat] = useState('PDF');

  const totalOverdue = 12845620.35;
  const totalClients = 2458;
  const totalRecovered = 3215480.75;
  const totalRate = 25.03;

  const handleExportExcel = () => {
    const headers = ['Segmento', 'Clientes', 'Saldo Total (Q)', 'Monto Recuperado (Q)', '% Recuperación', 'Tasa de Mora'];
    const rows = PORTFOLIO_SEGMENTS.map(s => [
      s.segment,
      s.clientsCount,
      s.totalBalance,
      s.recoveredAmount,
      `${s.recoveryPercentage}%`,
      `${s.defaultRate}%`,
    ]);
    rows.push([
      'Total general',
      totalClients,
      totalOverdue,
      totalRecovered,
      `${totalRate}%`,
      '7.91%',
    ]);
    exportToCSV('JME_Reporte_Cartera_Vencida', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header matching PDF Page 1 Top */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Reportes de cartera vencida
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Análisis y estadísticas de la cartera en mora para una gestión eficiente de crédito.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={printToPDF}
            leftIcon={<FileDown className="w-4 h-4 text-rose-600" />}
          >
            Exportar PDF
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportExcel}
            leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-400" />}
          >
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Filter Row matching PDF */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Rango de fecha
          </label>
          <input
            type="text"
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 px-3 py-2"
          />
        </div>

        <div>
          <Select
            label="Estado"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            options={[
              { value: 'Todos', label: 'Todos' },
              { value: 'En gestión', label: 'En gestión' },
              { value: 'Convenio vigente', label: 'Convenio vigente' },
              { value: 'Demanda judicial', label: 'Demanda judicial' },
              { value: 'Castigada', label: 'Castigada' },
            ]}
          />
        </div>

        <div>
          <Select
            label="Rango de mora (días)"
            value={delinquencyFilter}
            onChange={e => setDelinquencyFilter(e.target.value)}
            options={[
              { value: 'Todos', label: 'Todos' },
              { value: '1-30', label: '1 - 30 días' },
              { value: '31-60', label: '31 - 60 días' },
              { value: '61-90', label: '61 - 90 días' },
              { value: '91-120', label: '91 - 120 días' },
              { value: '121-180', label: '121 - 180 días' },
              { value: '180+', label: '180+ días' },
            ]}
          />
        </div>

        <div>
          <Select
            label="Formato de exportación"
            value={exportFormat}
            onChange={e => setExportFormat(e.target.value)}
            options={[
              { value: 'PDF', label: 'Documento PDF (.pdf)' },
              { value: 'Excel', label: 'Hoja de Cálculo Excel (.xlsx)' },
              { value: 'CSV', label: 'Valores por Coma (.csv)' },
            ]}
          />
        </div>
      </div>

      {/* Top 4 Primary KPIs matching PDF */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Cartera vencida total"
          value={<Currency amount={totalOverdue} />}
          icon={<BarChart3 className="w-5 h-5" />}
          iconColor="blue"
          subtitle="Saldo global en mora auditado"
        />

        <StatCard
          label="Clientes en mora"
          value={totalClients.toLocaleString('es-GT')}
          icon={<Users className="w-5 h-5" />}
          iconColor="emerald"
          subtitle="Padrón crediticio atrasado"
        />

        <StatCard
          label="Monto recuperado (Q)"
          value={<Currency amount={totalRecovered} />}
          icon={<Coins className="w-5 h-5" />}
          iconColor="amber"
          subtitle="Cobranza efectiva ingresada"
        />

        <StatCard
          label="% Recuperación"
          value={`${totalRate}%`}
          icon={<Percent className="w-5 h-5" />}
          iconColor="purple"
          subtitle="Efectividad sobre saldo mora"
        />
      </div>

      {/* Visual Analytics Grid matching PDF Page 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Cartera vencida por rangos de mora */}
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Cartera vencida por rangos de mora
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Q en millones</span>
          </div>

          <div className="space-y-3 pt-2">
            {DELINQUENCY_RANGES.map(item => {
              const maxAmount = 5000000;
              const pct = (item.amount / maxAmount) * 100;
              return (
                <div key={item.range} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{item.range}</span>
                    <span className="font-mono font-bold text-slate-900">
                      <Currency amount={item.amount} />
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                    <div
                      className="bg-[#0F1E36] h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Chart 2: Recuperación por mes */}
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Recuperación por mes
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Dic 2024 - May 2025</span>
          </div>

          <div className="space-y-3 pt-2">
            {MONTHLY_RECOVERY.map(item => {
              const maxVal = 700000;
              const pct = (item.amount / maxVal) * 100;
              return (
                <div key={item.month} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{item.month}</span>
                    <span className="font-mono font-bold text-blue-700">
                      <Currency amount={item.amount} />
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Chart 3: Cartera vencida por estado matching PDF */}
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Cartera vencida por estado
            </h3>
            <PieIcon className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3 pt-1">
            {PORTFOLIO_STATUS_DISTRIBUTION.map(item => (
              <div key={item.status} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-slate-700">{item.status}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">{item.percentage}%</span>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-500">
                  <Currency amount={item.amount} />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between text-xs font-bold text-slate-900">
            <span>Total:</span>
            <Currency amount={totalOverdue} />
          </div>
        </Card>
      </div>

      {/* Table: Resumen por segmento matching PDF Page 1 */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Resumen por segmento
          </h3>
          <span className="text-xs text-slate-400">Desglose de cartera y efectividad de recupero</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-5">Segmento</th>
                <th className="py-3 px-4 text-center">Clientes</th>
                <th className="py-3 px-4 text-right">Saldo (Q)</th>
                <th className="py-3 px-4 text-right">Recuperación (Q)</th>
                <th className="py-3 px-4 text-center">% Recup.</th>
                <th className="py-3 px-4 text-center">Tasa mora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PORTFOLIO_SEGMENTS.map(seg => (
                <tr key={seg.segment} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-slate-900">
                    {seg.segment}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-700">
                    {seg.clientsCount.toLocaleString('es-GT')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    <Currency amount={seg.totalBalance} />
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-700 font-semibold">
                    <Currency amount={seg.recoveredAmount} />
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-700">
                    {seg.recoveryPercentage.toFixed(2)}%
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-medium text-rose-600">
                    {seg.defaultRate.toFixed(2)}%
                  </td>
                </tr>
              ))}
              {/* Grand Total row matching PDF */}
              <tr className="bg-slate-50/90 font-bold border-t-2 border-slate-200 text-slate-900">
                <td className="py-3.5 px-5">Total general</td>
                <td className="py-3.5 px-4 text-center font-mono">
                  {totalClients.toLocaleString('es-GT')}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-slate-900">
                  <Currency amount={totalOverdue} />
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-700">
                  <Currency amount={totalRecovered} />
                </td>
                <td className="py-3.5 px-4 text-center font-mono">
                  {totalRate.toFixed(2)}%
                </td>
                <td className="py-3.5 px-4 text-center font-mono text-rose-700">
                  7.91%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
