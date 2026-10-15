import { formatRupiah } from '../utils/currency';
import { logAIOperation } from './telemetry';

export interface AdvisorInsight {
  type: 'spike_warning' | 'budget_alert' | 'saving_tip' | 'positive_reinforcement';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export async function generateAdvisorInsights(params: {
  userId: string;
  categoryName: string;
  currentAmount: number;
  monthlySpent: number;
  monthlyLimit?: number;
}): Promise<AdvisorInsight | null> {
  const startTime = Date.now();
  const { categoryName, currentAmount, monthlySpent, monthlyLimit } = params;

  // 1. Budget threshold check
  if (monthlyLimit && monthlyLimit > 0) {
    const ratio = (monthlySpent + currentAmount) / monthlyLimit;
    if (ratio >= 1.0) {
      await logAIOperation({
        userId: params.userId,
        provider: 'gemini',
        model: 'gemini-1.5-flash',
        promptTokens: 120,
        completionTokens: 45,
        latencyMs: Date.now() - startTime,
        purpose: 'advisor',
        status: 'success',
      });
      return {
        type: 'budget_alert',
        title: '⚠️ Anggaran Telah Terlampaui!',
        message: `Pengeluaran ${categoryName} bulan ini telah mencapai ${Math.round(
          ratio * 100
        )}% dari limit (${formatRupiah(monthlySpent + currentAmount)} / ${formatRupiah(
          monthlyLimit
        )}). Rem dulu pengeluaran di kategori ini ya!`,
        severity: 'high',
      };
    } else if (ratio >= 0.8) {
      await logAIOperation({
        userId: params.userId,
        provider: 'gemini',
        model: 'gemini-1.5-flash',
        promptTokens: 110,
        completionTokens: 40,
        latencyMs: Date.now() - startTime,
        purpose: 'advisor',
        status: 'success',
      });
      return {
        type: 'budget_alert',
        title: '⚡ Peringatan Kuota Anggaran (80%)',
        message: `Kategori ${categoryName} sudah mencapai ${Math.round(
          ratio * 100
        )}% dari limit bulanan. Sisa anggaran: ${formatRupiah(
          monthlyLimit - (monthlySpent + currentAmount)
        )}.`,
        severity: 'medium',
      };
    }
  }

  // 2. Expense spike check (> 50% single transaction relative to 500rb or monthly spent)
  if (currentAmount >= 500000) {
    await logAIOperation({
      userId: params.userId,
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      promptTokens: 130,
      completionTokens: 50,
      latencyMs: Date.now() - startTime,
      purpose: 'advisor',
      status: 'success',
    });
    return {
      type: 'spike_warning',
      title: '💡 Lonjakan Pengeluaran Terdeteksi',
      message: `Transaksi ${categoryName} sebesar ${formatRupiah(
        currentAmount
      )} tergolong besar hari ini. Pastikan alokasi pos tabungan dan dana darurat kamu tetap aman!`,
      severity: 'medium',
    };
  }

  return null;
}
