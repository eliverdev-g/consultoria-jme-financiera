import React, { ButtonHTMLAttributes, forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  // Brand navy matching PDF header/sidebar #0F1E36 & #1D4ED8
  primary: 'bg-[#0F1E36] hover:bg-[#1A3258] text-white shadow-xs focus-visible:ring-2 focus-visible:ring-[#0F1E36]/30',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 focus-visible:ring-2 focus-visible:ring-slate-300',
  outline: 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-xs focus-visible:ring-2 focus-visible:ring-slate-200',
  ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-xs focus-visible:ring-2 focus-visible:ring-red-400',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs focus-visible:ring-2 focus-visible:ring-emerald-400',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'text-xs py-1 px-2.5 rounded-md gap-1.5',
  sm: 'text-xs py-1.5 px-3 rounded-lg gap-1.5 font-medium',
  md: 'text-sm py-2 px-4 rounded-lg gap-2 font-medium',
  lg: 'text-base py-2.5 px-5 rounded-lg gap-2.5 font-medium',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-0.5 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
