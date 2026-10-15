import { describe, it, expect } from '../harness';
import { handleTelegramUpdate, TelegramUpdate } from '../../../src/lib/telegram/message-handler';
import { demoStore } from '../../../src/lib/mock/store';

describe('Tier 4: App 1 — Warung & Jajan Enthusiast (Daily Cash Flow & Telegram)', () => {
  it('App 1: Executes complete 5-step daily warung tracking journey', async () => {
    const user = demoStore.getUser();
    user.subscription_tier = 'pro';

    const cashWallet = demoStore.getWallets().find((w) => w.type === 'cash')!;
    const startBalance = cashWallet.balance;

    // Step 1: Scheduled reminder check
    expect(Boolean(user.telegram_chat_id)).toBe(true);

    // Step 2: Lunch at Warung Padang (35rb)
    const lunchUpdate: TelegramUpdate = {
      update_id: 81001,
      message: {
        message_id: 811,
        from: { id: user.telegram_chat_id!, is_bot: false, first_name: 'Ahmad' },
        chat: { id: user.telegram_chat_id!, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: 'Makan siang padang 35rb',
      },
    };
    const lunchRes = await handleTelegramUpdate(lunchUpdate);
    expect(lunchRes.handled).toBe(true);
    expect(lunchRes.replyText!).toContain('Rp 35.000');
    expect(cashWallet.balance).toBe(startBalance - 35000);

    // Step 3: Afternoon coffee (18k)
    const coffeeUpdate: TelegramUpdate = {
      update_id: 81002,
      message: {
        message_id: 812,
        from: { id: user.telegram_chat_id!, is_bot: false, first_name: 'Ahmad' },
        chat: { id: user.telegram_chat_id!, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: 'beli kopi kenangan 18k',
      },
    };
    const coffeeRes = await handleTelegramUpdate(coffeeUpdate);
    expect(coffeeRes.handled).toBe(true);
    expect(coffeeRes.replyText!).toContain('Rp 18.000');
    expect(cashWallet.balance).toBe(startBalance - 35000 - 18000);

    // Step 4: Evening voice note (45ribu)
    const voiceUpdate: TelegramUpdate = {
      update_id: 81003,
      message: {
        message_id: 813,
        from: { id: user.telegram_chat_id!, is_bot: false, first_name: 'Ahmad' },
        chat: { id: user.telegram_chat_id!, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        voice: { file_id: 'voice_martabak_45rb', duration: 8, mime_type: 'audio/ogg' },
      },
    };
    const voiceRes = await handleTelegramUpdate(voiceUpdate);
    expect(voiceRes.handled).toBe(true);
    expect(Boolean(voiceRes.replyText)).toBe(true);
    expect(voiceRes.replyText!).toContain('🎙️ Transkrip:');

    // Step 5: Inquire /saldo and /hari ini
    const saldoUpdate: TelegramUpdate = {
      update_id: 81004,
      message: {
        message_id: 814,
        from: { id: user.telegram_chat_id!, is_bot: false, first_name: 'Ahmad' },
        chat: { id: user.telegram_chat_id!, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: '/saldo',
      },
    };
    const saldoRes = await handleTelegramUpdate(saldoUpdate);
    expect(saldoRes.handled).toBe(true);
    expect(saldoRes.replyText!).toContain('INFORMASI SALDO');
    expect(saldoRes.replyText!).toContain('Tunai Dompet');

    const hariUpdate: TelegramUpdate = {
      update_id: 81005,
      message: {
        message_id: 815,
        from: { id: user.telegram_chat_id!, is_bot: false, first_name: 'Ahmad' },
        chat: { id: user.telegram_chat_id!, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: '/hari ini',
      },
    };
    const hariRes = await handleTelegramUpdate(hariUpdate);
    expect(hariRes.handled).toBe(true);
    expect(hariRes.replyText!).toContain('RINGKASAN HARI INI');
  });
});
