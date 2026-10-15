'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Cpu,
  Users,
  Activity,
  Search,
  CreditCard,
  Download,
  ArrowLeft,
  Server,
  X,
} from 'lucide-react';
import { demoStore } from '@/lib/mock/store';

export function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const admin = demoStore.getAdminUser();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Initial read
    if (typeof window !== 'undefined') {
      demoStore.loadFromStorage();
      setPendingCount(demoStore.getPendingUsers().length);
    }

    const handleToggle = () => setIsMobileOpen((prev) => !prev);
    const handleClose = () => setIsMobileOpen(false);
    const handleRefresh = () => {
      demoStore.loadFromStorage();
      setPendingCount(demoStore.getPendingUsers().length);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('tatadana:toggle-admin-sidebar', handleToggle);
      window.addEventListener('tatadana:close-admin-sidebar', handleClose);
      window.addEventListener('tatadana:realtime', handleRefresh);
      window.addEventListener('storage', handleRefresh);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('tatadana:toggle-admin-sidebar', handleToggle);
        window.removeEventListener('tatadana:close-admin-sidebar', handleClose);
        window.removeEventListener('tatadana:realtime', handleRefresh);
        window.removeEventListener('storage', handleRefresh);
      }
    };
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const navItems = [
    { label: 'Ringkasan Platform', href: '/admin', icon: Server },
    { label: 'AI Provider Manager', href: '/admin/ai-providers', icon: Cpu },
    {
      label: 'Manajemen Pengguna',
      href: '/admin/users',
      icon: Users,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { label: 'AI Telemetry & Logs', href: '/admin/ai-logs', icon: Activity },
    { label: 'Inspektur Transaksi', href: '/admin/transactions', icon: Search },
    { label: 'Persetujuan Bayar', href: '/admin/payments', icon: CreditCard },
    { label: 'Ekspor Data Platform', href: '/admin/export', icon: Download },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full bg-slate-900 text-slate-200">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <Link href="/admin" className="flex items-center gap-2.5 font-bold text-lg text-white">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="tracking-tight font-extrabold">
              Tata<span className="text-brand-500">Dana</span>
              <span className="ml-1 text-[10px] font-semibold bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/30">
                ADMIN
              </span>
            </span>
          </Link>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-rose-600/20 text-rose-400 font-semibold border border-rose-500/30 shadow-xs'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-400 text-slate-950 shadow-xs animate-pulse">
                    {item.badge} ACC
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile & Return to App */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke App User</span>
        </Link>

        <div className="flex items-center gap-2.5 pt-2">
          <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs border border-rose-500/30">
            AD
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-white truncate">{admin.full_name}</div>
            <div className="text-[11px] text-slate-400 truncate">{admin.email}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-col justify-between h-screen sticky top-0 flex-shrink-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-slate-900 shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
