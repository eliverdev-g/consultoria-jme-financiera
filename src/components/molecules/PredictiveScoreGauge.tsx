import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';

interface PredictiveScoreGaugeProps {
  score: number; // 0-100
  probability: number; // 0-100%
  riskLevel: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
  className?: string;
}

export const PredictiveScoreGauge: React.FC<PredictiveScoreGaugeProps> = ({
  score,
  probability,
  riskLevel,
  className = '',
}) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Crítico':
        return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'Alto':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Medio':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    }
  };

  return (
    <div className={`p-4 rounded-xl border border-slate-200/90 bg-slate-50/70 space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Scoring Predictivo de Cobranza</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded font-medium border ${getRiskColor(riskLevel)}`}>
          Riesgo {riskLevel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Índice de Riesgo</span>
            <AlertTriangle className="w-3 h-3 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
            {score}<span className="text-xs text-slate-400 font-normal">/100</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${score > 75 ? 'bg-rose-500' : score > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Propensión Pago</span>
            <TrendingUp className="w-3 h-3 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
            {probability}<span className="text-xs text-slate-400 font-normal">%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${probability > 70 ? 'bg-emerald-500' : probability > 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${probability}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
