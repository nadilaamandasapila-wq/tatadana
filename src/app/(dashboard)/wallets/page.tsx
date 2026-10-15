'use client';

import React, { useState } from 'react';
import {
  Wallet as WalletIcon,
  Plus,
  Star,
  Trash2,
  Edit2,
  Building2,
  Smartphone,
  Banknote,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { formatRupiah } from '@/lib/utils/currency';
import { demoStore } from '@/lib/mock/store';
import { useRealtimeTransactions } from '@/hooks/useRealtimeTransactions';
import { Wallet, WalletType } from '@/types/database';

export default function WalletsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);

  const [walletName, setWalletName] = useState('');
  const [walletType, setWalletType] = useState<WalletType>('bank');
  const [initialBalance, setInitialBalance] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const { wallets, addWallet, updateWallet, deleteWallet } = useRealtimeTransactions();

  const handleCreateWallet = (e: React.FormEvent) => {
    e.preventDefault();
    const balance = parseInt(initialBalance.replace(/\D/g, ''), 10) || 0;
    if (!walletName) return;

    addWallet({
      user_id: demoStore.getUser().id,
      name: walletName,
      type: walletType,
      balance,
      is_default: isDefault,
      icon: walletType === 'cash' ? 'Banknote' : walletType === 'bank' ? 'CreditCard' : 'Smartphone',
    });

    setIsModalOpen(false);
    setWalletName('');
    setInitialBalance('');
    setIsDefault(false);
  };

  const handleEditWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWalletId || !walletName) return;

    updateWallet(editingWalletId, {
      name: walletName,
      type: walletType,
    });

    setIsEditModalOpen(false);
    setEditingWalletId(null);
    setWalletName('');
  };

  const openEditModal = (w: Wallet) => {
    setEditingWalletId(w.id);
    setWalletName(w.name);
    setWalletType(w.type);
    setIsEditModalOpen(true);
  };

  const handleSetDefault = (id: string) => {
    // Set selected wallet as default, unsetting others
    updateWallet(id, { is_default: true });
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus dompet ini? Transaksi masa lalu yang terkait akan tetap tersimpan.')) {
      deleteWallet(id);
    }
  };

  return (
    <>
      <DashboardHeader title="Manajemen Dompet & Rekening" />

      <main className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Multi-Dompet Terpadu & Bot Selector</h2>
            <p className="text-xs text-slate-500 mt-1">
              Atur dompet tunai, rekening bank, dan e-wallet. Tentukan 1 dompet default untuk pencatatan otomatis via Telegram bot.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-1.5 shadow-sm text-xs sm:text-sm">
            <Plus className="w-4 h-4" /> Tambah Dompet Baru
          </Button>
        </div>

        {/* Wallets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {wallets.map((w) => {
            const isCash = w.type === 'cash';
            const isBank = w.type === 'bank';
            const Icon = isCash ? Banknote : isBank ? Building2 : Smartphone;

            return (
              <Card
                key={w.id}
                className={`hover:shadow-md transition-shadow relative overflow-hidden ${
                  w.is_default ? 'border-2 border-brand-500 shadow-brand-500/10' : ''
                }`}
              >
                {w.is_default && (
                  <div className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <Star className="w-3 h-3 fill-white" /> Default Bot Telegram
                  </div>
                )}

                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      isCash
                        ? 'bg-amber-100 text-amber-700'
                        : isBank
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">{w.name}</CardTitle>
                    <p className="text-xs text-slate-500 uppercase font-semibold">{w.type}</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-2">
                  <div>
                    <span className="text-xs text-slate-400">Saldo Dompet</span>
                    <div className="text-2xl font-bold text-slate-900">{formatRupiah(w.balance)}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    {!w.is_default ? (
                      <button
                        onClick={() => handleSetDefault(w.id)}
                        className="text-brand-600 hover:underline font-semibold flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5" /> Jadikan Default Bot
                      </button>
                    ) : (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Digunakan Telegram
                      </span>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(w)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 rounded transition-colors"
                        title="Ubah Nama Dompet"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {!w.is_default && (
                        <button
                          onClick={() => handleDelete(w.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Hapus Dompet"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Modal Tambah Dompet */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Tambah Dompet / Rekening Baru"
          description="Tambahkan akun bank, uang tunai, atau dompet digital untuk memantau arus kas terpisah."
        >
          <form onSubmit={handleCreateWallet} className="space-y-4">
            <Input
              label="Nama Dompet"
              placeholder="cth: Bank Mandiri, Tunai Harian, Dana, ShopeePay"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Tipe Dompet
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'bank', label: 'Bank' },
                  { id: 'ewallet', label: 'E-Wallet' },
                  { id: 'cash', label: 'Tunai' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setWalletType(t.id as WalletType)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      walletType === t.id
                        ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Selector for Active Indonesian Banks */}
            {walletType === 'bank' && (
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Pilih Bank Aktif di Indonesia:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {[
                    'BCA',
                    'Bank Mandiri',
                    'BRI',
                    'BNI',
                    'BSI (Syariah)',
                    'CIMB Niaga',
                    'Permata Bank',
                    'Bank Danamon',
                    'BTN',
                    'Bank Jago',
                    'SeaBank',
                    'Blu by BCA',
                    'Bank Neo (BNC)',
                    'Jenius BTPN',
                    'OCBC NISP',
                    'Maybank',
                    'Panin Bank',
                    'Allo Bank',
                  ].map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setWalletName(bank)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                        walletName.includes(bank)
                          ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-brand-300'
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Selector for Active Indonesian E-Wallets */}
            {walletType === 'ewallet' && (
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Pilih E-Wallet Aktif di Indonesia:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'GoPay',
                    'OVO',
                    'DANA',
                    'ShopeePay',
                    'LinkAja',
                    'AstraPay',
                    'i.saku',
                    'Sakuku',
                  ].map((ewallet) => (
                    <button
                      key={ewallet}
                      type="button"
                      onClick={() => setWalletName(ewallet)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                        walletName.includes(ewallet)
                          ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-brand-300'
                      }`}
                    >
                      {ewallet}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Selector for Cash */}
            {walletType === 'cash' && (
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Pilihan Dompet Tunai:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['Tunai Dompet', 'Uang Kas Harian', 'Brankas Pribadi', 'Amplop Tabungan'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setWalletName(c)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                        walletName === c
                          ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-brand-300'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Input
              label="Saldo Awal (Rp)"
              placeholder="cth: 500.000"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
            />

            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded text-brand-500 focus:ring-brand-500 w-4 h-4"
              />
              <span>Jadikan sebagai dompet default untuk Telegram Bot</span>
            </label>

            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary">
                Simpan Dompet
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal Ubah Dompet */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Ubah Rincian Dompet"
          description="Perbarui nama atau tipe dompet yang dipilih."
        >
          <form onSubmit={handleEditWallet} className="space-y-4">
            <Input
              label="Nama Dompet"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Tipe Dompet
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'bank', label: 'Bank' },
                  { id: 'ewallet', label: 'E-Wallet' },
                  { id: 'cash', label: 'Tunai' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setWalletType(t.id as WalletType)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      walletType === t.id
                        ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary">
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </>
  );
}
