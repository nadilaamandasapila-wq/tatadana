import { NextRequest, NextResponse } from 'next/server';
import { TelegramBotApi } from '@/lib/telegram/bot-api';
import { demoStore } from '@/lib/mock/store';

export async function GET(req: NextRequest) {
  try {
    const user = demoStore.getUser();
    if (!user.telegram_chat_id) {
      return NextResponse.json({ sent: 0, reason: 'No telegram chat id linked' });
    }

    const botApi = new TelegramBotApi();
    const reminderText = `⏰ <b>Pengingat Catat Keuangan TataDana</b>

Halo ${user.full_name}! Jangan lupa catat pengeluaran atau jajan Anda hari ini ya.

Cukup ketik langsung nominalnya di sini:
 • <i>Makan siang padang 25rb</i>
 • <i>Kopi 18rb</i>
 • <i>Beli bensin 50k</i>

Atau ketik /saldo untuk cek posisi dana Anda. Semangat!`;

    await botApi.sendMessage(user.telegram_chat_id, reminderText);

    return NextResponse.json({ sent: 1, to: user.telegram_chat_id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
