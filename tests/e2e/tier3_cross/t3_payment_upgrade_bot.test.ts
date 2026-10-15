import { describe, it, expect } from '../harness';
import { handleTelegramUpdate, TelegramUpdate } from '../../../src/lib/telegram/message-handler';
import { createSnapToken, handleMidtransNotification } from '../../../src/lib/payment/midtrans';
import { demoStore } from '../../../src/lib/mock/store';

describe('Tier 3: Cross-Feature Integration — Midtrans Payment -> Upgrade -> Telegram Feature Unlock', () => {
  it('CROSS-4: Upgrading from Starter to Pro via Midtrans instantly unlocks OCR in Telegram Bot', async () => {
    const user = demoStore.getUser();
    user.subscription_tier = 'starter';

    // Step 1: Starter user attempts OCR photo -> blocked
    const initialOcrUpdate: TelegramUpdate = {
      update_id: 75001,
      message: {
        message_id: 751,
        from: { id: 987654321, is_bot: false, first_name: 'Ahmad' },
        chat: { id: 987654321, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        photo: [{ file_id: 'receipt_photo_1' }],
      },
    };

    const blockedRes = await handleTelegramUpdate(initialOcrUpdate);
    expect(blockedRes.handled).toBe(true);
    expect(blockedRes.replyText!).toContain('Fitur Eksklusif Pro');

    // Step 2: User initiates Midtrans payment
    const payment = await createSnapToken({
      userId: user.id,
      plan: 'pro',
      amount: 99000,
    });
    expect(Boolean(payment.snapToken)).toBe(true);

    // Step 3: Midtrans Webhook receives settlement notification
    const notification = {
      order_id: payment.orderId,
      transaction_status: 'settlement',
      fraud_status: 'accept',
    };
    const paymentHandled = await handleMidtransNotification(notification);
    expect(paymentHandled).toBe(true);
    expect(user.subscription_tier).toBe('pro');

    // Step 4: Pro user attempts OCR photo -> now allowed and processed!
    const proOcrUpdate: TelegramUpdate = {
      update_id: 75002,
      message: {
        message_id: 752,
        from: { id: 987654321, is_bot: false, first_name: 'Ahmad' },
        chat: { id: 987654321, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        photo: [{ file_id: 'receipt_photo_2' }],
      },
    };

    const allowedRes = await handleTelegramUpdate(proOcrUpdate);
    expect(allowedRes.handled).toBe(true);
    expect(Boolean(allowedRes.replyText)).toBe(true);
    // Verified that it returned transaction success rather than upgrade message
    expect(allowedRes.replyText!.includes('Fitur Eksklusif Pro')).toBe(false);
    expect(allowedRes.replyText!).toContain('WIB');
  });
});
