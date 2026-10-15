'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { demoStore } from '@/lib/mock/store';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    // Check admin role
    const adminUser = demoStore.getAdminUser();
    const currentUser = demoStore.getUser();
    const isImpersonating = demoStore.isImpersonating();

    // If impersonating a non-admin user, or user is not admin
    if (isImpersonating && !currentUser.is_admin) {
      setIsAdmin(false);
    } else {
      setIsAdmin(adminUser.is_admin === true);
    }
  }, []);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Akses Terbatas: Superadmin</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Halaman portal administrator hanya dapat diakses oleh akun berwenang dengan hak akses peran <code>superadmin</code>. Akun yang sedang aktif saat ini tidak memiliki izin ini.
          </p>
          <div className="pt-2">
            <Link href="/dashboard">
              <Button className="w-full gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Dashboard Utama</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
