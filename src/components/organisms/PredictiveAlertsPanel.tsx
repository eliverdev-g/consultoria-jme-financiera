import React, { useState } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  Phone, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Send,
  Zap
} from 'lucide-react';
import { Drawer } from '../molecules/Drawer';
import { Button } from '../atoms/Button';
import { Currency } from '../atoms/Currency';
import { useData } from '../../context/DataContext';
import { PredictiveAlert } from '../../types';

interface PredictiveAlertsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PredictiveAlertsPanel: React.FC<PredictiveAlertsPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const { alerts, resolveAlert, triggerPredictiveBatch, addActivity } = useData();
  const [activeTab, setActiveTab] = useState<'todas' | 'criticas' | 'altas'>('todas');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const filteredAlerts = alerts.filter(a => {
    if (activeTab === 'criticas') return a.severity === 'Crítico';
    if (activeTab === 'altas') return a.severity === 'Alto';
    return true;
  });

  const handleExecuteAutomatedAction = (alert: PredictiveAlert) => {
    // Register simulated automatic activity
    addActivity({
      date: new Date().toLocaleDateString('es-GT'),
      time: new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }),
      collectorId: 'sys-auto',
      collectorName: 'Cobranza Automatizada Predictiva (IA)',
      clientId: alert.clientId,
      clientName: alert.clientName,
      clientCode: alert.clientCode,
      debtAmount: alert.amount,
      type: alert.recommendedChannel === 'WhatsApp' ? 'Mensaje WhatsApp' : 'Llamada telefónica',
      result: 'Promesa de pago',
      notes: `Alerta predictiva ejecutada: ${alert.title}. Se activó canal ${alert.recommendedChannel} en ventana óptima ${alert.bestContactWindow}.`,
      nextActionDate: 'En 3 días',
      nextActionTime: '10:00',
      nextActionNote: 'Validación de acreditación bancaria automática',
      status: 'En seguimiento',
      amountPromised: alert.amount * 0.3,
    });

    resolveAlert(alert.id);
    setActionSuccessMessage(`¡Acción automática enviada para ${alert.clientName}! Se notificó por ${alert.recommendedChannel} y se registró en su expediente.`);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Alertas Predictivas de Cobranza"
      subtitle="Optimización automatizada de recuperación de cartera y mitigación de mora"
      badge={
        <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
          <Sparkles className="w-3 h-3 text-blue-600" />
          Motor IA Activo
        </span>
      }
      width="xl"
      footer={
        <div className="w-full flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerPredictiveBatch}
            leftIcon={<Zap className="w-3.5 h-3.5 text-amber-500" />}
          >
            Recalcular Predicciones
          </Button>
          <Button variant="primary" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Success toast */}
        {actionSuccessMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {/* Predictive Summary Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#0F1E36] to-[#1A3258] text-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
              Diagnóstico Predictivo de Cartera
            </span>
            <span className="text-xs bg-blue-500/30 px-2 py-0.5 rounded text-blue-200 font-mono">
              Q 78,820.75 en riesgo mitigable
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            El sistema evalúa variables de comportamiento de pago, antigüedad de deuda y respuesta multicanal para priorizar gestiones con mayor probabilidad de recupero hoy.
          </p>
        </div>

        {/* Tab filters */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('todas')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'todas'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todas ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTab('criticas')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'criticas'
                ? 'bg-rose-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Críticas ({alerts.filter(a => a.severity === 'Crítico').length})
          </button>
          <button
            onClick={() => setActiveTab('altas')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'altas'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Prioridad Alta ({alerts.filter(a => a.severity === 'Alto').length})
          </button>
        </div>

        {/* Alert Cards */}
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              <p className="text-sm font-medium text-slate-600">No hay alertas en este filtro</p>
              <p className="text-xs text-slate-400">Todas las acciones predictivas han sido atendidas.</p>
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const isCrit = alert.severity === 'Crítico';
              const isResolved = alert.status === 'Resuelta';

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isResolved
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : isCrit
                      ? 'bg-rose-50/40 border-rose-200/90 shadow-2xs'
                      : 'bg-white border-slate-200/90 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase ${
                          isCrit
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">{alert.clientName}</span>
                      <span className="text-xs text-slate-400 font-mono">({alert.clientCode})</span>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900 font-mono">
                        <Currency amount={alert.amount} />
                      </div>
                      <div className="text-[10px] text-slate-400">{alert.daysOverdue} días de mora</div>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <AlertTriangle className={`w-3.5 h-3.5 ${isCrit ? 'text-rose-600' : 'text-amber-600'}`} />
                    {alert.title}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {alert.description}
                  </p>

                  {/* Prediction metrics row */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 mb-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Horario Óptimo:</span>
                      <strong className="text-slate-800 font-mono">{alert.bestContactWindow}</strong>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600 justify-end">
                      {alert.recommendedChannel === 'WhatsApp' ? (
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                      )}
                      <span>Canal:</span>
                      <strong className="text-slate-800">{alert.recommendedChannel}</strong>
                    </div>
                  </div>

                  {/* Action recommendation */}
                  <div className="text-xs text-slate-700 bg-blue-50/60 p-2 rounded-lg border border-blue-100/80 mb-3 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-blue-900">Sugerencia del motor: </span>
                      <span>{alert.suggestedAction}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">{alert.createdAt}</span>

                    {isResolved ? (
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Atendida
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          Ignorar
                        </button>
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={() => handleExecuteAutomatedAction(alert)}
                          leftIcon={<Send className="w-3 h-3" />}
                        >
                          Ejecutar Acción Automatizada
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Drawer>
  );
};
