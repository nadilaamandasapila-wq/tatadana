import { NextRequest, NextResponse } from 'next/server';
import { handleTelegramUpdate } from '@/lib/telegram/message-handler';

export async function POST(req: NextRequest) {
  try {
    const secretHeader = req.headers.get('x-telegram-bot-api-secret-token');
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

    // Reject request if secret is configured on server and incoming token doesn't match
    if (expectedSecret && secretHeader !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized secret token' }, { status: 401 });
    }

    const update = await req.json();
    if (!update || typeof update.update_id !== 'number') {
      return NextResponse.json({ error: 'Invalid update payload' }, { status: 400 });
    }

    // Atomic idempotency and execution handled in message-handler
    await handleTelegramUpdate(update);

    // Telegram webhook must receive 200 OK
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error('Telegram webhook handler error:', err);
    // Still return 200 to avoid Telegram retry storms
    return NextResponse.json({ ok: true, error: err.message }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'TataDana Telegram Bot Webhook Endpoint',
    status: 'active',
  });
}
