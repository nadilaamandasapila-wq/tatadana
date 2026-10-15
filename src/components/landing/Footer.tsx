import React from 'react';
import Link from 'next/link';
import { Wallet, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* 4-Columns Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-white">
              <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-md">
                <Wallet className="h-5 w-5" />
              </div>
              <span className="tracking-tight text-xl font-extrabold">
                Tata<span className="text-brand-500">Dana</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Platform manajemen keuangan pribadi dan UMKM Indonesia generasi baru. Menggabungkan kemudahan Telegram Bot dengan kekuatan AI multi-provider dan ekspor data akuntansi resmi.
            </p>
            <div className="text-xs text-slate-500">
              📍 Sudirman Central Business District (SCBD), Jakarta Selatan, Indonesia.
            </div>
          </div>

          {/* Col 1: Produk */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Produk</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="#simulator" className="hover:text-brand-400 transition-colors">
                  Telegram Bot AI
                </Link>
              </li>
              <li>
                <Link href="#fitur" className="hover:text-brand-400 transition-colors">
                  Multimodal OCR Struk
                </Link>
              </li>
              <li>
                <Link href="#fitur" className="hover:text-brand-400 transition-colors">
                  Voice Note STT
                </Link>
              </li>
              <li>
                <Link href="/dashboard/reports" className="hover:text-brand-400 transition-colors">
                  Ekspor Excel & PDF
                </Link>
              </li>
              <li>
                <Link href="/dashboard/budgets" className="hover:text-brand-400 transition-colors">
                  Manajemen Anggaran
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Perusahaan */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Perusahaan</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="#" className="hover:text-brand-400 transition-colors">
                  Tentang TataDana
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-brand-400 transition-colors">
                  Karir
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-brand-400 transition-colors">
                  Blog Finansial
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-brand-400 transition-colors">
                  Kontak Media
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Bantuan */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Legal & Bantuan</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="#" className="hover:text-brand-400 transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-brand-400 transition-colors">
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-brand-400 transition-colors">
                  Keamanan Data RLS
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-brand-400 transition-colors text-slate-500">
                  Portal Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} PT TataDana Finansial Digital. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-6">
            <span>Zona Waktu: Asia/Jakarta (WIB)</span>
            <span>Made with ❤️ in Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
