'use client';

import React from 'react';
import { ShieldCheck, Cpu, Database, Activity, Menu } from 'lucide-react';

export function AdminHeader({ title }: { title: string }) {
  const toggleMobileAdminSidebar = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tatadana:toggle-admin-sidebar'));
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleMobileAdminSidebar}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
          aria-label="Buka Menu Admin"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 text-xs">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
          <Cpu className="w-3.5 h-3.5 text-brand-500" />
          <span>Gemini & OpenAI: OK</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
          <Database className="w-3.5 h-3.5 text-emerald-500" />
          <span>RLS & Ledger: Synced</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
          <Activity className="w-3.5 h-3.5 text-emerald-500" />
          <span className="hidden sm:inline">System Healthy</span>
          <span className="sm:hidden">Healthy</span>
        </div>
      </div>
    </header>
  );
}
