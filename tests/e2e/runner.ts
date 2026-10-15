/**
 * TataDana Comprehensive E2E Test Suite Runner
 * 
 * Executes all test tiers:
 * - Tier 1: Feature Coverage (F01-F48)
 * - Tier 2: Boundary, Negative & Corner Cases
 * - Tier 3: Cross-Feature Pairwise Integration
 * - Tier 4: Real-World Fintech Application Scenarios
 * 
 * Run command: npx tsx tests/e2e/runner.ts
 */

import { harness } from './harness';

// 1. Tier 1: Feature Coverage Suites
import './tier1_features/t1_schema_foundation.test';
import './tier1_features/t1_ai_nlp_voice_ocr.test';
import './tier1_features/t1_export_engine.test';
import './tier1_features/t1_telegram_engine.test';
import './tier1_features/t1_auth_payment.test';
import './tier1_features/t1_dashboard_admin.test';

// 2. Tier 2: Boundary & Corner Case Suites
import './tier2_boundary/t2_boundary_nlp.test';
import './tier2_boundary/t2_boundary_webhook.test';
import './tier2_boundary/t2_boundary_starter.test';
import './tier2_boundary/t2_boundary_payment.test';
import './tier2_boundary/t2_boundary_budget.test';

// 3. Tier 3: Cross-Feature Integration Suites
import './tier3_cross/t3_nlp_wallet_budget.test';
import './tier3_cross/t3_ocr_items_export.test';
import './tier3_cross/t3_payment_upgrade_bot.test';

// 4. Tier 4: Real-World Fintech Application Scenarios
import './tier4_realworld/app1_warung_daily.test';
import './tier4_realworld/app2_freelancer_gig.test';
import './tier4_realworld/app3_family_shopper.test';
import './tier4_realworld/app4_business_admin.test';
import './tier4_realworld/app5_bot_lifecycle.test';

const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const GRAY = '\x1b[90m';

async function main() {
  console.log(`\n${BOLD}${CYAN}================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}   🚀 TataDana Full E2E Test Suite (Tiers 1 - 4)                ${RESET}`);
  console.log(`${BOLD}${CYAN}================================================================${RESET}\n`);

  const startTime = Date.now();
  const { summaries, allPassed, total, passed, failed, totalDurationMs } = await harness.run();

  for (const s of summaries) {
    const statusIcon = s.failed === 0 ? `${GREEN}✔ PASS${RESET}` : `${RED}✖ FAIL${RESET}`;
    console.log(`\n${BOLD}${s.name}${RESET} ${statusIcon} ${GRAY}(${s.durationMs}ms)${RESET}`);

    for (const t of s.tests) {
      if (t.passed) {
        console.log(`  ${GREEN}✓${RESET} ${t.name} ${GRAY}(${t.durationMs}ms)${RESET}`);
      } else {
        console.log(`  ${RED}✗ ${t.name}${RESET} ${GRAY}(${t.durationMs}ms)${RESET}`);
        if (t.error) {
          console.log(`    ${RED}${t.error.message}${RESET}`);
          if (t.error.stack) {
            const stackLines = t.error.stack.split('\n').slice(1, 4).join('\n');
            console.log(`    ${GRAY}${stackLines}${RESET}`);
          }
        }
      }
    }
  }

  console.log(`\n${BOLD}${CYAN}----------------------------------------------------------------${RESET}`);
  console.log(`${BOLD}SUMMARY REPORT:${RESET}`);
  console.log(`  Total Suites   : ${summaries.length}`);
  console.log(`  Total Tests    : ${total}`);
  console.log(`  Passed Tests   : ${GREEN}${passed}${RESET}`);
  console.log(`  Failed Tests   : ${failed > 0 ? RED + failed + RESET : '0'}`);
  console.log(`  Total Duration : ${totalDurationMs}ms (${(totalDurationMs / 1000).toFixed(2)}s)`);
  console.log(`${BOLD}${CYAN}----------------------------------------------------------------${RESET}\n`);

  if (!allPassed) {
    console.error(`${RED}${BOLD}❌ E2E TEST SUITE FAILED${RESET}\n`);
    process.exit(1);
  } else {
    console.log(`${GREEN}${BOLD}🎉 ALL E2E TESTS PASSED SUCCESSFULLY! (100% PASS RATE)${RESET}\n`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal error running E2E test runner:', err);
  process.exit(1);
});
