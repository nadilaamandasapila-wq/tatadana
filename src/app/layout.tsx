import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TataDana - Fintech Manajemen Keuangan Pribadi Terintegrasi Telegram Bot',
  description:
    'Catat pengeluaran semudah chatting di Telegram. Didukung AI multimodal Google Gemini, OCR struk belanja, pesan suara, dan ekspor laporan akuntansi resmi.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="min-h-screen bg-white text-slate-900">{children}</body>
    </html>
  );
}
