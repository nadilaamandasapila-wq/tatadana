'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wallet, ArrowRight, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { createBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { demoStore } from '@/lib/mock/store';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Live Supabase Auth SignUp only if real Supabase credentials are configured
      if (isSupabaseConfigured()) {
        const supabase = createBrowserClient();
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
            },
          },
        });
        if (signUpError) {
          setError(signUpError.message);
          setIsLoading(false);
          return;
        }
      }

      // 2. Registration Auto-Setup with Clean Account (Rp 0 & Empty Transactions)
      demoStore.resetToCleanAccount(fullName, email, phone);


      // Auto-setup onboarding checklist
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'tatadana_onboarding_checklist',
          JSON.stringify({
            registered: true,
            defaultWalletCreated: true,
            categoriesProvisioned: true,
            botConnected: false,
            firstTransactionAdded: false,
          })
        );
      }

      setIsLoading(false);
      router.push('/pending-approval');
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Gagal mendaftar');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* Left 40% Orange Fintech Branding Accent */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-brand-600 via-brand-500 to-amber-600 p-12 text-white flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none" />

        <div>
          <Link href="/" className="flex items-center gap-2.5 font-bold text-2xl text-white">
            <div className="w-10 h-10 rounded-xl bg-white text-brand-600 flex items-center justify-center shadow-lg font-bold">
              <Wallet className="h-6 w-6" />
            </div>
            <span>TataDana</span>
          </Link>
          <div className="mt-12 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" /> Setup Akun Otomatis
            </div>
            <h2 className="text-3xl font-extrabold leading-tight">
              Mulai Kendalikan Keuangan Anda Dalam 30 Detik
            </h2>
            <p className="text-white/90 text-sm leading-relaxed">
              Daftar sekarang untuk langsung mendapatkan dompet default Tunai, 9 kategori pengeluaran siap pakai, dan integrasi Telegram Bot.
            </p>
          </div>
        </div>

        <div className="space-y-3 bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-sm text-xs">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Gratis 50 Transaksi/Bulan Selamanya</span>
          </div>
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Tanpa Perlu Memasukkan Nomor Kartu Kredit</span>
          </div>
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Integrasi Aman Menggunakan PostgreSQL RLS</span>
          </div>
        </div>
      </div>

      {/* Right 60% Form Container */}
      <div className="col-span-1 lg:col-span-7 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div>
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-slate-900">TataDana</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Buat Akun TataDana
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Sudah memiliki akun?{' '}
              <Link href="/login" className="text-brand-600 font-bold hover:underline">
                Masuk di sini
              </Link>
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Nama Lengkap"
              type="text"
              placeholder="Ahmad Fauzi"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Nomor Handphone (WhatsApp)"
              type="tel"
              placeholder="081234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Kata Sandi (Min. 8 karakter)"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="text-xs text-slate-500 leading-relaxed">
              Dengan mendaftar, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi TataDana Indonesia.
            </div>

            <Button type="submit" variant="primary" className="w-full h-11" isLoading={isLoading}>
              Daftar Sekarang <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Social Sign-up */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">Atau daftar dengan</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              const supabase = createBrowserClient();
              if (supabase) {
                await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
                  },
                });
              } else {
                router.push('/dashboard');
              }
            }}
            className="w-full h-11 gap-2.5 text-slate-700 font-medium"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Daftar dengan Google
          </Button>
        </div>
      </div>
    </div>
  );
}
