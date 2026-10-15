'use client';

import React, { useState, useMemo } from 'react';
import { Search, ShieldCheck, Eye, AlertTriangle, CheckCircle2, ShoppingBag, Layers, X } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { demoStore } from '@/lib/mock/store';
import { formatRupiah } from '@/lib/utils/currency';
import { formatWIB } from '@/lib/utils/date';
import { Transaction } from '@/types/database';

export default function AdminTransactionsInspectorPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectedTx, setInspectedTx] = useState<Transaction | null>(null);
  const [lastAuditActionId, setLastAuditActionId] = useState<string | null>(null);

  const transactions = demoStore.getTransactions();

  const handleInspect = (tx: Transaction) => {
    // Audit log requirement: Every transaction inspection must be permanently logged to admin_audit_logs
    const auditId = `aud_inspect_${Date.now()}`;
    demoStore.addAuditLog('INSPECT_TRANSACTION_DETAIL', tx.user_id, {
      transaction_id: tx.id,
      amount: tx.amount,
      notes: tx.notes,
      source: tx.source,
      inspected_by: demoStore.getAdminUser().email,
    });
    setLastAuditActionId(auditId);
    setInspectedTx(tx);
  };

  const filtered = useMemo(() => {
    if (!searchTerm) return transactions;
    const q = searchTerm.toLowerCase();
    return transactions.filter((t) => {
      return (
        t.notes?.toLowerCase().includes(q) ||
        t.user_id.toLowerCase().includes(q) ||
        t.amount.toString().includes(q) ||
        t.source?.toLowerCase().includes(q)
      );
    });
  }, [transactions, searchTerm]);

  return (
    <>
      <AdminHeader title="Inspektur Transaksi & Jejak Audit" />

      <main className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3 text-xs text-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span>
            <b>Perhatian Kepatuhan Privasi Data:</b> Seluruh tindakan melihat dan memeriksa rincian transaksi nasabah dicatat secara otomatis ke dalam tabel <code>public.admin_audit_logs</code> demi audit kepatuhan regulasi fintech.
          </span>
        </div>

        {/* Audit Log Confirmation Toast */}
        {lastAuditActionId && (
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                Jejak audit berhasil dicatat ke <code>admin_audit_logs</code> (Aksi: <b>INSPECT_TRANSACTION_DETAIL</b>).
              </span>
            </div>
            <button
              onClick={() => setLastAuditActionId(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari User ID, catatan, nominal, sumber..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 h-10 w-full rounded-lg border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Transaction Table */}
        <Card className="p-0 overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900">
              Daftar Transaksi Seluruh Nasabah ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-6">User ID</th>
                    <th className="py-3 px-6">Tanggal</th>
                    <th className="py-3 px-6">Kategori</th>
                    <th className="py-3 px-6">Catatan Transaksi</th>
                    <th className="py-3 px-6">Dompet</th>
                    <th className="py-3 px-6 text-right">Nominal</th>
                    <th className="py-3 px-6 text-center">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-6 font-mono text-[11px] text-slate-500 whitespace-nowrap">{tx.user_id}</td>
                      <td className="py-3.5 px-6 text-slate-600 whitespace-nowrap">{formatWIB(tx.transaction_date)}</td>
                      <td className="py-3.5 px-6 font-semibold text-slate-800 whitespace-nowrap">
                        {tx.category?.name || 'Lain-lain'}
                      </td>
                      <td className="py-3.5 px-6 text-slate-900 max-w-xs truncate">{tx.notes || '-'}</td>
                      <td className="py-3.5 px-6 text-slate-600 whitespace-nowrap">{tx.wallet?.name}</td>
                      <td className="py-3.5 px-6 text-right font-bold text-slate-900 whitespace-nowrap">
                        {formatRupiah(tx.amount)}
                      </td>
                      <td className="py-3.5 px-6 text-center whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleInspect(tx)}
                          className="gap-1 text-[11px] h-7 px-2.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspeksi</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Inspected Transaction Detail Card */}
        {inspectedTx && (
          <Card className="border-2 border-brand-500 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-500" />
                <span>Rincian Transaksi yang Diinspeksi (Logged to admin_audit_logs)</span>
              </h3>
              <Button size="sm" variant="ghost" onClick={() => setInspectedTx(null)}>
                Tutup
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400">Transaction ID</span>
                <div className="font-mono font-bold text-slate-800">{inspectedTx.id}</div>
              </div>
              <div>
                <span className="text-slate-400">User ID</span>
                <div className="font-mono font-bold text-slate-800">{inspectedTx.user_id}</div>
              </div>
              <div>
                <span className="text-slate-400">Raw Input Text</span>
                <div className="font-bold text-slate-800">{inspectedTx.raw_input || '-'}</div>
              </div>
              <div>
                <span className="text-slate-400">Sumber Channel</span>
                <div className="font-bold text-slate-800">{inspectedTx.source}</div>
              </div>
            </div>

            {/* If items exist (Receipt OCR) */}
            {inspectedTx.items && inspectedTx.items.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-brand-500" />
                  <span>Item Struk Belanja Terverifikasi ({inspectedTx.items.length})</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {inspectedTx.items.map((item) => (
                    <div key={item.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">{item.item_name}</div>
                        <div className="text-[10px] text-slate-500">{item.quantity}x @ {formatRupiah(item.price)}</div>
                      </div>
                      <div className="font-bold text-slate-900">{formatRupiah(item.total_amount)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}
      </main>
    </>
  );
}
