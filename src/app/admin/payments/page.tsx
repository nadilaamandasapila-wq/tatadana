'use client';

import React, { useState } from 'react';
import { CreditCard, Check, X, CheckCircle2, Clock, XCircle, Search } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { demoStore } from '@/lib/mock/store';
import { formatRupiah } from '@/lib/utils/currency';
import { formatWIB } from '@/lib/utils/date';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([
    {
      id: 'pay_01',
      sub_id: 'sub_02',
      user_name: 'Siti Rahmawati',
      user_email: 'siti.rahma@yahoo.co.id',
      plan: 'pro',
      amount: 99000,
      payment_type: 'bca_va (Manual Transfer)',
      status: 'pending',
      created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    },
    {
      id: 'pay_02',
      sub_id: 'sub_03',
      user_name: 'Budi Santoso',
      user_email: 'budi.santoso@gmail.com',
      plan: 'pro',
      amount: 99000,
      payment_type: 'gopay_qris (Midtrans Snap)',
      status: 'completed',
      created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
    {
      id: 'pay_03',
      sub_id: 'sub_01',
      user_name: 'Ahmad Fauzi',
      user_email: 'fauzi@tatadana.id',
      plan: 'pro',
      amount: 99000,
      payment_type: 'mandiri_va (Midtrans Core)',
      status: 'completed',
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
  ]);

  const handleApprove = (paymentId: string, subId?: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: 'completed' } : p))
    );

    // Update subscription in demoStore if subId exists
    if (subId) {
      demoStore.updateSubscription(subId, 'active');
    }

    demoStore.addAuditLog('APPROVE_PAYMENT', paymentId, {
      payment_id: paymentId,
      sub_id: subId,
      approved_by: demoStore.getAdminUser().email,
    });
  };

  const handleReject = (paymentId: string, subId?: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: 'rejected' } : p))
    );

    if (subId) {
      demoStore.updateSubscription(subId, 'cancelled');
    }

    demoStore.addAuditLog('REJECT_PAYMENT', paymentId, {
      payment_id: paymentId,
      sub_id: subId,
      rejected_by: demoStore.getAdminUser().email,
    });
  };

  return (
    <>
      <AdminHeader title="Persetujuan & Verifikasi Pembayaran" />

      <main className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Antrean Pembayaran & Invoice Langganan</h2>
            <p className="text-xs text-slate-500 mt-1">
              Verifikasi mutasi transfer manual rekening atau webhook Midtrans yang membutuhkan persetujuan manual administrator.
            </p>
          </div>
        </div>

        <Card className="p-0 overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900">
              Transaksi Masuk ({payments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-6">ID Pembayaran</th>
                    <th className="py-3 px-6">Pelanggan</th>
                    <th className="py-3 px-6">Paket</th>
                    <th className="py-3 px-6">Metode</th>
                    <th className="py-3 px-6">Waktu Masuk</th>
                    <th className="py-3 px-6">Jumlah</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-slate-800 whitespace-nowrap">{p.id}</td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{p.user_name}</div>
                        <div className="text-[11px] text-slate-500">{p.user_email}</div>
                      </td>
                      <td className="py-4 px-6 font-bold uppercase text-brand-600 whitespace-nowrap">{p.plan}</td>
                      <td className="py-4 px-6 font-mono uppercase text-slate-700 whitespace-nowrap">{p.payment_type}</td>
                      <td className="py-4 px-6 text-slate-500 whitespace-nowrap">{formatWIB(p.created_at)}</td>
                      <td className="py-4 px-6 font-bold text-slate-900 text-sm whitespace-nowrap">
                        {formatRupiah(p.amount)}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {p.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Lunas
                          </span>
                        ) : p.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                            <Clock className="w-3.5 h-3.5" /> Menunggu Persetujuan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                            <X className="w-3.5 h-3.5" /> Ditolak
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        {p.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(p.id, p.sub_id)}
                              className="text-emerald-700 hover:bg-emerald-50 border-emerald-300 h-7 text-xs"
                            >
                              <Check className="w-3.5 h-3.5 mr-1" /> Setujui
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(p.id, p.sub_id)}
                              className="text-rose-700 hover:bg-rose-50 border-rose-300 h-7 text-xs"
                            >
                              <X className="w-3.5 h-3.5 mr-1" /> Tolak
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Selesai</span>
                        )}
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
