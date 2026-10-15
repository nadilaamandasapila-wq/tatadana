'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Trash2,
  Copy,
  Check,
  Loader2,
  HelpCircle,
  TrendingDown,
  Wallet,
  FileSpreadsheet,
} from 'lucide-react';
import { askDashboardAssistant, AssistantMessage } from '@/lib/ai/dashboard-assistant';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIChatModal({ isOpen, onClose }: AIChatModalProps) {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: 'Halo! Saya **Asisten Cerdas TataDana** 🤖✨\n\nSaya dapat membantu menjawab segala hal seputar aplikasi ini, memeriksa kondisi saldo dan pengeluaran Anda, hingga memberikan tips keuangan.\n\nSilakan pilih topik cepat di bawah atau ketik pertanyaan apa pun!',
      timestamp: 'Baru saja',
      suggestions: [
        'Berapa total saldo & pengeluaran saya bulan ini?',
        'Kategori apa yang paling banyak menghabiskan uang?',
        'Bagaimana cara menghubungkan Telegram bot?',
        'Apakah ada pos anggaran yang mendekati batas?',
        'Bagaimana cara ekspor laporan ke Excel dan PDF?',
      ],
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || isLoading) return;

    const userMsg: AssistantMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Baru saja',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const reply = await askDashboardAssistant(text);
      const assistantMsg: AssistantMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: reply,
        timestamp: 'Baru saja',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: AssistantMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: 'Maaf, terjadi kendala saat memproses pertanyaan Anda. Silakan coba kembali sesaat lagi.',
        timestamp: 'Baru saja',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'init-reset',
        sender: 'assistant',
        text: 'Riwayat obrolan telah dibersihkan. Ada hal lain seputar keuangan atau aplikasi yang ingin Anda tanyakan?',
        timestamp: 'Baru saja',
        suggestions: [
          'Berapa total saldo saya saat ini?',
          'Bantu saya membuat rencana anggaran hemat',
          'Cara menggunakan foto struk kasir',
        ],
      },
    ]);
  };

  // Helper to format basic markdown (bold, lists, links)
  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');
    return lines.map((line, idx) => {
      // Bold replacement
      let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

      if (line.startsWith('• ') || line.startsWith('- ')) {
        return (
          <li
            key={idx}
            className="ml-4 list-disc"
            dangerouslySetInnerHTML={{ __html: formatted.replace(/^[•-]\s*/, '') }}
          />
        );
      }
      if (/^\d+\.\s/.test(line)) {
        return (
          <li
            key={idx}
            className="ml-4 list-decimal"
            dangerouslySetInnerHTML={{ __html: formatted.replace(/^\d+\.\s*/, '') }}
          />
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      return <p key={idx} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 flex flex-col h-[85vh] max-h-[700px] overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-orange-500/5 via-amber-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base">Asisten AI TataDana</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-700">
                  Tersambung ke Data Anda
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Tanyakan seputar transaksi, saldo, fitur aplikasi, atau konsultasi finansial.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearChat}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Bersihkan Obrolan"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex-shrink-0 flex items-center justify-center shadow-sm font-bold text-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm shadow-sm space-y-2 relative group ${
                  msg.sender === 'user'
                    ? 'bg-brand-500 text-white rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                }`}
              >
                <div className="space-y-1">{renderFormattedText(msg.text)}</div>

                {/* Suggestions pill buttons */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Pertanyaan yang sering diajukan:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSendMessage(sug)}
                          className="text-left px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-brand-700 text-xs font-medium border border-brand-200/60 transition-colors"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message footer & copy button */}
                <div
                  className={`flex items-center justify-between pt-1 text-[10px] ${
                    msg.sender === 'user' ? 'text-white/70' : 'text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'assistant' && (
                    <button
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-brand-600 rounded"
                      title="Salin jawaban"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex-shrink-0 flex items-center justify-center shadow-sm font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex-shrink-0 flex items-center justify-center shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none p-3.5 shadow-sm text-xs text-slate-500 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />
                <span>Asisten AI sedang menganalisis data keuangan Anda...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Tanyakan seputar transaksi, fitur, saldo, atau bantuan aplikasi..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-500/25 hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Kirim</span>
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
            <span>💡 Terhubung langsung ke data dompet, anggaran, dan riwayat transaksi akun Anda</span>
            <span className="hidden sm:inline">Tekan Enter untuk kirim</span>
          </div>
        </div>
      </div>
    </div>
  );
}
