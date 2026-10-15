'use client';

import React, { useState } from 'react';
import {
  Settings,
  Bot,
  User,
  Bell,
  FolderPlus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  Sparkles,
  Check,
  MessageSquare,
  Camera,
  Upload,
} from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { demoStore } from '@/lib/mock/store';
import { testBotConnection } from '@/lib/telegram/bot-api';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'telegram' | 'profile' | 'reminders' | 'categories'>('telegram');
  const user = demoStore.getUser();

  // Telegram test states
  const [botToken, setBotToken] = useState('demo_bot_token_tatadana');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testResult, setTestResult] = useState<{ botUsername?: string; error?: string } | null>(null);

  // Profile states
  const [fullName, setFullName] = useState(user.full_name);
  const [phone, setPhone] = useState(user.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
  const [currency, setCurrency] = useState('IDR');
  const [profileSaved, setProfileSaved] = useState(false);

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
  ];

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Reminders states
  const [reminderMorning, setReminderMorning] = useState(true);
  const [reminderEvening, setReminderEvening] = useState(true);
  const [remindersSaved, setRemindersSaved] = useState(false);

  // New category states (with emoji & color)
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'expense' | 'income'>('expense');
  const [newCatEmoji, setNewCatEmoji] = useState('🏷️');
  const [newCatColor, setNewCatColor] = useState('#f97316');
  const [categoriesList, setCategoriesList] = useState(demoStore.getCategories());

  const availableColors = [
    '#f97316', // Brand Orange
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#ec4899', // Pink
    '#8b5cf6', // Violet
    '#ef4444', // Red
    '#eab308', // Amber
    '#06b6d4', // Cyan
  ];

  const availableEmojis = ['🏷️', '🍔', '🚗', '🛍️', '💡', '🎬', '🏥', '💼', '🎁', '📈', '☕', '📚', '✈️', '🎮'];

  const handleTestBot = async () => {
    setTestStatus('testing');
    setTestResult(null);

    const res = await testBotConnection(botToken);
    if (res.ok) {
      setTestStatus('success');
      setTestResult({ botUsername: res.botUsername || 'tatadana_bot' });
    } else {
      setTestStatus('failed');
      setTestResult({ error: res.error || 'Token bot tidak valid atau tidak dapat dijangkau' });
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    demoStore.updateUser({
      full_name: fullName,
      phone: phone,
      avatar_url: avatarUrl,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleSaveReminders = () => {
    setRemindersSaved(true);
    setTimeout(() => setRemindersSaved(false), 2000);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    const newCat = demoStore.addCategory({
      name: newCatName,
      type: newCatType,
      is_default: false,
      color: newCatColor,
      icon: newCatEmoji,
      user_id: user.id,
    });

    setCategoriesList([...demoStore.getCategories()]);
    setNewCatName('');
  };

  return (
    <>
      <DashboardHeader title="Pengaturan Akun & Integrasi" />

      <main className="p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('telegram')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'telegram'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bot className="w-4 h-4" /> Telegram Bot
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" /> Profil Pengguna
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'reminders'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-4 h-4" /> Pengingat Harian
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'categories'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FolderPlus className="w-4 h-4" /> Kategori Kustom
          </button>
        </div>

        {/* Tab 1: Telegram Bot Integration */}
        {activeTab === 'telegram' && (
          <Card className="space-y-6">
            <CardHeader className="pb-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Konfigurasi Telegram Bot
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hubungkan bot pribadi atau bot bersama via token API untuk mencatat keuangan langsung lewat chat santai.
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              <Input
                label="Bot Token Telegram"
                placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ..."
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                helperText="Dapatkan token gratis via @BotFather di aplikasi Telegram Anda."
              />

              {/* Test Connection Button & Indicator with exact requested states */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  type="button"
                  onClick={handleTestBot}
                  disabled={testStatus === 'testing'}
                  className="gap-2 text-xs sm:text-sm"
                >
                  {testStatus === 'testing' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>⏳ Testing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Test Koneksi</span>
                    </>
                  )}
                </Button>

                {testStatus === 'success' && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>🟢 Terhubung: @{testResult?.botUsername} (Webhook Siap)</span>
                  </div>
                )}

                {testStatus === 'failed' && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    <span>🔴 Tidak terhubung: {testResult?.error}</span>
                  </div>
                )}
              </div>

              {/* Bot Info Guidance */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2 mt-4">
                <h4 className="font-bold text-slate-900">Panduan Langkah Menghubungkan Bot:</h4>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Buka aplikasi Telegram dan cari bot resmi <b>@BotFather</b></li>
                  <li>Kirim perintah <code>/newbot</code> dan ikuti instruksi penamaan hingga mendapatkan API token</li>
                  <li>Tempel API token di kolom atas dan klik tombol <b>Test Koneksi</b></li>
                  <li>Kirim pesan <code>/start</code> ke bot Anda di Telegram untuk verifikasi ID obrolan</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab 2: Profile */}
        {activeTab === 'profile' && (
          <Card className="space-y-6">
            <CardHeader className="pb-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Profil & Pengaturan Akun</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kelola identitas akun Anda, perbarui foto profil, dan atur mata uang standar.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Avatar Photo Section */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Foto Profil Anda
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    <div className="relative group">
                      <img
                        src={avatarUrl}
                        alt="Foto Profil"
                        className="w-20 h-20 rounded-full object-cover border-2 border-brand-500 shadow-md"
                      />
                      <label className="absolute bottom-0 right-0 p-1.5 bg-brand-500 text-white rounded-full cursor-pointer shadow-md hover:bg-brand-600 transition-colors">
                        <Camera className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="space-y-2 text-center sm:text-left">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-sm transition-all">
                          <Upload className="w-3.5 h-3.5 text-brand-500" />
                          <span>Upload Foto Baru</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarFileUpload}
                            className="hidden"
                          />
                        </label>
                        <span className="text-xs text-slate-400">atau pilih avatar siap pakai:</span>
                      </div>

                      {/* Preset Avatar Gallery */}
                      <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                        {presetAvatars.map((url, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setAvatarUrl(url)}
                            className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${
                              avatarUrl === url ? 'border-brand-500 ring-2 ring-brand-500/30' : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nama Lengkap"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                  <Input label="Alamat Email" defaultValue={user.email} disabled helperText="Email terkunci sebagai kredensial utama" />
                  <Input
                    label="Nomor Handphone (Kunci Telegram Bot)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081234567890"
                    helperText="Nomor ini dipakai bot untuk mengenali akun Anda saat chat."
                  />
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Mata Uang Default
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    >
                      <option value="IDR">Rupiah Indonesia (IDR - Rp)</option>
                      <option value="USD">US Dollar (USD - $)</option>
                      <option value="SGD">Singapore Dollar (SGD - S$)</option>
                      <option value="EUR">Euro (EUR - €)</option>
                    </select>
                    <p className="text-[11px] text-slate-400 mt-1">Mata uang utama pelaporan transaksi</p>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <Button type="submit">
                    {profileSaved ? <Check className="w-4 h-4 mr-1 text-white" /> : null}
                    {profileSaved ? 'Perubahan Tersimpan!' : 'Simpan Perubahan Profil'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tab 3: Reminders */}
        {activeTab === 'reminders' && (
          <Card className="space-y-6">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg font-bold text-slate-900">
                Pengingat Harian Otomatis (Maksimal 2x/Hari)
              </CardTitle>
              <p className="text-xs text-slate-500">
                Bot Telegram akan mengirimkan pesan pengingat ramah untuk membantu Anda tetap disiplin mencatat pengeluaran.
              </p>
            </CardHeader>
            <CardContent className="space-y-5 pt-2">
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Pengingat Siang (12:30 WIB)</div>
                    <div className="text-xs text-slate-500">
                      Pengingat untuk mencatat makan siang dan belanja tengah hari
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={reminderMorning}
                    onChange={(e) => setReminderMorning(e.target.checked)}
                    className="rounded text-brand-500 focus:ring-brand-500 w-5 h-5"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Pengingat Malam (20:30 WIB)</div>
                    <div className="text-xs text-slate-500">
                      Rekap transaksi harian sebelum istirahat malam
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={reminderEvening}
                    onChange={(e) => setReminderEvening(e.target.checked)}
                    className="rounded text-brand-500 focus:ring-brand-500 w-5 h-5"
                  />
                </label>
              </div>

              {/* Reminder Live Message Preview */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4 text-brand-500" />
                  <span>Pratinjau Pesan yang Dikirimkan Bot di Telegram</span>
                </div>
                <div className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs font-sans space-y-2 border border-slate-800 shadow-inner">
                  <div className="flex items-center gap-2 text-brand-400 font-bold">
                    <Bot className="w-4 h-4" /> TataDana Bot
                  </div>
                  <p className="leading-relaxed">
                    👋 <b>Halo, {user.full_name}!</b>
                    <br />
                    Sudah mencatat pengeluaran Anda hari ini? ☕
                    <br /><br />
                    Cukup balas pesan ini dengan nominal & keterangan transaksi, contoh:
                    <br />
                    <i>&bull; "Makan siang Padang 25rb"</i>
                    <br />
                    <i>&bull; "Kopi susu 18k dompet gopay"</i>
                    <br /><br />
                    Tetap semangat mengelola keuangan bersama TataDana! ✨
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button onClick={handleSaveReminders}>
                  {remindersSaved ? <Check className="w-4 h-4 mr-1" /> : null}
                  {remindersSaved ? 'Jadwal Tersimpan!' : 'Simpan Jadwal Pengingat'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab 4: Categories */}
        {activeTab === 'categories' && (
          <Card className="space-y-6">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg font-bold text-slate-900">
                Kategori Transaksi Kustom (Emoji & Warna)
              </CardTitle>
              <p className="text-xs text-slate-500">
                Sesuaikan kategori pengeluaran dan pemasukan dengan ikon emoji dan palet warna favorit Anda.
              </p>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {/* Add form with Emoji & Color Selector */}
              <form onSubmit={handleAddCategory} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-6">
                    <Input
                      label="Nama Kategori Baru"
                      placeholder="cth: Donasi & Sedekah, Kursus, Hobi"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Tipe
                    </label>
                    <select
                      value={newCatType}
                      onChange={(e) => setNewCatType(e.target.value as any)}
                      className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="expense">Pengeluaran</option>
                      <option value="income">Pemasukan</option>
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Pilih Emoji
                    </label>
                    <select
                      value={newCatEmoji}
                      onChange={(e) => setNewCatEmoji(e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {availableEmojis.map((em) => (
                        <option key={em} value={em}>
                          {em}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Color Palette Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Warna Penanda
                  </label>
                  <div className="flex items-center gap-2">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewCatColor(color)}
                        className={`w-7 h-7 rounded-full transition-transform ${
                          newCatColor === color ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit">Tambah Kategori</Button>
                </div>
              </form>

              {/* Category List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {categoriesList.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs shadow-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-xs"
                        style={{ backgroundColor: `${c.color || '#f97316'}20`, color: c.color || '#f97316' }}
                      >
                        {c.icon && c.icon.length <= 2 ? c.icon : '🏷️'}
                      </span>
                      <span className="font-semibold text-slate-800 truncate">{c.name}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        c.type === 'income'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {c.type}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
