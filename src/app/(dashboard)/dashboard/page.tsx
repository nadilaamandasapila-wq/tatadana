'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Target,
  ArrowRight,
  Bot,
  CheckCircle2,
  Calendar,
  Sparkles,
  Radio,
  FileSpreadsheet,
  CircleDot,
  RotateCcw,
} from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/Header';
import { PeriodFilter, PeriodType } from '@/components/dashboard/PeriodFilter';
import { DonutChart, SixMonthBarChart, DailyTrendChart } from '@/components/ui/charts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/utils/currency';
import { formatWIB } from '@/lib/utils/date';
import { demoStore } from '@/lib/mock/store';
import { useRealtimeTransactions } from '@/hooks/useRealtimeTransactions';

export default function DashboardOverviewPage() {
  const [period, setPeriod] = useState<PeriodType>('monthly');

  const { transactions, wallets, budgets, isConnected, refresh } = useRealtimeTransactions();
  const user = demoStore.getUser();

  const handleLoadDemo = () => {
    demoStore.loadSampleData();
    refresh();
  };

  const handleResetClean = () => {
    demoStore.resetToCleanAccount(user.full_name, user.email, user.phone);
    refresh();
  };


  // Calculations
  const totalBalance = useMemo(() => {
    return wallets.reduce((acc, w) => acc + w.balance, 0);
  }, [wallets]);

  // Filter transactions based on selected period
  const filteredTxs = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.transaction_date);
      const now = new Date();
      if (period === 'daily') {
        return (
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }
      if (period === 'weekly') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
        return d >= sevenDaysAgo;
      }
      if (period === 'monthly') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (period === 'yearly') {
        return d.getFullYear() === now.getFullYear();
      }
      return true; // custom / all
    });
  }, [transactions, period]);

  const periodLabel =
    period === 'daily'
      ? 'Hari Ini'
      : period === 'weekly'
      ? 'Minggu Ini'
      : period === 'monthly'
      ? 'Bulan Ini'
      : period === 'yearly'
      ? 'Tahun Ini'
      : 'Periode Terpilih';

  const totalIncome = useMemo(() => {
    return filteredTxs
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [filteredTxs]);

  const totalExpense = useMemo(() => {
    return filteredTxs
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [filteredTxs]);

  const totalBudgetLimit = useMemo(() => {
    return budgets.reduce((acc, b) => acc + b.monthly_limit, 0);
  }, [budgets]);

  const totalBudgetSpent = useMemo(() => {
    // Dynamic calculate spent from expense transactions of current month
    const now = new Date();
    const currentMonthTxs = transactions.filter((t) => {
      const d = new Date(t.transaction_date);
      return (
        t.type === 'expense' &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    });
    return currentMonthTxs.reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const remainingBudget = Math.max(totalBudgetLimit - totalBudgetSpent, 0);

  // Category Pie Data
  const pieData = useMemo(() => {
    const categoryTotals: Record<string, { amount: number; color: string }> = {};
    filteredTxs
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const catName = t.category?.name || 'Lain-lain';
        const color = t.category?.color || '#f97316';
        if (!categoryTotals[catName]) {
          categoryTotals[catName] = { amount: 0, color };
        }
        categoryTotals[catName].amount += t.amount;
      });

    return Object.entries(categoryTotals).map(([name, val]) => ({
      name,
      amount: val.amount,
      color: val.color,
    }));
  }, [filteredTxs]);

  // Dynamic 6-Month Bar Data
  const barData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const now = new Date();
    const result = [];

    for (let i = 5; i >= 0; i--) {
      const targetMonthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = targetMonthDate.getMonth();
      const yVal = targetMonthDate.getFullYear();
      const mLabel = monthNames[mIdx];

      // Sum income & expense for that month
      let mIncome = 0;
      let mExpense = 0;

      transactions.forEach((t) => {
        const tDate = new Date(t.transaction_date);
        if (tDate.getMonth() === mIdx && tDate.getFullYear() === yVal) {
          if (t.type === 'income') mIncome += t.amount;
          else if (t.type === 'expense') mExpense += t.amount;
        }
      });

      result.push({
        month: mLabel,
        income: mIncome,
        expense: mExpense,
      });
    }

    return result;
  }, [transactions]);

  // Dynamic Daily Trend Data (last 7 days)
  const trendData = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dayStr = `${String(d.getDate()).padStart(2, '0')} ${
        ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][d.getMonth()]
      }`;

      // Sum expenses on this day
      const dayExpense = transactions
        .filter((t) => {
          if (t.type !== 'expense') return false;
          const txDate = new Date(t.transaction_date);
          return (
            txDate.getDate() === d.getDate() &&
            txDate.getMonth() === d.getMonth() &&
            txDate.getFullYear() === d.getFullYear()
          );
        })
        .reduce((sum, t) => sum + t.amount, 0);

      days.push({
        day: dayStr,
        amount: dayExpense,
      });
    }
    return days;
  }, [transactions]);

  // Onboarding Checklist statuses
  const hasWallets = wallets.length > 0;
  const hasBudgets = budgets.length > 0;
  const hasBotLinked = Boolean(user.telegram_chat_id);
  const hasTransactions = transactions.length > 0;
  const completedSteps = [true, hasWallets, hasBudgets, hasBotLinked, hasTransactions].filter(Boolean).length;

  return (
    <>
      <DashboardHeader title="Beranda Keuangan" />

      <main className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Onboarding Checklist Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-orange-50 via-white to-amber-50 border border-brand-200/80 p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Checklist Memulai TataDana ({completedSteps}/5 Selesai)
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Selamat Datang, {user.full_name}! Akun Anda Telah Siap.
              </h3>
              <p className="text-xs text-slate-600">
                Lengkapi langkah onboarding berikut untuk mengoptimalkan otomatisasi Telegram bot dan asisten keuangan Anda.
              </p>

              {/* Progress items */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Akun Terverifikasi</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-700">
                  <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${hasWallets ? 'text-emerald-500' : 'text-slate-300'}`} />
                  <span>{wallets.length} Dompet Aktif</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-700">
                  <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${hasBudgets ? 'text-emerald-500' : 'text-slate-300'}`} />
                  <span>{budgets.length} Limit Anggaran</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-700">
                  <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${hasBotLinked ? 'text-emerald-500' : 'text-slate-300'}`} />
                  <span>Bot Telegram {hasBotLinked ? 'Terhubung' : 'Belum'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {transactions.length === 0 ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLoadDemo}
                  className="gap-1.5 whitespace-nowrap text-xs border-brand-300 text-brand-600 hover:bg-brand-50"
                  title="Isi data simulasi untuk preview grafik"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Muat Data Simulasi (Demo)
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleResetClean}
                  className="gap-1.5 whitespace-nowrap text-xs border-slate-300 text-slate-600 hover:bg-slate-50"
                  title="Hapus data contoh dan mulai dari Rp 0"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Mulai Akun Bersih (Rp 0)
                </Button>
              )}

              <Link href="/settings">
                <Button size="sm" variant="primary" className="gap-1.5 whitespace-nowrap text-xs">
                  <Bot className="w-4 h-4" /> Pengaturan Telegram Bot
                </Button>
              </Link>
            </div>
          </div>
        </div>


        {/* Global Period Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Ringkasan Statistik Keuangan</h2>
            <p className="text-xs text-slate-500">
              Waktu Indonesia Barat (WIB) &bull; Sinkronisasi Supabase Realtime Otomatis
            </p>
          </div>
          <PeriodFilter currentPeriod={period} onChange={setPeriod} />
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Saldo Total */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase">
                Total Saldo Semua Dompet
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{formatRupiah(totalBalance)}</div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span>{wallets.length} Dompet Aktif</span> &bull;{' '}
                <Link href="/wallets" className="text-brand-600 hover:underline font-medium">
                  Kelola Dompet
                </Link>
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Pemasukan Bulan Ini */}
          <Card className="hover:shadow-md transition-shadow border-emerald-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-emerald-700 uppercase">
                Pemasukan ({periodLabel})
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700">+{formatRupiah(totalIncome)}</div>
              <p className="text-xs text-emerald-600 mt-1">Gaji & Pendapatan Terverifikasi</p>
            </CardContent>
          </Card>

          {/* Card 3: Pengeluaran */}
          <Card className="hover:shadow-md transition-shadow border-rose-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-rose-700 uppercase">
                Pengeluaran ({periodLabel})
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-700">-{formatRupiah(totalExpense)}</div>
              <p className="text-xs text-rose-600 mt-1">
                {totalIncome > 0
                  ? `${Math.round((totalExpense / totalIncome) * 100)}% dari pemasukan`
                  : 'Belum ada pemasukan'}
              </p>
            </CardContent>
          </Card>

          {/* Card 4: Sisa Anggaran */}
          <Card className="hover:shadow-md transition-shadow border-brand-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-brand-700 uppercase">
                Sisa Anggaran Bulanan
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brand-600">{formatRupiah(remainingBudget)}</div>
              <p className="text-xs text-brand-700 mt-1">
                Limit: {formatRupiah(totalBudgetLimit)} ({totalBudgetLimit > 0 ? Math.round((totalBudgetSpent / totalBudgetLimit) * 100) : 0}% terpakai)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Category Donut Chart (5 cols) */}
          <div className="lg:col-span-5">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-bold text-slate-900">
                  Kategori Pengeluaran
                </CardTitle>
                <Link href="/budgets" className="text-xs text-brand-600 hover:underline font-semibold">
                  Atur Limit
                </Link>
              </CardHeader>
              <CardContent className="pt-4">
                <DonutChart data={pieData} />
              </CardContent>
            </Card>
          </div>

          {/* 6-Month Income vs Expense Bar Chart (7 cols) */}
          <div className="lg:col-span-7">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-bold text-slate-900">
                  Arus Kas 6 Bulan Terakhir
                </CardTitle>
                <span className="text-xs text-slate-400 font-medium">Tren Bulanan (WIB)</span>
              </CardHeader>
              <CardContent className="pt-2">
                <SixMonthBarChart data={barData} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Daily Trend Line Chart */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Tren Pengeluaran 7 Hari Terakhir
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Pantau lonjakan pengeluaran harian Anda</p>
            </div>
            <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md self-start sm:self-auto">
              Rata-rata: {formatRupiah(Math.round(totalExpense / 30))}/hari
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <DailyTrendChart data={trendData} />
          </CardContent>
        </Card>

        {/* Recent 10 Transactions Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                10 Transaksi Terakhir
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Transaksi dari Telegram Bot & manual disinkronkan realtime
              </p>
            </div>
            <Link href="/transactions">
              <Button variant="ghost" size="sm" className="text-brand-600 gap-1 text-xs">
                Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-y border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-6">Tanggal & Waktu</th>
                    <th className="py-3 px-6">Kategori</th>
                    <th className="py-3 px-6">Catatan</th>
                    <th className="py-3 px-6">Dompet</th>
                    <th className="py-3 px-6">Sumber</th>
                    <th className="py-3 px-6 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 px-6 text-center">
                        <div className="max-w-md mx-auto space-y-2">
                          <p className="font-semibold text-slate-700 text-sm">Belum Ada Transaksi Tercatat</p>
                          <p className="text-xs text-slate-500">
                            Pemasukan dan pengeluaran Anda masih Rp 0. Klik tombol <strong>+ Catat Transaksi</strong> di kanan atas, kirim pesan ke bot Telegram, atau klik tombol simulasi di bawah untuk preview.
                          </p>
                          <div className="pt-2 flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleLoadDemo}
                              className="gap-1.5 text-xs text-brand-600 border-brand-200 hover:bg-brand-50"
                            >
                              <Sparkles className="w-3.5 h-3.5" /> Muat Data Simulasi (Demo)
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    transactions.slice(0, 10).map((tx) => {
                      const isIncome = tx.type === 'income';
                      const isTransfer = tx.type === 'transfer';
                      const color = isIncome
                        ? 'text-emerald-600'
                        : isTransfer
                        ? 'text-blue-600'
                        : 'text-rose-600';
                      const sign = isIncome ? '+' : isTransfer ? '' : '-';

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-6 font-medium text-slate-600 whitespace-nowrap">
                            {formatWIB(tx.transaction_date, { formatStr: 'short' })}
                          </td>
                          <td className="py-3.5 px-6 whitespace-nowrap">
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold text-[11px]"
                              style={{
                                backgroundColor: `${tx.category?.color || '#f97316'}15`,
                                color: tx.category?.color || '#f97316',
                              }}
                            >
                              {tx.category?.name || 'Lain-lain'}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-slate-800 font-medium max-w-xs truncate">
                            {tx.notes || '-'}
                          </td>
                          <td className="py-3.5 px-6 text-slate-500 whitespace-nowrap">{tx.wallet?.name || 'Dompet'}</td>
                          <td className="py-3.5 px-6 whitespace-nowrap">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              {tx.source}
                            </span>
                          </td>
                          <td className={`py-3.5 px-6 text-right font-bold whitespace-nowrap ${color}`}>
                            {sign}
                            {formatRupiah(tx.amount)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
