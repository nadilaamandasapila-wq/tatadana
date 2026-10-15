import { describe, it, expect } from '../harness';
import { generateAdvisorInsights } from '../../../src/lib/ai/advisor';
import { renderProgressBar } from '../../../src/lib/telegram/templates';

describe('Tier 2: Boundary & Corner Cases — Budget Thresholds & Advisor Alerts', () => {
  it('BUD-B1: Zero and sub-80% spending does not trigger budget alerts', async () => {
    // 0%
    const zeroInsight = await generateAdvisorInsights({
      userId: 'test_user',
      categoryName: 'Makanan & Minuman',
      currentAmount: 0,
      monthlySpent: 0,
      monthlyLimit: 1000000,
    });
    expect(zeroInsight).toBeNull();

    // 50%
    const halfInsight = await generateAdvisorInsights({
      userId: 'test_user',
      categoryName: 'Makanan & Minuman',
      currentAmount: 200000,
      monthlySpent: 300000,
      monthlyLimit: 1000000,
    });
    expect(halfInsight).toBeNull();

    // 79.9% (799,000 / 1,000,000)
    const justUnder80 = await generateAdvisorInsights({
      userId: 'test_user',
      categoryName: 'Makanan & Minuman',
      currentAmount: 99000,
      monthlySpent: 700000,
      monthlyLimit: 1000000,
    });
    expect(justUnder80).toBeNull();
  });

  it('BUD-B2: Exactly 80% spending triggers 80% threshold warning', async () => {
    const exactly80 = await generateAdvisorInsights({
      userId: 'test_user',
      categoryName: 'Transportasi',
      currentAmount: 100000,
      monthlySpent: 700000,
      monthlyLimit: 1000000, // 800k / 1M = 80%
    });

    expect(Boolean(exactly80)).toBe(true);
    expect(exactly80!.type).toBe('budget_alert');
    expect(exactly80!.title).toContain('80%');
    expect(exactly80!.severity).toBe('medium');
  });

  it('BUD-B3: Exactly 100% and overshoot (>100%) triggers high severity alert', async () => {
    // Exactly 100%
    const exactly100 = await generateAdvisorInsights({
      userId: 'test_user',
      categoryName: 'Belanja',
      currentAmount: 200000,
      monthlySpent: 800000,
      monthlyLimit: 1000000,
    });

    expect(Boolean(exactly100)).toBe(true);
    expect(exactly100!.severity).toBe('high');
    expect(exactly100!.title).toContain('Terlampaui');

    // 150% overshoot
    const overshoot150 = await generateAdvisorInsights({
      userId: 'test_user',
      categoryName: 'Belanja',
      currentAmount: 700000,
      monthlySpent: 800000,
      monthlyLimit: 1000000, // 1.5M / 1M = 150%
    });

    expect(Boolean(overshoot150)).toBe(true);
    expect(overshoot150!.severity).toBe('high');
    expect(overshoot150!.message).toContain('150%');
  });

  it('BUD-B4: Zero or undefined monthlyLimit handled safely without division by zero', async () => {
    const zeroLimit = await generateAdvisorInsights({
      userId: 'test_user',
      categoryName: 'Lain-lain',
      currentAmount: 50000,
      monthlySpent: 100000,
      monthlyLimit: 0,
    });

    // Zero limit does not trigger budget alert or crash
    expect(zeroLimit).toBeNull();
  });

  it('BUD-B5: Visual progress bar boundary representations', () => {
    expect(renderProgressBar(0, 500000)).toBe('[░░░░░░░░░░] 0%');
    expect(renderProgressBar(50000, 500000)).toBe('[█░░░░░░░░░] 10%');
    expect(renderProgressBar(400000, 500000)).toBe('[████████░░] 80%');
    expect(renderProgressBar(500000, 500000)).toBe('[██████████] 100%');
    expect(renderProgressBar(1000000, 500000)).toBe('[██████████] 200%');
    // Limit is 0
    expect(renderProgressBar(100000, 0)).toBe('[██████████] 100%');
  });
});
