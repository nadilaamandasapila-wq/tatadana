'use client';

import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowDownToLine,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/utils/currency';
import { formatWIB } from '@/lib/utils/date';
import { demoStore } from '@/lib/mock/store';
import { generateReportExport } from '@/lib/export';
import { useRealtimeTransactions } from '@/hooks/useRealtimeTransactions';
import { Transaction, ExportHistory } from '@/types/database';

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('Oktober 2026');
  const [isExporting, setIsExporting] = useState<string | null>(null);

  // Native Report Table State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedWallet, setSelectedWallet] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortField, setSortField] = useState<'date' | 'category' | 'wallet' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { transactions: rawTransactions, wallets } = useRealtimeTransactions();
  const categories = demoStore.getCategories();
  const [exportsList, setExportsList] = useState<ExportHistory[]>(demoStore.getExports());

  // Metrics calculation
  const totalIncome = useMemo(() => {
    return rawTransactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [rawTransactions]);

  const totalExpense = useMemo(() => {
    return rawTransactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [rawTransactions]);

  const netCashflow = totalIncome - totalExpense;

  // Filter Transactions
  const filtered = useMemo(() => {
    return rawTransactions.filter((t) => {
      if (selectedType !== 'all' && t.type !== selectedType) return false;
      if (selectedCategory !== 'all' && t.category_id !== selectedCategory) return false;
      if (selectedWallet !== 'all' && t.wallet_id !== selectedWallet) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchNotes = t.notes?.toLowerCase().includes(q);
        const matchCat = t.category?.name?.toLowerCase().includes(q);
        const matchWallet = t.wallet?.name?.toLowerCase().includes(q);
        const matchAmt = t.amount.toString().includes(q);
        if (!matchNotes && !matchCat && !matchWallet && !matchAmt) return false;
      }
      return true;
    });
  }, [rawTransactions, selectedType, selectedCategory, selectedWallet, searchQuery]);

  // Sort Transactions
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime();
      } else if (sortField === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortField === 'category') {
        comparison = (a.category?.name || '').localeCompare(b.category?.name || '');
      } else if (sortField === 'wallet') {
        comparison = (a.wallet?.name || '').localeCompare(b.wallet?.name || '');
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [filtered, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.max(Math.ceil(sorted.length / pageSize), 1);
  const paginated = useMemo(() => {
    return sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [sorted, currentPage, pageSize]);

  const toggleSort = (field: 'date' | 'category' | 'wallet' | 'amount') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleExport = async (type: 'pdf' | 'xlsx') => {
    setIsExporting(type);
    try {
      const user = demoStore.getUser();
      const res = await generateReportExport({
        userId: user.id,
        fileType: type,
        period: selectedPeriod,
        transactions: sorted,
      });

      setExportsList(demoStore.getExports());
      window.open(res.fileUrl, '_blank');
      setIsExporting(null);
    } catch (err) {
      console.error('Export error:', err);
      setIsExporting(null);
    }
  };

  return (
    <>
      <DashboardHeader title="Laporan & Ekspor Data" />

      <main className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Export Banner Card */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-5 sm:p-8 text-white shadow-lg shadow-brand-500/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" /> Mesin Ekspor Dokumen Resmi
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              Laporan Keuangan & Mutasi Terpadu
            </h2>
            <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
              Tinjau buku kas terperinci dengan filter multi-dimensi, atau unduh berkas spreadsheet .xlsx dan dokumen cetak PDF resmi dengan tautan terverifikasi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => handleExport('xlsx')}
              isLoading={isExporting === 'xlsx'}
              className="gap-2 bg-white text-slate-900 hover:bg-slate-100 shadow-sm text-xs sm:text-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Ekspor Excel (.xlsx)</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('pdf')}
              isLoading={isExporting === 'pdf'}
              className="gap-2 bg-white/10 text-white hover:bg-white/20 border-white/30 backdrop-blur-sm text-xs sm:text-sm"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>Ekspor PDF Cetak</span>
            </Button>
          </div>
        </div>

        {/* Financial Summary Ledger Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-emerald-100">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-semibold text-emerald-700 uppercase">
                Total Pemasukan ({selectedPeriod})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700">+{formatRupiah(totalIncome)}</div>
            </CardContent>
          </Card>

          <Card className="border-rose-100">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-semibold text-rose-700 uppercase">
                Total Pengeluaran ({selectedPeriod})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-700">-{formatRupiah(totalExpense)}</div>
            </CardContent>
          </Card>

          <Card className="border-brand-100">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-semibold text-brand-700 uppercase">
                Arus Kas Bersih (Net Cashflow)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netCashflow >= 0 ? 'text-brand-600' : 'text-rose-600'}`}>
                {formatRupiah(netCashflow)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Native Report Table Section */}
        <Card className="p-0 overflow-hidden">
          <CardHeader className="px-5 sm:px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Buku Besar & Jurnal Mutasi Transaksi
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Menampilkan {filtered.length} transaksi &bull; Klik tajuk kolom untuk mengurutkan data
              </p>
            </div>

            {/* Filter Controls Row */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari transaksi..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8 pr-3 h-9 w-full rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Wallet Filter */}
              <select
                value={selectedWallet}
                onChange={(e) => {
                  setSelectedWallet(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">Semua Dompet</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">Semua Jenis</option>
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                    <th
                      className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                      onClick={() => toggleSort('date')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Tanggal</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3.5 px-6">Jenis</th>
                    <th
                      className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                      onClick={() => toggleSort('category')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Kategori</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3.5 px-6">Catatan & Keterangan</th>
                    <th
                      className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                      onClick={() => toggleSort('wallet')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Dompet</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th
                      className="py-3.5 px-6 text-right cursor-pointer hover:bg-slate-100 transition-colors select-none"
                      onClick={() => toggleSort('amount')}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Nominal</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        Tidak ada catatan transaksi yang sesuai kriteria filter.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((tx) => {
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
                            {formatWIB(tx.transaction_date)}
                          </td>
                          <td className="py-3.5 px-6 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                isIncome
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : isTransfer
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 font-semibold text-slate-800 whitespace-nowrap">
                            {tx.category?.name || 'Lain-lain'}
                          </td>
                          <td className="py-3.5 px-6 max-w-xs text-slate-900 truncate">
                            {tx.notes || '-'}
                          </td>
                          <td className="py-3.5 px-6 text-slate-600 font-medium whitespace-nowrap">
                            {tx.wallet?.name || '-'}
                          </td>
                          <td className={`py-3.5 px-6 text-right font-bold text-sm whitespace-nowrap ${color}`}>
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

            {/* Pagination Toolbar */}
            <div className="px-5 sm:px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Halaman <span className="font-bold text-slate-800">{currentPage}</span> dari{' '}
                <span className="font-bold text-slate-800">{totalPages}</span> (Total {sorted.length} data)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="h-8 px-2.5 gap-1 text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="h-8 px-2.5 gap-1 text-xs"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export History Table with Download Links */}
        <Card className="p-0 overflow-hidden">
          <CardHeader className="px-5 sm:px-6 py-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Riwayat Berkas Ekspor Dokumen
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Dokumen tersimpan siap diunduh kembali kapan saja dengan tautan valid
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-6">Nama File</th>
                    <th className="py-3 px-6">Format</th>
                    <th className="py-3 px-6">Periode</th>
                    <th className="py-3 px-6">Waktu Ekspor</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {exportsList.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900 flex items-center gap-2 whitespace-nowrap">
                        {exp.file_type === 'xlsx' ? (
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <FileText className="w-4 h-4 text-rose-500" />
                        )}
                        <span>{exp.file_name}</span>
                      </td>
                      <td className="py-4 px-6 uppercase font-bold text-slate-600 whitespace-nowrap">{exp.file_type}</td>
                      <td className="py-4 px-6 text-slate-600 whitespace-nowrap">{exp.period_range}</td>
                      <td className="py-4 px-6 text-slate-500 whitespace-nowrap">{formatWIB(exp.created_at)}</td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Siap
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <a
                          href={exp.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                        >
                          <ArrowDownToLine className="w-3.5 h-3.5" /> Unduh Berkas
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
