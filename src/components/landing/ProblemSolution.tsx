import React from 'react';
import { XCircle, CheckCircle2, Zap, Smartphone, FileSpreadsheet, Clock } from 'lucide-react';

export function ProblemSolution() {
  const problems = [
    {
      icon: Clock,
      title: 'Lupa Mencatat Pengeluaran Harian',
      desc: 'Buka aplikasi akuntansi biasa butuh 5-8 kali klik, pilih akun, pilih tanggal, dan ketik manual. Ujung-ujungnya malas dan lupa catat.',
    },
    {
      icon: FileSpreadsheet,
      title: 'Struk Belanja Tercecer & Hilang',
      desc: 'Struk supermarket atau minimarket menumpuk di dompet, tintanya pudar atau hilang sebelum sempat diinput.',
    },
    {
      icon: XCircle,
      title: 'Tidak Tahu Ke Mana Uang Habis',
      desc: 'Akhir bulan selalu heran saldo rekening habis tanpa sadar kategori pengeluaran mana yang overbudget.',
    },
  ];

  const solutions = [
    {
      icon: Smartphone,
      title: 'Cukup Kirim Chat di Telegram',
      desc: 'Buka Telegram yang sudah Anda pakai sehari-hari, ketik "Nasi uduk 15rb", selesai dalam 3 detik!',
    },
    {
      icon: Zap,
      title: 'OCR Struk Belanja Otomatis',
      desc: 'Cukup jepret foto bon atau struk kasir, AI mengekstrak nama merchant, daftar barang, harga satuan, dan total belanja.',
    },
    {
      icon: CheckCircle2,
      title: 'Visual Progress Bar & AI Advisor',
      desc: 'Dapatkan progress bar visual anggaran dan peringatan proaktif jika pengeluaran kategori melonjak >50%.',
    },
  ];

  return (
    <section id="solusi" className="py-20 bg-slate-50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-brand-600 uppercase tracking-widest">
            Tantangan Finansial vs Solusi Nyata
          </h2>
          <p className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Kenapa 90% Orang Gagal Disiplin Mengatur Keuangan?
          </p>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Aplikasi konvensional terlalu kaku dan rumit. TataDana mendesain ulang cara mencatat uang agar senyaman mengobrol dengan sahabat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {/* Problems Box */}
          <div className="rounded-2xl bg-white p-8 border border-rose-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-full -z-0" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold mb-6">
                <XCircle className="w-4 h-4" /> Cara Lama yang Melelahkan
              </div>
              <div className="space-y-6">
                {problems.map((p, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0">
                      <p.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{p.title}</h4>
                      <p className="text-sm text-slate-600 mt-1 leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Solution Box */}
          <div className="rounded-2xl bg-white p-8 border border-brand-200/80 shadow-md shadow-brand-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-full -z-0" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold mb-6">
                <CheckCircle2 className="w-4 h-4" /> Pengalaman Modern TataDana
              </div>
              <div className="space-y-6">
                {solutions.map((s, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center flex-shrink-0">
                      <s.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{s.title}</h4>
                      <p className="text-sm text-slate-600 mt-1 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
