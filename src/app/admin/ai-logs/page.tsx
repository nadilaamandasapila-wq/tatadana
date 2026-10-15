'use client';

import React, { useState, useMemo } from 'react';
import { Activity, Cpu, Filter, Clock, DollarSign, CheckCircle2, AlertTriangle, XCircle, Search } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { demoStore } from '@/lib/mock/store';
import { formatWIB } from '@/lib/utils/date';

export default function AdminAILogsPage() {
  const [purposeFilter, setPurposeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const logs = demoStore.getAILogs();

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      if (purposeFilter !== 'all' && l.purpose !== purposeFilter) return false;
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchProvider = l.provider.toLowerCase().includes(q);
        const matchModel = l.model.toLowerCase().includes(q);
        const matchPurpose = l.purpose.toLowerCase().includes(q);
        if (!matchProvider && !matchModel && !matchPurpose) return false;
      }
      return true;
    });
  }, [logs, purposeFilter, statusFilter, searchTerm]);

  const avgLatency = Math.round(logs.reduce((acc, l) => acc + l.latency_ms, 0) / (logs.length || 1));
  const totalTokens = logs.reduce((acc, l) => acc + l.prompt_tokens + l.completion_tokens, 0);
  const totalEstimatedCost = logs.reduce((acc, l) => acc + (l.estimated_cost || 0), 0);
  const errorCount = logs.filter((l) => l.status === 'failed').length;

  return (
    <>
      <AdminHeader title="AI Telemetry & Observability" />

      <main className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase">
                Rata-rata Latensi AI
              </CardTitle>
              <Clock className="w-4 h-4 text-brand-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{avgLatency} ms</div>
              <p className="text-xs text-slate-500 mt-1">End-to-end response time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase">
                Total Token Diproses
              </CardTitle>
              <Cpu className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalTokens.toLocaleString()} Tokens</div>
              <p className="text-xs text-slate-500 mt-1">Prompt & Completion tokens</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase">
                Estimasi Total Biaya
              </CardTitle>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                ${totalEstimatedCost.toFixed(5)}
              </div>
              <p className="text-xs text-emerald-600 mt-1">Kumulatif seluruh provider</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase">
                Status Keberhasilan
              </CardTitle>
              <Activity className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {logs.length > 0 ? (((logs.length - errorCount) / logs.length) * 100).toFixed(1) : 100}%
              </div>
              <p className="text-xs text-slate-500 mt-1">{errorCount} error tercatat</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Toolbar (Purpose & Error/Status filter) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Status / Error Filter */}
            <span className="text-slate-500 font-bold mr-1">Status:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({logs.length})
            </button>
            <button
              onClick={() => setStatusFilter('success')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                statusFilter === 'success'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Sukses ({logs.length - errorCount})
            </button>
            <button
              onClick={() => setStatusFilter('failed')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                statusFilter === 'failed'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Hanya Error ({errorCount})
            </button>

            <span className="text-slate-300 mx-1 hidden sm:inline">|</span>

            {/* Purpose Filter */}
            <span className="text-slate-500 font-bold mr-1">Tujuan:</span>
            {['all', 'nlp_parse', 'ocr_receipt', 'voice_stt', 'advisor'].map((p) => (
              <button
                key={p}
                onClick={() => setPurposeFilter(p)}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                  purposeFilter === p
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p === 'all'
                  ? 'Semua'
                  : p === 'nlp_parse'
                  ? 'NLP Parse'
                  : p === 'ocr_receipt'
                  ? 'OCR Struk'
                  : p === 'voice_stt'
                  ? 'Voice STT'
                  : 'Advisor'}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari provider/model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 h-9 w-full rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Logs Table Card */}
        <Card className="p-0 overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900">
              Riwayat Eksekusi & Telemetri Model AI ({filteredLogs.length})
            </CardTitle>
            <span className="text-xs text-slate-400 font-mono">public.ai_logs</span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-6">Waktu Eksekusi</th>
                    <th className="py-3 px-6">Provider / Model</th>
                    <th className="py-3 px-6">Tujuan (Purpose)</th>
                    <th className="py-3 px-6">Tokens (In / Out)</th>
                    <th className="py-3 px-6">Latensi</th>
                    <th className="py-3 px-6">Estimasi Biaya</th>
                    <th className="py-3 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        {statusFilter === 'failed'
                          ? '✅ Tidak ada log kegagalan/error. Seluruh pemanggilan AI berjalan stabil.'
                          : 'Tidak ada log yang sesuai dengan filter.'}
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      const isFailed = log.status === 'failed';

                      return (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-6 text-slate-600 whitespace-nowrap">
                            {formatWIB(log.created_at)}
                          </td>
                          <td className="py-3.5 px-6 font-mono text-[11px] text-slate-900 whitespace-nowrap">
                            <span className="font-semibold text-brand-600">{log.provider}</span> / {log.model}
                          </td>
                          <td className="py-3.5 px-6 whitespace-nowrap">
                            <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] uppercase">
                              {log.purpose}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-slate-600 font-mono whitespace-nowrap">
                            {log.prompt_tokens} / {log.completion_tokens}
                          </td>
                          <td className="py-3.5 px-6 font-bold text-slate-800 whitespace-nowrap">
                            {log.latency_ms} ms
                          </td>
                          <td className="py-3.5 px-6 font-mono text-slate-500 whitespace-nowrap">
                            ${log.estimated_cost?.toFixed(6) || '0.000000'}
                          </td>
                          <td className="py-3.5 px-6 text-right whitespace-nowrap">
                            {isFailed ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                <XCircle className="w-3.5 h-3.5" /> Gagal
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Sukses
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
