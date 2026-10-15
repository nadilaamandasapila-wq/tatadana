'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wallet, Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tatadana_store_state_v2');
      const checklist = localStorage.getItem('tatadana_onboarding_checklist');
      if (stored || checklist) {
        setHasAccount(true);
      }
    }
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-slate-900 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="tracking-tight text-xl font-extrabold">
            Tata<span className="text-brand-500">Dana</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="#fitur" className="hover:text-brand-500 transition-colors">
            Fitur
          </Link>
          <Link href="#simulator" className="hover:text-brand-500 transition-colors">
            Simulator Bot
          </Link>
          <Link href="#harga" className="hover:text-brand-500 transition-colors">
            Harga
          </Link>
          <Link href="#faq" className="hover:text-brand-500 transition-colors">
            FAQ
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {hasAccount ? (
            <Link href="/dashboard">
              <Button variant="primary" size="sm" className="gap-1.5 shadow-sm shadow-brand-500/20">
                Buka Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm" className="gap-1.5">
                  Daftar Gratis <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </>
          )}
        </div>


        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-100 bg-white px-4 pt-2 pb-6 space-y-3">
          <Link
            href="#fitur"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 hover:text-brand-500"
          >
            Fitur
          </Link>
          <Link
            href="#simulator"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 hover:text-brand-500"
          >
            Simulator Bot
          </Link>
          <Link
            href="#harga"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 hover:text-brand-500"
          >
            Harga
          </Link>
          <Link
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 hover:text-brand-500"
          >
            FAQ
          </Link>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            {hasAccount ? (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full">
                  Buka Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Masuk
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Daftar Gratis
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
