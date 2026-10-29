import React from 'react';
import { formatQuetzales } from '../../utils/formatters';

interface CurrencyProps {
  amount: number | undefined | null;
  className?: string;
  showDecimals?: boolean;
}

export const Currency: React.FC<CurrencyProps> = ({
  amount,
  className = '',
  showDecimals = true,
}) => {
  const formatted = formatQuetzales(amount);

  return (
    <span className={`font-mono tabular-nums tracking-tight ${className}`}>
      {showDecimals ? formatted : formatted.split('.')[0]}
    </span>
  );
};
