'use client';

import React, { useState } from 'react';
import { Plus, Bell, Radio, Check, Menu, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { AIChatModal } from './AIChatModal';
import { demoStore } from '@/lib/mock/store';
import { useRealtimeTransactions } from '@/hooks/useRealtimeTransactions';

export function DashboardHeader({ title }: { title: string }) {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { wallets, addTransaction, isConnected } = useRealtimeTransactions();
  const categories = demoStore.getCategories().filter((c) => c.type === txType);

  const toggleMobileSidebar = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tatadana:toggle-sidebar'));
    }
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseInt(amount.replace(/\D/g, ''), 10);
    if (!parsedAmount || parsedAmount <= 0) return;

    const user = demoStore.getUser();
    addTransaction({
      user_id: user.id,
      wallet_id: selectedWalletId || wallets[0]?.id || 'wal_01',
      category_id: selectedCategoryId || categories[0]?.id || 'cat_01',
      type: txType,
      amount: parsedAmount,
      notes: notes || (txType === 'expense' ? 'Pengeluaran Manual' : 'Pemasukan Manual'),
      raw_input: `Manual input: ${parsedAmount}`,
      source: 'manual',
      transaction_date: new Date().toISOString(),
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsAddModalOpen(false);
      setAmount('');
      setNotes('');
    }, 500);
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-100 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMobileSidebar}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">{title}</h1>

          {/* Realtime Status Indicator */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>{isConnected ? 'Realtime Aktif (WIB)' : 'Menghubungkan...'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Tanya AI Assistant Button */}
          <button
            type="button"
            onClick={() => setIsAIChatOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-500/20 hover:from-orange-600 hover:to-amber-600 transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Buka Asisten AI TataDana"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-200 animate-pulse" />
            <span className="hidden sm:inline">Tanya AI</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-semibold hidden md:inline">
              Chat
            </span>
          </button>

          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="shadow-sm shadow-brand-500/20 gap-1.5 whitespace-nowrap text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah Transaksi</span>
            <span className="sm:hidden">Tambah</span>
          </Button>
        </div>
      </header>

      {/* Manual Transaction Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Catat Transaksi Baru"
        description="Masukkan transaksi keuangan manual ke buku kas Anda."
      >
        <form onSubmit={handleSaveTransaction} className="space-y-4">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setTxType('expense')}
              className={`py-2 text-xs font-bold rounded-md transition-all ${
                txType === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600'
              }`}
            >
              Pengeluaran (-)
            </button>
            <button
              type="button"
              onClick={() => setTxType('income')}
              className={`py-2 text-xs font-bold rounded-md transition-all ${
                txType === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600'
              }`}
            >
              Pemasukan (+)
            </button>
          </div>

          <Input
            label="Nominal (Rp)"
            placeholder="cth: 50.000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Dompet / Sumber Dana
            </label>
            <select
              value={selectedWalletId || wallets[0]?.id}
              onChange={(e) => setSelectedWalletId(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.type})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Kategori
            </label>
            <select
              value={selectedCategoryId || categories[0]?.id}
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
            label="Catatan Transaksi"
            placeholder="cth: Makan siang kantor, Nasi Padang"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              {isSuccess ? <Check className="w-4 h-4 mr-1" /> : null}
              {isSuccess ? 'Tersimpan!' : 'Simpan Transaksi'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* TataDana AI Assistant Chat Modal */}
      <AIChatModal isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
    </>
  );
}
