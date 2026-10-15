'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  ShieldAlert,
  Bot,
  CheckCircle2,
  XCircle,
  UserCheck,
  Search,
  Sparkles,
  Clock,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { demoStore } from '@/lib/mock/store';
import { formatWIB } from '@/lib/utils/date';
import { Profile } from '@/types/database';

export default function AdminUsersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Read subscriptions and users from store
  const [subscriptions, setSubscriptions] = useState(() => demoStore.getSubscriptions());
  const [usersList, setUsersList] = useState(() => demoStore.getUsers());

  // Listen to realtime changes (when new user registers or gets approved)
  useEffect(() => {
    const refreshData = () => {
      demoStore.loadFromStorage();
      setSubscriptions([...demoStore.getSubscriptions()]);
      setUsersList([...demoStore.getUsers()]);
    };

    if (typeof window !== 'undefined') {
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

  // Compute pending users
  const pendingUsers = useMemo(() => {
    return usersList.filter((u) => u.approval_status === 'pending_approval');
  }, [usersList]);

  // Compute filtered users for "All Users" tab
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      const matchName = u.full_name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchPhone = u.phone?.toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone;
    });
  }, [usersList, searchTerm]);

  // Handle Approve (ACC)
  const handleApprove = (userId: string, userName: string) => {
    demoStore.approveUser(userId);
    setSubscriptions([...demoStore.getSubscriptions()]);
    setUsersList([...demoStore.getUsers()]);
    setSuccessMessage(`Berhasil menyetujui akun "${userName}". Pengguna sekarang dapat login & mengakses dashboard.`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Handle Reject
  const handleReject = (userId: string, userName: string) => {
    const reason = prompt(`Masukkan alasan penolakan untuk "${userName}":`, 'Data pendaftaran belum memenuhi syarat verifikasi.');
    if (reason === null) return; // user cancelled

    demoStore.rejectUser(userId, reason);
    setSubscriptions([...demoStore.getSubscriptions()]);
    setUsersList([...demoStore.getUsers()]);
    setSuccessMessage(`Akun "${userName}" telah ditandai ditolak.`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Handle Impersonate
  const handleImpersonate = (userId: string, userName: string) => {
    demoStore.addAuditLog('user_impersonate', userId, {
      reason: 'Sesi Bantuan Teknis & Dukungan Pelanggan',
      impersonated_at: new Date().toISOString(),
      user_name: userName,
    });
    demoStore.impersonate(userId);
    alert(`Memulai sesi impersonasi akun: ${userName}. Anda akan dialihkan ke dashboard pengguna.`);
    router.push('/dashboard');
  };

  return (
    <>
      <AdminHeader title="Persetujuan & Manajemen Pengguna" />

      <main className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Success Alert Banner */}
        {successMessage && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Info Banner */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Persetujuan Akun Pengguna Baru (ACC)</h2>
            <p className="text-xs text-slate-500 mt-1">
              Pengguna yang baru mendaftar wajib disetujui (ACC) oleh Admin sebelum dapat menggunakan aplikasi TataDana.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, email, hp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 h-10 w-full rounded-lg border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'pending'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Menunggu Persetujuan (ACC)</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
                pendingUsers.length > 0
                  ? 'bg-amber-100 text-amber-800 animate-pulse'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {pendingUsers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'all'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Semua Pengguna Terdaftar ({usersList.length})</span>
          </button>
        </div>

        {/* TAB 1: PENDING USERS (Awaiting ACC) */}
        {activeTab === 'pending' && (
          <Card className="p-0 overflow-hidden shadow-sm">
            <CardHeader className="px-6 py-4 border-b border-slate-100 flex flex-row items-center justify-between bg-amber-50/40">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <CardTitle className="text-sm font-bold text-slate-900">
                  Antrean Verifikasi Akun ({pendingUsers.length} Pengguna)
                </CardTitle>
              </div>
              <span className="text-xs text-slate-500">Persetujuan real-time</span>
            </CardHeader>
            <CardContent className="p-0">
              {pendingUsers.length === 0 ? (
                <div className="py-16 px-6 text-center text-slate-400">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <p className="font-bold text-slate-700 text-sm">Tidak Ada Antrean Persetujuan</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Semua pengguna yang mendaftar telah ditinjau dan disetujui. Pengguna baru yang mendaftar akan otomatis muncul di sini.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-3 px-6">Nama Pengguna</th>
                        <th className="py-3 px-6">Kontak & Email</th>
                        <th className="py-3 px-6">Waktu Mendaftar (WIB)</th>
                        <th className="py-3 px-6">Status</th>
                        <th className="py-3 px-6 text-right">Keputusan Admin (ACC)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-amber-50/30 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-900 text-sm">{u.full_name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">ID: {u.id}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-semibold text-slate-800">{u.email}</div>
                            <div className="text-slate-500">{u.phone || 'Belum isi no HP'}</div>
                          </td>
                          <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                            {formatWIB(u.created_at)}
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <Clock className="w-3.5 h-3.5 animate-pulse" />
                              Menunggu ACC
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(u.id, u.full_name)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs font-bold shadow-sm shadow-emerald-600/20"
                              >
                                <Check className="w-4 h-4" />
                                <span>Setujui Akun (ACC)</span>
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(u.id, u.full_name)}
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 text-xs gap-1"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Tolak</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 2: ALL USERS DIRECTORY */}
        {activeTab === 'all' && (
          <Card className="p-0 overflow-hidden shadow-sm">
            <CardHeader className="px-6 py-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900">
                Direktori Semua Akun ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-3 px-6">Pengguna</th>
                      <th className="py-3 px-6">Paket</th>
                      <th className="py-3 px-6">Status Persetujuan</th>
                      <th className="py-3 px-6">Telegram Bot</th>
                      <th className="py-3 px-6">Terdaftar Sejak</th>
                      <th className="py-3 px-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => {
                      const isApproved = u.approval_status === 'approved';
                      const isPending = u.approval_status === 'pending_approval';
                      const isRejected = u.approval_status === 'rejected';

                      return (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-900 text-sm">{u.full_name}</div>
                            <div className="text-slate-500 text-[11px]">{u.email}</div>
                            <div className="text-slate-400 text-[10px]">{u.phone || 'No phone'}</div>
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`font-bold uppercase text-[10px] px-2.5 py-1 rounded-full ${
                                u.subscription_tier === 'pro'
                                  ? 'bg-brand-50 text-brand-600 border border-brand-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {u.subscription_tier}
                            </span>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            {isApproved ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Disetujui (ACC)
                              </span>
                            ) : isPending ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300">
                                <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> Menunggu ACC
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" /> Ditolak
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            {u.telegram_chat_id ? (
                              <span className="text-brand-600 font-semibold flex items-center gap-1">
                                <Bot className="w-3.5 h-3.5" /> ID: {u.telegram_chat_id}
                              </span>
                            ) : (
                              <span className="text-slate-400">Belum terhubung</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-slate-500 whitespace-nowrap">{formatWIB(u.created_at)}</td>
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {isPending && (
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(u.id, u.full_name)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1 py-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>ACC</span>
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleImpersonate(u.id, u.full_name)}
                                className="gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 text-xs"
                              >
                                <UserCheck className="w-4 h-4" />
                                <span>Impersonate</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
