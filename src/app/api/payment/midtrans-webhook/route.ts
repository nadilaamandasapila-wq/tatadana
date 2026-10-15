import { NextRequest, NextResponse } from 'next/server';
import { handleMidtransNotification, verifyMidtransSignature } from '@/lib/payment/midtrans';

export async function POST(req: NextRequest) {
  try {
    const notification = await req.json();
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const { order_id, status_code, gross_amount, signature_key } = notification;

    // Cryptographic SHA-512 signature verification
    if (signature_key) {
      const isValid = verifyMidtransSignature(
        order_id,
        status_code,
        gross_amount,
        serverKey,
        signature_key
      );

      if (!isValid) {
        return NextResponse.json({ error: 'Invalid Midtrans signature' }, { status: 403 });
      }
    } else if (serverKey && !serverKey.includes('your-midtrans')) {
      return NextResponse.json({ error: 'Missing Midtrans signature_key' }, { status: 403 });
    }

    const success = await handleMidtransNotification(notification);

    if (success) {
      return NextResponse.json({ status: 'ok', message: 'Subscription updated to active' });
    }

    return NextResponse.json({
      status: 'received',
      message: `Processed notification for status ${notification.transaction_status || 'unknown'}`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

