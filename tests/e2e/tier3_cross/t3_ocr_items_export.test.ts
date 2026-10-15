import * as XLSX from 'xlsx';
import { describe, it, expect } from '../harness';
import { parseReceiptImage } from '../../../src/lib/ai/ocr-service';
import { generateExcelReport } from '../../../src/lib/export/excel-generator';
import { generateHtmlForPdf } from '../../../src/lib/export/pdf-generator';
import { demoStore } from '../../../src/lib/mock/store';

describe('Tier 3: Cross-Feature Integration — OCR Items -> Ledger -> Report Export', () => {
  it('CROSS-3: OCR receipt parsed into parent transaction with items, exported accurately to Excel & PDF', async () => {
    const user = demoStore.getUser();
    const defaultWallet = demoStore.getWallets().find((w) => w.is_default)!;
    const shoppingCat = demoStore.getCategories().find((c) => c.name === 'Belanja')!;

    // 1. Parse mock receipt
    const fakeBuffer = Buffer.from('mock_receipt_image_data');
    const ocrResult = await parseReceiptImage(fakeBuffer, 'image/jpeg', user.id);

    // 2. Add to ledger with items breakdown
    const parentTx = demoStore.addTransaction({
      user_id: user.id,
      wallet_id: defaultWallet.id,
      category_id: shoppingCat.id,
      type: 'expense',
      amount: ocrResult.total_amount,
      notes: `Struk Belanja: ${ocrResult.merchant_name}`,
      raw_input: '[OCR Receipt]',
      source: 'telegram_ocr',
      transaction_date: new Date().toISOString(),
      items: ocrResult.items.map((it, idx) => ({
        id: `item_cross_${Date.now()}_${idx}`,
        transaction_id: '',
        item_name: it.name,
        quantity: 1,
        price: it.amount,
        total_amount: it.amount,
        category_id: shoppingCat.id,
        created_at: new Date().toISOString(),
      })),
    });

    expect(Boolean(parentTx.items)).toBe(true);
    expect(parentTx.items!.length).toBe(ocrResult.items.length);

    // 3. Export ledger containing this transaction to Excel
    const excelBuf = generateExcelReport(demoStore.getTransactions(), 'Oktober 2026', user.full_name);
    const wb = XLSX.read(excelBuf, { type: 'buffer' });
    const detailRows: any[] = XLSX.utils.sheet_to_json(wb.Sheets['Rincian Transaksi']);

    const foundInExcel = detailRows.some(
      (r) => r['Catatan'] === `Struk Belanja: ${ocrResult.merchant_name}` && r['Nominal (Rp)'] === ocrResult.total_amount
    );
    expect(foundInExcel).toBe(true);

    // 4. Export ledger containing this transaction to PDF (HTML format)
    const pdfHtml = generateHtmlForPdf(demoStore.getTransactions(), 'Oktober 2026', user.full_name);
    expect(pdfHtml).toContain(ocrResult.merchant_name);

    // Cleanup
    demoStore.deleteTransaction(parentTx.id);
  });
});
