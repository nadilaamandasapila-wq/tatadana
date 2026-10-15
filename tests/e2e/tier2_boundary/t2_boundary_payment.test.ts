import crypto from 'crypto';
import { describe, it, expect } from '../harness';
import { createSnapToken, verifyMidtransSignature, handleMidtransNotification } from '../../../src/lib/payment/midtrans';
import { demoStore } from '../../../src/lib/mock/store';

describe('Tier 2: Boundary & Corner Cases — Payment & Midtrans Verification', () => {
  it('PAY-B1: Missing or corrupted signature fails verification with non-empty serverKey', () => {
    const serverKey = 'SB-Mid-server-TESTKEY-ABC';
    const orderId = 'TATADANA-999';
    const statusCode = '200';
    const grossAmount = '49000.00';

    expect(verifyMidtransSignature(orderId, statusCode, grossAmount, serverKey, '')).toBe(false);
    expect(verifyMidtransSignature(orderId, statusCode, grossAmount, serverKey, 'corrupted_hash_xyz')).toBe(false);

    // Exact SHA-512 matches
    const expected = crypto.createHash('sha512').update(`${orderId}${statusCode}${grossAmount}${serverKey}`).digest('hex');
    expect(verifyMidtransSignature(orderId, statusCode, grossAmount, serverKey, expected)).toBe(true);
  });

  it('PAY-B2: Pending or expired Midtrans notification does NOT upgrade subscription', async () => {
    const user = demoStore.getUser();
    user.subscription_tier = 'starter';

    const pendingNotification = {
      order_id: 'TATADANA-PENDING-001',
      transaction_status: 'pending',
      fraud_status: 'accept',
    };
    const resPending = await handleMidtransNotification(pendingNotification);
    expect(resPending).toBe(false);
    expect(user.subscription_tier).toBe('starter');

    const expireNotification = {
      order_id: 'TATADANA-EXPIRED-001',
      transaction_status: 'expire',
      fraud_status: 'accept',
    };
    const resExpire = await handleMidtransNotification(expireNotification);
    expect(resExpire).toBe(false);
    expect(user.subscription_tier).toBe('starter');
  });

  it('PAY-B3: Denied or cancelled Midtrans notification does NOT upgrade subscription', async () => {
    const user = demoStore.getUser();
    user.subscription_tier = 'starter';

    const denyNotification = {
      order_id: 'TATADANA-DENY-001',
      transaction_status: 'deny',
    };
    const resDeny = await handleMidtransNotification(denyNotification);
    expect(resDeny).toBe(false);
    expect(user.subscription_tier).toBe('starter');

    const cancelNotification = {
      order_id: 'TATADANA-CANCEL-001',
      transaction_status: 'cancel',
    };
    const resCancel = await handleMidtransNotification(cancelNotification);
    expect(resCancel).toBe(false);
    expect(user.subscription_tier).toBe('starter');
  });

  it('PAY-B4: createSnapToken generates unique sequential order IDs', async () => {
    const t1 = await createSnapToken({ userId: 'u1', plan: 'starter', amount: 49000 });
    const t2 = await createSnapToken({ userId: 'u1', plan: 'pro', amount: 99000 });

    expect(t1.orderId).not.toBe(t2.orderId);
    expect(t1.snapToken).not.toBe(t2.snapToken);
  });

  it('PAY-B5: Successful capture with fraud challenge does not upgrade', async () => {
    const user = demoStore.getUser();
    user.subscription_tier = 'starter';

    const challengeNotification = {
      order_id: 'TATADANA-CHALLENGE-001',
      transaction_status: 'capture',
      fraud_status: 'challenge', // Not 'accept'
    };
    const resChallenge = await handleMidtransNotification(challengeNotification);
    expect(resChallenge).toBe(false);
    expect(user.subscription_tier).toBe('starter');
  });
});
