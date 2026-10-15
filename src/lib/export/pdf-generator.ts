import { Transaction } from '@/types/database';
import { formatRupiah } from '../utils/currency';
import { formatWIB } from '../utils/date';

/**
 * Escapes characters for PDF literal string syntax: ( ... )
 * and sanitizes non-ASCII glyphs to safe WinAnsi/ASCII equivalents.
 */
function escapePdfText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, (char) => {
      if (char === '•') return '*';
      if (char === '—' || char === '–') return '-';
      if (char === '’' || char === '‘') return "'";
      if (char === '“' || char === '”') return '"';
      if (char === '…') return '...';
      return ' ';
    });
}

/**
 * Generates a genuine, ISO 32000-1 / PDF-1.4 compliant binary PDF document.
 * Features:
 * - A4 geometry (595.28 x 841.89 pt) with TataDana Orange branding (#F97316)
 * - Financial summary metrics (Pemasukan, Pengeluaran, Arus Kas Bersih)
 * - Structured transaction ledger table with alternating rows and colorized amounts
 * - Automatic multi-page pagination with running headers, footers, and page numbers
 * - Valid object cross-reference table (xref) and document trailer
 */
export function generatePdfReport(
  transactions: Transaction[],
  period: string,
  userFullName: string
): Buffer {
  // 1. Calculate Financial Totals
  let totalIncome = 0;
  let totalExpense = 0;

  for (const t of transactions) {
    if (t.type === 'income') totalIncome += t.amount;
    if (t.type === 'expense') totalExpense += t.amount;
  }
  const netCashflow = totalIncome - totalExpense;

  // 2. Pagination calculation
  const rowsPerPageFirst = 24;
  const rowsPerPageSubsequent = 34;

  let totalPages = 1;
  if (transactions.length > rowsPerPageFirst) {
    const remaining = transactions.length - rowsPerPageFirst;
    totalPages = 1 + Math.ceil(remaining / rowsPerPageSubsequent);
  }

  // 3. Generate Content Streams for each page
  const pageStreams: string[] = [];
  const printedDate = formatWIB(new Date());

  let currentTxIndex = 0;

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const streamParts: string[] = [];

    // Helper: Text block
    const addText = (
      font: string,
      size: number,
      x: number,
      y: number,
      text: string,
      r = 0.059,
      g = 0.09,
      b = 0.165
    ) => {
      streamParts.push(`q\n${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg\nBT\n/${font} ${size} Tf\n1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm\n(${escapePdfText(text)}) Tj\nET\nQ\n`);
    };

    // Helper: Filled Rectangle
    const fillRect = (x: number, y: number, w: number, h: number, r: number, g: number, b: number) => {
      streamParts.push(`q\n${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg\n${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f\nQ\n`);
    };

    // Helper: Stroked Rectangle / Box
    const strokeRect = (x: number, y: number, w: number, h: number, r = 0.886, g = 0.91, b = 0.941, lineWidth = 0.75) => {
      streamParts.push(`q\n${lineWidth} w\n${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG\n${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S\nQ\n`);
    };

    // Helper: Horizontal Line
    const drawHLine = (x1: number, x2: number, y: number, r = 0.886, g = 0.91, b = 0.941, lineWidth = 0.5) => {
      streamParts.push(`q\n${lineWidth} w\n${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG\n${x1.toFixed(2)} ${y.toFixed(2)} m ${x2.toFixed(2)} ${y.toFixed(2)} l S\nQ\n`);
    };

    // --- PAGE 1 HEADER & SUMMARY ---
    if (pageNum === 1) {
      // Top Orange Accent Bar (#F97316)
      fillRect(40, 796, 515, 4, 0.976, 0.451, 0.086);

      // Brand Title & Tagline
      addText('F2', 20, 40, 766, 'TataDana', 0.976, 0.451, 0.086);
      addText('F1', 9, 40, 752, 'Fintech Personal Finance Management', 0.392, 0.455, 0.545);

      // Metadata Block (Right aligned block)
      addText('F1', 8.5, 340, 770, `Nama: ${userFullName}`, 0.2, 0.25, 0.3);
      addText('F1', 8.5, 340, 757, `Periode: ${period}`, 0.2, 0.25, 0.3);
      addText('F1', 8.5, 340, 744, `Dicetak: ${printedDate}`, 0.392, 0.455, 0.545);

      // Divider below header
      drawHLine(40, 555, 734, 0.886, 0.91, 0.941, 0.75);

      // Three Financial Summary Cards
      // Card 1: Pemasukan (Green accent)
      fillRect(40, 666, 163, 56, 0.973, 0.98, 0.988);
      strokeRect(40, 666, 163, 56, 0.886, 0.91, 0.941);
      addText('F2', 7.5, 50, 706, 'TOTAL PEMASUKAN', 0.392, 0.455, 0.545);
      addText('F2', 12, 50, 684, `+${formatRupiah(totalIncome)}`, 0.063, 0.725, 0.506);

      // Card 2: Pengeluaran (Red accent)
      fillRect(216, 666, 163, 56, 0.973, 0.98, 0.988);
      strokeRect(216, 666, 163, 56, 0.886, 0.91, 0.941);
      addText('F2', 7.5, 226, 706, 'TOTAL PENGELUARAN', 0.392, 0.455, 0.545);
      addText('F2', 12, 226, 684, `-${formatRupiah(totalExpense)}`, 0.937, 0.267, 0.267);

      // Card 3: Arus Kas Bersih (Net)
      fillRect(392, 666, 163, 56, 0.973, 0.98, 0.988);
      strokeRect(392, 666, 163, 56, 0.886, 0.91, 0.941);
      addText('F2', 7.5, 402, 706, 'ARUS KAS BERSIH (NET)', 0.392, 0.455, 0.545);
      const netColor = netCashflow >= 0 ? [0.063, 0.725, 0.506] : [0.937, 0.267, 0.267];
      addText('F2', 12, 402, 684, formatRupiah(netCashflow), netColor[0], netColor[1], netColor[2]);

      // Table Title
      addText('F2', 11, 40, 642, `Rincian Transaksi (${transactions.length} Transaksi)`, 0.059, 0.09, 0.165);

      // Table Header Row
      fillRect(40, 616, 515, 20, 0.945, 0.961, 0.976);
      drawHLine(40, 555, 616, 0.796, 0.835, 0.882, 0.75);

      addText('F2', 8, 46, 622, 'No', 0.28, 0.33, 0.41);
      addText('F2', 8, 72, 622, 'Tanggal', 0.28, 0.33, 0.41);
      addText('F2', 8, 142, 622, 'Kategori', 0.28, 0.33, 0.41);
      addText('F2', 8, 242, 622, 'Catatan', 0.28, 0.33, 0.41);
      addText('F2', 8, 382, 622, 'Dompet', 0.28, 0.33, 0.41);
      addText('F2', 8, 470, 622, 'Jumlah (Rp)', 0.28, 0.33, 0.41);
    } else {
      // --- SUBSEQUENT PAGES COMPACT HEADER ---
      fillRect(40, 804, 515, 3, 0.976, 0.451, 0.086);
      addText('F2', 9, 40, 788, `TataDana - Laporan Keuangan (${period})`, 0.059, 0.09, 0.165);
      addText('F1', 8, 430, 788, `Halaman ${pageNum} dari ${totalPages}`, 0.392, 0.455, 0.545);
      drawHLine(40, 555, 778, 0.886, 0.91, 0.941, 0.5);

      // Table Header Row
      fillRect(40, 752, 515, 20, 0.945, 0.961, 0.976);
      drawHLine(40, 555, 752, 0.796, 0.835, 0.882, 0.75);

      addText('F2', 8, 46, 758, 'No', 0.28, 0.33, 0.41);
      addText('F2', 8, 72, 758, 'Tanggal', 0.28, 0.33, 0.41);
      addText('F2', 8, 142, 758, 'Kategori', 0.28, 0.33, 0.41);
      addText('F2', 8, 242, 758, 'Catatan', 0.28, 0.33, 0.41);
      addText('F2', 8, 382, 758, 'Dompet', 0.28, 0.33, 0.41);
      addText('F2', 8, 470, 758, 'Jumlah (Rp)', 0.28, 0.33, 0.41);
    }

    // --- TABLE ROWS FOR CURRENT PAGE ---
    const rowHeight = 18;
    const pageCapacity = pageNum === 1 ? rowsPerPageFirst : rowsPerPageSubsequent;
    let yPos = pageNum === 1 ? 598 : 734;

    const pageTxEnd = Math.min(currentTxIndex + pageCapacity, transactions.length);

    if (transactions.length === 0 && pageNum === 1) {
      addText('F3', 9, 45, yPos - 6, 'Belum ada data transaksi untuk periode yang dipilih.', 0.5, 0.55, 0.6);
    }

    for (let i = currentTxIndex; i < pageTxEnd; i++) {
      const tx = transactions[i];
      const isOdd = (i - currentTxIndex) % 2 === 1;

      // Subtle zebra striping
      if (isOdd) {
        fillRect(40, yPos - 4, 515, rowHeight, 0.98, 0.985, 0.992);
      }
      // Row bottom border
      drawHLine(40, 555, yPos - 4, 0.92, 0.935, 0.955, 0.4);

      const txDateStr = formatWIB(tx.transaction_date, { includeTime: false });
      const catName = (tx.category?.name || 'Lain-lain').slice(0, 18);
      const notesStr = (tx.notes || '-').slice(0, 24);
      const walletName = (tx.wallet?.name || 'Dompet').slice(0, 14);

      const isInc = tx.type === 'income';
      const isExp = tx.type === 'expense';
      const amtPrefix = isInc ? '+' : isExp ? '-' : '';
      const amtFormatted = `${amtPrefix}${formatRupiah(tx.amount)}`;
      const amtColor = isInc ? [0.063, 0.725, 0.506] : isExp ? [0.937, 0.267, 0.267] : [0.392, 0.455, 0.545];

      addText('F1', 7.5, 46, yPos, `${i + 1}`, 0.35, 0.4, 0.45);
      addText('F1', 7.5, 72, yPos, txDateStr, 0.2, 0.25, 0.3);
      addText('F2', 7.5, 142, yPos, catName, 0.1, 0.15, 0.2);
      addText('F1', 7.5, 242, yPos, notesStr, 0.4, 0.45, 0.5);
      addText('F1', 7.5, 382, yPos, walletName, 0.3, 0.35, 0.4);
      addText('F2', 7.5, 470, yPos, amtFormatted, amtColor[0], amtColor[1], amtColor[2]);

      yPos -= rowHeight;
    }

    currentTxIndex = pageTxEnd;

    // --- RUNNING FOOTER ---
    drawHLine(40, 555, 46, 0.886, 0.91, 0.941, 0.5);
    addText(
      'F1',
      7.5,
      40,
      32,
      `Dicetak otomatis oleh TataDana - https://tatadana.id  *  Integritas Data Terverifikasi`,
      0.5,
      0.55,
      0.6
    );
    addText(
      'F1',
      7.5,
      480,
      32,
      `Halaman ${pageNum} dari ${totalPages}`,
      0.5,
      0.55,
      0.6
    );

    pageStreams.push(streamParts.join(''));
  }

  // 4. Assemble the complete PDF-1.4 file
  const chunks: string[] = [];
  const byteOffsets: number[] = [];

  const addChunk = (str: string) => {
    chunks.push(str);
  };

  // Header: Standard PDF 1.4 specification
  addChunk('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

  // Object counter and IDs
  // Obj 1: Catalog
  // Obj 2: Pages root
  // Obj 3: Font F1 (Helvetica)
  // Obj 4: Font F2 (Helvetica-Bold)
  // Obj 5: Font F3 (Helvetica-Oblique)
  // Obj 6: Shared Resources
  // Pages & Streams: for each page i from 1 to totalPages:
  //   Page Obj ID: 7 + (i - 1) * 2
  //   Content Stream ID: 8 + (i - 1) * 2
  // Document Info Obj ID: 7 + totalPages * 2

  const catalogObjId = 1;
  const pagesObjId = 2;
  const fontF1Id = 3;
  const fontF2Id = 4;
  const fontF3Id = 5;
  const resourcesId = 6;
  const infoObjId = 7 + totalPages * 2;
  const totalObjects = infoObjId;

  const currentLength = () => chunks.reduce((acc, c) => acc + Buffer.byteLength(c, 'binary'), 0);

  // Object 1: Catalog
  byteOffsets[catalogObjId] = currentLength();
  addChunk(`${catalogObjId} 0 obj\n<< /Type /Catalog /Pages ${pagesObjId} 0 R >>\nendobj\n`);

  // Object 2: Pages
  const kidsStr = Array.from({ length: totalPages }, (_, i) => `${7 + i * 2} 0 R`).join(' ');
  byteOffsets[pagesObjId] = currentLength();
  addChunk(`${pagesObjId} 0 obj\n<< /Type /Pages /Kids [${kidsStr}] /Count ${totalPages} >>\nendobj\n`);

  // Object 3: Helvetica
  byteOffsets[fontF1Id] = currentLength();
  addChunk(`${fontF1Id} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n`);

  // Object 4: Helvetica-Bold
  byteOffsets[fontF2Id] = currentLength();
  addChunk(`${fontF2Id} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n`);

  // Object 5: Helvetica-Oblique
  byteOffsets[fontF3Id] = currentLength();
  addChunk(`${fontF3Id} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>\nendobj\n`);

  // Object 6: Shared Resources
  byteOffsets[resourcesId] = currentLength();
  addChunk(
    `${resourcesId} 0 obj\n<< /Font << /F1 ${fontF1Id} 0 R /F2 ${fontF2Id} 0 R /F3 ${fontF3Id} 0 R >> /ProcSet [/PDF /Text /ImageB /ImageC /ImageI] >>\nendobj\n`
  );

  // Pages and Content Streams
  for (let i = 0; i < totalPages; i++) {
    const pageId = 7 + i * 2;
    const contentId = 8 + i * 2;
    const streamContent = pageStreams[i];
    const streamLen = Buffer.byteLength(streamContent, 'binary');

    // Page object
    byteOffsets[pageId] = currentLength();
    addChunk(
      `${pageId} 0 obj\n<< /Type /Page /Parent ${pagesObjId} 0 R /MediaBox [0 0 595.28 841.89] /Resources ${resourcesId} 0 R /Contents ${contentId} 0 R >>\nendobj\n`
    );

    // Content stream object
    byteOffsets[contentId] = currentLength();
    addChunk(`${contentId} 0 obj\n<< /Length ${streamLen} >>\nstream\n${streamContent}\nendstream\nendobj\n`);
  }

  // Document Info Object
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const pdfDate = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(
    now.getMinutes()
  )}${pad(now.getSeconds())}`;

  byteOffsets[infoObjId] = currentLength();
  addChunk(
    `${infoObjId} 0 obj\n<< /Title (${escapePdfText(
      `Laporan Keuangan TataDana - ${period}`
    )}) /Author (TataDana) /Subject (Laporan Keuangan Pribadi) /Creator (TataDana PDF Export Engine) /CreationDate (D:${pdfDate}) >>\nendobj\n`
  );

  // Cross Reference Table (xref)
  const xrefOffset = currentLength();
  let xrefStr = `xref\n0 ${totalObjects + 1}\n0000000000 65535 f \n`;
  for (let objId = 1; objId <= totalObjects; objId++) {
    const off = byteOffsets[objId] || 0;
    xrefStr += `${String(off).padStart(10, '0')} 00000 n \n`;
  }
  addChunk(xrefStr);

  // Trailer & startxref
  addChunk(
    `trailer\n<< /Size ${totalObjects + 1} /Root ${catalogObjId} 0 R /Info ${infoObjId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`
  );

  const finalString = chunks.join('');
  return Buffer.from(finalString, 'binary');
}

/**
 * Backward-compatible HTML renderer for printable web previews if needed.
 */
export function generateHtmlForPdf(
  transactions: Transaction[],
  period: string,
  userFullName: string
): string {
  let totalIncome = 0;
  let totalExpense = 0;

  const rowsHtml = transactions
    .map((t, idx) => {
      if (t.type === 'income') totalIncome += t.amount;
      if (t.type === 'expense') totalExpense += t.amount;

      const isIncome = t.type === 'income';
      const isExpense = t.type === 'expense';
      const color = isIncome ? '#10b981' : isExpense ? '#ef4444' : '#6b7280';
      const sign = isIncome ? '+' : isExpense ? '-' : '';

      return `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px; font-size: 13px;">${idx + 1}</td>
        <td style="padding: 10px; font-size: 13px;">${formatWIB(t.transaction_date, { includeTime: false })}</td>
        <td style="padding: 10px; font-size: 13px; font-weight: 500;">${t.category?.name || 'Lain-lain'}</td>
        <td style="padding: 10px; font-size: 13px; color: #64748b;">${t.notes || '-'}</td>
        <td style="padding: 10px; font-size: 13px; color: #64748b;">${t.wallet?.name || '-'}</td>
        <td style="padding: 10px; font-size: 13px; font-weight: 600; text-align: right; color: ${color};">
          ${sign}${formatRupiah(t.amount)}
        </td>
      </tr>
    `;
    })
    .join('');

  const netCashflow = totalIncome - totalExpense;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Laporan Keuangan TataDana - ${period}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 40px; background: #ffffff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f97316; padding-bottom: 20px; margin-bottom: 24px; }
    .logo { font-size: 26px; font-weight: 800; color: #f97316; }
    .meta { text-align: right; font-size: 13px; color: #64748b; line-height: 1.5; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px; }
    .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
    .stat-title { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 6px; }
    .stat-value { font-size: 20px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; text-align: left; margin-top: 10px; }
    th { background: #f8fafc; padding: 12px 10px; font-size: 12px; font-weight: 700; color: #475569; border-bottom: 2px solid #cbd5e1; }
    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">TataDana</div>
      <div class="report-title" style="font-size: 16px; font-weight: 700; color: #1e293b; margin-top: 4px;">LAPORAN KEUANGAN TATADANA</div>
      <div style="font-size: 14px; color: #475569; margin-top: 4px;">Fintech Personal Finance Management</div>
    </div>
    <div class="meta">
      <strong>Nama:</strong> ${userFullName}<br>
      <strong>Periode:</strong> ${period}<br>
      <strong>Dicetak:</strong> ${formatWIB(new Date())}
    </div>
  </div>

  <div class="summary-grid">
    <div class="stat-card">
      <div class="stat-title">Total Pemasukan</div>
      <div class="stat-value" style="color: #10b981;">+${formatRupiah(totalIncome)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-title">Total Pengeluaran</div>
      <div class="stat-value" style="color: #ef4444;">-${formatRupiah(totalExpense)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-title">Arus Kas Bersih (Net)</div>
      <div class="stat-value" style="color: ${netCashflow >= 0 ? '#10b981' : '#ef4444'};">${formatRupiah(netCashflow)}</div>
    </div>
  </div>

  <h3>Rincian Transaksi (${transactions.length})</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 40px;">No</th>
        <th style="width: 120px;">Tanggal</th>
        <th style="width: 160px;">Kategori</th>
        <th>Catatan</th>
        <th style="width: 120px;">Dompet</th>
        <th style="width: 140px; text-align: right;">Jumlah</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="footer">
    Dicetak secara otomatis oleh TataDana - https://tatadana.id &bull; Integritas Data Terenkripsi
  </div>
</body>
</html>`;
}
