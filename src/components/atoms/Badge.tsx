import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple' | 'cyan';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200/80',
  danger: 'bg-rose-50 text-rose-700 border border-rose-200/80',
  info: 'bg-blue-50 text-blue-700 border border-blue-200/80',
  neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  purple: 'bg-purple-50 text-purple-700 border border-purple-200/80',
  cyan: 'bg-cyan-50 text-cyan-700 border border-cyan-200/80',
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium tracking-tight whitespace-nowrap ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
