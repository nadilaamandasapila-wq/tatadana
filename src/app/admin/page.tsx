'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  CreditCard,
  Cpu,
  Receipt,
  Activity,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/utils/currency';
import { formatWIB } from '@/lib/utils/date';
import { demoStore } from '@/lib/mock/store';
import { Profile } from '@/types/database';

export default function AdminOverviewPage() {
  const [users, setUsers] = useState(() => demoStore.getSubscriptions());
  const [usersList, setUsersList] = useState<Profile[]>(() => demoStore.getUsers());
  const [aiLogs, setAiLogs] = useState(() => demoStore.getAILogs());
  const [transactions, setTransactions] = useState(() => demoStore.getTransactions());
  const [auditLogs, setAuditLogs] = useState(() => demoStore.getAuditLogs());

  useEffect(() => {
    const refreshData = () => {
      demoStore.loadFromStorage();
      setUsers([...demoStore.getSubscriptions()]);
      setUsersList([...demoStore.getUsers()]);
      setAiLogs([...demoStore.getAILogs()]);
      setTransactions([...demoStore.getTransactions()]);
      setAuditLogs([...demoStore.getAuditLogs()]);
    };

    if (typeof window !== 'undefined') {
      demoStore.loadFromStorage();
      refreshData();
      window.addEventListener('tatadana:realtime', refreshData);
      window.addEventListener('storage', refreshData);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('tatadana:realtime', refreshData);
        window.removeEventListener('storage', refreshData);
      }
    };
  }, []);

  const pendingUsers = usersList.filter((u) => u.approval_status === 'pending_approval');
  const totalRevenue = users.filter((u) => u.plan === 'pro').length * 49000;

  return (
    <>
      <AdminHeader title="Platform Analytics & Overview" />

      <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Pending Approvals Urgent Alert Banner */}
        {pendingUsers.length > 0 && (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-orange-500/10 border-2 border-amber-400/60 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold flex-shrink-0 shadow-md">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-xs">
                    Perlu Tindakan Admin (ACC)
                  </span>
                  <span className="text-xs text-amber-800 font-bold">
                    {pendingUsers.length} Pengguna Baru Menunggu
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-1">
                  Ada {pendingUsers.length} pendaftar baru yang menunggu persetujuan (ACC) akun dari Anda!
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Pengguna tidak dapat mengakses dashboard utama TataDana sebelum akun disetujui oleh admin.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto flex-shrink-0">
              <Link href="/admin/users" className="w-full md:w-auto">
                <Button className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md flex items-center justify-center gap-2 px-4 py-2.5">
                  <span>Tinjau & Setujui Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-rose-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase">
                Total Pengguna Terdaftar
              </CardTitle>
              <Users className="w-4 h-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-slate-900">{usersList.length}</div>
                {pendingUsers.length > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                    {pendingUsers.length} Butuh ACC
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {usersList.filter((u) => u.approval_status === 'approved').length} Disetujui &bull;{' '}
                {users.filter((u) => u.plan === 'pro').length} Pro
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase">
                Estimasi MRR (Pendapatan)
              </CardTitle>
              <CreditCard className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {formatRupiah(totalRevenue + 882000)}
              </div>
              <p className="text-xs text-emerald-600 mt-1">Midtrans & QRIS Terverifikasi</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-brand-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase">
                Total Transaksi Tercatat
              </CardTitle>
              <Receipt className="w-4 h-4 text-brand-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{transactions.length + 328}</div>
              <p className="text-xs text-slate-500 mt-1">Bulan Berjalan (WIB)</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase">
                Panggilan AI (Latency Rata-rata)
              </CardTitle>
              <Cpu className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">485 ms</div>
              <p className="text-xs text-slate-500 mt-1">99.9% Sukses (Gemini + OpenAI)</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/ai-providers" className="block group">
            <Card className="h-full group-hover:border-rose-300 transition-colors">
              <CardContent className="p-6 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold mb-3">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base group-hover:text-rose-600">
                  AI Provider Manager
                </h3>
                <p className="text-xs text-slate-500">
                  Konfigurasi Gemini, OpenAI, DeepSeek, dan beralih antara Single vs Failover mode.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/users" className="block group">
            <Card className="h-full group-hover:border-rose-300 transition-colors relative">
              {pendingUsers.length > 0 && (
                <div className="absolute top-4 right-4 bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm animate-pulse">
                  {pendingUsers.length} ACC
                </div>
              )}
              <CardContent className="p-6 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600">
                  Manajemen Pengguna & Impersonasi
                </h3>
                <p className="text-xs text-slate-500">
                  Tinjau akun baru, persetujuan admin (ACC), status langganan, dan 1-klik Impersonation.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/transactions" className="block group">
            <Card className="h-full group-hover:border-rose-300 transition-colors">
              <CardContent className="p-6 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-600">
                  Inspektur Transaksi & Audit
                </h3>
                <p className="text-xs text-slate-500">
                  Alat bantu customer support untuk meninjau transaksi pengguna dengan jejak audit ketat.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Audit Log */}
        <Card className="p-0 overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900">
              Audit Log Aktivitas Administrator
            </CardTitle>
            <span className="text-xs text-slate-400">admin_audit_logs</span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase">
                    <th className="py-3 px-6">Waktu</th>
                    <th className="py-3 px-6">Admin</th>
                    <th className="py-3 px-6">Aksi</th>
                    <th className="py-3 px-6">Target User ID</th>
                    <th className="py-3 px-6">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-6 text-slate-500">{formatWIB(log.created_at)}</td>
                      <td className="py-3.5 px-6 font-semibold text-slate-800">{log.admin_email}</td>
                      <td className="py-3.5 px-6">
                        <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-500 font-mono text-[11px]">
                        {log.target_user_id || '-'}
                      </td>
                      <td className="py-3.5 px-6 text-slate-500">{log.ip_address}</td>
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
