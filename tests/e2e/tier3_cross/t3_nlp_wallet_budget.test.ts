import { describe, it, expect } from '../harness';
import { handleTelegramUpdate, TelegramUpdate } from '../../../src/lib/telegram/message-handler';
import { demoStore } from '../../../src/lib/mock/store';

describe('Tier 3: Cross-Feature Integration — NLP -> Wallet Balance -> Category Budget', () => {
  it('CROSS-1: Ingesting text expense deducts default wallet balance and increments category budget spent', async () => {
    const user = demoStore.getUser();
    user.subscription_tier = 'pro';

    const defaultWallet = demoStore.getWallets().find((w) => w.is_default)!;
    const initialBalance = defaultWallet.balance;

    const foodCategory = demoStore.getCategories().find((c) => c.name === 'Makanan & Minuman')!;
    let budget = demoStore.getBudgets().find((b) => b.category_id === foodCategory.id);
    if (!budget) {
      budget = demoStore.saveBudget(foodCategory.id, 1000000);
    }
    const initialSpent = budget.spent || 0;

    const update: TelegramUpdate = {
      update_id: 70001,
      message: {
        message_id: 701,
        from: { id: 987654321, is_bot: false, first_name: 'Ahmad' },
        chat: { id: 987654321, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: 'Makan siang ayam geprek 25rb',
      },
    };

    const res = await handleTelegramUpdate(update);
    expect(res.handled).toBe(true);
    expect(Boolean(res.replyText)).toBe(true);

    // 1. Balance deduction check
    expect(defaultWallet.balance).toBe(initialBalance - 25000);

    // 2. Category budget spent check
    const updatedBudget = demoStore.getBudgets().find((b) => b.category_id === foodCategory.id)!;
    expect(updatedBudget.spent).toBe(initialSpent + 25000);

    // 3. Response contains progress bar
    expect(res.replyText!).toContain('Rp 25.000');
    expect(res.replyText!).toContain('[');
    expect(res.replyText!).toContain(']');
    expect(res.replyText!).toContain('%');
  });

  it('CROSS-2: Ingesting transfer transaction moves balance between source and destination wallets', async () => {
    const wallets = demoStore.getWallets();
    const cashWallet = wallets.find((w) => w.type === 'cash')!;
    const bankWallet = wallets.find((w) => w.type === 'bank')!;

    const initialCash = cashWallet.balance;
    const initialBank = bankWallet.balance;
    const transferAmount = 100000;

    // Direct transaction addition representing parsed transfer
    const tx = demoStore.addTransaction({
      user_id: cashWallet.user_id,
      wallet_id: cashWallet.id,
      destination_wallet_id: bankWallet.id,
      type: 'transfer',
      amount: transferAmount,
      notes: 'Transfer tunai ke bank BCA',
      source: 'manual',
      transaction_date: new Date().toISOString(),
    });

    expect(cashWallet.balance).toBe(initialCash - transferAmount);
    expect(bankWallet.balance).toBe(initialBank + transferAmount);

    // Deleting transaction reverts balances
    demoStore.deleteTransaction(tx.id);
    expect(cashWallet.balance).toBe(initialCash);
    expect(bankWallet.balance).toBe(initialBank);
  });
});
