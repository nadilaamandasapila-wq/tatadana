import React from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-20 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 text-white">
      {/* Decorative ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent_70%)] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Akses Instan &bull; Siap Pakai Hari Ini</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto">
          Mulai Kendalikan Arus Keuangan Anda Bersama TataDana
        </h2>

        <p className="text-white/90 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Bergabunglah dengan ribuan pengguna Indonesia yang menghemat waktu dan uang dengan mencatat mutasi keuangan semudah mengirim chat di Telegram.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-white text-brand-700 hover:bg-slate-100 font-bold px-8 py-3 text-base shadow-xl shadow-black/10"
            >
              Daftar Gratis Sekarang <ArrowRight className="h-5 w-5 ml-1" />
            </Button>
          </Link>
          <Link href="#simulator" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-white border-white/40 hover:bg-white/10 text-base gap-2 backdrop-blur-sm"
            >
              <Bot className="h-5 w-5" />
              Coba Bot Simulator
            </Button>
          </Link>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-white/80 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Setup 30 Detik</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Tanpa Kartu Kredit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Gratis 50 Transaksi/Bulan</span>
          </div>
        </div>
      </div>
    </section>
  );
}
