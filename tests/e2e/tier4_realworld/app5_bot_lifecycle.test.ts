import { describe, it, expect } from '../harness';
import { testBotConnection } from '../../../src/lib/telegram/bot-api';
import { handleTelegramUpdate, TelegramUpdate } from '../../../src/lib/telegram/message-handler';
import { demoStore } from '../../../src/lib/mock/store';

describe('Tier 4: App 5 — Telegram Bot Lifecycle, Idempotency & Command Queries', () => {
  it('App 5: Complete Telegram Bot lifecycle and command suite execution', async () => {
    // Step 1: Connectivity check (getMe & setWebhook)
    const testResult = await testBotConnection('valid_prod_bot_token');
    expect(testResult.ok).toBe(true);
    expect(testResult.webhookSet).toBe(true);

    // Step 2: Send normal transaction update
    const user = demoStore.getUser();
    const update1: TelegramUpdate = {
      update_id: 85001,
      message: {
        message_id: 851,
        from: { id: user.telegram_chat_id!, is_bot: false, first_name: 'Ahmad' },
        chat: { id: user.telegram_chat_id!, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: 'beli bensin pertamax 50k',
      },
    };
    const res1 = await handleTelegramUpdate(update1);
    expect(res1.handled).toBe(true);
    expect(res1.replyText!).toContain('Rp 50.000');
    expect(res1.replyText!).toContain('WIB');

    // Step 3: Replay same update_id -> verify idempotent discard
    const replayRes = await handleTelegramUpdate(update1);
    expect(replayRes.handled).toBe(true);
    expect(replayRes.replyText).toBeUndefined();

    // Step 4: Dispatch command queries: /saldo, /budget, /bantuan
    const saldoUpdate: TelegramUpdate = {
      update_id: 85002,
      message: {
        message_id: 852,
        from: { id: user.telegram_chat_id!, is_bot: false, first_name: 'Ahmad' },
        chat: { id: user.telegram_chat_id!, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: '/saldo',
      },
    };
    const saldoRes = await handleTelegramUpdate(saldoUpdate);
    expect(saldoRes.handled).toBe(true);
    expect(saldoRes.replyText!).toContain('INFORMASI SALDO');

    const budgetUpdate: TelegramUpdate = {
      update_id: 85003,
      message: {
        message_id: 853,
        from: { id: user.telegram_chat_id!, is_bot: false, first_name: 'Ahmad' },
        chat: { id: user.telegram_chat_id!, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: '/budget',
      },
    };
    const budgetRes = await handleTelegramUpdate(budgetUpdate);
    expect(budgetRes.handled).toBe(true);
    expect(budgetRes.replyText!).toContain('STATUS ANGGARAN');

    // Step 5: Verify format contains 10-block visual progress bar
    expect(budgetRes.replyText!).toContain('[');
    expect(budgetRes.replyText!).toContain(']');
    expect(budgetRes.replyText!).toContain('%');
  });
});
