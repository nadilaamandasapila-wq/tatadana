'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wallet, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { createBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { demoStore } from '@/lib/mock/store';


export default function LoginPage() {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isSupabaseConfigured()) {
        const supabase = createBrowserClient();
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) {
          setError(authError.message);
          setIsLoading(false);
          return;
        }
      }

      if (typeof window !== 'undefined') {
        const checklist = localStorage.getItem('tatadana_onboarding_checklist');
        if (!checklist) {
          localStorage.setItem(
            'tatadana_onboarding_checklist',
            JSON.stringify({ registered: true, defaultWalletCreated: true })
          );
        }
      }

      setIsLoading(false);
      const currentUser = demoStore.getUser();
      if (currentUser.approval_status === 'pending_approval') {
        router.push('/pending-approval');
        return;
      }
      if (currentUser.approval_status === 'rejected') {
        setError(currentUser.rejection_reason || 'Pendaftaran akun Anda belum disetujui oleh administrator.');
        return;
      }
      router.push('/dashboard');
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Gagal masuk');
    }
  };

  const handleSendOtp = () => {
    if (!phone) {
      setError('Masukkan nomor HP Anda');
      return;
    }
    setError('');
    setOtpSent(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Dev OTP bypass 123456
    if (otp === '123456') {
      if (typeof window !== 'undefined') {
        const checklist = localStorage.getItem('tatadana_onboarding_checklist');
        if (!checklist) {
          localStorage.setItem(
            'tatadana_onboarding_checklist',
            JSON.stringify({ registered: true, defaultWalletCreated: true })
          );
        }
      }

      setTimeout(() => {
        setIsLoading(false);
        const currentUser = demoStore.getUser();
        if (currentUser.approval_status === 'pending_approval') {
          router.push('/pending-approval');
          return;
        }
        if (currentUser.approval_status === 'rejected') {
          setError(currentUser.rejection_reason || 'Pendaftaran akun Anda belum disetujui oleh administrator.');
          return;
        }
        router.push('/dashboard');
      }, 500);
    } else {
      setIsLoading(false);
      setError('Kode OTP salah. Gunakan kode pengujian 123456');
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
            <h2 className="text-3xl font-extrabold leading-tight">
              Selamat Datang Kembali di Pusat Keuangan Anda
            </h2>
            <p className="text-white/90 text-sm leading-relaxed">
              Pantau arus kas, verifikasi mutasi Telegram bot, dan nikmati analisis keuangan cerdas berbasis AI.
            </p>
          </div>
        </div>

        <div className="space-y-4 bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-100">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Enkripsi Bank-Grade & Supabase RLS</span>
          </div>
          <p className="text-xs text-white/80 leading-relaxed italic">
            &ldquo;Catat pengeluaran semudah kirim chat. Tidak ada lagi akhir bulan yang boncos tanpa tahu ke mana uang pergi.&rdquo;
          </p>
        </div>
      </div>

      {/* Right 60% Clean White Form Container */}
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
              Masuk ke Akun Anda
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Belum punya akun?{' '}
              <Link href="/register" className="text-brand-600 font-bold hover:underline">
                Daftar Gratis
              </Link>
            </p>
          </div>

          {/* Method Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              onClick={() => {
                setAuthMethod('email');
                setError('');
              }}
              className={`py-2 rounded-md transition-all ${
                authMethod === 'email' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Email & Password
            </button>
            <button
              onClick={() => {
                setAuthMethod('phone');
                setError('');
              }}
              className={`py-2 rounded-md transition-all ${
                authMethod === 'phone' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              No. Handphone (OTP)
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {authMethod === 'email' ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Kata Sandi"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input type="checkbox" className="rounded text-brand-500 focus:ring-brand-500" defaultChecked />
                  <span>Ingat saya</span>
                </label>
                <a href="#" className="text-brand-600 font-semibold hover:underline">
                  Lupa password?
                </a>
              </div>

              <Button type="submit" variant="primary" className="w-full h-11" isLoading={isLoading}>
                Masuk Sekarang <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1.5">
                <Input
                  label="Nomor Handphone (WhatsApp / SMS)"
                  type="tel"
                  placeholder="081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={otpSent}
                  required
                />
                {!otpSent && (
                  <Button type="button" variant="outline" size="sm" onClick={handleSendOtp} className="w-full mt-2">
                    Kirim Kode OTP
                  </Button>
                )}
              </div>

              {otpSent && (
                <div className="space-y-3 pt-2">
                  <div className="p-2.5 bg-brand-50 border border-brand-200 rounded-lg text-xs text-brand-700">
                    💡 Mode demo aktif: Gunakan kode verifikasi bypass <b>123456</b>
                  </div>
                  <Input
                    label="Kode Verifikasi OTP"
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                  <Button type="submit" variant="primary" className="w-full h-11" isLoading={isLoading}>
                    Verifikasi & Masuk
                  </Button>
                </div>
              )}
            </form>
          )}

          {/* Social Sign-in Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">Atau masuk dengan</span>
            </div>
          </div>

          {/* Google OAuth Button */}
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
            Masuk dengan Google
          </Button>
        </div>
      </div>
    </div>
  );
}
