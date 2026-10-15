import { AIPurpose, AIStatus, AILog } from '@/types/database';
import { demoStore } from '@/lib/mock/store';
import { createAdminClient } from '@/lib/supabase/admin';

interface LogAIOperationParams {
  userId?: string | null;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  purpose: AIPurpose;
  status: AIStatus;
  errorMessage?: string | null;
  estimatedCost?: number;
}

export async function logAIOperation(params: LogAIOperationParams): Promise<AILog> {
  const cost = params.estimatedCost ?? calculateCost(params.provider, params.model, params.promptTokens, params.completionTokens);

  const supabase = createAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('ai_logs')
        .insert({
          user_id: params.userId,
          provider: params.provider,
          model: params.model,
          prompt_tokens: params.promptTokens,
          completion_tokens: params.completionTokens,
          latency_ms: params.latencyMs,
          purpose: params.purpose,
          status: params.status,
          error_message: params.errorMessage,
          estimated_cost: cost,
        })
        .select()
        .single();

      if (!error && data) {
        return data as AILog;
      }
    } catch {
      // Fallback to demo store if supabase request fails
    }
  }

  // Fallback to in-memory demo store
  return demoStore.addAILog({
    user_id: params.userId,
    provider: params.provider,
    model: params.model,
    prompt_tokens: params.promptTokens,
    completion_tokens: params.completionTokens,
    latency_ms: params.latencyMs,
    purpose: params.purpose,
    status: params.status,
    error_message: params.errorMessage,
    estimated_cost: cost,
  });
}

function calculateCost(provider: string, model: string, promptTokens: number, completionTokens: number): number {
  if (provider === 'gemini') {
    // ~$0.075 per 1M prompt, $0.30 per 1M completion
    return (promptTokens * 0.075 + completionTokens * 0.3) / 1_000_000;
  }
  if (provider === 'openai') {
    // GPT-4o-mini: $0.15 / 1M prompt, $0.60 / 1M completion
    return (promptTokens * 0.15 + completionTokens * 0.6) / 1_000_000;
  }
  if (provider === 'deepseek') {
    // DeepSeek V3: $0.14 / 1M prompt, $0.28 / 1M completion
    return (promptTokens * 0.14 + completionTokens * 0.28) / 1_000_000;
  }
  return 0;
}
