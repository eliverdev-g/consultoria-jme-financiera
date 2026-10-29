/**
 * Export table data to CSV format natively recognized by Microsoft Excel (with UTF-8 BOM)
 */
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const processCell = (cell: string | number) => {
    const stringValue = cell === null || cell === undefined ? '' : String(cell);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const csvContent = [
    headers.map(processCell).join(','),
    ...rows.map(row => row.map(processCell).join(',')),
  ].join('\r\n');

  // Add UTF-8 BOM so Excel opens accents and special characters correctly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Trigger print dialog configured for clean PDF generation
 */
export function printToPDF() {
  window.print();
}
