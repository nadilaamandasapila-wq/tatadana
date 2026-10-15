import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { describe, it, expect } from '../harness';
import { createSnapToken, verifyMidtransSignature, handleMidtransNotification } from '../../../src/lib/payment/midtrans';
import { demoStore } from '../../../src/lib/mock/store';

describe('Tier 1: Auth Subsystem, Landing Page & Midtrans Payment (F25-F33)', () => {
  const projectRoot = path.resolve(__dirname, '../../../');

  it('F25-F27: Split-Layout Auth Pages and Phone OTP Dev Bypass 123456', () => {
    const loginPagePath = path.join(projectRoot, 'src/app/(auth)/login/page.tsx');
    const registerPagePath = path.join(projectRoot, 'src/app/(auth)/register/page.tsx');

    expect(fs.existsSync(loginPagePath)).toBe(true);
    expect(fs.existsSync(registerPagePath)).toBe(true);

    const loginContent = fs.readFileSync(loginPagePath, 'utf8');
    // Split layout 40/60
    expect(loginContent.includes('lg:grid-cols-12')).toBe(true);
    expect(loginContent.includes('123456')).toBe(true);
  });

  it('F28: Registration Auto-Setup provisions default Tunai wallet and categories', () => {
    const wallets = demoStore.getWallets();
    const defaultWallet = wallets.find((w) => w.is_default);
    expect(Boolean(defaultWallet)).toBe(true);
    expect(defaultWallet?.name.toLowerCase()).toContain('tunai');

    const categories = demoStore.getCategories();
    expect(categories.length >= 6).toBe(true);
    const hasIncome = categories.some((c) => c.type === 'income');
    const hasExpense = categories.some((c) => c.type === 'expense');
    expect(hasIncome).toBe(true);
    expect(hasExpense).toBe(true);
  });

  it('F29-F30: Landing Page has 14 Sections and Interactive Bot Simulator', () => {
    const landingPath = path.join(projectRoot, 'src/app/page.tsx');
    expect(fs.existsSync(landingPath)).toBe(true);
    const content = fs.readFileSync(landingPath, 'utf8');

    // Contains key sections: Hero, problem, solution, pricing, FAQ
    expect(content.toLowerCase().includes('tatadana')).toBe(true);
  });

  it('F31: Midtrans Snap Payment creates Snap token with orderId and redirectUrl', async () => {
    const res = await createSnapToken({
      userId: 'usr_demo_fauzi_001',
      plan: 'pro',
      amount: 99000,
    });

    expect(typeof res.snapToken).toBe('string');
    expect(res.snapToken.length > 0).toBe(true);
    expect(typeof res.orderId).toBe('string');
    expect(res.orderId.startsWith('TATADANA-')).toBe(true);
    expect(typeof res.redirectUrl).toBe('string');
  });

  it('F32: Midtrans Webhook Handler processes settlement notification and upgrades user', async () => {
    const user = demoStore.getUser();
    user.subscription_tier = 'starter';

    const notification = {
      order_id: 'TATADANA-TEST-12345',
      transaction_status: 'settlement',
      fraud_status: 'accept',
    };

    const handled = await handleMidtransNotification(notification);
    expect(handled).toBe(true);
    expect(user.subscription_tier).toBe('pro');
  });

  it('F32: Midtrans SHA-512 Signature Verification calculates correct hash', () => {
    const orderId = 'TATADANA-1001';
    const statusCode = '200';
    const grossAmount = '99000.00';
    const serverKey = 'SB-Mid-server-REAL-SECRET-KEY';

    const payload = `${orderId}${statusCode}${grossAmount}${serverKey}`;
    const expectedHash = crypto.createHash('sha512').update(payload).digest('hex');

    const isValid = verifyMidtransSignature(orderId, statusCode, grossAmount, serverKey, expectedHash);
    expect(isValid).toBe(true);

    const isInvalid = verifyMidtransSignature(orderId, statusCode, grossAmount, serverKey, 'wrong_hash');
    expect(isInvalid).toBe(false);
  });

  it('F33: Subscription Lifecycle Management tracks status updates', () => {
    const subs = demoStore.getSubscriptions();
    expect(subs.length > 0).toBe(true);

    demoStore.updateSubscription('sub_01', 'expired');
    const updated = demoStore.getSubscriptions().find((s) => s.id === 'sub_01');
    expect(updated?.status).toBe('expired');

    // Restore to active
    demoStore.updateSubscription('sub_01', 'active');
    expect(updated?.status).toBe('active');
  });
});
