import { describe, it, expect } from '../harness';
import { extractAmount, determineTransactionType, parseTransactionText } from '../../../src/lib/ai/nlp-parser';

describe('Tier 2: Boundary & Corner Cases — NLP Parser', () => {
  it('NLP-B1: Empty, whitespace, and non-numeric inputs return null or zero amount', () => {
    expect(extractAmount('')).toBeNull();
    expect(extractAmount('   ')).toBeNull();
    expect(extractAmount('halo bot')).toBeNull();
    expect(extractAmount('selamat pagi apa kabar')).toBeNull();
    expect(extractAmount('catat ya')).toBeNull();
  });

  it('NLP-B2: Slang with various case and punctuation variations', () => {
    const res1 = extractAmount('Makan Siang @Padang!! 35RB...');
    expect(res1 !== null).toBe(true);
    expect(res1!.amount).toBe(35000);

    const res2 = extractAmount('Beli Kopi #2 Kenangan 18K???');
    expect(res2 !== null).toBe(true);
    expect(res2!.amount).toBe(18000);

    const res3 = extractAmount('GAJIAN BESAR 10JT');
    expect(res3 !== null).toBe(true);
    expect(res3!.amount).toBe(10000000);
  });

  it('NLP-B3: Decimal comma vs decimal dot handling', () => {
    const dotRes = extractAmount('proyek 2.5jt');
    const commaRes = extractAmount('proyek 2,5jt');
    expect(dotRes!.amount).toBe(2500000);
    expect(commaRes!.amount).toBe(2500000);

    const dotK = extractAmount('bensin 12.5rb');
    const commaK = extractAmount('bensin 12,5rb');
    expect(dotK!.amount).toBe(12500);
    expect(commaK!.amount).toBe(12500);
  });

  it('NLP-B4: Traditional Chinese Hokkien Slang denominations in Indonesian slang', () => {
    expect(extractAmount('uang parkir seceng')?.amount).toBe(1000);
    expect(extractAmount('ongkos noceng')?.amount).toBe(2000);
    expect(extractAmount('kopi goceng')?.amount).toBe(5000);
    expect(extractAmount('beli rokok ceban')?.amount).toBe(10000);
    expect(extractAmount('makan bakso noban')?.amount).toBe(20000);
    expect(extractAmount('jajan sate gocap')?.amount).toBe(50000);
    expect(extractAmount('baju distro pego')?.amount).toBe(150000);
  });

  it('NLP-B5: Boundary large numbers and fallback transaction parsing', async () => {
    const largeAmount = extractAmount('beli mobil 250.000.000');
    expect(largeAmount !== null).toBe(true);
    expect(largeAmount!.amount).toBe(250000000);

    // Parsing text with zero detectable amount
    const parsedZero = await parseTransactionText('Hanya mengobrol saja', {
      categories: ['Makanan'],
      wallets: ['Tunai'],
    });
    expect(parsedZero.amount).toBe(0);
  });
});
