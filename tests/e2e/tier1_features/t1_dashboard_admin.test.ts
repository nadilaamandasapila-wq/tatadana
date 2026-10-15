import { describe, it, expect } from '../harness';
import { demoStore } from '../../../src/lib/mock/store';

describe('Tier 1: Dashboard, Wallets, Budgets & Admin Portal (F34-F48)', () => {
  it('F34-F35: Dashboard Overview & Multi-Period Stats Calculation', () => {
    const transactions = demoStore.getTransactions();
    expect(transactions.length > 0).toBe(true);

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    expect(totalIncome).toBeGreaterThan(0);
    expect(totalExpense).toBeGreaterThan(0);
  });

  it('F36: Transactions Management Page supports adding and querying receipt items', () => {
    const ocrTx = demoStore.getTransactions().find((t) => t.items && t.items.length > 0);
    expect(Boolean(ocrTx)).toBe(true);
    expect(ocrTx!.items!.length).toBeGreaterThan(0);
    expect(ocrTx!.items![0].price).toBeGreaterThan(0);
  });

  it('F37: Budget Management Page tracks category limits and spent amounts', () => {
    const budgets = demoStore.getBudgets();
    expect(budgets.length > 0).toBe(true);
    const firstBudget = budgets[0];
    expect(firstBudget.monthly_limit).toBeGreaterThan(0);
    expect(typeof firstBudget.spent).toBe('number');

    // Save/update budget limit
    const updated = demoStore.saveBudget(firstBudget.category_id, 2500000);
    expect(updated.monthly_limit).toBe(2500000);
  });

  it('F38: Reports and Export History persists downloads', () => {
    const exports = demoStore.getExports();
    expect(Array.isArray(exports)).toBe(true);
  });

  it('F39: Multi-Wallet Management supports default wallet and balance tracking', () => {
    const wallets = demoStore.getWallets();
    expect(wallets.length >= 3).toBe(true);

    const defaultCount = wallets.filter((w) => w.is_default).length;
    expect(defaultCount).toBe(1);

    // Initial wallet balance
    const cashWallet = wallets.find((w) => w.type === 'cash')!;
    const prevBalance = cashWallet.balance;

    // Adding income increases balance
    const newTx = demoStore.addTransaction({
      user_id: cashWallet.user_id,
      wallet_id: cashWallet.id,
      type: 'income',
      amount: 50000,
      notes: 'Bonus tunai',
      source: 'manual',
      transaction_date: new Date().toISOString(),
    });

    expect(cashWallet.balance).toBe(prevBalance + 50000);

    // Clean up
    demoStore.deleteTransaction(newTx.id);
    expect(cashWallet.balance).toBe(prevBalance);
  });

  it('F40: Settings Page Bot Connection Test returns status', async () => {
    const { testBotConnection } = await import('../../../src/lib/telegram/bot-api');
    const result = await testBotConnection('valid_token_123');
    expect(result.ok).toBe(true);
    expect(result.webhookSet).toBe(true);
  });

  it('F42: Admin AI Provider Manager supports Single vs Failover toggle', () => {
    const initialMode = demoStore.getFailoverMode();
    demoStore.setFailoverMode(!initialMode);
    expect(demoStore.getFailoverMode()).toBe(!initialMode);
    demoStore.setFailoverMode(initialMode); // Restore
  });

  it('F43 & F45: Admin Impersonation & Audit Log Recording', () => {
    const initialLogCount = demoStore.getAuditLogs().length;

    // Simulate Admin impersonating a user
    demoStore.addAuditLog('user_impersonate', 'usr_demo_fauzi_001', {
      reason: 'Customer Support Request #1029',
    });

    const auditLogs = demoStore.getAuditLogs();
    expect(auditLogs.length).toBeGreaterThan(initialLogCount);
    const latest = auditLogs[0];
    expect(latest.action).toBe('user_impersonate');
    expect(latest.target_user_id).toBe('usr_demo_fauzi_001');
    expect(latest.details?.reason).toBe('Customer Support Request #1029');
  });

  it('F46: Admin Payment Approvals updates subscription status', () => {
    demoStore.updateSubscription('sub_01', 'active');
    const sub = demoStore.getSubscriptions().find((s) => s.id === 'sub_01');
    expect(sub?.status).toBe('active');
  });
});
