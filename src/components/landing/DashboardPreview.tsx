import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, TrendingUp, TrendingDown, Wallet, Target, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DonutChart, SixMonthBarChart } from '@/components/ui/charts';
import { formatRupiah } from '@/lib/utils/currency';

export function DashboardPreview() {
  const pieData = [
    { name: 'Makanan & Minuman', amount: 1950000, color: '#f97316' },
    { name: 'Belanja', amount: 1720000, color: '#ec4899' },
    { name: 'Tagihan & Utilitas', amount: 450000, color: '#eab308' },
    { name: 'Transportasi', amount: 450000, color: '#3b82f6' },
    { name: 'Hiburan', amount: 600000, color: '#8b5cf6' },
  ];

  const barData = [
    { month: 'Mei', income: 14000000, expense: 4800000 },
    { month: 'Jun', income: 15500000, expense: 5200000 },
    { month: 'Jul', income: 14500000, expense: 4900000 },
    { month: 'Agu', income: 16000000, expense: 5500000 },
    { month: 'Sep', income: 18500000, expense: 5800000 },
    { month: 'Okt', income: 18500000, expense: 5170000 },
  ];

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Web Dashboard Responsif
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Visualisasi Finansial Lengkap & Jernih
            </h2>
            <p className="mt-3 text-slate-600 max-w-xl text-sm sm:text-base">
              Setiap sen yang Anda kirim lewat bot langsung dirangkum dalam grafik interaktif, laporan ekspor, dan audit multi-dompet.
            </p>
          </div>
          <Link href="/register">
            <Button variant="primary" className="gap-2">
              Daftar & Coba Sekarang <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Dashboard Preview Card Container */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl space-y-8">
          {/* 4 Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>TOTAL SALDO</span>
                <Wallet className="w-4 h-4 text-brand-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">Rp 16.770.000</div>
              <div className="text-xs text-slate-500 mt-1">3 Dompet Terhubung</div>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-5">
              <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
                <span>PEMASUKAN BULAN INI</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-700 mt-2">+Rp 18.500.000</div>
              <div className="text-xs text-emerald-600 mt-1">Gaji & Freelance</div>
            </div>

            <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-5">
              <div className="flex items-center justify-between text-rose-700 text-xs font-semibold">
                <span>PENGELUARAN BULAN INI</span>
                <TrendingDown className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-bold text-rose-700 mt-2">-Rp 5.170.000</div>
              <div className="text-xs text-rose-600 mt-1">28% dari Total Pemasukan</div>
            </div>

            <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-5">
              <div className="flex items-center justify-between text-brand-700 text-xs font-semibold">
                <span>SISA ANGGARAN</span>
                <Target className="w-4 h-4 text-brand-600" />
              </div>
              <div className="text-2xl font-bold text-brand-600 mt-2">Rp 1.180.000</div>
              <div className="text-xs text-brand-700 mt-1">Dari Limit Rp 6.350.000</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
            <div className="rounded-xl border border-slate-100 p-5">
              <div className="text-sm font-bold text-slate-900 mb-4">Distribusi Pengeluaran per Kategori</div>
              <DonutChart data={pieData} />
            </div>

            <div className="rounded-xl border border-slate-100 p-5">
              <div className="text-sm font-bold text-slate-900 mb-4">Arus Kas 6 Bulan Terakhir</div>
              <SixMonthBarChart data={barData} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
