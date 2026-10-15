'use client';

import React, { useState, useMemo } from 'react';
import { Target, AlertTriangle, AlertCircle, CheckCircle2, Plus, Edit2, Sparkles, TrendingDown } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { formatRupiah } from '@/lib/utils/currency';
import { demoStore } from '@/lib/mock/store';
import { useRealtimeTransactions } from '@/hooks/useRealtimeTransactions';

export default function BudgetsPage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [limitInput, setLimitInput] = useState('');

  const { budgets, transactions, saveBudget } = useRealtimeTransactions();
  const categories = demoStore.getCategories().filter((c) => c.type === 'expense');

  // Compute live spent for each category from current month transactions
  const enrichedBudgets = useMemo(() => {
    const now = new Date();
    return budgets.map((b) => {
      // Find expense transactions for this category in current month
      const spentForCat = transactions
        .filter((t) => {
          if (t.type !== 'expense' || t.category_id !== b.category_id) return false;
          const d = new Date(t.transaction_date);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        })
        .reduce((sum, t) => sum + t.amount, 0);

      // Use calculated spent if available, else b.spent
      const effectiveSpent = spentForCat > 0 ? spentForCat : (b.spent || 0);

      return {
        ...b,
        spent: effectiveSpent,
      };
    });
  }, [budgets, transactions]);

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(limitInput.replace(/\D/g, ''), 10);
    if (!parsed || parsed <= 0 || !selectedCategoryId) return;

    saveBudget(selectedCategoryId, parsed);
    setIsEditModalOpen(false);
    setLimitInput('');
  };

  const openEditModal = (catId?: string, currentLimit?: number) => {
    setSelectedCategoryId(catId || categories[0]?.id || '');
    setLimitInput(currentLimit ? currentLimit.toString() : '');
    setIsEditModalOpen(true);
  };

  return (
    <>
      <DashboardHeader title="Anggaran & Batas Pengeluaran" />

      <main className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Kontrol Kuota Anggaran Bulanan</h2>
            <p className="text-xs text-slate-500 mt-1">
              Sistem akan memicu peringatan visual dan notifikasi Telegram saat pengeluaran mencapai ambang batas <b>80%</b> dan <b>100%</b>.
            </p>
          </div>
          <Button onClick={() => openEditModal()} className="gap-1.5 shadow-sm text-xs sm:text-sm">
            <Plus className="w-4 h-4" /> Atur Anggaran Baru
          </Button>
        </div>

        {/* Budgets List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrichedBudgets.map((b) => {
            const spent = b.spent || 0;
            const limit = b.monthly_limit;
            const ratio = limit > 0 ? spent / limit : 0;
            const percent = Math.round(ratio * 100);

            let statusBadge = (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Aman ({percent}%)
              </span>
            );

            let barColor = 'bg-emerald-500';
            let cardBorder = '';

            if (ratio >= 1.0) {
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-300 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> Overbudget! ({percent}%)
                </span>
              );
              barColor = 'bg-rose-500';
              cardBorder = 'border-rose-200 shadow-rose-500/5';
            } else if (ratio >= 0.8) {
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Peringatan 80% ({percent}%)
                </span>
              );
              barColor = 'bg-amber-500';
              cardBorder = 'border-amber-200 shadow-amber-500/5';
            }

            return (
              <Card key={b.id} className={`hover:shadow-md transition-shadow relative overflow-hidden ${cardBorder}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
                      style={{ backgroundColor: b.category?.color || '#f97316' }}
                    >
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900">
                        {b.category?.name || 'Kategori'}
                      </CardTitle>
                      <p className="text-xs text-slate-400">Periode: {b.month_year}</p>
                    </div>
                  </div>
                  {statusBadge}
                </CardHeader>

                <CardContent className="space-y-4 pt-2">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-bold text-slate-900 text-lg">{formatRupiah(spent)}</span>
                    <span className="text-xs text-slate-500">
                      Limit: <strong className="text-slate-800">{formatRupiah(limit)}</strong>
                    </span>
                  </div>

                  {/* Visual Progress Bar with Threshold Markers */}
                  <div className="relative pt-1">
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                    {/* Visual 80% marker */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-amber-400 opacity-70 pointer-events-none"
                      style={{ left: '80%' }}
                      title="Batas 80%"
                    />
                  </div>

                  {/* Threshold Alert Messages */}
                  {ratio >= 1.0 ? (
                    <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-between">
                      <span>Peringatan: Melebihi limit {formatRupiah(spent - limit)}</span>
                      <span className="font-bold">100% Terlampaui</span>
                    </div>
                  ) : ratio >= 0.8 ? (
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium flex items-center justify-between">
                      <span>Mendekati limit! Sisa kuota: {formatRupiah(limit - spent)}</span>
                      <span className="font-bold">≥ 80% Limit</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span>Sisa anggaran yang dapat digunakan: {formatRupiah(limit - spent)}</span>
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => openEditModal(b.category_id, b.monthly_limit)}
                      className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline font-semibold"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Ubah Limit Anggaran
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Modal Setup Anggaran */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Atur Anggaran Kategori"
          description="Tentukan batas pengeluaran maksimal bulanan untuk kategori ini."
        >
          <form onSubmit={handleSaveBudget} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Kategori Pengeluaran
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Batas Maksimal Bulanan (Rp)"
              placeholder="cth: 2.000.000"
              value={limitInput}
              onChange={(e) => setLimitInput(e.target.value)}
              required
              helperText="Bot akan otomatis mengingatkan saat pengeluaran kategori mencapai 80% dan 100%."
            />

            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary">
                Simpan Anggaran
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </>
  );
}
