import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Handshake, 
  TrendingUp, 
  AlertCircle, 
  Sparkles, 
  Clock, 
  ArrowUpRight,
  PhoneCall,
  CalendarCheck
} from 'lucide-react';
import { StatCard } from '../components/molecules/StatCard';
import { Card } from '../components/atoms/Card';
import { Button } from '../components/atoms/Button';
import { Currency } from '../components/atoms/Currency';
import { Badge } from '../components/atoms/Badge';
import { useData } from '../context/DataContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { clients, agreements, activities, alerts, triggerPredictiveBatch } = useData();

  const totalOverdue = 12845620.35;
  const clientsInArrears = 2458;
  const recoveredAmount = 3215480.75;
  const recoveryRate = 25.03;

  const criticalAlerts = alerts.filter(a => a.severity === 'Crítico');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Panel de Control General
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Gestión de Créditos en Mora y Cobranza Predictiva
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Supervisión en tiempo real de carteras, convenios acordados y sugerencias automatizadas de cobro.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerPredictiveBatch}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-blue-600" />}
          >
            Actualizar Algoritmo
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/reportes')}
            rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
          >
            Ver Reporte Completo
          </Button>
        </div>
      </div>

      {/* Top 4 Primary KPIs matching PDF */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Cartera Vencida Total"
          value={<Currency amount={totalOverdue} />}
          icon={<AlertCircle className="w-5 h-5" />}
          iconColor="rose"
          subtitle="Saldo global en mora activa"
          trend={{ value: '2.4% vs mes anterior', isPositive: false }}
        />

        <StatCard
          label="Clientes en Mora"
          value={clientsInArrears.toLocaleString('es-GT')}
          icon={<Users className="w-5 h-5" />}
          iconColor="blue"
          subtitle="842 clientes en gestión directa"
          trend={{ value: '18 casos nuevos hoy', isPositive: false }}
        />

        <StatCard
          label="Monto Recuperado (Q)"
          value={<Currency amount={recoveredAmount} />}
          icon={<TrendingUp className="w-5 h-5" />}
          iconColor="emerald"
          subtitle="Recaudación acumulada del mes"
          trend={{ value: '+8.5% meta cumplida', isPositive: true }}
        />

        <StatCard
          label="% Recuperación"
          value={`${recoveryRate}%`}
          icon={<Handshake className="w-5 h-5" />}
          iconColor="purple"
          subtitle="64 convenios activos al 78% de pago"
          trend={{ value: '+3.1% eficacia', isPositive: true }}
        />
      </div>

      {/* Predictive Intelligence Feature Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Automated Predictive Alert Queue */}
        <div className="lg:col-span-2 space-y-4">
          <Card padding="md">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Alertas Predictivas de Cobranza Prioritaria</h3>
                  <p className="text-xs text-slate-500">Casos identificados por scoring para contacto en ventana óptima hoy</p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold font-mono">
                {criticalAlerts.length} Casos Críticos
              </span>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {alerts.slice(0, 3).map(alert => (
                <div key={alert.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{alert.clientName}</span>
                      <span className="text-xs text-slate-400 font-mono">({alert.clientCode})</span>
                      <Badge variant={alert.severity === 'Crítico' ? 'danger' : 'warning'}>
                        Riesgo {alert.predictedProbability}%
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">{alert.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Ventana: <strong className="text-slate-700">{alert.bestContactWindow}</strong>
                      </span>
                      <span>·</span>
                      <span>Canal sugerido: <strong className="text-slate-700">{alert.recommendedChannel}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900 font-mono">
                        <Currency amount={alert.amount} />
                      </div>
                      <div className="text-[10px] text-slate-400">{alert.daysOverdue} días de mora</div>
                    </div>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => navigate('/clientes')}
                    >
                      Gestionar
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Mostrando top prioridades del modelo predictivo</span>
              <button
                onClick={() => navigate('/clientes')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Ver todos los clientes en mora →
              </button>
            </div>
          </Card>

          {/* Quick Access Grid to Modules */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card
              padding="sm"
              className="p-4 hover:border-blue-400 transition-colors cursor-pointer group"
              onClick={() => navigate('/convenios')}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Convenios de Pago</span>
                <Handshake className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-lg font-bold text-slate-900 font-mono">64 Activos</div>
              <p className="text-[11px] text-slate-500 mt-1">Q 1,245,680.00 financiados</p>
            </Card>

            <Card
              padding="sm"
              className="p-4 hover:border-blue-400 transition-colors cursor-pointer group"
              onClick={() => navigate('/gestores')}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Gestores de Cobro</span>
                <PhoneCall className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-lg font-bold text-slate-900 font-mono">24 en Turno</div>
              <p className="text-[11px] text-slate-500 mt-1">16 contactos efectivos hoy</p>
            </Card>

            <Card
              padding="sm"
              className="p-4 hover:border-blue-400 transition-colors cursor-pointer group"
              onClick={() => navigate('/reportes')}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Cartera Vencida</span>
                <CalendarCheck className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-lg font-bold text-slate-900 font-mono">5 Segmentos</div>
              <p className="text-[11px] text-slate-500 mt-1">Exportar PDF y Excel</p>
            </Card>
          </div>
        </div>

        {/* Right Col: Recovery Distribution & Recent Collector Activity */}
        <div className="space-y-4">
          {/* Recovery by portfolio status */}
          <Card padding="md" className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Distribución de Cartera Vencida</h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">En gestión (55.4%)</span>
                  <span className="font-mono text-slate-900 font-bold">Q 7,116,473.67</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '55.4%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Convenio vigente (22.8%)</span>
                  <span className="font-mono text-slate-900 font-bold">Q 2,928,801.44</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-teal-600 h-full rounded-full" style={{ width: '22.8%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Demanda judicial (15.4%)</span>
                  <span className="font-mono text-slate-900 font-bold">Q 1,978,225.53</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '15.4%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Castigada (6.4%)</span>
                  <span className="font-mono text-slate-900 font-bold">Q 822,119.71</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: '6.4%' }} />
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600">
              <span className="font-semibold text-slate-900">Total Auditado:</span>{' '}
              <Currency amount={totalOverdue} className="font-bold text-slate-900 ml-1" />
            </div>
          </Card>

          {/* Recent Collector Activity feed */}
          <Card padding="md">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Últimas Gestiones de Cobranza</h3>
            <div className="space-y-3">
              {activities.slice(0, 3).map(act => (
                <div key={act.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{act.clientName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{act.date} {act.time}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <Badge variant={act.result === 'Promesa de pago' ? 'success' : 'neutral'}>
                      {act.result}
                    </Badge>
                    <span className="text-[11px] text-slate-500">{act.collectorName}</span>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="xs"
              className="w-full mt-3"
              onClick={() => navigate('/gestores')}
            >
              Ver bitácora de gestiones
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
