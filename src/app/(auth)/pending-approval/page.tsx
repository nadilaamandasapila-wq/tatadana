'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Sparkles,
  LogOut,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { demoStore } from '@/lib/mock/store';
import { formatWIB } from '@/lib/utils/date';

export default function PendingApprovalPage() {
  const router = useRouter();
  const [user, setUser] = useState(() => demoStore.getUser());
  const [isChecking, setIsChecking] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const checkStatus = () => {
    setIsChecking(true);
    demoStore.loadFromStorage();
    const updated = demoStore.getUser();
    setUser({ ...updated });
    setTimeout(() => {
      setIsChecking(false);
      if (updated.approval_status === 'approved') {
        router.push('/dashboard');
      }
    }, 600);
  };

  // Cross-tab and real-time event listener
  useEffect(() => {
    const handleSync = () => {
      demoStore.loadFromStorage();
      const updated = demoStore.getUser();
      setUser({ ...updated });
      if (updated.approval_status === 'approved') {
        setTimeout(() => {
          router.push('/dashboard');
        }, 1200);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('tatadana:realtime', handleSync);
      window.addEventListener('storage', handleSync);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('tatadana:realtime', handleSync);
        window.removeEventListener('storage', handleSync);
      }
    };
  }, [router]);

  const handleAdminQuickApprove = () => {
    setIsSimulating(true);
    demoStore.approveUser(user.id);
    setTimeout(() => {
      setIsSimulating(false);
      setUser({ ...demoStore.getUser() });
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    }, 500);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tatadana_store_state_v2');
      localStorage.removeItem('tatadana_onboarding_checklist');
      window.location.href = '/';
    }
  };

  const isApproved = user.approval_status === 'approved';
  const isRejected = user.approval_status === 'rejected';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Simple Header */}
      <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-slate-900">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white shadow-sm font-bold">
            <Wallet className="h-4 w-4" />
          </div>
          <span>
            Tata<span className="text-brand-500">Dana</span>
          </span>
        </Link>
        <button
          onClick={handleLogout}
          className="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Akun</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-xl w-full space-y-6">
          {/* Main Card */}
          <Card className="border-slate-200/90 shadow-xl overflow-hidden">
            {/* Top Status Header */}
            <div
              className={`p-6 sm:p-8 text-center text-white transition-colors ${
                isApproved
                  ? 'bg-gradient-to-br from-emerald-600 to-teal-600'
                  : isRejected
                  ? 'bg-gradient-to-br from-rose-600 to-red-600'
                  : 'bg-gradient-to-br from-orange-500 via-brand-500 to-amber-500'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-inner">
                {isApproved ? (
                  <CheckCircle2 className="w-8 h-8 text-white animate-bounce" />
                ) : isRejected ? (
                  <ShieldAlert className="w-8 h-8 text-white" />
                ) : (
                  <Clock className="w-8 h-8 text-white animate-pulse" />
                )}
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm mb-2">
                {isApproved
                  ? '🟢 Akun Disetujui (ACC)'
                  : isRejected
                  ? '🔴 Pendaftaran Ditolak'
                  : '⏳ Menunggu Persetujuan Admin'}
              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {isApproved
                  ? 'Selamat! Akun Anda Telah Disetujui'
                  : isRejected
                  ? 'Pendaftaran Akun Ditolak'
                  : 'Menunggu Persetujuan Administrator'}
              </h1>

              <p className="text-white/90 text-xs sm:text-sm mt-2 max-w-md mx-auto leading-relaxed">
                {isApproved
                  ? 'Administrator telah menyetujui akun Anda. Anda sekarang dapat mengakses seluruh fitur TataDana.'
                  : isRejected
                  ? user.rejection_reason || 'Mohon maaf, data registrasi belum memenuhi kriteria verifikasi.'
                  : 'Setiap akun pengguna baru diverifikasi terlebih dahulu oleh tim Admin sebelum dapat mencatat transaksi keuangan.'}
              </p>
            </div>

            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Account Summary Box */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2.5 text-xs sm:text-sm">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Nama Pendaftar:</span>
                  <span className="font-bold text-slate-800">{user.full_name}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-semibold text-slate-800">{user.email}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Nomor Telepon:</span>
                  <span className="font-semibold text-slate-800">{user.phone || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Waktu Mendaftar:</span>
                  <span className="text-slate-700 font-medium">{formatWIB(user.created_at)}</span>
                </div>
              </div>

              {/* Step Process Visualizer */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Progres Verifikasi Akun:
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                    <span className="font-bold block">1. Daftar</span>
                    <span className="text-[10px] text-emerald-600">Selesai</span>
                  </div>

                  <div
                    className={`p-2.5 rounded-lg border transition-all ${
                      isApproved
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : isRejected
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : 'bg-amber-50 border-amber-300 text-amber-800 ring-2 ring-amber-400/20'
                    }`}
                  >
                    <Clock
                      className={`w-4 h-4 mx-auto mb-1 ${
                        isApproved
                          ? 'text-emerald-600'
                          : isRejected
                          ? 'text-rose-600'
                          : 'text-amber-600 animate-spin'
                      }`}
                    />
                    <span className="font-bold block">2. ACC Admin</span>
                    <span className="text-[10px]">
                      {isApproved ? 'Disetujui' : isRejected ? 'Ditolak' : 'Meninjau'}
                    </span>
                  </div>

                  <div
                    className={`p-2.5 rounded-lg border ${
                      isApproved
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 mx-auto mb-1" />
                    <span className="font-bold block">3. Dashboard</span>
                    <span className="text-[10px]">{isApproved ? 'Siap Digunakan' : 'Terkunci'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {isApproved ? (
                  <Link href="/dashboard" className="block w-full">
                    <Button variant="primary" size="lg" className="w-full gap-2 text-sm shadow-md shadow-brand-500/20">
                      <span>Masuk ke Dashboard Sekarang</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={checkStatus}
                    disabled={isChecking}
                    variant="primary"
                    size="lg"
                    className="w-full gap-2 text-sm shadow-md shadow-brand-500/20"
                  >
                    <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                    <span>{isChecking ? 'Memeriksa ke Sistem...' : 'Cek Status Persetujuan'}</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Admin Simulation Helper Box for Testing / Evaluation */}
          <div className="rounded-2xl bg-amber-50/80 border border-amber-200 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Pusat Kendali Pengujian Admin (ACC Langsung)</span>
            </div>
            <p className="text-xs text-amber-700 leading-relaxed">
              Anda sedang menguji integrasi alur persetujuan admin. Anda dapat membuka halaman admin di{' '}
              <Link href="/admin/users" className="font-bold underline hover:text-amber-900">
                Dashboard Admin &rarr; Manajemen Pengguna
              </Link>{' '}
              untuk menyetujui akun ini secara resmi, atau klik tombol simulasi di bawah untuk ACC instan:
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {!isApproved ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAdminQuickApprove}
                  disabled={isSimulating}
                  className="bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-300 gap-1.5 text-xs font-bold shadow-sm"
                >
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>{isSimulating ? 'Memproses ACC...' : '⚡ Setujui Akun Ini Sekarang (ACC)'}</span>
                </Button>
              ) : (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200">
                  ✓ Akun berhasil disetujui
                </span>
              )}

              <Link href="/admin/users">
                <Button size="sm" variant="outline" className="bg-white text-slate-700 border-slate-300 text-xs gap-1.5">
                  Buka Panel Admin &rarr;
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-100 bg-white">
        TataDana &bull; Sistem Manajemen Keuangan Terintegrasi Telegram Bot
      </footer>
    </div>
  );
}
