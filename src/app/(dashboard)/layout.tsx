'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard/Sidebar';
import { demoStore } from '@/lib/mock/store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tatadana_store_state_v2');
      const checklist = localStorage.getItem('tatadana_onboarding_checklist');
      if (!stored && !checklist) {
        // Belum mendaftar, arahkan ke registrasi
        router.replace('/register');
        return;
      }

      const user = demoStore.getUser();
      if (user.approval_status === 'pending_approval' || user.approval_status === 'rejected') {
        // Menunggu persetujuan admin atau ditolak
        router.replace('/pending-approval');
        return;
      }

      setIsAuthenticated(true);
    }
  }, [router, pathname]);

  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          <span className="text-xs font-medium text-slate-500">Memuat TataDana...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

