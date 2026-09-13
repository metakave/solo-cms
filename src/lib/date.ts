/**
 * Universal Date Formatting Utilities for SoloCRM
 * Standard format required: DD/MM/YYYY
 */

/**
 * Formats a Date or ISO string to "DD/MM/YYYY" (e.g. 15/03/2026)
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
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
