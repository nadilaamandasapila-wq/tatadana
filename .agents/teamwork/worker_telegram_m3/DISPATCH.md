# Dispatch Assignment: Telegram Bot Engine Specialist (M3)

Working Directory: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_telegram_m3
Project Root: C:\Users\nadil\.gemini\antigravity\scratch\tatadana
Original Request Path: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\ORIGINAL_REQUEST.md
Project Plan: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\PROJECT.md
Audit Report: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\explorer_codebase_audit\report.md

## Exclusive File Ownership:
- `src/lib/telegram/**`
- `src/app/api/telegram/**`
- `scripts/bot-dev.ts`
- `tests/telegram-templates.test.ts`

## Mandatory Integrity Warning:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Mission:
You are the Telegram Bot Engine Specialist for TataDana.
1. Read `ORIGINAL_REQUEST.md` and `PROJECT.md`.
2. Address M3 audit findings and requirements:
   - Webhook endpoint (`src/app/api/telegram/webhook/route.ts`):
     - Check `x-telegram-bot-api-secret-token` when `TELEGRAM_WEBHOOK_SECRET` is set.
     - Enforce atomic `update_id` idempotency via `telegram_processed_updates` before handling.
     - Respond with 200 OK within seconds.
   - Telegram Bot API wrapper (`src/lib/telegram/bot-api.ts`):
     - Implement `getMe`, `setWebhook`, `deleteWebhook`, `sendMessage`, `sendPhoto`, `sendChatAction`.
     - Implement `getFile` and `downloadFile` methods to download user-sent voice notes and receipt photos from `https://api.telegram.org/file/bot<TOKEN>/<file_path>` into real Buffers.
   - Telegram Message Handler & Dev runner:
     - 8 commands: `/start`, `/saldo`, `/hari ini`, `/minggu ini`, `/bulan ini`, `/budget`, `/sheet`, `/bantuan`.
     - Timezone Asia/Jakarta (WIB) for all timestamps and replies.
     - Precision reply templates with 10-block visual progress bar (`█` and `░`).
     - Starter tier gating: max 50 transactions/month, reject receipt photo and advisor with educational upgrade CTA.
     - Bot connection test endpoint: `src/app/api/telegram/test-connection/route.ts` (and `/test/route.ts` or as needed) for Settings page live test.
3. Test using `npx tsx tests/telegram-templates.test.ts`.
4. Write `changes.md` and `handoff.md` in your working directory.
5. Send completion message to parent orchestrator (`f97a728b-f0fe-408f-8312-c163fb72bca4`).

## 2026-10-15T03:59:11Z
[Message] timestamp=2026-10-15T03:59:11Z sender=f97a728b-f0fe-408f-8312-c163fb72bca4 priority=MESSAGE_PRIORITY_HIGH content=You are the Telegram Bot Engine Specialist (M3) for TataDana.
Your working directory is: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_telegram_m3
Project root: C:\Users\nadil\.gemini\antigravity\scratch\tatadana
Dispatch file: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_telegram_m3\DISPATCH.md
Original user request file: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\ORIGINAL_REQUEST.md
Project plan: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\PROJECT.md
Audit Report: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\explorer_codebase_audit\report.md

Read DISPATCH.md and ORIGINAL_REQUEST.md immediately.
Set up BRIEFING.md and progress.md in your working directory.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your exclusive file ownership:
- src/lib/telegram/**
- src/app/api/telegram/**
- scripts/bot-dev.ts
- tests/telegram-templates.test.ts

Execute your tasks per DISPATCH.md:
1. Webhook endpoint /api/telegram/webhook with secret token verification and atomic update_id idempotency.
2. Bot API client: implement getMe, setWebhook, deleteWebhook, sendMessage, sendPhoto, sendChatAction, and real getFile/downloadFile helpers.
3. Message handler & Dev runner: 8 commands (/start, /saldo, /hari ini, /minggu ini, /bulan ini, /budget, /sheet, /bantuan), Asia/Jakarta WIB formatting with 10-block visual progress bar (█ and ░).
4. Starter tier gating (max 50 tx/mo, reject OCR & advisor with educational upgrade CTA).
5. Bot connection test endpoint /api/telegram/test-connection/route.ts.
6. Run tests: npx tsx tests/telegram-templates.test.ts and npx tsx tests/e2e/tier1_features/t1_telegram_engine.test.ts.
7. Write changes.md and handoff.md, then send completion message to parent orchestrator (f97a728b-f0fe-408f-8312-c163fb72bca4).
