import { demoStore } from '../mock/store';
import { generatePdfReport } from './pdf-generator';
import { generateExcelReport } from './excel-generator';
import { createAdminClient } from '../supabase/admin';

export async function generateReportExport(params: {
  userId: string;
  fileType: 'pdf' | 'xlsx';
  period: string;
  transactions: any[];
}): Promise<{ fileUrl: string; fileName: string; exportId: string }> {
  const ext = params.fileType;
  const sanitizedPeriod = params.period.replace(/\s+/g, '_');
  const fileName = `Laporan_Keuangan_TataDana_${sanitizedPeriod}.${ext}`;

  // Direct streaming API endpoint as default robust fallback
  const streamingUrl = `/api/reports/export?format=${ext}&period=${encodeURIComponent(params.period)}`;
  let finalFileUrl = streamingUrl;

  const user = demoStore.getUser();
  const userFullName = user?.full_name || 'Pengguna TataDana';

  // Attempt to generate file buffer and upload to Supabase Storage if configured
  try {
    const supabase = createAdminClient();
    if (supabase) {
      const buffer =
        params.fileType === 'pdf'
          ? generatePdfReport(params.transactions, params.period, userFullName)
          : generateExcelReport(params.transactions, params.period, userFullName);

      const storagePath = `${params.userId}/${fileName}`;
      const contentType =
        params.fileType === 'pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('tatadana-exports')
        .upload(storagePath, buffer, {
          contentType,
          upsert: true,
        });

      if (!uploadErr && uploadData) {
        // Generate a 60-minute signed URL
        const { data: signedData, error: signedErr } = await supabase.storage
          .from('tatadana-exports')
          .createSignedUrl(storagePath, 3600);

        if (!signedErr && signedData?.signedUrl) {
          finalFileUrl = signedData.signedUrl;
        }
      }

      // Record in Supabase export_history table if connected
      await supabase.from('export_history').insert({
        user_id: params.userId,
        file_name: fileName,
        file_url: finalFileUrl,
        file_type: params.fileType,
        period_range: params.period,
        status: 'completed',
      });
    }
  } catch (err: any) {
    // If Supabase Storage is not provisioned or fails, continue with streaming URL fallback
    console.warn('Supabase storage export upload bypassed, using direct streaming URL:', err?.message);
  }

  // Record export in demo store
  const exportItem = demoStore.addExport({
    user_id: params.userId,
    file_name: fileName,
    file_url: finalFileUrl,
    file_type: params.fileType,
    period_range: params.period,
    status: 'completed',
  });

  return {
    fileUrl: finalFileUrl,
    fileName,
    exportId: exportItem.id,
  };
}
