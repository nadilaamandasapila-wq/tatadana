import { NextRequest, NextResponse } from 'next/server';
import { testBotConnection } from '@/lib/telegram/bot-api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = body.token || process.env.TELEGRAM_BOT_TOKEN || '';
    const result = await testBotConnection(token);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN || '';
    const result = await testBotConnection(token);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
