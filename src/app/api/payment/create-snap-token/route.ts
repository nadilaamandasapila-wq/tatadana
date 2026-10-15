import { NextRequest, NextResponse } from 'next/server';
import { createSnapToken } from '@/lib/payment/midtrans';

export async function POST(req: NextRequest) {
  try {
    const { userId, plan, amount } = await req.json();

    if (!userId || !plan || !amount) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const result = await createSnapToken({ userId, plan, amount });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
