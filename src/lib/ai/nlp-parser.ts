import { ParsedTransaction } from '@/types';

/**
 * Normalizes Indonesian slang amounts, currency multipliers, and number patterns:
 * - 15rb, 15ribu, 15k -> 15000
 * - 500k -> 500000
 * - 1.5jt, 1,5jt, 1.5 juta -> 1500000
 * - 2.500.000, 1,500,000 -> 2500000, 1500000
 * - Slangs: ceban (10000), gocap (50000), goban (50000), goceng (5000), seceng (1000),
 *   noceng (2000), noban (20000), pego (150000), gopek (500), cepek (100), cepek ceng (100000),
 *   setengah juta (500000), sejuta (1000000), seribu (1000).
 */
export function extractAmount(text: string): { amount: number; matchedText: string } | null {
  if (!text) return null;
  const clean = text.toLowerCase().trim();

  // 1. Indonesian compound/word slangs
  if (/\b(?:setengah|1\/2)\s*juta\b/i.test(clean)) {
    const m = clean.match(/\b(?:setengah|1\/2)\s*juta\b/i)!;
    return { amount: 500000, matchedText: m[0] };
  }
  if (/\b(?:seperempat|1\/4)\s*juta\b/i.test(clean)) {
    const m = clean.match(/\b(?:seperempat|1\/4)\s*juta\b/i)!;
    return { amount: 250000, matchedText: m[0] };
  }
  if (/\bsejuta\b/i.test(clean)) {
    const m = clean.match(/\bsejuta\b/i)!;
    return { amount: 1000000, matchedText: m[0] };
  }
  if (/\bseribu\b/i.test(clean)) {
    const m = clean.match(/\bseribu\b/i)!;
    return { amount: 1000, matchedText: m[0] };
  }

  // 2. Hokkien-derived Indonesian monetary slang terms
  const slangMap: Record<string, number> = {
    'cepek ceng': 100000,
    cepeceng: 100000,
    pego: 150000,
    gocap: 50000,
    goban: 50000,
    noban: 20000,
    ceban: 10000,
    goceng: 5000,
    noceng: 2000,
    seceng: 1000,
    gopek: 500,
    cepek: 100,
  };

  for (const [slang, val] of Object.entries(slangMap)) {
    const regex = new RegExp(`\\b${slang}\\b`, 'i');
    const match = clean.match(regex);
    if (match) {
      return { amount: val, matchedText: match[0] };
    }
  }

  // 3. Check "jt" or "juta" with optional decimal (e.g. 1.5jt, 1,5 juta, 2jt, 10 juta, 2.5jt)
  const jtRegex = /(?:rp\.?\s*|idr\s*)?(\d+([.,]\d+)?)\s*(?:jt|juta)\b/i;
  const jtMatch = clean.match(jtRegex);
  if (jtMatch) {
    const num = parseFloat(jtMatch[1].replace(',', '.'));
    return { amount: Math.round(num * 1_000_000), matchedText: jtMatch[0] };
  }

  // 4. Check "rb", "ribu", "k" with optional decimal (e.g. 15rb, 500k, 50k, 18ribu, 25.5rb)
  const rbRegex = /(?:rp\.?\s*|idr\s*)?(\d+([.,]\d+)?)\s*(?:rb|ribu|k)\b/i;
  const rbMatch = clean.match(rbRegex);
  if (rbMatch) {
    const num = parseFloat(rbMatch[1].replace(',', '.'));
    return { amount: Math.round(num * 1_000), matchedText: rbMatch[0] };
  }

  // 5. Check "miliar" / "milyar" (e.g. 1.2 miliar, 2 milyar)
  const mRegex = /(?:rp\.?\s*|idr\s*)?(\d+([.,]\d+)?)\s*(?:miliar|milyar)\b/i;
  const mMatch = clean.match(mRegex);
  if (mMatch) {
    const num = parseFloat(mMatch[1].replace(',', '.'));
    return { amount: Math.round(num * 1_000_000_000), matchedText: mMatch[0] };
  }

  // 6. Check dotted Rupiah format (e.g. 2.500.000 or Rp 25.000)
  const dottedRegex = /(?:rp\.?\s*|idr\s*)?(\d{1,3}(?:\.\d{3})+)(?:,\d{2})?\b/i;
  const dottedMatch = clean.match(dottedRegex);
  if (dottedMatch) {
    const numStr = dottedMatch[1].replace(/\./g, '');
    return { amount: parseInt(numStr, 10), matchedText: dottedMatch[0] };
  }

  // 7. Check comma-separated thousands format (e.g. 1,500,000 or 150,000)
  const commaRegex = /(?:rp\.?\s*|idr\s*)?(\d{1,3}(?:,\d{3})+)(?:\.\d{2})?\b/i;
  const commaMatch = clean.match(commaRegex);
  if (commaMatch) {
    const numStr = commaMatch[1].replace(/,/g, '');
    return { amount: parseInt(numStr, 10), matchedText: commaMatch[0] };
  }

  // 8. Check plain numbers with explicit Rp / IDR prefix (e.g. Rp 50000, IDR 25000, Rp 500)
  const plainWithPrefix = /(?:rp\.?\s*|idr\s*)(\d{3,10})\b/i;
  const prefixMatch = clean.match(plainWithPrefix);
  if (prefixMatch) {
    return { amount: parseInt(prefixMatch[1], 10), matchedText: prefixMatch[0] };
  }

  // 9. Check standalone plain numbers (min 3 digits, max 10 digits)
  const standaloneRegex = /\b(\d{3,10})\b/;
  const standaloneMatch = clean.match(standaloneRegex);
  if (standaloneMatch) {
    return { amount: parseInt(standaloneMatch[1], 10), matchedText: standaloneMatch[0] };
  }

  return null;
}

/**
 * Determines transaction type based on Indonesian keywords.
 * Prioritizes income inflow indicators first, then transfer commands, then expenses.
 */
export function determineTransactionType(text: string): 'income' | 'expense' | 'transfer' {
  if (!text) return 'expense';
  const clean = text.toLowerCase();

  // 1. Explicit income inflow keywords (including transfer masuk / terima transfer)
  if (
    /(?:pemasukan|pendapatan|inflow|income|top\s*up|gaji|payroll|salary|bonus|freelance|dapat|terima|tf\s+masuk|transfer\s+masuk|uang\s+masuk|dana\s+masuk|cashback|nemu|jual|hasil\s+jual|cairkan|dividen|profit|untung|bunga\s+bank)/i.test(
      clean
    )
  ) {
    return 'income';
  }

  // 2. Transfer keywords: transfer/tf to an account/wallet (e.g. "transfer ke bca", "tf 500k ke gopay")
  if (
    /(?:transfer\s+ke|tf\s+ke|pindah\s+ke|kirim\s+ke|transfer\s+menuju|\b(?:transfer|tf|kirim|pindah)\b.*?\b(?:ke|menuju)\b)/i.test(
      clean
    )
  ) {
    return 'transfer';
  }

  // 3. Default to expense
  return 'expense';
}

/**
 * Matches category based on Indonesian expense/income vocabulary and user's category list.
 */
export function matchCategory(
  text: string,
  type: 'income' | 'expense' | 'transfer',
  availableCategories: string[] = []
): string {
  const clean = text.toLowerCase();
  const cats = availableCategories.length > 0 ? availableCategories : [];

  if (type === 'income') {
    if (/gaji|payroll|salary|upah/i.test(clean)) {
      return cats.find((c) => /gaji/i.test(c)) || 'Gaji Pokok';
    }
    if (/investasi|saham|reksadana|crypto|dividen|bunga|deposito/i.test(clean)) {
      return cats.find((c) => /investasi/i.test(c)) || 'Investasi';
    }
    return cats.find((c) => /bonus|hadiah|freelance|pendapatan|pemasukan/i.test(c)) || 'Bonus & Freelance';
  }

  if (type === 'transfer') {
    return cats.find((c) => /transfer/i.test(c)) || 'Transfer';
  }

  // Expense matching rules
  if (
    /makan|minum|kopi|coffee|resto|padang|warteg|sarapan|dinner|lunch|siang|malam|jajan|mcd|kfc|bakso|mie|snack|burger|goceng|gorengan|sate|nasi|es\s*teh|boba|cafe|kafe|roti|pizza|ayam|bebek|pecel|seblak|martabak/i.test(
      clean
    )
  ) {
    return cats.find((c) => /makan/i.test(c)) || 'Makanan & Minuman';
  }

  if (
    /bensin|pertamax|pertalite|shell|solar|grab|gojek|goride|gocar|tol|parkir|kereta|krl|mrt|busway|transjakarta|ojol|maxim|indrive|taksi|taxi|servis\s*motor|oli|tambal\s*ban|bengkel|kendaraan/i.test(
      clean
    )
  ) {
    return cats.find((c) => /transport/i.test(c)) || 'Transportasi';
  }

  if (
    /belanja|superindo|indomaret|alfamart|shopee|tokopedia|lazada|tiktok\s*shop|baju|celana|sepatu|skincare|sabun|pasar|mall|toserba|hypermart|transmart|sayur|sembako|pakaian|tas|jaket/i.test(
      clean
    )
  ) {
    return cats.find((c) => /belanja/i.test(c)) || 'Belanja';
  }

  if (
    /listrik|pln|air|pdam|wifi|indihome|biznet|pulsa|kuota|kontrakan|kos|sewa|bpjs|asuransi|pajak|iuran|maintenance|token\s*listrik/i.test(
      clean
    )
  ) {
    return cats.find((c) => /tagihan|utilitas/i.test(c)) || 'Tagihan & Utilitas';
  }

  if (
    /bioskop|xxi|cinema|nonton|game|steam|spotify|netflix|disney|karaoke|liburan|hotel|staycation|wisata|konser|tiket|rekreasi/i.test(
      clean
    )
  ) {
    return cats.find((c) => /hiburan/i.test(c)) || 'Hiburan';
  }

  if (
    /dokter|obat|apotek|klinik|vitamin|panadol|paracetamol|rumah\s*sakit|rs|laboratorium|checkup|swab|masker|medis|periksa/i.test(
      clean
    )
  ) {
    return cats.find((c) => /kesehatan/i.test(c)) || 'Kesehatan';
  }

  if (/buku|kursus|udemy|sekolah|kuliah|spp|les|seminar|workshop|pelatihan|ujian/i.test(clean)) {
    return cats.find((c) => /pendidikan|edukasi/i.test(c)) || 'Pendidikan';
  }

  if (/sedekah|infaq|zakat|donasi|sumbangan|kondangan|angpao|amal|santunan/i.test(clean)) {
    return cats.find((c) => /donasi|sosial/i.test(c)) || 'Donasi & Amal';
  }

  // Fallback to first available expense category or general
  return cats[0] || 'Lain-lain';
}

/**
 * Extracts a clean note description from the raw text by removing the matched amount
 * and common conversational action verbs.
 */
export function extractNotes(
  text: string,
  matchedAmountText: string,
  type: 'income' | 'expense' | 'transfer' = 'expense'
): string {
  let notes = text.replace(matchedAmountText, '').trim();
  // Strip leading common prepositions / verbs
  notes = notes
    .replace(/^(beli|bayar|buat|untuk|buat beli|ke|terima|dapat|biaya)\s+/i, '')
    .trim();

  if (notes.length > 0) {
    notes = notes.charAt(0).toUpperCase() + notes.slice(1);
  }
  const defaultFallback =
    type === 'income' ? 'Pemasukan' : type === 'transfer' ? 'Transfer' : 'Pengeluaran';
  return notes || defaultFallback;
}

/**
 * Main parser entry point conforming to the project interface contract:
 * parseTransactionText(text, context): Promise<ParsedTransaction>
 */
export async function parseTransactionText(
  text: string,
  context: { categories: string[]; wallets: string[] }
): Promise<ParsedTransaction> {
  const safeCategories = context?.categories || [];
  const safeWallets = context?.wallets || [];

  const amountMatch = extractAmount(text);
  const amount = amountMatch ? amountMatch.amount : 0;
  const type = determineTransactionType(text);
  const category_name = matchCategory(text, type, safeCategories);
  const notes = amountMatch
    ? extractNotes(text, amountMatch.matchedText, type)
    : text?.trim() || 'Transaksi';

  let destination_wallet_name: string | undefined;
  if (type === 'transfer') {
    const foundWallet = safeWallets.find((w) =>
      new RegExp(`\\b${w}\\b`, 'i').test(text)
    );
    if (foundWallet) {
      destination_wallet_name = foundWallet;
    }
  }

  return {
    type,
    amount,
    category_name,
    notes,
    destination_wallet_name,
    raw_input: text,
  };
}
