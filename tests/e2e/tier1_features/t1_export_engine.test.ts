import * as XLSX from 'xlsx';
import { describe, it, expect } from '../harness';
import { generateExcelReport } from '../../../src/lib/export/excel-generator';
import { generateHtmlForPdf } from '../../../src/lib/export/pdf-generator';
import { generateReportExport } from '../../../src/lib/export';
import { demoStore } from '../../../src/lib/mock/store';
import { Transaction } from '../../../src/types/database';

describe('Tier 1: Export Engine & Persistence (F14-F16)', () => {
  const sampleTransactions: Transaction[] = [
    {
      id: 'tx_exp_01',
      user_id: 'usr_demo_fauzi_001',
      wallet_id: 'wal_01',
      category_id: 'cat_01',
      type: 'expense',
      amount: 45000,
      notes: 'Makan Bebek Sinjay',
      source: 'manual',
      transaction_date: '2026-10-15T12:00:00Z',
      created_at: '2026-10-15T12:00:00Z',
      updated_at: '2026-10-15T12:00:00Z',
      category: { id: 'cat_01', name: 'Makanan & Minuman', type: 'expense', is_default: true, created_at: '' },
      wallet: { id: 'wal_01', user_id: 'usr_demo_fauzi_001', name: 'Tunai Dompet', type: 'cash', balance: 500000, is_default: true, created_at: '', updated_at: '' },
    },
    {
      id: 'tx_exp_02',
      user_id: 'usr_demo_fauzi_001',
      wallet_id: 'wal_02',
      category_id: 'cat_07',
      type: 'income',
      amount: 5000000,
      notes: 'Gaji Proyek A',
      source: 'manual',
      transaction_date: '2026-10-15T09:00:00Z',
      created_at: '2026-10-15T09:00:00Z',
      updated_at: '2026-10-15T09:00:00Z',
      category: { id: 'cat_07', name: 'Gaji Pokok', type: 'income', is_default: true, created_at: '' },
      wallet: { id: 'wal_02', user_id: 'usr_demo_fauzi_001', name: 'BCA Utama', type: 'bank', balance: 15000000, is_default: false, created_at: '', updated_at: '' },
    },
  ];

  it('F14: On-Demand PDF Report Generator formats HTML with WIB and Rupiah', () => {
    const html = generateHtmlForPdf(sampleTransactions, 'Oktober 2026', 'Ahmad Fauzi');
    expect(typeof html).toBe('string');
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('LAPORAN KEUANGAN TATADANA');
    expect(html).toContain('Ahmad Fauzi');
    expect(html).toContain('Oktober 2026');
    expect(html).toContain('Rp 5.000.000');
    expect(html).toContain('Rp 45.000');
    expect(html).toContain('Makan Bebek Sinjay');
    expect(html).toContain('WIB');
  });

  it('F15: On-Demand Excel Report Generator outputs valid XLSX with Ringkasan and Rincian sheets', () => {
    const buf = generateExcelReport(sampleTransactions, 'Oktober 2026', 'Ahmad Fauzi');
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.length).toBeGreaterThan(100);

    // Parse the generated XLSX buffer using xlsx library to verify sheet structure
    const wb = XLSX.read(buf, { type: 'buffer' });
    expect(wb.SheetNames.includes('Ringkasan')).toBe(true);
    expect(wb.SheetNames.includes('Rincian Transaksi')).toBe(true);

    const detailSheet = wb.Sheets['Rincian Transaksi'];
    const rows: any[] = XLSX.utils.sheet_to_json(detailSheet);
    expect(rows.length >= 2).toBe(true);
    const txRows = rows.filter((r) => typeof r.No === 'number' && r.No > 0);
    expect(txRows.length).toBe(2);
    expect(txRows[0]['Kategori']).toBe('Makanan & Minuman');
    expect(txRows[0]['Nominal (Rp)']).toBe(45000);
    expect(txRows[1]['Nominal (Rp)']).toBe(5000000);
  });

  it('F16: Storage Signed URL Persistence registers export history entry', async () => {
    const initialExportsCount = demoStore.getExports().length;
    const result = await generateReportExport({
      userId: 'usr_demo_fauzi_001',
      fileType: 'xlsx',
      period: 'Oktober 2026',
      transactions: sampleTransactions,
    });

    expect(typeof result.fileUrl).toBe('string');
    expect(result.fileUrl).toContain('format=xlsx');
    expect(result.fileName).toContain('Oktober_2026.xlsx');
    expect(typeof result.exportId).toBe('string');

    const history = demoStore.getExports();
    expect(history.length).toBeGreaterThan(initialExportsCount);
    const latest = history[0];
    expect(latest.id).toBe(result.exportId);
    expect(latest.status).toBe('completed');
  });

  it('F16: PDF export registers history with pdf extension', async () => {
    const result = await generateReportExport({
      userId: 'usr_demo_fauzi_001',
      fileType: 'pdf',
      period: 'September 2026',
      transactions: sampleTransactions,
    });

    expect(result.fileName.endsWith('.pdf')).toBe(true);
    expect(result.fileUrl).toContain('format=pdf');
  });
});
