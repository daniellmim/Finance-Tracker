import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Expense } from '@/lib/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function exportToCsv(filename: string, rows: Expense[]) {
  if (!rows || rows.length === 0) {
    alert("No data to export.");
    return;
  }

  const separator = ',';
  const keys = ['date', 'description', 'category', 'amount'];
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map(row => {
        return keys
          .map(k => {
            let cell = row[k as keyof Expense] as string | number | Date;
            if (k === 'date' && cell instanceof Date) {
              // Format date as YYYY-MM-DD
              cell = [
                cell.getFullYear(),
                ('0' + (cell.getMonth() + 1)).slice(-2),
                ('0' + cell.getDate()).slice(-2),
              ].join('-');
            }
            let cellString = String(cell ?? '').replace(/"/g, '""');
            if (cellString.search(/("|,|\n)/g) >= 0) {
              cellString = `"${cellString}"`;
            }
            return cellString;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
