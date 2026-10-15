'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'lifetime'>('lifetime');

  return (
    <section id="harga" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
            Investasi Finansial
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Pilihan Paket Transparan Tanpa Biaya Tersembunyi
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Pilih paket Starter bulanan atau nikmati paket Pro sekali bayar untuk akses AI finansial seumur hidup.
          </p>

          {/* Monthly / Lifetime Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 p-1 rounded-full bg-slate-100 border border-slate-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bulanan (Starter Rp49k/bln)
            </button>
            <button
              onClick={() => setBillingCycle('lifetime')}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                billingCycle === 'lifetime' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sekali Bayar (Pro Rp99k Lifetime)
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${billingCycle === 'lifetime' ? 'bg-white text-brand-600' : 'bg-brand-100 text-brand-700'}`}>
                Populer
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          {/* Starter Plan */}
          <div className={`rounded-2xl border ${billingCycle === 'monthly' ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200'} bg-white p-8 shadow-sm flex flex-col justify-between transition-all`}>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-4">
                Starter Bulanan
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Mulai Mengatur Keuangan</h3>
              <p className="text-sm text-slate-500 mt-1 mb-6">
                Cocok untuk pengguna pemula yang ingin membiasakan diri mencatat pengeluaran rutin.
              </p>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-extrabold text-slate-900">Rp 49.000</span>
                <span className="text-sm text-slate-500">/ bulan</span>
              </div>

              <ul className="space-y-3.5 text-sm text-slate-700">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>Maksimal 50 transaksi per bulan</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>Integrasi Telegram Bot untuk pesan teks</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>Maksimal 2 Dompet (Tunai & 1 Rekening)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>Visual Progress Bar Anggaran</span>
                </li>
                <li className="flex items-center gap-3 text-slate-400">
                  <span className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center text-xs">✕</span>
                  <span>Scan OCR Foto Struk Belanja</span>
                </li>
                <li className="flex items-center gap-3 text-slate-400">
                  <span className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center text-xs">✕</span>
                  <span>Pesan Suara (Voice Note STT)</span>
                </li>
                <li className="flex items-center gap-3 text-slate-400">
                  <span className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center text-xs">✕</span>
                  <span>AI Financial Advisor Proaktif</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link href="/register">
                <Button variant="outline" className="w-full">
                  Pilih Starter Bulanan
                </Button>
              </Link>
            </div>
          </div>

          {/* Pro Plan */}
          <div className={`rounded-2xl border-2 ${billingCycle === 'lifetime' ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200'} bg-white p-8 shadow-xl shadow-brand-500/10 flex flex-col justify-between relative overflow-hidden transition-all`}>
            <div className="absolute top-0 right-0 bg-brand-500 text-white text-[11px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Rekomendasi Lifetime
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold mb-4">
                <Zap className="w-3.5 h-3.5" /> TataDana Pro (Lifetime)
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Kendali Finansial Total</h3>
              <p className="text-sm text-slate-500 mt-1 mb-6">
                Akses seumur hidup tanpa biaya langganan bulanan. Kekuatan AI canggih tanpa batas.
              </p>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-extrabold text-slate-900">
                  Rp 99.000
                </span>
                <span className="text-sm text-slate-500">/ sekali bayar</span>
                <span className="text-xs text-brand-600 ml-1 font-semibold">(Akses Seumur Hidup)</span>
              </div>

              <ul className="space-y-3.5 text-sm text-slate-700">
                <li className="flex items-center gap-3 font-semibold text-slate-900">
                  <Check className="w-5 h-5 text-brand-500 flex-shrink-0" />
                  <span>Transaksi Bulanan Tanpa Batas (Unlimited)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-brand-500 flex-shrink-0" />
                  <span>Scan OCR Struk Kasir & Supermarket (Foto)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-brand-500 flex-shrink-0" />
                  <span>Input via Pesan Suara (Voice Note STT)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-brand-500 flex-shrink-0" />
                  <span>AI Financial Advisor (Deteksi lonjakan belanja)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-brand-500 flex-shrink-0" />
                  <span>Multi-Dompet Tanpa Batas (Cash, Bank, E-Wallet)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-brand-500 flex-shrink-0" />
                  <span>Ekspor Laporan On-Demand PDF & Excel (.xlsx)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-brand-500 flex-shrink-0" />
                  <span>Pengingat Jadwal Harian via Telegram (2x/hari)</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link href="/register">
                <Button variant="primary" className="w-full shadow-lg shadow-brand-500/25">
                  Dapatkan Akses Pro Rp99k Lifetime
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
