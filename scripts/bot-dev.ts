/**
 * TataDana Telegram Bot Local Development Polling Runner
 * Run with: npm run bot:dev
 *
 * This allows testing the bot locally on Windows without requiring an ngrok / HTTPS webhook tunnel.
 */

import { handleTelegramUpdate } from '../src/lib/telegram/message-handler';
import { TelegramBotApi } from '../src/lib/telegram/bot-api';

async function startDevPolling() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  console.log('🤖 [TataDana Bot Dev Runner] Memulai polling Telegram...');

  if (!token || token.startsWith('demo_')) {
    console.log('ℹ️ [TataDana Bot Dev Runner] Token Telegram belum diisi atau berupa demo token.');
    console.log('ℹ️ Bot simulator di web (http://localhost:3000/#simulator) tetap dapat dicoba secara interaktif.');
    console.log('ℹ️ Untuk menghubungkan dengan bot Telegram riil, set TELEGRAM_BOT_TOKEN di .env.local.');
    return;
  }

  const botApi = new TelegramBotApi(token);

  try {
    // Remove active webhook so long-polling doesn't conflict
    console.log('🔄 Memastikan webhook dinonaktifkan untuk mode dev polling...');
    await botApi.deleteWebhook(false);
  } catch (err: any) {
    console.warn('⚠️ Gagal mereset webhook:', err.message);
  }

  let offset = 0;
  console.log('🚀 [TataDana Bot Dev Runner] Terhubung ke Telegram Bot API. Mendengarkan pesan masuk...');

  while (true) {
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=30`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            const sender = update.message?.from?.first_name || 'User';
            console.log(`📨 [Telegram Update #${update.update_id}] Diterima dari ${sender}`);
            const result = await handleTelegramUpdate(update);
            if (result.handled && result.replyText) {
              console.log(`💬 Balasan terkirim: ${result.replyText.substring(0, 50)}...`);
            }
            offset = update.update_id + 1;
          }
        }
      }
    } catch (err: any) {
      console.error('⚠️ [Polling Error]:', err.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

startDevPolling();
