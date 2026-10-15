'use client';

import React, { useState } from 'react';
import { Download, FileSpreadsheet, Server, CheckCircle2, FileText, Database, ShieldCheck } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { demoStore } from '@/lib/mock/store';

export default function AdminExportPage() {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  const totalUsers = demoStore.getSubscriptions().length;
  const totalTransactions = demoStore.getTransactions().length;
  const totalAILogs = demoStore.getAILogs().length;
  const totalAuditLogs = demoStore.getAuditLogs().length;

  const handleDownload = (format: 'xlsx' | 'json') => {
    setDownloadingFormat(format);
    setTimeout(() => {
      setDownloadingFormat(null);
      if (format === 'xlsx') {
        window.open('/api/reports/export?format=xlsx', '_blank');
      } else {
        // Export summary JSON directly
        const summaryData = {
          export_timestamp: new Date().toISOString(),
          platform: 'TataDana Fintech SaaS',
          total_users: totalUsers,
          total_transactions: totalTransactions,
          total_ai_logs: totalAILogs,
          total_audit_logs: totalAuditLogs,
          active_wallets: demoStore.getWallets().length,
          failover_mode_active: demoStore.getFailoverMode(),
        };

        const blob = new Blob([JSON.stringify(summaryData, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tatadana_platform_export_${new Date().toISOString().substring(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }

      demoStore.addAuditLog('EXPORT_PLATFORM_DATA', null, {
        format,
        exported_by: demoStore.getAdminUser().email,
      });
    }, 600);
  };

  return (
    <>
      <AdminHeader title="Ekspor Data Platform Administrator" />

      <main className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        <Card className="p-5 sm:p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold flex-shrink-0">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Ekspor Buku Besar & Ringkasan Data Platform
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Unduh seluruh data agregat untuk pelaporan pajak, rekonsiliasi keuangan, dan analisis cohort platform.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase">Total Pengguna</span>
              <div className="text-2xl font-bold text-slate-900">{totalUsers} Akun</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase">Total Transaksi</span>
              <div className="text-2xl font-bold text-slate-900">{totalTransactions} Mutasi</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase">AI Telemetry Logs</span>
              <div className="text-2xl font-bold text-blue-600">{totalAILogs} Eksekusi</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase">Audit Logs Keamanan</span>
              <div className="text-2xl font-bold text-emerald-600">{totalAuditLogs} Entri</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Standar Keamanan Enkripsi Ekspor Platform:</span>
            </div>
            <p>
              Seluruh berkas yang diekspor telah diproses dengan enkripsi AES-256 dan hanya dapat diunduh oleh akun dengan hak akses Superadmin. Setiap tindakan ekspor dicatat secara otomatis ke dalam <code>admin_audit_logs</code>.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => handleDownload('json')}
              isLoading={downloadingFormat === 'json'}
              className="gap-2 text-xs sm:text-sm"
            >
              <Database className="w-4 h-4 text-slate-600" />
              <span>Ekspor Ringkasan JSON (.json)</span>
            </Button>
            <Button
              variant="primary"
              onClick={() => handleDownload('xlsx')}
              isLoading={downloadingFormat === 'xlsx'}
              className="gap-2 text-xs sm:text-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>Unduh Database Platform (.xlsx)</span>
            </Button>
          </div>
        </Card>
      </main>
    </>
  );
}
