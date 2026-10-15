import * as XLSX from 'xlsx';
import { describe, it, expect } from '../harness';
import { handleTelegramUpdate, TelegramUpdate } from '../../../src/lib/telegram/message-handler';
import { generateExcelReport } from '../../../src/lib/export/excel-generator';
import { demoStore } from '../../../src/lib/mock/store';

describe('Tier 4: App 2 — Freelancer & Multi-Wallet Gig Worker', () => {
  it('App 2: Executes 5-step freelancer income, allocation, and monthly Excel export', async () => {
    const user = demoStore.getUser();
    user.subscription_tier = 'pro';

    const wallets = demoStore.getWallets();
    const defaultWallet = wallets.find((w) => w.is_default)!;
    const bankWallet = wallets.find((w) => w.type === 'bank')!;

    const initialDefaultBalance = defaultWallet.balance;
    const initialBankBalance = bankWallet.balance;

    // Step 1: Record incoming freelance project payment: "Gaji freelance masuk 8.5jt"
    const incomeUpdate: TelegramUpdate = {
      update_id: 82001,
      message: {
        message_id: 821,
        from: { id: user.telegram_chat_id!, is_bot: false, first_name: 'Ahmad' },
        chat: { id: user.telegram_chat_id!, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: 'Gaji freelance masuk 8.5jt',
      },
    };
    const incomeRes = await handleTelegramUpdate(incomeUpdate);
    expect(incomeRes.handled).toBe(true);
    expect(incomeRes.replyText!).toContain('Rp 8.500.000');
    expect(defaultWallet.balance).toBe(initialDefaultBalance + 8500000);

    // Step 2: Transfer savings to Bank account: "Transfer ke BCA 5jt"
    const transferTx = demoStore.addTransaction({
      user_id: user.id,
      wallet_id: defaultWallet.id,
      destination_wallet_id: bankWallet.id,
      type: 'transfer',
      amount: 5000000,
      notes: 'Alokasi tabungan freelance ke BCA',
      source: 'manual',
      transaction_date: new Date().toISOString(),
    });

    expect(defaultWallet.balance).toBe(initialDefaultBalance + 8500000 - 5000000);
    expect(bankWallet.balance).toBe(initialBankBalance + 5000000);

    // Step 3: Check summary command /bulan ini
    const monthUpdate: TelegramUpdate = {
      update_id: 82002,
      message: {
        message_id: 822,
        from: { id: user.telegram_chat_id!, is_bot: false, first_name: 'Ahmad' },
        chat: { id: user.telegram_chat_id!, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: '/bulan ini',
      },
    };
    const monthRes = await handleTelegramUpdate(monthUpdate);
    expect(monthRes.handled).toBe(true);
    expect(monthRes.replyText!).toContain('RINGKASAN BULAN INI');

    // Step 4: Export Excel workbook for tax & financial bookkeeping
    const excelBuf = generateExcelReport(demoStore.getTransactions(), 'Oktober 2026', user.full_name);
    expect(Buffer.isBuffer(excelBuf)).toBe(true);

    // Step 5: Verify sheet contents and calculations
    const wb = XLSX.read(excelBuf, { type: 'buffer' });
    const summaryRows: any[][] = XLSX.utils.sheet_to_json(wb.Sheets['Ringkasan'], { header: 1 });
    const hasNetCashflow = summaryRows.some((row) => row[0] && String(row[0]).includes('Arus Kas Bersih'));
    expect(hasNetCashflow).toBe(true);

    // Clean up transfer
    demoStore.deleteTransaction(transferTx.id);
  });
});
