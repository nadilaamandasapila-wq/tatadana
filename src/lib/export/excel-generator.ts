import * as XLSX from 'xlsx';
import { Transaction } from '@/types/database';
import { formatRupiah } from '../utils/currency';
import { formatWIB } from '../utils/date';

/**
 * Generates an Excel (.xlsx) workbook containing:
 * 1. "Ringkasan" sheet: Financial KPI summary with IDR formatted amounts.
 * 2. "Rincian Transaksi" sheet: Detailed transaction ledger with summary total rows and IDR columns.
 */
export function generateExcelReport(
  transactions: Transaction[],
  period: string,
  userFullName: string
): Buffer {
  const wb = XLSX.utils.book_new();

  // 1. Calculate totals
  let totalIncome = 0;
  let totalExpense = 0;

  const txRows = transactions.map((t, idx) => {
    if (t.type === 'income') totalIncome += t.amount;
    if (t.type === 'expense') totalExpense += t.amount;

    const jenisLabel =
      t.type === 'income' ? 'Pemasukan' : t.type === 'expense' ? 'Pengeluaran' : 'Transfer';

    return {
      No: idx + 1,
      Tanggal: formatWIB(t.transaction_date, { includeTime: false }),
      Jenis: jenisLabel,
      Kategori: t.category?.name || 'Lain-lain',
      Dompet: t.wallet?.name || 'Dompet',
      'Nominal (Rp)': t.amount,
      'Nominal Terformat': (t.type === 'income' ? '+' : t.type === 'expense' ? '-' : '') + formatRupiah(t.amount),
      Catatan: t.notes || '-',
      Sumber: t.source || 'manual',
    };
  });

  const netCashflow = totalIncome - totalExpense;

  // 2. Sheet 1: Ringkasan Eksekutif
  const summaryData = [
    ['LAPORAN KEUANGAN TATADANA'],
    ['Fintech Personal Finance Management'],
    [],
    ['INFORMASI LAPORAN', ''],
    ['Nama Pengguna', userFullName],
    ['Periode Laporan', period],
    ['Waktu Unduh (WIB)', formatWIB(new Date())],
    [],
    ['RINGKASAN METRIK KEUANGAN', 'NILAI NOMINAL (RP)', 'FORMAT RUPIAH'],
    ['Total Pemasukan', totalIncome, formatRupiah(totalIncome)],
    ['Total Pengeluaran', totalExpense, formatRupiah(totalExpense)],
    ['Arus Kas Bersih (Net Cashflow)', netCashflow, formatRupiah(netCashflow)],
    ['Total Transaksi', transactions.length, `${transactions.length} transaksi`],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 30 }, { wch: 22 }, { wch: 26 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

  // 3. Sheet 2: Rincian Transaksi with Summary Totals
  const txRowsWithTotals: any[] = [...txRows];

  if (transactions.length > 0) {
    // Blank separator row
    txRowsWithTotals.push({
      No: '',
      Tanggal: '',
      Jenis: '',
      Kategori: '',
      Dompet: '',
      'Nominal (Rp)': '',
      'Nominal Terformat': '',
      Catatan: '',
      Sumber: '',
    });

    // Summary totals rows
    txRowsWithTotals.push({
      No: '',
      Tanggal: 'RINGKASAN TOTAL',
      Jenis: 'Pemasukan',
      Kategori: 'Semua Kategori',
      Dompet: 'Semua Dompet',
      'Nominal (Rp)': totalIncome,
      'Nominal Terformat': `+${formatRupiah(totalIncome)}`,
      Catatan: `Total Pemasukan Periode ${period}`,
      Sumber: 'TataDana Export',
    });

    txRowsWithTotals.push({
      No: '',
      Tanggal: 'RINGKASAN TOTAL',
      Jenis: 'Pengeluaran',
      Kategori: 'Semua Kategori',
      Dompet: 'Semua Dompet',
      'Nominal (Rp)': totalExpense,
      'Nominal Terformat': `-${formatRupiah(totalExpense)}`,
      Catatan: `Total Pengeluaran Periode ${period}`,
      Sumber: 'TataDana Export',
    });

    txRowsWithTotals.push({
      No: '',
      Tanggal: 'ARUS KAS BERSIH',
      Jenis: netCashflow >= 0 ? 'Surplus' : 'Defisit',
      Kategori: 'Net Cashflow',
      Dompet: 'Semua Dompet',
      'Nominal (Rp)': netCashflow,
      'Nominal Terformat': formatRupiah(netCashflow),
      Catatan: `Selisih Pemasukan & Pengeluaran`,
      Sumber: 'TataDana Export',
    });
  }

  const wsDetail = XLSX.utils.json_to_sheet(txRowsWithTotals);
  wsDetail['!cols'] = [
    { wch: 6 },  // No
    { wch: 18 }, // Tanggal
    { wch: 14 }, // Jenis
    { wch: 22 }, // Kategori
    { wch: 18 }, // Dompet
    { wch: 18 }, // Nominal (Rp)
    { wch: 22 }, // Nominal Terformat
    { wch: 32 }, // Catatan
    { wch: 18 }, // Sumber
  ];
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Rincian Transaksi');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
}
