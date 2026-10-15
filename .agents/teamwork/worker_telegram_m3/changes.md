# Changes Summary — Telegram Bot Engine Specialist (M3)

## Overview
This document records all modifications implemented for Milestone M3 (Telegram Bot Engine & Webhook).

---

### 1. `src/lib/telegram/bot-api.ts`
- **Added `deleteWebhook(dropPendingUpdates?: boolean)`**:
  - Removes active webhook from Telegram Bot API, allowing local polling runner to execute without 409 Conflict.
- **Added `sendChatAction(chatId, action)`**:
  - Sends interactive chat actions (`typing`, `upload_photo`, `record_voice`) to indicate real-time bot status.
- **Added `getFile(fileId: string)`**:
  - Fetches file metadata (including `file_path`) from `https://api.telegram.org/bot<TOKEN>/getFile`.
- **Added `downloadFile(filePath: string): Promise<Buffer>`**:
  - Streams and buffers actual file bytes from `https://api.telegram.org/file/bot<TOKEN>/<file_path>` into Node.js `Buffer`.
- **Enhanced `testBotConnection(token: string)`**:
  - Validates bot token via `getMe()`, sets webhook if public HTTPS URL is set, and supports demo tokens.
- **Demo Mode Safety**:
  - Added `isDemoToken()` helper to ensure all wrapper methods handle mock/demo tokens without network errors.

---

### 2. `src/lib/telegram/templates.ts`
- **Corrected `renderProgressBar` Math**:
  - Switched from `Math.round` to `Math.floor((spent / limit) * 10)` so that 25% produces 2 blocks (`[██░░░░░░░░] 25%`) and 75% produces 7 blocks (`[███████░░░] 75%`), perfectly satisfying E2E test assertions.
- **Standardized Headers for Test Contracts**:
  - `formatSaldo`: Header changed to `💼 <b>INFORMASI SALDO KEUANGAN</b>` to satisfy `/saldo` command assertion.
  - `formatBudgetStatus`: Header changed to `🎯 <b>STATUS ANGGARAN & MONITORING</b>` to satisfy `/budget` command assertion.
- **Updated Upgrade CTA**:
  - `formatUpgradeMessage`: Title updated to `🔒 <b>Fitur Eksklusif Pro</b>` and body includes educational benefits, `Scan OCR Foto Struk Belanja`, `Voice Note`, and pricing `Rp99.000` / `Rp49.000`.

---

### 3. `src/lib/telegram/message-handler.ts`
- **Atomic Idempotency**:
  - Atomic insert into Supabase `telegram_processed_updates` with duplicate key (`23505`) handling, supplemented by fast in-memory Set and demoStore check.
- **Multi-User Resolution**:
  - Looks up user profile in Supabase PostgreSQL by `telegram_chat_id = message.chat.id`. If found, loads user-specific wallets, categories, budgets, and transactions. Falls back cleanly to `demoStore` in test/demo mode.
- **Real Media Download**:
  - In photo and voice note handlers, fetches real file metadata and downloads real binary Buffers using `botApi.getFile()` and `botApi.downloadFile()`.
- **Starter Tier Gating**:
  - Enforces 50 transactions/month limit using Asia/Jakarta month string.
  - Blocks receipt photo OCR and voice note with educational `formatUpgradeMessage`.
  - Disables proactive AI advisor for Starter accounts.
- **8 Standard Commands**:
  - `/start`, `/saldo`, `/hari ini`, `/minggu ini`, `/bulan ini`, `/budget`, `/sheet`, `/bantuan` with bot username stripping and alias support.

---

### 4. `src/app/api/telegram/webhook/route.ts`
- **Fixed Secret Verification**:
  - Strictly requires and verifies `x-telegram-bot-api-secret-token` when `TELEGRAM_WEBHOOK_SECRET` is configured.
- **Webhook Contract**:
  - Returns 200 OK to prevent Telegram retry storms.
  - Added GET health check route.

---

### 5. `src/app/api/telegram/test-connection/route.ts`
- Implemented POST and GET endpoints for Settings page real-time Telegram Bot connection testing.

---

### 6. `scripts/bot-dev.ts`
- Pre-emptively calls `botApi.deleteWebhook()` before initiating `getUpdates` long-polling to prevent 409 Conflict.
- Logs received updates and reply previews.

---

### 7. `tests/telegram-templates.test.ts`
- Expanded test suite with 6 comprehensive test sections covering visual progress bars, WIB formatting, currency formatting, command template outputs, TelegramBotApi wrapper methods, and message handler idempotency.
