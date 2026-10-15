/**
 * Format a number into standard Indonesian Rupiah string (e.g. "Rp 25.000")
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }
  const formatted = Math.abs(Math.round(amount))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return amount < 0 ? `-Rp ${formatted}` : `Rp ${formatted}`;
}

/**
 * Format a number into compact Indonesian representation (e.g. "1.5jt", "250rb")
 */
export function formatCompactRupiah(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1).replace(/\.0$/, '')} M`;
  }
  if (abs >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')} jt`;
  }
  if (abs >= 1_000) {
    return `${(amount / 1_000).toFixed(0)} rb`;
  }
  return formatRupiah(amount);
}
