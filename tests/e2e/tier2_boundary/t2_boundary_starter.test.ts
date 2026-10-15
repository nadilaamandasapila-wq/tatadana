import { describe, it, expect } from '../harness';
import { handleTelegramUpdate, TelegramUpdate } from '../../../src/lib/telegram/message-handler';
import { formatUpgradeMessage } from '../../../src/lib/telegram/templates';
import { demoStore } from '../../../src/lib/mock/store';

describe('Tier 2: Boundary & Corner Cases — Starter Tier Limits & Gating', () => {
  it('START-B1: formatUpgradeMessage includes feature name, pricing, and CTA link', () => {
    const msg = formatUpgradeMessage('Scan OCR Foto Struk Belanja');
    expect(msg).toContain('Fitur Eksklusif Pro');
    expect(msg).toContain('Scan OCR Foto Struk Belanja');
    expect(msg).toContain('Rp99.000');
    expect(msg).toContain('/dashboard/settings');
  });

  it('START-B2: Starter tier attempting OCR Receipt is blocked with upgrade CTA', async () => {
    const user = demoStore.getUser();
    const prevTier = user.subscription_tier;
    user.subscription_tier = 'starter';

    try {
      const update: TelegramUpdate = {
        update_id: 99101,
        message: {
          message_id: 501,
          from: { id: 987654321, is_bot: false, first_name: 'Ahmad' },
          chat: { id: 987654321, type: 'private' },
          date: Math.floor(Date.now() / 1000),
          photo: [{ file_id: 'photo_abc' }],
        },
      };

      const res = await handleTelegramUpdate(update);
      expect(res.handled).toBe(true);
      expect(Boolean(res.replyText)).toBe(true);
      expect(res.replyText!).toContain('Fitur Eksklusif Pro');
      expect(res.replyText!).toContain('Scan OCR Foto Struk Belanja');
    } finally {
      user.subscription_tier = prevTier;
    }
  });

  it('START-B3: Starter tier can record Voice Note STT up to 60s within monthly limit', async () => {
    const user = demoStore.getUser();
    const prevTier = user.subscription_tier;
    user.subscription_tier = 'starter';

    try {
      const update: TelegramUpdate = {
        update_id: 99102,
        message: {
          message_id: 502,
          from: { id: 987654321, is_bot: false, first_name: 'Ahmad' },
          chat: { id: 987654321, type: 'private' },
          date: Math.floor(Date.now() / 1000),
          voice: { file_id: 'voice_abc', duration: 15 },
        },
      };

      const res = await handleTelegramUpdate(update);
      expect(res.handled).toBe(true);
      expect(Boolean(res.replyText)).toBe(true);
      expect(res.replyText!).toContain('🎙️ Transkrip:');
    } finally {
      user.subscription_tier = prevTier;
    }
  });

  it('START-B4: Starter tier hitting 50 transactions threshold in current month is blocked', async () => {
    const user = demoStore.getUser();
    const prevTier = user.subscription_tier;
    user.subscription_tier = 'starter';

    // Seed temporary transactions to hit 50 in current month
    const currentMonth = new Date().toISOString().substring(0, 7);
    const initialTxs = demoStore.getTransactions();
    const currentCount = initialTxs.filter((t) => t.transaction_date.startsWith(currentMonth)).length;

    const addedIds: string[] = [];
    for (let i = currentCount; i < 50; i++) {
      const t = demoStore.addTransaction({
        user_id: user.id,
        wallet_id: 'wal_01',
        type: 'expense',
        amount: 1000,
        notes: `Filler ${i}`,
        source: 'manual',
        transaction_date: `${currentMonth}-01T10:00:00Z`,
      });
      addedIds.push(t.id);
    }

    try {
      // 51st transaction attempt
      const update: TelegramUpdate = {
        update_id: 99103,
        message: {
          message_id: 503,
          from: { id: 987654321, is_bot: false, first_name: 'Ahmad' },
          chat: { id: 987654321, type: 'private' },
          date: Math.floor(Date.now() / 1000),
          text: 'beli pulsa 25rb',
        },
      };

      const res = await handleTelegramUpdate(update);
      expect(res.handled).toBe(true);
      expect(Boolean(res.replyText)).toBe(true);
      expect(res.replyText!).toContain('Batas Transaksi Starter Tercapai (50/bln)');
      expect(res.replyText!).toContain('Rp99.000');
    } finally {
      // Cleanup filler transactions
      for (const id of addedIds) {
        demoStore.deleteTransaction(id);
      }
      user.subscription_tier = prevTier;
    }
  });

  it('START-B5: Pro tier user is NEVER blocked by the 50 transactions ceiling', async () => {
    const user = demoStore.getUser();
    user.subscription_tier = 'pro';

    const update: TelegramUpdate = {
      update_id: 99104,
      message: {
        message_id: 504,
        from: { id: 987654321, is_bot: false, first_name: 'Ahmad' },
        chat: { id: 987654321, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: 'kopi pro 20rb',
      },
    };

    const res = await handleTelegramUpdate(update);
    expect(res.handled).toBe(true);
    expect(Boolean(res.replyText)).toBe(true);
    expect(res.replyText!.includes('Batas Transaksi Starter Tercapai')).toBe(false);
    expect(res.replyText!).toContain('Rp 20.000');
  });
});
