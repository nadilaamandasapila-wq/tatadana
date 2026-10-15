import React from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-orange-50/50 via-white to-white">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-brand-200/40 via-orange-100/30 to-transparent blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Pre-headline Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-brand-500 animate-pulse" />
          <span>✨ Catat keuangan langsung dari Telegram</span>
        </div>

        {/* Gradient H1 Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
          <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 bg-clip-text text-transparent">
            Gaji habis sebelum akhir bulan?
          </span>{' '}
          Sudah saatnya kamu tahu ke mana uangmu pergi.
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          TataDana mencatat setiap pengeluaranmu langsung dari chat Telegram atau foto struk — sisanya kami yang urus.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto px-8 shadow-lg shadow-brand-500/25 text-base">
              Mulai Gratis Sekarang <ArrowRight className="h-5 w-5 ml-1" />
            </Button>
          </Link>
          <Link href="#simulator" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base gap-2">
              <Bot className="h-5 w-5 text-brand-500" />
              Lihat cara kerjanya &rarr;
            </Button>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Tanpa Kartu Kredit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-500" />
            <span>Terkoneksi Aman via Supabase RLS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Mendukung Slang & Nominal Indo</span>
          </div>
        </div>

        {/* Hero Video / Dashboard Graphic Placeholder */}
        {/* // TODO: ganti dengan video asli */}
        <div className="mt-14 relative max-w-5xl mx-auto rounded-2xl border border-slate-200/80 bg-white p-2 shadow-2xl shadow-slate-200/50">
          <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-800 text-left p-6 sm:p-8 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="ml-2 text-xs font-mono text-slate-400">tatadana-fintech-hub.local</span>
              </div>
              <div className="text-xs bg-brand-500/20 text-brand-400 border border-brand-500/30 px-3 py-1 rounded-full font-semibold">
                Live Preview
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-4">
                <div className="text-xs font-semibold text-brand-400 tracking-wide uppercase">
                  Ringkasan Keuangan Anda (WIB)
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  Rp 16.770.000
                  <span className="text-xs font-normal text-emerald-400 ml-2 bg-emerald-500/10 px-2 py-0.5 rounded">
                    +18.4% bulan ini
                  </span>
                </div>
                <p className="text-sm text-slate-300">
                  Transaksi via Telegram Bot langsung tersinkronisasi ke 3 dompet: Tunai Dompet, BCA Utama, dan GoPay.
                </p>
              </div>

              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60">
                <div className="text-xs text-slate-400 mb-2 font-medium">Monitoring Anggaran Bulanan</div>
                <div className="text-xs font-semibold text-slate-200 flex justify-between mb-1">
                  <span>Makanan & Minuman</span>
                  <span className="text-amber-400">78%</span>
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-brand-500 h-full rounded-full" style={{ width: '78%' }} />
                </div>
                <div className="text-[11px] text-slate-400 mt-2">Rp 1.950.000 / Rp 2.500.000</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
