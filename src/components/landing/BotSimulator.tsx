'use client';

import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { handleTelegramUpdate } from '@/lib/telegram/message-handler';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export function BotSimulator() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_0',
      sender: 'bot',
      text: `👋 <b>Halo!</b> Saya <b>TataDana FinBot</b>.<br>Coba ketik transaksi Anda, misalnya:<br>• <i>Makan siang padang 25rb</i><br>• <i>Beli bensin pertamax 50k</i><br>• <i>/saldo</i> atau <i>/budget</i>`,
      time: '10:00 WIB',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const samplePrompts = [
    'Makan siang padang 25rb',
    'Beli bensin shell 50k',
    'Kopi kenangan 18ribu',
    '/saldo',
    '/budget',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // Execute through actual Telegram message handler
      const res = await handleTelegramUpdate({
        update_id: Date.now(),
        message: {
          message_id: Math.floor(Math.random() * 10000),
          from: { id: 987654321, is_bot: false, first_name: 'Fauzi' },
          chat: { id: 987654321, type: 'private' },
          date: Math.floor(Date.now() / 1000),
          text,
        },
      });

      const botReply = res.replyText || 'Format pesan berhasil diproses.';

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot_${Date.now()}`,
            sender: 'bot',
            text: botReply.replace(/\n/g, '<br>'),
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
          },
        ]);
        setIsTyping(false);
      }, 400);
    } catch {
      setIsTyping(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'msg_0',
        sender: 'bot',
        text: `👋 <b>Halo!</b> Saya <b>TataDana FinBot</b>.<br>Coba ketik transaksi Anda, misalnya:<br>• <i>Makan siang padang 25rb</i><br>• <i>Beli bensin pertamax 50k</i><br>• <i>/saldo</i> atau <i>/budget</i>`,
        time: '10:00 WIB',
      },
    ]);
  };

  return (
    <section id="simulator" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Uji Coba Interaktif Langsung
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Coba Ketik Transaksi di Simulator Bot
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            Ketik bahasa santai Anda atau pilih tombol cepat di bawah untuk merasakan respon secepat kilat dari bot TataDana.
          </p>
        </div>

        {/* Telegram Chat Mockup Frame */}
        <div className="rounded-2xl border border-slate-200 bg-slate-900 shadow-2xl overflow-hidden text-slate-100 flex flex-col h-[520px]">
          {/* Header */}
          <div className="bg-slate-800 px-4 py-3 border-b border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-500 to-amber-500 flex items-center justify-center text-white shadow">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  TataDana FinBot <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                </div>
                <div className="text-[11px] text-slate-400">bot aktif &bull; didukung AI Multi-Provider</div>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="Reset Chat"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/60 font-sans">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 max-w-[85%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                    m.sender === 'user' ? 'bg-brand-500 text-white' : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-none'
                      : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/60 font-mono sm:font-sans'
                  }`}
                >
                  <div dangerouslySetInnerHTML={{ __html: m.text }} />
                  <div
                    className={`text-[10px] mt-1 text-right ${
                      m.sender === 'user' ? 'text-brand-200' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 items-center text-xs text-slate-400 italic">
                <Bot className="w-4 h-4 text-brand-400" />
                <span>TataDana FinBot sedang mengetik...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-slate-900/90 px-3 py-2 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
            <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Contoh cepat:</span>
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-800 border-t border-slate-700/80 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ketik transaksi... (cth: Makan padang 25rb)"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Button type="submit" size="sm" className="h-10 px-4 rounded-xl">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
