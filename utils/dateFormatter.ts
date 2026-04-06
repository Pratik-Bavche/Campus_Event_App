/**
 * Formats a date string or object into a 12-hour time format (e.g., 02:30 PM)
 */
export const formatTime12h = (dateInput: string | Date | undefined): string => {
  if (!dateInput) return 'N/A';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  if (isNaN(date.getTime())) return 'Invalid Date';

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Formats a date string or object into a readable date format (e.g., Apr 6, 2026)
 */
export const formatDate = (dateInput: string | Date | undefined, options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }): string => {
  if (!dateInput) return 'N/A';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

  if (isNaN(date.getTime())) return 'Invalid Date';

  return date.toLocaleDateString(undefined, options);
};
