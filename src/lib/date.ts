/**
 * Universal Date Formatting Utilities for SoloCRM
 * Standard format required: DD/MM/YYYY
 */

/**
 * Formats a Date or ISO string to "DD/MM/YYYY" (e.g. 15/03/2026)
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseDateInput(date) || new Date(date) : date;
  if (!d || isNaN(d.getTime())) return '';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Formats a Date or ISO string to "DD/MM/YYYY, HH:MM AM/PM" (e.g. 15/03/2026, 03:30 PM)
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!d || isNaN(d.getTime())) return '';
  
  const datePart = formatDate(d);
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = String(hours).padStart(2, '0');
  
  return `${datePart}, ${formattedHours}:${minutes} ${ampm}`;
}

/**
 * Formats a Date or ISO string to time only: "HH:MM AM/PM" (e.g. 03:30 PM)
 */
export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!d || isNaN(d.getTime())) return '';
  
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = String(hours).padStart(2, '0');
  
  return `${formattedHours}:${minutes} ${ampm}`;
}

/**
 * Parses a "DD/MM/YYYY" (or "DD-MM-YYYY", "DD.MM.YYYY", or "YYYY-MM-DD") string into a valid Date object
 */
export function parseDateInput(str: string | null | undefined): Date | null {
  if (!str) return null;
  const trimmed = str.trim();
  if (!trimmed) return null;

  // If already YYYY-MM-DD or ISO string
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  }

  // If DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const parts = trimmed.split(/[/.-]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);
    if (year < 100) year += 2000;

    if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
      const d = new Date(year, month - 1, day, 12, 0, 0);
      return isNaN(d.getTime()) ? null : d;
    }
  }

  return null;
}

/**
 * Converts any date or DD/MM/YYYY string to ISO Date string "YYYY-MM-DD"
 */
export function toIsoDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
    return date.trim();
  }
  const d = typeof date === 'string' ? parseDateInput(date) || new Date(date) : date;
  if (!d || isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
