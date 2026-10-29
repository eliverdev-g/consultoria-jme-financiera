import React from 'react';
import { Card } from '../atoms/Card';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  subtitle?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  iconColor?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'slate';
  className?: string;
}

const iconColorMap = {
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  purple: 'bg-purple-50 text-purple-600',
  rose: 'bg-rose-50 text-rose-600',
  slate: 'bg-slate-100 text-slate-700',
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  subtitle,
  trend,
  iconColor = 'blue',
  className = '',
}) => {
  return (
    <Card padding="md" className={`flex items-start justify-between relative overflow-hidden ${className}`}>
      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums leading-tight">
          {value}
        </div>
        {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
        {trend && (
          <div className="flex items-center gap-1.5 text-xs font-medium pt-0.5">
            <span className={trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
            {trend.label && <span className="text-slate-400 font-normal">{trend.label}</span>}
          </div>
        )}
      </div>

      {icon && (
        <div className={`p-2.5 rounded-xl shrink-0 ${iconColorMap[iconColor]}`}>
          {icon}
        </div>
      )}
    </Card>
  );
};
