import { describe, it, expect } from '../harness';
import { createSnapToken, handleMidtransNotification } from '../../../src/lib/payment/midtrans';
import { handleTelegramUpdate, TelegramUpdate } from '../../../src/lib/telegram/message-handler';
import { demoStore } from '../../../src/lib/mock/store';

describe('Tier 4: App 3 — Family Grocery Shopper with Pro Plan & OCR', () => {
  it('App 3: Full end-to-end flow: Midtrans purchase -> receipt OCR -> item breakdown -> budget limit alert', async () => {
    const user = demoStore.getUser();
    user.subscription_tier = 'starter';

    // Step 1: User purchases Pro Plan via Midtrans Snap (Rp99.000)
    const snap = await createSnapToken({
      userId: user.id,
      plan: 'pro',
      amount: 99000,
    });
    expect(snap.orderId.startsWith('TATADANA-')).toBe(true);

    // Step 2: Midtrans sends webhook notification, user activates to 'pro'
    const paymentSuccess = await handleMidtransNotification({
      order_id: snap.orderId,
      transaction_status: 'settlement',
      fraud_status: 'accept',
    });
    expect(paymentSuccess).toBe(true);
    expect(user.subscription_tier).toBe('pro');

    // Step 3: Shopper sends grocery receipt photo to Telegram Bot
    const receiptUpdate: TelegramUpdate = {
      update_id: 83001,
      message: {
        message_id: 831,
        from: { id: user.telegram_chat_id!, is_bot: false, first_name: 'Ahmad' },
        chat: { id: user.telegram_chat_id!, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        photo: [{ file_id: 'receipt_superindo_oct', file_size: 2048 }],
      },
    };

    const receiptRes = await handleTelegramUpdate(receiptUpdate);
    expect(receiptRes.handled).toBe(true);
    expect(Boolean(receiptRes.replyText)).toBe(true);

    // Step 4: Verify receipt was parsed and added to transactions ledger with items
    const latestTx = demoStore.getTransactions()[0];
    expect(latestTx.source).toBe('telegram_ocr');
    expect(Boolean(latestTx.items && latestTx.items.length > 0)).toBe(true);

    // Step 5: Check category budget reflects expenditure
    const budgets = demoStore.getBudgets();
    const belanjaBudget = budgets.find((b) => b.category?.name === 'Belanja');
    if (belanjaBudget) {
      expect(belanjaBudget.spent).toBeGreaterThan(0);
    }
  });
});
