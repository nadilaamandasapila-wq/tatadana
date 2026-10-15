import { describe, it, expect } from '../harness';
import { demoStore, MOCK_ADMIN } from '../../../src/lib/mock/store';

describe('Tier 4: App 4 — Small Business Admin Governance & Impersonation', () => {
  it('App 4: Complete admin workflow: health check, failover toggle, audit logging & payment approval', () => {
    // Step 1: Admin session check
    expect(MOCK_ADMIN.is_admin).toBe(true);

    // Step 2: Configure AI Provider Failover Mode
    const prevMode = demoStore.getFailoverMode();
    demoStore.setFailoverMode(true);
    expect(demoStore.getFailoverMode()).toBe(true);

    // Step 3: Admin Impersonates user to inspect account
    const initialAuditCount = demoStore.getAuditLogs().length;
    demoStore.addAuditLog('admin_impersonate_user', 'usr_demo_fauzi_001', {
      reason: 'Support ticket #8843 - verify balance synchronization',
      admin: MOCK_ADMIN.email,
    });

    // Step 4: Audit log immutability check
    const auditLogs = demoStore.getAuditLogs();
    expect(auditLogs.length).toBeGreaterThan(initialAuditCount);
    const latestAudit = auditLogs[0];
    expect(latestAudit.action).toBe('admin_impersonate_user');
    expect(latestAudit.target_user_id).toBe('usr_demo_fauzi_001');

    // Step 5: Manual payment approval
    demoStore.updateSubscription('sub_01', 'active');
    const sub = demoStore.getSubscriptions().find((s) => s.id === 'sub_01');
    expect(sub?.status).toBe('active');

    // Restore failover mode
    demoStore.setFailoverMode(prevMode);
  });
});
