import { demoStore } from '@/lib/mock/store';
import { formatRupiah } from '@/lib/utils/currency';
import { formatWIB } from '@/lib/utils/date';

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

/**
 * Intelligent financial & application assistant for TataDana.
 * Uses live store context (wallets, transactions, budgets, settings)
 * and combines local contextual reasoning with LLM calls when configured.
 */
export async function askDashboardAssistant(query: string): Promise<string> {
  const cleanQuery = query.toLowerCase().trim();
  const user = demoStore.getUser();
  const wallets = demoStore.getWallets();
  const transactions = demoStore.getTransactions();
  const budgets = demoStore.getBudgets();

  // 1. Gather live contextual summary
  const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);

  const now = new Date();
  const currentMonthTxs = transactions.filter((t) => {
    const d = new Date(t.transaction_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalIncome = currentMonthTxs
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = currentMonthTxs
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const netCashflow = totalIncome - totalExpense;

  // Category breakdown
  const categorySpending: Record<string, number> = {};
  currentMonthTxs
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const catName = t.category?.name || 'Lain-lain';
      categorySpending[catName] = (categorySpending[catName] || 0) + t.amount;
    });

  const sortedCategories = Object.entries(categorySpending).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories[0];

  // Budget status
  const budgetAlerts = budgets.filter((b) => {
    const pct = b.spent ? (b.spent / b.monthly_limit) * 100 : 0;
    return pct >= 80;
  });

  // 2. Check if external Gemini / OpenAI API key is set
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && !geminiKey.includes('your-gemini')) {
    try {
      const systemPrompt = `Anda adalah Asisten Cerdas TataDana (Fintech Personal Finance SaaS Indonesia).
Bicaralah dengan bahasa Indonesia yang ramah, profesional, solutif, dan cerdas finansial.
Gunakan format markdown dengan bullet points dan cetak tebal untuk angka nominal agar mudah dibaca.

DATA PENGGUNA TERKINI:
- Nama: ${user.full_name}
- Paket: ${user.subscription_tier.toUpperCase()}
- Total Saldo: ${formatRupiah(totalBalance)}
- Rincian Dompet: ${wallets.map((w) => `${w.name} (${formatRupiah(w.balance)})`).join(', ')}
- Pemasukan Bulan Ini: ${formatRupiah(totalIncome)}
- Pengeluaran Bulan Ini: ${formatRupiah(totalExpense)}
- Net Cashflow: ${formatRupiah(netCashflow)}
- Pengeluaran Terbesar: ${topCategory ? `${topCategory[0]} (${formatRupiah(topCategory[1])})` : 'Belum ada'}
- Anggaran Mendekati Batas: ${budgetAlerts.map((b) => `${b.category?.name} (${Math.round((b.spent / b.monthly_limit) * 100)}%)`).join(', ') || 'Semua aman'}
- Status Telegram: ${user.telegram_chat_id ? 'Terhubung' : 'Belum terhubung'}

PANDUAN APLIKASI TATADANA:
- Cara catat via Telegram: ketik nominal slang (cth: "beli bakso 15rb", "goceng buat parkir", "gajian 5jt"), kirim foto struk (Pro only), atau kirim voice note maks 60 detik.
- Perintah bot: /saldo, /hari ini, /minggu ini, /bulan ini, /budget, /bantuan.
- Halaman Laporan: buka /dashboard/reports untuk download PDF atau Excel (.xlsx) on-demand.
- Multi-Wallet: kelola di /dashboard/wallets (bisa pilih seluruh bank dan e-wallet Indonesia).
- Pengaturan: /dashboard/settings untuk token bot, foto profil, dan pengingat harian.`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${systemPrompt}\n\nPertanyaan Pengguna: "${query}"` },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 800,
            },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      }
    } catch {
      // Fallback to built-in intelligence engine below
    }
  }

  // 3. Built-in Contextual Intelligence Engine (High Accuracy NLP & Knowledge Base)

  // A. Saldo & Dompet
  if (
    cleanQuery.includes('saldo') ||
    cleanQuery.includes('uang') ||
    cleanQuery.includes('dompet') ||
    cleanQuery.includes('rekening') ||
    cleanQuery.includes('tabungan') ||
    cleanQuery.includes('kas')
  ) {
    const walletList = wallets
      .map((w) => `• **${w.name}**: ${formatRupiah(w.balance)} ${w.is_default ? '*(Default Bot Telegram)*' : ''}`)
      .join('\n');

    return `💰 **Ringkasan Saldo Keuangan Anda:**\n\nTotal saldo gabungan Anda saat ini adalah **${formatRupiah(totalBalance)}** yang tersebar di dompet berikut:\n\n${walletList}\n\n💡 *Tips: Anda dapat menambahkan rekening bank atau e-wallet baru di menu **[Dompet Saya](/dashboard/wallets)**.*`;
  }

  // B. Pengeluaran / Pemasukan / Arus Kas
  if (
    cleanQuery.includes('pengeluaran') ||
    cleanQuery.includes('keluar') ||
    cleanQuery.includes('boros') ||
    cleanQuery.includes('biaya') ||
    cleanQuery.includes('belanja') ||
    cleanQuery.includes('pemasukan') ||
    cleanQuery.includes('masuk') ||
    cleanQuery.includes('cashflow')
  ) {
    const topBreakdown = sortedCategories
      .slice(0, 3)
      .map(([cat, amt]) => `• **${cat}**: ${formatRupiah(amt)}`)
      .join('\n');

    const statusCashflow =
      netCashflow > 0
        ? `🟢 Arus kas Anda **surplus sebesar ${formatRupiah(netCashflow)}**. Pertahankan kondisi ini dan sisihkan ke tabungan!`
        : `🔴 Arus kas Anda **defisit sebesar ${formatRupiah(Math.abs(netCashflow))}**. Pengeluaran melebihi pemasukan bulan ini!`;

    return `📊 **Rekapitulasi Arus Kas Bulan Ini:**\n\n• **Total Pemasukan:** ${formatRupiah(totalIncome)}\n• **Total Pengeluaran:** ${formatRupiah(totalExpense)}\n• **Sisa Arus Kas (Net):** ${formatRupiah(netCashflow)}\n\n${statusCashflow}\n\n🏆 **Pengeluaran Terbanyak:**\n${topBreakdown || '• Belum ada catatan pengeluaran.'}\n\nIngin melihat detail setiap transaksi? Kunjungi menu **[Transaksi](/dashboard/transactions)** atau **[Laporan](/dashboard/reports)**.`;
  }

  // C. Anggaran / Budgeting
  if (
    cleanQuery.includes('budget') ||
    cleanQuery.includes('anggaran') ||
    cleanQuery.includes('limit') ||
    cleanQuery.includes('kuota') ||
    cleanQuery.includes('habis')
  ) {
    if (budgetAlerts.length > 0) {
      const alertList = budgetAlerts
        .map((b) => {
          const pct = Math.round((b.spent / b.monthly_limit) * 100);
          return `⚠️ **${b.category?.name || 'Kategori'}**: Terpakai **${pct}%** (${formatRupiah(b.spent)} dari kuota ${formatRupiah(b.monthly_limit)})`;
        })
        .join('\n');

      return `🎯 **Status Peringatan Anggaran:**\n\nPerhatian, Anda memiliki kategori yang sudah mendekati atau melebihi batas:\n\n${alertList}\n\n💡 *Saran: Rem belanja pada pos-pos di atas hingga awal bulan depan agar keuangan tetap aman. Kelola batas anggaran di menu **[Anggaran](/dashboard/budgets)**.*`;
    }

    return `🎯 **Status Anggaran Anda:**\n\nSemua pos anggaran Anda bulan ini masih berada dalam batas aman di bawah 80%! Kuota total pengeluaran Anda terkontrol dengan baik.\n\nAnda dapat meninjau grafik progress bar dan menyesuaikan kuota di menu **[Anggaran](/dashboard/budgets)**.`;
  }

  // D. Telegram Bot
  if (
    cleanQuery.includes('telegram') ||
    cleanQuery.includes('bot') ||
    cleanQuery.includes('botfather') ||
    cleanQuery.includes('hubungkan') ||
    cleanQuery.includes('token')
  ) {
    return `🤖 **Panduan Menghubungkan Telegram Bot ke TataDana:**\n\n1. Buka aplikasi Telegram dan cari akun resmi **@BotFather**.\n2. Ketik perintah \`/newbot\` dan beri nama bot Anda (misal: *MyTataDanaBot*).\n3. Salin **API Token** yang diberikan oleh BotFather.\n4. Masuk ke menu **[Pengaturan > Tab Telegram Bot](/dashboard/settings)** di dashboard ini, tempel token, lalu klik **"Test Koneksi"**.\n5. Di laptop Anda, jalankan file runner:\n   \`C:\\Users\\nadil\\.gemini\\antigravity\\scratch\\JALANKAN_BOT.bat\`\n6. Buka bot Anda di Telegram dan ketik \`/start\` atau langsung catat (contoh: *"beli bakso 15rb"*).\n\nTransaksi akan otomatis tersinkronisasi ke dashboard ini secara realtime!`;
  }

  // E. Cara Catat Transaksi / Slang Indonesia
  if (
    cleanQuery.includes('catat') ||
    cleanQuery.includes('format') ||
    cleanQuery.includes('struk') ||
    cleanQuery.includes('voice') ||
    cleanQuery.includes('suara') ||
    cleanQuery.includes('slang') ||
    cleanQuery.includes('ocr')
  ) {
    return `📝 **Cara Mencatat Keuangan di TataDana:**\n\nAnda bisa mencatat dengan 3 metode praktis:\n\n1. **Bahasa Santai / Teks Telegram:**\n   • *"beli sate 25rb"*\n   • *"kopi goceng"*\n   • *"gaji masuk 10jt"*\n   • *"transfer ke bca 500k"*\n\n2. **Foto Struk Belanja (Paket Pro):**\n   Kirimkan foto struk kasir minimarket/restoran ke chat bot Telegram. AI Vision akan otomatis membaca nama toko, rincian barang, dan total belanja.\n\n3. **Voice Note (Pesan Suara):**\n   Rekam suara Anda di Telegram (maksimal 60 detik), contoh: *"Barusan bayar tagihan listrik seratus lima puluh ribu"*. AI akan mentranskripsi dan mencatatnya otomatis.\n\n4. **Manual di Web:**\n   Klik tombol **"+ Tambah Transaksi"** di sudut kanan atas dashboard ini.`;
  }

  // F. Laporan & Ekspor Data
  if (
    cleanQuery.includes('laporan') ||
    cleanQuery.includes('ekspor') ||
    cleanQuery.includes('export') ||
    cleanQuery.includes('pdf') ||
    cleanQuery.includes('excel') ||
    cleanQuery.includes('unduh') ||
    cleanQuery.includes('download')
  ) {
    return `📄 **Cara Mengunduh Laporan Keuangan:**\n\n1. Buka menu **[Laporan](/dashboard/reports)** di sidebar kiri.\n2. Anda akan melihat ringkasan net cashflow dan tabel transaksi lengkap yang dapat difilter per tanggal, kategori, atau dompet.\n3. Di bagian banner atas, klik tombol:\n   • **"Ekspor PDF"** untuk laporan formal siap cetak.\n   • **"Ekspor Excel (.xlsx)"** untuk analisis spreadsheet akuntansi mandiri.\n4. File akan langsung digenerate dan terunduh otomatis ke browser Anda!`;
  }

  // G. Paket Langganan & Upgrade
  if (
    cleanQuery.includes('paket') ||
    cleanQuery.includes('harga') ||
    cleanQuery.includes('pro') ||
    cleanQuery.includes('starter') ||
    cleanQuery.includes('upgrade') ||
    cleanQuery.includes('langganan')
  ) {
    return `⭐ **Perbandingan Paket Langganan TataDana:**\n\n• **Paket Starter (Rp 49.000 / bulan):**\n  - Pencatatan via teks Telegram (maksimal 50 transaksi/bulan)\n  - Maksimal 3 dompet & 5 kategori anggaran\n  - Dashboard web lengkap\n\n• **Paket Pro (Rp 99.000 Sekali Bayar / Lifetime):**\n  - Transaksi, dompet, dan kategori **tanpa batas (Unlimited)**\n  - **Scan Foto Struk Kasir (OCR AI)**\n  - **AI Financial Advisor Proaktif**\n  - Ekspor laporan ke PDF & Excel tanpa batas\n  - Pengingat harian kustom\n\n*Status paket akun Anda saat ini:* **${user.subscription_tier.toUpperCase()}**.`;
  }

  // H. Tips Mengatur Gaji / Literasi Keuangan
  if (
    cleanQuery.includes('tips') ||
    cleanQuery.includes('saran') ||
    cleanQuery.includes('hemat') ||
    cleanQuery.includes('gaji') ||
    cleanQuery.includes('investasi') ||
    cleanQuery.includes('menabung')
  ) {
    return `💡 **Tips Tata Kelola Finansial Cerdas (Aturan 50/30/20):**\n\n1. **50% Kebutuhan Pokok (Needs):**\n   Alokasikan untuk makan, sewa tempat tinggal/KPR, listrik, air, dan transportasi kerja.\n2. **30% Keinginan (Wants):**\n   Hiburan, nongkrong, belanja gaya hidup, dan langganan hiburan. Pastikan tidak melebihi kuota anggaran!\n3. **20% Tabungan & Masa Depan (Savings & Debt):**\n   Prioritaskan membangun dana darurat minimal 3-6 bulan pengeluaran sebelum mulai berinvestasi.\n\n*Pencatatan rutin setiap pengeluaran kecil (seperti parkir dan kopi) adalah kunci agar tidak bocor halus di akhir bulan!*`;
  }

  // I. Default Helpful Fallback
  return `Halo **${user.full_name}**! 👋 Saya adalah Asisten Finansial & Aplikasi TataDana.\n\nSaya bisa membantu Anda dengan berbagai hal:\n\n• **Informasi Keuangan Anda**: Tanya *"Berapa saldo saya?"*, *"Pengeluaran terbesar bulan ini apa?"*, atau *"Apakah ada anggaran yang overbudget?"*.\n• **Bantuan Fitur Aplikasi**: Tanya *"Cara menghubungkan Telegram Bot"*, *"Format teks yang didukung"*, *"Cara ekspor laporan ke Excel/PDF"*, atau *"Fitur paket Pro"*.\n• **Konsultasi Finansial**: Tanya *"Tips mengelola gaji"* atau *"Cara mencegah boncos"*.\n\nAda yang ingin Anda ketahui lebih detail? Silakan ketik pertanyaan Anda!`;
}
