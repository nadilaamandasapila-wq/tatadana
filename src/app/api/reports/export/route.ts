import { NextRequest, NextResponse } from 'next/server';
import { demoStore } from '@/lib/mock/store';
import { generateExcelReport } from '@/lib/export/excel-generator';
import { generatePdfReport, generateHtmlForPdf } from '@/lib/export/pdf-generator';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = (searchParams.get('format') || 'pdf').toLowerCase();
    const period = searchParams.get('period') || 'Oktober 2026';

    const user = demoStore.getUser();
    const transactions = demoStore.getTransactions();
    const sanitizedPeriod = period.replace(/\s+/g, '_');

    // 1. Excel Spreadsheet Export (.xlsx)
    if (format === 'xlsx') {
      const buffer = generateExcelReport(transactions, period, user.full_name);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="Laporan_Keuangan_TataDana_${sanitizedPeriod}.xlsx"`,
          'Content-Length': buffer.length.toString(),
        },
      });
    }

    // 2. Printable HTML Preview (if explicitly requested)
    if (format === 'html') {
      const html = generateHtmlForPdf(transactions, period, user.full_name);
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    // 3. Genuine Binary PDF Document (%PDF-1.4)
    const pdfBuffer = generatePdfReport(transactions, period, user.full_name);
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Laporan_Keuangan_TataDana_${sanitizedPeriod}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
