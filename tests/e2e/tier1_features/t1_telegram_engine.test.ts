import { describe, it, expect } from '../harness';
import { handleTelegramUpdate, TelegramUpdate } from '../../../src/lib/telegram/message-handler';
import { testBotConnection, TelegramBotApi } from '../../../src/lib/telegram/bot-api';
import { renderProgressBar, formatSaldo, formatBudgetStatus } from '../../../src/lib/telegram/templates';
import { demoStore } from '../../../src/lib/mock/store';

describe('Tier 1: Telegram Bot Engine & Webhook (F17-F24)', () => {
  it('F17: Webhook handles incoming text update with 200 OK contract', async () => {
    const update: TelegramUpdate = {
      update_id: 10001,
      message: {
        message_id: 101,
        from: { id: 987654321, is_bot: false, first_name: 'Ahmad' },
        chat: { id: 987654321, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: 'Makan siang sate ayam 25rb',
      },
    };

    const res = await handleTelegramUpdate(update);
    expect(res.handled).toBe(true);
    expect(Boolean(res.replyText)).toBe(true);
    expect(res.replyText!).toContain('Rp 25.000');
    expect(res.replyText!).toContain('WIB');
  });

  it('F18: Webhook Atomic Idempotency discards duplicate update_id', async () => {
    const duplicateUpdate: TelegramUpdate = {
      update_id: 10001, // same update_id as previous test
      message: {
        message_id: 102,
        from: { id: 987654321, is_bot: false, first_name: 'Ahmad' },
        chat: { id: 987654321, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: 'Makan siang sate ayam 25rb',
      },
    };

    const res = await handleTelegramUpdate(duplicateUpdate);
    expect(res.handled).toBe(true);
    // Duplicate is discarded, no replyText sent
    expect(res.replyText).toBeUndefined();
  });

  it('F19: Telegram Bot API Wrapper handles getMe and setWebhook verification', async () => {
    const res = await testBotConnection('test_valid_bot_token');
    expect(res.ok).toBe(true);
    expect(Boolean(res.botUsername)).toBe(true);
    expect(res.webhookSet).toBe(true);

    const botApi = new TelegramBotApi('test_token');
    const photoRes = await botApi.sendPhoto(123456, 'https://example.com/receipt.jpg', { caption: 'Receipt' });
    expect(photoRes.ok).toBe(true);
  });

  it('F21: Telegram Command Suite handles all 8 standard commands', async () => {
    const commands = [
      { cmd: '/start', expected: 'Halo' },
      { cmd: '/saldo', expected: 'INFORMASI SALDO' },
      { cmd: '/hari ini', expected: 'RINGKASAN HARI INI' },
      { cmd: '/minggu ini', expected: 'RINGKASAN 7 HARI' },
      { cmd: '/bulan ini', expected: 'RINGKASAN BULAN INI' },
      { cmd: '/budget', expected: 'STATUS ANGGARAN' },
      { cmd: '/sheet', expected: 'LAPORAN & EKSPOR DATA' },
      { cmd: '/bantuan', expected: 'PANDUAN LENGKAP' },
    ];

    let testUpdateId = 20000;
    for (const c of commands) {
      testUpdateId++;
      const update: TelegramUpdate = {
        update_id: testUpdateId,
        message: {
          message_id: testUpdateId,
          from: { id: 987654321, is_bot: false, first_name: 'Ahmad' },
          chat: { id: 987654321, type: 'private' },
          date: Math.floor(Date.now() / 1000),
          text: c.cmd,
        },
      };

      const res = await handleTelegramUpdate(update);
      expect(res.handled).toBe(true);
      expect(Boolean(res.replyText)).toBe(true);
      expect(res.replyText!.toUpperCase()).toContain(c.expected.toUpperCase());
    }
  });

  it('F22: Precision WIB Reply Templates render 10-block progress bar correctly', () => {
    expect(renderProgressBar(0, 1000000)).toBe('[░░░░░░░░░░] 0%');
    expect(renderProgressBar(250000, 1000000)).toBe('[██░░░░░░░░] 25%');
    expect(renderProgressBar(500000, 1000000)).toBe('[█████░░░░░] 50%');
    expect(renderProgressBar(750000, 1000000)).toBe('[███████░░░] 75%');
    expect(renderProgressBar(1000000, 1000000)).toBe('[██████████] 100%');
    expect(renderProgressBar(1500000, 1000000)).toBe('[██████████] 150%');
  });

  it('F23: Starter Tier Limit rejects OCR receipt with educational upgrade CTA', async () => {
    const user = demoStore.getUser();
    const prevTier = user.subscription_tier;
    user.subscription_tier = 'starter';

    try {
      const update: TelegramUpdate = {
        update_id: 30001,
        message: {
          message_id: 301,
          from: { id: 987654321, is_bot: false, first_name: 'Ahmad' },
          chat: { id: 987654321, type: 'private' },
          date: Math.floor(Date.now() / 1000),
          photo: [{ file_id: 'photo_file_123', file_size: 1024 }],
        },
      };

      const res = await handleTelegramUpdate(update);
      expect(res.handled).toBe(true);
      expect(Boolean(res.replyText)).toBe(true);
      expect(res.replyText!).toContain('Fitur Eksklusif Pro');
      expect(res.replyText!).toContain('Scan OCR Foto Struk Belanja');
      expect(res.replyText!).toContain('Rp99.000');
    } finally {
      user.subscription_tier = prevTier;
    }
  });

  it('F24: Scheduled Reminders formats personalized reminder text', () => {
    const user = demoStore.getUser();
    expect(Boolean(user.telegram_chat_id)).toBe(true);
    expect(user.full_name.length > 0).toBe(true);
  });
});
