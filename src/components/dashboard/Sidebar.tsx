'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  Target,
  FileSpreadsheet,
  Wallet,
  Settings,
  ShieldAlert,
  LogOut,
  Zap,
  X,
} from 'lucide-react';
import { demoStore } from '@/lib/mock/store';

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState(() => demoStore.getUser());
  const [isImpersonating, setIsImpersonating] = useState(() => demoStore.isImpersonating());

  useEffect(() => {
    const handleToggle = () => setIsMobileOpen((prev) => !prev);
    const handleClose = () => setIsMobileOpen(false);
    const handleRealtime = () => {
      setUser({ ...demoStore.getUser() });
      setIsImpersonating(demoStore.isImpersonating());
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('tatadana:toggle-sidebar', handleToggle);
      window.addEventListener('tatadana:close-sidebar', handleClose);
      window.addEventListener('tatadana:realtime', handleRealtime);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('tatadana:toggle-sidebar', handleToggle);
        window.removeEventListener('tatadana:close-sidebar', handleClose);
        window.removeEventListener('tatadana:realtime', handleRealtime);
      }
    };
  }, []);


  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const navItems = [
    { label: 'Beranda', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Transaksi', href: '/transactions', icon: Receipt },
    { label: 'Anggaran', href: '/budgets', icon: Target },
    { label: 'Laporan', href: '/reports', icon: FileSpreadsheet },
    { label: 'Dompet Saya', href: '/wallets', icon: Wallet },
    { label: 'Pengaturan', href: '/settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-lg text-slate-900">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white shadow-sm">
              <Wallet className="h-4 w-4" />
            </div>
            <span className="tracking-tight font-extrabold">
              Tata<span className="text-brand-500">Dana</span>
            </span>
          </Link>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Impersonation Banner */}
        {isImpersonating && (
          <div className="mx-4 mt-4 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Mode Impersonasi</span>
            </div>
            <button
              onClick={() => {
                demoStore.impersonate(null);
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('tatadana:realtime'));
                }
              }}
              className="text-[11px] underline font-bold hover:text-amber-950"
            >
              Keluar
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-600 font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-brand-500' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User & Plan Status Footer */}
      <div className="p-4 border-t border-slate-100 space-y-4">
        {/* Plan Upgrade Banner */}
        <div className="rounded-xl bg-gradient-to-tr from-brand-500 to-amber-500 p-3.5 text-white shadow-md shadow-brand-500/20">
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> {user.subscription_tier.toUpperCase()} PLAN
            </span>
            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">Aktif</span>
          </div>
          <p className="text-[11px] text-white/90 leading-tight">
            {user.subscription_tier === 'pro'
              ? 'OCR Struk & Fitur AI aktif tanpa batas'
              : 'Upgrade untuk scan foto struk & kuota tak terbatas'}
          </p>
        </div>

        {/* User Profile Info */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 truncate">
            <img
              src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user.full_name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            <div className="truncate">
              <div className="text-xs font-bold text-slate-800 truncate">{user.full_name}</div>
              <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('tatadana_store_state_v2');
                localStorage.removeItem('tatadana_onboarding_checklist');
                window.location.href = '/';
              }
            }}
            title="Keluar ke Landing Page"
            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-100 flex-col justify-between h-screen sticky top-0 flex-shrink-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Mobile Drawer Menu */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
