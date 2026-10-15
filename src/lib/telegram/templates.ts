import { formatRupiah } from '../utils/currency';
import { formatWIB } from '../utils/date';
import { Transaction, Wallet } from '@/types/database';

/**
 * Renders a 10-block visual progress bar using █ and ░
 * e.g.: [████████░░] 80%
 */
export function renderProgressBar(spent: number, limit: number): string {
  const safeSpent = Math.max(0, spent);
  if (limit <= 0) {
    return safeSpent > 0 ? '[██████████] 100%' : '[░░░░░░░░░░] 0%';
  }
  const percentage = Math.round((safeSpent / limit) * 100);
  const filledCount = Math.max(0, Math.min(Math.floor((safeSpent / limit) * 10), 10));
  const emptyCount = Math.max(0, 10 - filledCount);

  const filled = '█'.repeat(filledCount);
  const empty = '░'.repeat(emptyCount);

  return `[${filled}${empty}] ${percentage}%`;
}

export function formatTransactionSuccess(
  tx: Transaction,
  walletName: string,
  categoryName: string,
  budgetInfo?: { spent: number; limit: number }
): string {
  const timeWib = formatWIB(tx.transaction_date, { includeDay: true });
  const isIncome = tx.type === 'income';
  const isTransfer = tx.type === 'transfer';

  let title = '✅ <b>Pengeluaran Tercatat!</b>';
  let amountStr = `- ${formatRupiah(tx.amount)}`;

  if (isIncome) {
    title = '🎉 <b>Pemasukan Tercatat!</b>';
    amountStr = `+ ${formatRupiah(tx.amount)}`;
  } else if (isTransfer) {
    title = '🔄 <b>Transfer Berhasil Dicatat!</b>';
    amountStr = `${formatRupiah(tx.amount)}`;
  }

  let budgetLine = '';
  if (budgetInfo && budgetInfo.limit > 0) {
    const bar = renderProgressBar(budgetInfo.spent, budgetInfo.limit);
    budgetLine = `\n📊 <b>Anggaran:</b> ${bar}\n   <i>(${formatRupiah(
      budgetInfo.spent
    )} / ${formatRupiah(budgetInfo.limit)})</i>`;
  }

  let itemsLine = '';
  if (tx.items && tx.items.length > 0) {
    itemsLine = `\n\n🧾 <b>Rincian Barang (${tx.items.length}):</b>\n` +
      tx.items
        .map(
          (item) => ` • ${item.item_name} (${item.quantity}x) : ${formatRupiah(item.total_amount)}`
        )
        .join('\n');
  }

  return `${title}

💰 <b>Jumlah:</b> <code>${amountStr}</code>
📂 <b>Kategori:</b> ${categoryName}
💳 <b>Dompet:</b> ${walletName}
📝 <b>Catatan:</b> ${tx.notes || '-'}${budgetLine}${itemsLine}

🕒 <i>${timeWib}</i>`;
}

export function formatVoiceTransactionSuccess(
  transcript: string,
  tx: Transaction,
  walletName: string,
  categoryName: string
): string {
  const base = formatTransactionSuccess(tx, walletName, categoryName);
  return `🎙️ Transkrip: "${transcript}"\n\n${base}`;
}

export function formatSaldo(wallets: Wallet[]): string {
  const total = wallets.reduce((acc, w) => acc + (w.balance || 0), 0);
  const nowWib = formatWIB(new Date(), { includeDay: true });

  const walletLines = wallets
    .map(
      (w) =>
        ` • ${w.is_default ? '⭐ ' : ''}<b>${w.name}</b> (${w.type}): <code>${formatRupiah(
          w.balance
        )}</code>`
    )
    .join('\n');

  return `💼 <b>INFORMASI SALDO KEUANGAN</b>
🕒 <i>${nowWib}</i>

${walletLines || ' • Belum ada dompet terdaftar'}

━━━━━━━━━━━━━━━━━━━━━
💵 <b>Total Seluruh Saldo:</b>
<code>${formatRupiah(total)}</code>`;
}

export function formatSummaryReport(
  periodTitle: string,
  totalIncome: number,
  totalExpense: number,
  txCount: number
): string {
  const net = totalIncome - totalExpense;
  const nowWib = formatWIB(new Date(), { includeDay: true });

  return `📊 <b>RINGKASAN ${periodTitle.toUpperCase()}</b>
🕒 <i>${nowWib}</i>

📈 <b>Pemasukan:</b> <code>+${formatRupiah(totalIncome)}</code>
📉 <b>Pengeluaran:</b> <code>-${formatRupiah(totalExpense)}</code>
━━━━━━━━━━━━━━━━━━━━━
⚖️ <b>Arus Kas Bersih:</b> <code>${formatRupiah(net)}</code>
🔢 <b>Jumlah Transaksi:</b> ${txCount} kali`;
}

export function formatBudgetStatus(
  budgetsWithCategories: Array<{
    categoryName: string;
    spent: number;
    limit: number;
  }>
): string {
  const nowWib = formatWIB(new Date(), { includeDay: false });

  if (budgetsWithCategories.length === 0) {
    return `🎯 <b>STATUS ANGGARAN BULAN INI</b>\n\nBelum ada target anggaran yang dibuat. Kunjungi dashboard web untuk mengatur limit bulanan kategori Anda!`;
  }

  const lines = budgetsWithCategories
    .map((b) => {
      const bar = renderProgressBar(b.spent, b.limit);
      const ratio = b.limit > 0 ? b.spent / b.limit : (b.spent > 0 ? 1.0 : 0);
      let badge = '🟢 Aman';
      if (ratio >= 1.0) badge = '🔴 Overbudget!';
      else if (ratio >= 0.8) badge = '🟡 Waspada (≥80%)';

      return `<b>${b.categoryName}</b> [${badge}]
${bar}
<code>${formatRupiah(b.spent)} / ${formatRupiah(b.limit)}</code>`;
    })
    .join('\n\n');

  return `🎯 <b>STATUS ANGGARAN & MONITORING (Periode ${nowWib})</b>

${lines}

<i>Gunakan /hari ini atau buka dashboard untuk rincian transaksi lengkap.</i>`;
}

export function formatHelpMessage(): string {
  return `🤖 <b>PANDUAN LENGKAP BOT TATADANA</b>

TataDana memungkinkan Anda mencatat transaksi langsung semudah chat santai.

📝 <b>Format Catat Transaksi Cepat:</b>
 • <i>Makan siang padang 25rb</i>
 • <i>Beli bensin pertamax 50k</i>
 • <i>Kopi kenangan 18ribu</i>
 • <i>Gaji bulanan masuk 15jt</i>
 • <i>Transfer ke BCA 500rb</i>
 • <i>Gocap buat jajan bakso</i>

📸 <b>Foto Struk Belanja (Pro):</b>
Kirimkan foto struk kasir (Indomaret, Alfamart, Superindo, dsb), AI akan langsung membaca nama toko, rincian barang, dan total pengeluaran!

🎙️ <b>Pesan Suara (Voice Note):</b>
Rekam pesan suara hingga 60 detik (cth: "Makan nasi goreng 20 ribu"), AI otomatis mentranskripsi dan mencatatnya.

⚡ <b>Perintah Tersedia:</b>
/saldo - Cek saldo semua dompet (Cash, Bank, eWallet)
/hari ini - Laporan mutasi hari ini
/minggu ini - Ringkasan 7 hari terakhir
/bulan ini - Ringkasan bulan berjalan
/budget - Pantau sisa kuota anggaran per kategori
/sheet - Dapatkan link laporan PDF & Excel
/bantuan - Tampilkan panduan ini

🌐 <b>Akses Web Dashboard:</b>
Buka https://tatadana.id untuk grafik analitik, manajemen dompet, dan pengaturan akun.`;
}

export function formatUpgradeMessage(featureName: string): string {
  return `🔒 <b>Fitur Eksklusif Pro</b>

Mohon maaf, fitur <b>${featureName}</b> hanya dapat diakses oleh pelanggan <b>TataDana Pro</b>.

Keunggulan TataDana Pro:
 ✨ Scan OCR Foto Struk Belanja Tanpa Batas
 ✨ AI Financial Advisor & Peringatan Pengeluaran Proaktif
 ✨ Transaksi Bulanan Tanpa Batas (Starter maks 50 tx/bulan)
 ✨ Ekspor Laporan Excel & PDF Kustom

👉 <b>Upgrade sekarang hanya Rp99.000 (sekali bayar seumur hidup) atau Rp49.000/bulan:</b>
Buka menu Subscription di web dashboard <b>/dashboard/settings</b> (https://tatadana.id/dashboard/settings) untuk aktivasi instan via QRIS / GoPay / Bank Transfer!`;
}
