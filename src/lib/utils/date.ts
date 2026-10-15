/**
 * Format a date object or ISO string in Asia/Jakarta (WIB) timezone
 */
export function formatWIB(
  dateInput: Date | string | number,
  options: {
    includeTime?: boolean;
    includeDay?: boolean;
    formatStr?: 'short' | 'medium' | 'full' | 'timeOnly';
  } = {}
): string {
  const date = typeof dateInput === 'string' || typeof dateInput === 'number'
    ? new Date(dateInput)
    : dateInput;

  if (isNaN(date.getTime())) {
    return '-';
  }

  // Indonesian locale options in WIB
  const intlOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Jakarta',
  };

  if (options.formatStr === 'timeOnly') {
    intlOptions.hour = '2-digit';
    intlOptions.minute = '2-digit';
    return `${date.toLocaleTimeString('id-ID', intlOptions)} WIB`;
  }

  if (options.includeDay) {
    intlOptions.weekday = 'long';
  }

  intlOptions.day = 'numeric';
  intlOptions.month = options.formatStr === 'short' ? 'short' : 'long';
  intlOptions.year = 'numeric';

  if (options.includeTime !== false) {
    intlOptions.hour = '2-digit';
    intlOptions.minute = '2-digit';
  }

  const formatted = date.toLocaleDateString('id-ID', intlOptions);
  return options.includeTime !== false ? `${formatted} WIB` : formatted;
}

export function getCurrentMonthYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
