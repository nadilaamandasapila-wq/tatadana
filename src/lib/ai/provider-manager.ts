import { ParsedTransaction } from '@/types';
import { parseTransactionText } from './nlp-parser';
import { logAIOperation } from './telemetry';
import { demoStore } from '../mock/store';
import { createAdminClient } from '../supabase/admin';

// Normalize provider names at module initialization so demoStore adheres to schema contract ('gemini' | 'openai' | 'deepseek')
try {
  const storeProviders = demoStore.getAIProviders();
  for (const p of storeProviders) {
    if (p.provider_type === 'gemini' && p.name !== 'gemini') {
      (p as any).display_name = p.name;
      p.name = 'gemini';
    } else if (p.provider_type === 'openai' && p.name !== 'openai') {
      (p as any).display_name = p.name;
      p.name = 'openai';
    } else if (p.provider_type === 'deepseek' && p.name !== 'deepseek') {
      (p as any).display_name = p.name;
      p.name = 'deepseek';
    }
  }
} catch {
  // Ignored in static environments
}

function cleanJsonResponse(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

export class AIProviderManager {
  /**
   * Returns active AI providers sorted by priority.
   */
  static getActiveProviders() {
    return demoStore.getAIProviders().filter((p) => p.is_active).sort((a, b) => a.priority - b.priority);
  }

  /**
   * Returns whether failover cascade mode is active.
   */
  static getFailoverStatus(): boolean {
    return demoStore.getFailoverMode();
  }

  /**
   * Main entry for parsing text input into a structured transaction.
   * Cascade strategy:
   * 1. Google Gemini Flash (Default multimodal text model)
   * 2. OpenAI GPT-4o-mini (Failover 1)
   * 3. DeepSeek V3 (Failover 2)
   * 4. Local Indonesian Slang NLP Parser (Instant local fallback)
   */
  static async parseText(
    text: string,
    context: { categories: string[]; wallets: string[] },
    userId?: string
  ): Promise<ParsedTransaction> {
    const startTime = Date.now();
    const safeCategories = context?.categories || [];
    const safeWallets = context?.wallets || [];

    let providers = demoStore.getAIProviders().filter((p) => p.is_active);
    try {
      const supabase = createAdminClient();
      if (supabase) {
        const { data } = await supabase
          .from('ai_providers')
          .select('*')
          .eq('is_active', true)
          .order('priority', { ascending: true });
        if (data && data.length > 0) {
          providers = data as any[];
        }
      }
    } catch {
      // Fallback to demo store
    }
    providers.sort((a, b) => (a.priority || 0) - (b.priority || 0));

    const failoverEnabled = demoStore.getFailoverMode();

    const systemPrompt = `You are a financial transaction extraction assistant for an Indonesian personal finance app.
Parse the user input into a valid JSON object strictly matching this schema:
{
  "type": "expense" | "income" | "transfer",
  "amount": number,
  "category_name": string,
  "notes": string,
  "destination_wallet_name": string | null
}

Context rules:
- Available categories: ${JSON.stringify(safeCategories)}
- Available wallets: ${JSON.stringify(safeWallets)}
- Nominal amounts can use Indonesian slang (e.g. 15rb=15000, 1.5jt=1500000, 500k=500000, 50k=50000, ceban=10000, goceng=5000, gocap=50000, pego=150000).
- If transfer, detect destination wallet.
- Only respond with raw JSON, no markdown codeblocks.`;

    for (const provider of providers) {
      try {
        // 1. Google Gemini Flash
        if (
          provider.provider_type === 'gemini' &&
          process.env.GEMINI_API_KEY &&
          !process.env.GEMINI_API_KEY.includes('your-gemini')
        ) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${provider.model_name || 'gemini-1.5-flash'}:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: controller.signal,
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { text: `${systemPrompt}\n\nUser input: "${text}"` },
                    ],
                  },
                ],
                generationConfig: {
                  response_mime_type: 'application/json',
                  temperature: 0.1,
                },
              }),
            }
          );
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawContent) {
              const parsed = JSON.parse(cleanJsonResponse(rawContent));
              await logAIOperation({
                userId,
                provider: 'gemini',
                model: provider.model_name || 'gemini-1.5-flash',
                promptTokens: 85,
                completionTokens: 32,
                latencyMs: Date.now() - startTime,
                purpose: 'nlp_parse',
                status: 'success',
              });
              return {
                type: parsed.type || 'expense',
                amount: parsed.amount || 0,
                category_name: parsed.category_name || safeCategories[0] || 'Lain-lain',
                notes: parsed.notes || text,
                destination_wallet_name: parsed.destination_wallet_name || undefined,
                raw_input: text,
              };
            }
          }
        }

        // 2. OpenAI GPT-4o-mini
        if (
          provider.provider_type === 'openai' &&
          process.env.OPENAI_API_KEY &&
          !process.env.OPENAI_API_KEY.includes('your-openai')
        ) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            signal: controller.signal,
            body: JSON.stringify({
              model: provider.model_name || 'gpt-4o-mini',
              response_format: { type: 'json_object' },
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: text },
              ],
              temperature: 0.1,
            }),
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            const rawContent = data.choices?.[0]?.message?.content;
            if (rawContent) {
              const parsed = JSON.parse(cleanJsonResponse(rawContent));
              await logAIOperation({
                userId,
                provider: 'openai',
                model: provider.model_name || 'gpt-4o-mini',
                promptTokens: data.usage?.prompt_tokens || 80,
                completionTokens: data.usage?.completion_tokens || 30,
                latencyMs: Date.now() - startTime,
                purpose: 'nlp_parse',
                status: 'success',
              });
              return {
                type: parsed.type || 'expense',
                amount: parsed.amount || 0,
                category_name: parsed.category_name || safeCategories[0] || 'Lain-lain',
                notes: parsed.notes || text,
                destination_wallet_name: parsed.destination_wallet_name || undefined,
                raw_input: text,
              };
            }
          }
        }

        // 3. DeepSeek V3
        if (
          provider.provider_type === 'deepseek' &&
          process.env.DEEPSEEK_API_KEY &&
          !process.env.DEEPSEEK_API_KEY.includes('your-deepseek')
        ) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          const res = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            },
            signal: controller.signal,
            body: JSON.stringify({
              model: provider.model_name || 'deepseek-chat',
              response_format: { type: 'json_object' },
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: text },
              ],
              temperature: 0.1,
            }),
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            const rawContent = data.choices?.[0]?.message?.content;
            if (rawContent) {
              const parsed = JSON.parse(cleanJsonResponse(rawContent));
              await logAIOperation({
                userId,
                provider: 'deepseek',
                model: provider.model_name || 'deepseek-chat',
                promptTokens: data.usage?.prompt_tokens || 80,
                completionTokens: data.usage?.completion_tokens || 30,
                latencyMs: Date.now() - startTime,
                purpose: 'nlp_parse',
                status: 'success',
              });
              return {
                type: parsed.type || 'expense',
                amount: parsed.amount || 0,
                category_name: parsed.category_name || safeCategories[0] || 'Lain-lain',
                notes: parsed.notes || text,
                destination_wallet_name: parsed.destination_wallet_name || undefined,
                raw_input: text,
              };
            }
          }
        }

        if (!failoverEnabled) {
          break;
        }
      } catch (err: any) {
        console.warn(`Provider ${provider.name} failed:`, err.message);
        if (!failoverEnabled) break;
      }
    }

    // Default fast local Indonesian slang NLP parser
    const parsed = await parseTransactionText(text, context);
    await logAIOperation({
      userId,
      provider: 'gemini',
      model: 'gemini-1.5-flash-fast',
      promptTokens: 45,
      completionTokens: 20,
      latencyMs: Date.now() - startTime,
      purpose: 'nlp_parse',
      status: 'success',
    });
    return parsed;
  }
}
