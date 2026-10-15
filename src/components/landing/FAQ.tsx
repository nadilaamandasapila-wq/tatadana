'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Bagaimana cara menghubungkan akun TataDana dengan Telegram Bot?',
      a: 'Sangat mudah! Setelah mendaftar, buka halaman Pengaturan di dashboard web. Masukkan token bot Telegram Anda atau klik tombol "Mulai Chat" untuk langsung berbicara dengan TataDana FinBot. Akun Anda otomatis tersinkronisasi.',
    },
    {
      q: 'Apakah data keuangan pribadi saya aman?',
      a: 'Sangat aman. TataDana menggunakan arsitektur Row-Level Security (RLS) di Supabase PostgreSQL, enkripsi data in-transit (HTTPS/TLS) & at-rest, serta tokenisasi Midtrans. Data Anda terisolasi penuh dan tidak akan pernah dibagikan ke pihak ketiga.',
    },
    {
      q: 'Format teks seperti apa yang bisa dipahami oleh bot TataDana?',
      a: 'AI kami dilatih untuk memahami bahasa santai Indonesia. Anda bisa mengetik "Makan siang 25rb", "Beli bensin 50k", "Kopi 18ribu", "Gaji masuk 15jt", "Transfer ke BCA 500rb", atau bahkan bahasa gaul seperti "gocap buat makan".',
    },
    {
      q: 'Bagaimana cara kerja scan struk belanja (OCR)?',
      a: 'Pengguna paket Pro cukup memotret struk belanja dari kasir supermarket, minimarket, atau restoran lalu mengirimkannya ke Telegram bot. AI Vision multimodal kami membaca nama toko, rincian barang, harga, dan total belanja lalu menyimpannya ke sistem.',
    },
    {
      q: 'Metode pembayaran apa saja yang didukung untuk upgrade ke Pro?',
      a: 'Kami terintegrasi resmi dengan Midtrans Payment Gateway. Anda dapat membayar menggunakan QRIS (GoPay, OVO, ShopeePay, DANA), Virtual Account Bank (BCA, Mandiri, BNI, BRI), maupun kartu debit/kredit.',
    },
    {
      q: 'Bisakah saya mengekspor data transaksi ke Excel atau PDF kapan saja?',
      a: 'Ya, Anda bisa mengunduh laporan keuangan berformat PDF elegan atau file Excel (.xlsx) multi-sheet kapan pun melalui menu Laporan di web dashboard atau cukup mengetikkan perintah /sheet di Telegram bot.',
    },
    {
      q: 'Apa yang terjadi jika batas 50 transaksi di paket Starter tercapai?',
      a: 'Jika kuota 50 transaksi bulanan Starter tercapai, data transaksi Anda sebelumnya tetap aman dan dapat diakses. Namun, bot akan meminta Anda melakukan upgrade ke Pro untuk terus mencatat transaksi baru tanpa batas.',
    },
  ];

  return (
    <section id="faq" className="py-24 bg-slate-50 border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
            Pertanyaan Umum
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Segala hal yang perlu Anda ketahui tentang TataDana dan integrasi Telegram Bot.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between font-bold text-slate-900 text-sm sm:text-base hover:text-brand-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${
                      isOpen ? 'transform rotate-180 text-brand-500' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
