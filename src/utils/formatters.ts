/**
 * Formats a number as Guatemalan Quetzales (Q) with standard comma separators
 * Example: 12845620.35 -> "Q 12,845,620.35"
 */
export function formatQuetzales(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'Q 0.00';
  }
  const formatted = new Intl.NumberFormat('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `Q ${formatted}`;
}

/**
 * Formats a percentage value
 * Example: 25.03 -> "25.03%"
 */
export function formatPercentage(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.00%';
  }
  return `${value.toFixed(2)}%`;
}

/**
 * Formats an ISO or string date to local Guatemalan standard DD/MM/YYYY
 */
export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  try {
    const parts = dateString.split(/[-T /]/);
    if (parts.length >= 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
      }
      // Already DD/MM/YYYY
      return dateString;
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('es-GT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}
