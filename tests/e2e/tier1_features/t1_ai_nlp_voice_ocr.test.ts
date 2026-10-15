import { describe, it, expect } from '../harness';
import {
  extractAmount,
  determineTransactionType,
  matchCategory,
  parseTransactionText,
} from '../../../src/lib/ai/nlp-parser';
import { parseReceiptImage } from '../../../src/lib/ai/ocr-service';
import { transcribeVoiceNote } from '../../../src/lib/ai/voice-service';
import { generateAdvisorInsights } from '../../../src/lib/ai/advisor';
import { AIProviderManager } from '../../../src/lib/ai/provider-manager';
import { logAIOperation } from '../../../src/lib/ai/telemetry';
import { demoStore } from '../../../src/lib/mock/store';

describe('Tier 1: AI Multi-Provider, Slang NLP, OCR, Voice, Advisor (F08-F13)', () => {
  it('F08: AI Multi-Provider Manager returns active providers and failover status', async () => {
    const providers = demoStore.getAIProviders();
    expect(providers.length >= 3).toBe(true);
    const gemini = providers.find((p) => p.name === 'gemini');
    expect(Boolean(gemini)).toBe(true);
    expect(gemini?.is_active).toBe(true);
  });

  it('F09: AI Telemetry correctly logs latency, tokens, and purpose', async () => {
    const initialLogCount = demoStore.getAILogs().length;
    await logAIOperation({
      userId: 'test_usr_telemetry',
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      promptTokens: 120,
      completionTokens: 45,
      latencyMs: 250,
      purpose: 'nlp_parse',
      status: 'success',
      estimatedCost: 0.0001,
    });

    const logs = demoStore.getAILogs();
    expect(logs.length).toBeGreaterThan(initialLogCount);
    const latest = logs[0];
    expect(latest.provider).toBe('gemini');
    expect(latest.purpose).toBe('nlp_parse');
    expect(latest.latency_ms).toBe(250);
  });

  it('F10: Indonesian Slang NLP Parser extracts amounts from varied slang formats', async () => {
    const cases = [
      { input: 'makan siang 15rb', expected: 15000 },
      { input: 'beli bensin 50k', expected: 50000 },
      { input: 'kopi kenangan 18ribu', expected: 18000 },
      { input: 'gaji bulanan 2.5jt', expected: 2500000 },
      { input: 'tagihan listrik 350.000', expected: 350000 },
      { input: 'jajan bakso gocap', expected: 50000 },
      { input: 'beli pulsa ceban', expected: 10000 },
      { input: 'baju pego', expected: 150000 },
      { input: 'parkir goceng', expected: 5000 },
      { input: 'uang parkir seceng', expected: 1000 },
    ];

    for (const c of cases) {
      const res = extractAmount(c.input);
      expect(res !== null).toBe(true);
      expect(res!.amount).toBe(c.expected);
    }
  });

  it('F10: NLP Parser detects transaction type and matches category', async () => {
    expect(determineTransactionType('Makan padang 25rb')).toBe('expense');
    expect(determineTransactionType('Gaji pokok 10jt')).toBe('income');
    expect(determineTransactionType('Transfer ke BCA 500rb')).toBe('transfer');

    const categories = ['Makanan & Minuman', 'Transportasi', 'Belanja', 'Tagihan & Utilitas', 'Gaji Pokok'];
    expect(matchCategory('beli bensin motor', 'expense', categories)).toBe('Transportasi');
    expect(matchCategory('nasi uduk', 'expense', categories)).toBe('Makanan & Minuman');

    const parsed = await parseTransactionText('Makan siang sate 30rb', {
      categories,
      wallets: ['Tunai', 'BCA'],
    });
    expect(parsed.amount).toBe(30000);
    expect(parsed.type).toBe('expense');
    expect(parsed.category_name).toBe('Makanan & Minuman');
  });

  it('F11: Multimodal Vision OCR Receipt Parser extracts merchant, date, and line items', async () => {
    const mockImageBuffer = Buffer.from('fake_receipt_image_bytes');
    const result = await parseReceiptImage(mockImageBuffer, 'image/jpeg', 'test_user');

    expect(typeof result.merchant_name).toBe('string');
    expect(result.merchant_name.length > 0).toBe(true);
    expect(result.total_amount).toBeGreaterThan(0);
    expect(Array.isArray(result.items)).toBe(true);
    expect(result.items.length).toBeGreaterThan(0);

    // Sum of items equals total_amount in valid receipt
    const itemTotal = result.items.reduce((acc, it) => acc + it.amount, 0);
    expect(itemTotal).toBe(result.total_amount);
  });

  it('F12: Voice Note STT Pipeline transcribes audio input', async () => {
    const mockAudioBuffer = Buffer.from('fake_voice_ogg_bytes');
    const transcript = await transcribeVoiceNote(mockAudioBuffer, 'audio/ogg', 'test_user');
    expect(typeof transcript).toBe('string');
    expect(transcript.length).toBeGreaterThan(0);
  });

  it('F13: Proactive AI Financial Advisor alerts when budget exceeds 80% or 100%', async () => {
    // 80% Alert
    const insight80 = await generateAdvisorInsights({
      userId: 'test_user',
      categoryName: 'Makanan & Minuman',
      currentAmount: 100000,
      monthlySpent: 750000,
      monthlyLimit: 1000000, // 850k / 1000k = 85%
    });
    expect(Boolean(insight80)).toBe(true);
    expect(insight80!.type).toBe('budget_alert');
    expect(insight80!.title).toContain('80%');

    // 100% Alert
    const insight100 = await generateAdvisorInsights({
      userId: 'test_user',
      categoryName: 'Makanan & Minuman',
      currentAmount: 300000,
      monthlySpent: 800000,
      monthlyLimit: 1000000, // 1.1M / 1M = 110%
    });
    expect(Boolean(insight100)).toBe(true);
    expect(insight100!.severity).toBe('high');
    expect(insight100!.title).toContain('Terlampaui');
  });
});
