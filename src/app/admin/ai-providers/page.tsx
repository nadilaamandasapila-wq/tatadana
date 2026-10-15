'use client';

import React, { useState } from 'react';
import { Cpu, CheckCircle2, XCircle, ArrowUpDown, ShieldCheck, Zap, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { demoStore } from '@/lib/mock/store';

export default function AdminAIProvidersPage() {
  const [failoverMode, setFailoverMode] = useState(demoStore.getFailoverMode());
  const [providers, setProviders] = useState(demoStore.getAIProviders());
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { latency: number; ok: boolean }>>({});

  const toggleProvider = (id: string) => {
    demoStore.toggleAIProvider(id);
    setProviders([...demoStore.getAIProviders()]);
  };

  const handleToggleFailover = () => {
    const next = !failoverMode;
    demoStore.setFailoverMode(next);
    setFailoverMode(next);
  };

  const handleTestHealth = (id: string, name: string) => {
    setTestingId(id);
    setTimeout(() => {
      setTestingId(null);
      const simulatedLatency = id.includes('gemini') ? 342 : id.includes('openai') ? 485 : 620;
      setTestResults((prev) => ({
        ...prev,
        [id]: { latency: simulatedLatency, ok: true },
      }));
    }, 500);
  };

  const movePriority = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= providers.length) return;

    const list = [...providers];
    const temp = list[index].priority;
    list[index].priority = list[targetIndex].priority;
    list[targetIndex].priority = temp;

    // Sort by priority
    list.sort((a, b) => a.priority - b.priority);
    setProviders(list);
  };

  return (
    <>
      <AdminHeader title="AI Provider Manager" />

      <main className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Failover Mode Control Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-brand-500" />
              <h2 className="text-lg font-bold text-slate-900">Mode Eksekusi AI Multi-Provider</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Saat <b>Failover Mode</b> aktif, jika Google Gemini mengalami rate limit atau kegagalan jaringan, sistem secara otomatis mengalihkan request ke OpenAI GPT-4o-mini dan DeepSeek V3 tanpa jeda bagi pengguna.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className="text-xs font-semibold text-slate-700">
              {failoverMode ? '🟢 Mode Failover (Aktif)' : '⚪ Mode Single Provider'}
            </span>
            <button
              onClick={handleToggleFailover}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                failoverMode ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
              title="Toggle Failover Mode"
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  failoverMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Providers Table Card */}
        <Card className="p-0 overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Daftar Provider Model AI & Urutan Prioritas
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Konfigurasi tabel <code>public.ai_providers</code></p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-6">Prioritas</th>
                    <th className="py-3 px-6">Nama Provider</th>
                    <th className="py-3 px-6">Tipe & Model</th>
                    <th className="py-3 px-6">API Key</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6">Uji Kesehatan (Ping)</th>
                    <th className="py-3 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {providers.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold text-slate-700">
                          <span>#{p.priority}</span>
                          <div className="flex flex-col ml-1">
                            <button
                              disabled={idx === 0}
                              onClick={() => movePriority(idx, 'up')}
                              className={`p-0.5 rounded hover:bg-slate-200 ${idx === 0 ? 'opacity-30 cursor-not-allowed' : 'text-slate-600'}`}
                              title="Naikkan Prioritas"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              disabled={idx === providers.length - 1}
                              onClick={() => movePriority(idx, 'down')}
                              className={`p-0.5 rounded hover:bg-slate-200 ${idx === providers.length - 1 ? 'opacity-30 cursor-not-allowed' : 'text-slate-600'}`}
                              title="Turunkan Prioritas"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">{p.name}</td>
                      <td className="py-4 px-6 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {p.provider_type} / <strong>{p.model_name}</strong>
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-400 whitespace-nowrap">••••••••••••••••</td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {p.is_active ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                            <XCircle className="w-3 h-3" /> Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {testResults[p.id] ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Latensi {testResults[p.id].latency} ms &bull; OK</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleTestHealth(p.id, p.name)}
                            disabled={testingId === p.id}
                            className="inline-flex items-center gap-1 text-brand-600 hover:underline font-semibold text-xs"
                          >
                            {testingId === p.id ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Menguji Ping...</span>
                              </>
                            ) : (
                              <span>Ping Server</span>
                            )}
                          </button>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <Button
                          variant={p.is_active ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => toggleProvider(p.id)}
                          className="text-xs"
                        >
                          {p.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
