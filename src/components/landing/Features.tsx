import React from 'react';
import { Camera, Mic, Wallet, Bot, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function Features() {
  const features = [
    {
      icon: Camera,
      title: 'Multimodal Vision OCR Struk Belanja',
      tagline: 'Struk Kasir Jadi Data Digital dalam 2 Detik',
      description:
        'Foto struk Indomaret, Alfamart, atau Superindo Anda. AI multimodal kami mengekstrak nama toko, tanggal, item barang beserta harganya, lalu mencatatnya secara terperinci ke dalam transaksi Anda.',
      points: [
        'Ekstraksi otomatis daftar item & harga satuan',
        'Penyimpanan foto struk aman di cloud storage',
        'Deteksi total belanja otomatis tanpa input manual',
      ],
      badge: 'TataDana Pro',
      reverse: false,
    },
    {
      icon: Mic,
      title: 'Pesan Suara (Voice Note STT)',
      tagline: 'Sambil Nyetir atau Jalan Santai, Tinggal Bicara',
      description:
        'Sedang di jalan dan tidak sempat mengetik? Tekan rekam di Telegram dan katakan "Beli bensin 50 ribu". AI Speech-to-Text kami mentranskripsikannya dan memproses nominalnya secara instan.',
      points: [
        'Mendukung Bahasa Indonesia kasual & slang',
        'Maksimal 60 detik audio per voice note',
        'Transkrip tertulis otomatis terlampir di laporan',
      ],
      badge: 'TataDana Pro',
      reverse: true,
    },
    {
      icon: Wallet,
      title: 'Multi-Dompet (Cash, Bank, & eWallet)',
      tagline: 'Atur Dompet Tunai, BCA, Mandiri, GoPay & OVO',
      description:
        'Pisahkan uang jajan, rekening operasional, dan saldo e-wallet. Anda dapat menentukan satu dompet default untuk Telegram bot atau memindahkan saldo antar-dompet dengan perintah transfer.',
      points: [
        'Sinkronisasi saldo otomatis pada setiap transaksi',
        'Kustomisasi ikon dan penamaan dompet sesuka hati',
        'Dukungan transaksi transfer antar-rekening instan',
      ],
      badge: 'Semua Paket',
      reverse: false,
    },
    {
      icon: FileText,
      title: 'Ekspor On-Demand PDF & Excel (.xlsx)',
      tagline: 'Laporan Keuangan Rapi Siap Kirim atau Cetak',
      description:
        'Unduh laporan bulanan berformat resmi lengkap dengan ringkasan arus kas bersih, rincian per kategori, dan stempel waktu WIB. Siap untuk pembukuan UMKM atau pengajuan pajak.',
      points: [
        'File Excel multi-sheet (Ringkasan + Detail Ledger)',
        'File PDF elegan dengan styling oranye khas TataDana',
        'Akses unduh langsung dari dashboard web maupun bot (/sheet)',
      ],
      badge: 'Semua Paket',
      reverse: true,
    },
  ];

  return (
    <section id="fitur" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
            Fitur Unggulan
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Dirancang Khusus untuk Gaya Hidup & Fintech Indonesia
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Kombinasi kekuatan AI terkini dengan kenyamanan aplikasi pesan Telegram yang ringan dan cepat.
          </p>
        </div>

        <div className="space-y-24">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-16 ${
                feat.reverse ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Text Info */}
              <div className="flex-1 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-brand-600 text-xs font-bold">
                  <feat.icon className="w-4 h-4" />
                  <span>{feat.badge}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {feat.title}
                </h3>
                <p className="text-base text-brand-600 font-semibold">{feat.tagline}</p>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{feat.description}</p>

                <ul className="space-y-3 pt-2">
                  {feat.points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                      <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        ✓
                      </span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Graphic Mock Card */}
              <div className="flex-1 w-full">
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-orange-50/30 p-8 shadow-lg relative overflow-hidden">
                  <div className="w-12 h-12 rounded-xl bg-brand-500 text-white flex items-center justify-center mb-6 shadow-md shadow-brand-500/20">
                    <feat.icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h4>
                  <p className="text-xs text-slate-500 mb-6">TataDana Enterprise & Personal Edition</p>

                  <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2">
                      <span>Status Engine</span>
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Aktif
                      </span>
                    </div>
                    <div className="text-xs font-mono text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      ai_module: &quot;{feat.title.toLowerCase().replace(/\s+/g, '_')}&quot;
                      <br />
                      telemetry: latency ~410ms | accuracy 99.8%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
