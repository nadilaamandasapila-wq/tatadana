import assert from 'assert';
import {
  extractAmount,
  determineTransactionType,
  matchCategory,
  parseTransactionText,
} from '../src/lib/ai/nlp-parser';
import { generatePdfReport } from '../src/lib/export/pdf-generator';
import { generateExcelReport } from '../src/lib/export/excel-generator';
import { Transaction } from '../src/types/database';

async function runTests() {
  console.log('🧪 [Test Suite] Running Indonesian NLP & Slang Parser Tests...');

  // 1. Amount Extraction Tests
  const cases: Array<{ input: string; expected: number }> = [
    { input: 'makan siang 15rb', expected: 15000 },
    { input: 'beli bensin 50k', expected: 50000 },
    { input: 'beli perlengkapan kantor 500k', expected: 500000 },
    { input: 'kopi kenangan 18ribu', expected: 18000 },
    { input: 'gaji masuk 1.5jt', expected: 1500000 },
    { input: 'freelance 1,5 juta', expected: 1500000 },
    { input: 'proyek website 2.5jt', expected: 2500000 },
    { input: 'fee konsultasi 2,5jt', expected: 2500000 },
    { input: 'bayar kos 2.500.000', expected: 2500000 },
    { input: 'beli laptop 1,500,000', expected: 1500000 },
    { input: 'jajan bakso gocap', expected: 50000 },
    { input: 'beli rokok goban', expected: 50000 },
    { input: 'parkir seceng', expected: 1000 },
    { input: 'beli gorengan goceng', expected: 5000 },
    { input: 'parkir motor 500', expected: 500 },
    { input: 'beli rokok ceban', expected: 10000 },
    { input: 'baju pego', expected: 150000 },
    { input: 'ongkos noban', expected: 20000 },
    { input: 'titip noceng', expected: 2000 },
    { input: 'es teh gopek', expected: 500 },
    { input: 'belanja cepek ceng', expected: 100000 },
    { input: 'bayar cepeceng', expected: 100000 },
    { input: 'dapat amplop sejuta', expected: 1000000 },
    { input: 'donasi seribu', expected: 1000 },
    { input: 'cicilan setengah juta', expected: 500000 },
    { input: 'voucher 1/2 juta', expected: 500000 },
  ];

  for (const c of cases) {
    const res = extractAmount(c.input);
    assert(res !== null, `Failed to extract amount for: "${c.input}"`);
    assert.strictEqual(
      res.amount,
      c.expected,
      `Expected ${c.expected} for "${c.input}", got ${res.amount}`
    );
    console.log(`  ✓ "${c.input}" -> Rp ${res.amount.toLocaleString('id-ID')}`);
  }

  // 2. Transaction Type Tests
  assert.strictEqual(determineTransactionType('Makan siang 25rb'), 'expense');
  assert.strictEqual(determineTransactionType('Gaji bulanan 15jt'), 'income');
  assert.strictEqual(determineTransactionType('Pemasukan freelance 500rb'), 'income');
  assert.strictEqual(determineTransactionType('Pendapatan deviden 1.2jt'), 'income');
  assert.strictEqual(determineTransactionType('Transfer ke BCA 500rb'), 'transfer');
  assert.strictEqual(determineTransactionType('Transfer 500rb ke BCA'), 'transfer');
  assert.strictEqual(determineTransactionType('Tf 100k ke GoPay'), 'transfer');
  assert.strictEqual(determineTransactionType('Transfer masuk 750rb'), 'income');
  assert.strictEqual(determineTransactionType('Terima transfer 2jt'), 'income');
  console.log('  ✓ Transaction types (income, expense, transfer) detected correctly');

  // 3. Category Matching Tests
  const categories = [
    'Makanan & Minuman',
    'Transportasi',
    'Belanja',
    'Tagihan & Utilitas',
    'Hiburan',
    'Kesehatan',
    'Gaji Pokok',
    'Investasi',
  ];
  assert.strictEqual(matchCategory('Kopi susu 18rb', 'expense', categories), 'Makanan & Minuman');
  assert.strictEqual(matchCategory('Bensin pertamax 50k', 'expense', categories), 'Transportasi');
  assert.strictEqual(matchCategory('Belanja superindo 300k', 'expense', categories), 'Belanja');
  assert.strictEqual(matchCategory('Bayar tagihan listrik PLN 200rb', 'expense', categories), 'Tagihan & Utilitas');
  assert.strictEqual(matchCategory('Nonton bioskop XXI 100k', 'expense', categories), 'Hiburan');
  assert.strictEqual(matchCategory('Beli obat apotek 45rb', 'expense', categories), 'Kesehatan');
  assert.strictEqual(matchCategory('Gaji kantor masuk', 'income', categories), 'Gaji Pokok');
  assert.strictEqual(matchCategory('Dividen saham BBCA 1.5jt', 'income', categories), 'Investasi');
  console.log('  ✓ Categories mapped correctly');

  // 4. Full parseTransactionText
  const full = await parseTransactionText('Makan padang 35rb', {
    categories,
    wallets: ['Tunai', 'BCA', 'GoPay'],
  });
  assert.strictEqual(full.amount, 35000);
  assert.strictEqual(full.type, 'expense');
  assert.strictEqual(full.category_name, 'Makanan & Minuman');
  console.log('  ✓ Full transaction parsing output verified');

  // 5. Transfer Destination Wallet Extraction
  const transferTx = await parseTransactionText('Transfer 200rb ke BCA', {
    categories,
    wallets: ['Tunai', 'BCA', 'GoPay'],
  });
  assert.strictEqual(transferTx.amount, 200000);
  assert.strictEqual(transferTx.type, 'transfer');
  assert.strictEqual(transferTx.destination_wallet_name, 'BCA');
  console.log('  ✓ Transfer destination wallet parsed successfully');

  // 6. Export Engine Tests (PDF & Excel)
  console.log('\n📄 [Export Engine] Verifying PDF and Excel Generator Outputs...');
  const sampleTransactions: Transaction[] = [
    {
      id: 'tx_test_01',
      user_id: 'usr_test',
      wallet_id: 'wal_01',
      category_id: 'cat_01',
      type: 'income',
      amount: 15000000,
      notes: 'Gaji Bulanan Oktober',
      source: 'manual',
      transaction_date: '2026-10-01T08:00:00Z',
      created_at: '2026-10-01T08:00:00Z',
      updated_at: '2026-10-01T08:00:00Z',
      category: { id: 'cat_01', user_id: 'usr_test', name: 'Gaji Pokok', type: 'income', color: '#10b981', is_default: true, created_at: '' },
      wallet: { id: 'wal_01', user_id: 'usr_test', name: 'BCA Utama', type: 'bank', balance: 15000000, is_default: true, created_at: '', updated_at: '' },
    },
    {
      id: 'tx_test_02',
      user_id: 'usr_test',
      wallet_id: 'wal_01',
      category_id: 'cat_02',
      type: 'expense',
      amount: 45000,
      notes: 'Makan Siang Nasi Padang',
      source: 'telegram_text',
      transaction_date: '2026-10-02T12:30:00Z',
      created_at: '2026-10-02T12:30:00Z',
      updated_at: '2026-10-02T12:30:00Z',
      category: { id: 'cat_02', user_id: 'usr_test', name: 'Makanan & Minuman', type: 'expense', color: '#f97316', is_default: true, created_at: '' },
      wallet: { id: 'wal_01', user_id: 'usr_test', name: 'BCA Utama', type: 'bank', balance: 14955000, is_default: true, created_at: '', updated_at: '' },
    },
  ];

  // Test PDF generator
  const pdfBuffer = generatePdfReport(sampleTransactions, 'Oktober 2026', 'Ahmad Fauzi');
  assert(Buffer.isBuffer(pdfBuffer), 'PDF output must be a valid Node.js Buffer');
  assert(pdfBuffer.length > 500, `PDF buffer too small: ${pdfBuffer.length} bytes`);
  const pdfHeader = pdfBuffer.subarray(0, 8).toString('binary');
  assert(pdfHeader.startsWith('%PDF-1.4'), `Expected %PDF-1.4 header, got: ${pdfHeader}`);
  const pdfContent = pdfBuffer.toString('binary');
  assert(pdfContent.includes('TataDana'), 'PDF must include TataDana branding');
  assert(pdfContent.includes('xref'), 'PDF must include xref table');
  assert(pdfContent.includes('trailer'), 'PDF must include trailer');
  assert(pdfContent.includes('startxref'), 'PDF must include startxref');
  assert(pdfContent.includes('%%EOF'), 'PDF must end with %%EOF');
  console.log(`  ✓ PDF binary generated successfully (${pdfBuffer.length} bytes, %PDF-1.4 header verified)`);

  // Test Excel generator
  const excelBuffer = generateExcelReport(sampleTransactions, 'Oktober 2026', 'Ahmad Fauzi');
  assert(Buffer.isBuffer(excelBuffer), 'Excel output must be a valid Buffer');
  assert(excelBuffer.length > 500, `Excel buffer too small: ${excelBuffer.length} bytes`);
  console.log(`  ✓ Excel .xlsx generated successfully (${excelBuffer.length} bytes)`);

  console.log('\n🎉 All NLP Parser and Export Engine tests passed successfully!\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
