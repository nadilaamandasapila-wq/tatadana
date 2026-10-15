import crypto from 'crypto';
import { demoStore } from '../mock/store';
import { createAdminClient } from '../supabase/admin';

let orderSequence = 1000;

export async function createSnapToken(params: {
  userId: string;
  plan: 'starter' | 'pro';
  amount: number;
}): Promise<{ snapToken: string; orderId: string; redirectUrl: string }> {
  const seq = orderSequence++;
  const orderId = `TATADANA-${Date.now()}-${seq}-${Math.floor(Math.random() * 1000)}`;
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

  if (serverKey && !serverKey.includes('your-midtrans')) {
    try {
      const authHeader = Buffer.from(`${serverKey}:`).toString('base64');
      const endpoint = isProduction
        ? 'https://app.midtrans.com/snap/v1/transactions'
        : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${authHeader}`,
        },
        body: JSON.stringify({
          transaction_details: {
            order_id: orderId,
            gross_amount: params.amount,
          },
          customer_details: {
            first_name: 'TataDana Subscriber',
            email: 'user@tatadana.id',
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          snapToken: data.token,
          orderId,
          redirectUrl: data.redirect_url,
        };
      }
    } catch (err: any) {
      console.warn('Midtrans live call failed, falling back to mock snap token:', err.message);
    }
  }

  // Fallback demo snap token for instant testing
  return {
    snapToken: `demo_snap_token_${Date.now()}_${seq}`,
    orderId,
    redirectUrl: `/dashboard?payment=success&orderId=${orderId}`,
  };
}

export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  signature: string
): boolean {
  if (!serverKey || serverKey.includes('your-midtrans')) {
    return true; // Bypass signature in demo/dev mode
  }
  const payload = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const hash = crypto.createHash('sha512').update(payload).digest('hex');
  if (Buffer.byteLength(hash) !== Buffer.byteLength(signature)) return false;
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}

export async function handleMidtransNotification(notification: any): Promise<boolean> {
  const { order_id, transaction_status, fraud_status } = notification;

  const isSuccess =
    transaction_status === 'capture' && fraud_status === 'accept'
      ? true
      : transaction_status === 'settlement';

  if (isSuccess) {
    // Upgrade demo user to pro
    const user = demoStore.getUser();
    user.subscription_tier = 'pro';
    demoStore.updateSubscription('sub_01', 'active');

    // Attempt live Supabase sync if configured
    const admin = createAdminClient();
    if (admin) {
      try {
        await admin
          .from('subscriptions')
          .update({
            status: 'active',
            midtrans_status: transaction_status,
          })
          .eq('midtrans_order_id', order_id);

        const { data: sub } = await admin
          .from('subscriptions')
          .select('user_id')
          .eq('midtrans_order_id', order_id)
          .maybeSingle();

        if (sub?.user_id) {
          await admin
            .from('profiles')
            .update({ subscription_tier: 'pro' })
            .eq('id', sub.user_id);
        }
      } catch (dbErr) {
        console.warn('Could not update live Supabase subscription:', dbErr);
      }
    }

    return true;
  }

  // Handle non-success lifecycle states
  if (transaction_status === 'expire') {
    demoStore.updateSubscription('sub_01', 'expired');
    const admin = createAdminClient();
    if (admin) {
      try {
        await admin
          .from('subscriptions')
          .update({ status: 'expired', midtrans_status: transaction_status })
          .eq('midtrans_order_id', order_id);
      } catch (dbErr) {
        console.warn('Could not update live Supabase subscription:', dbErr);
      }
    }
    return false;
  }

  if (transaction_status === 'cancel' || transaction_status === 'deny') {
    demoStore.updateSubscription('sub_01', 'cancelled');
    const admin = createAdminClient();
    if (admin) {
      try {
        await admin
          .from('subscriptions')
          .update({ status: 'cancelled', midtrans_status: transaction_status })
          .eq('midtrans_order_id', order_id);
      } catch (dbErr) {
        console.warn('Could not update live Supabase subscription:', dbErr);
      }
    }
    return false;
  }

  return false;
}

