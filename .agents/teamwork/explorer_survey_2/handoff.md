# Handoff Report — Explorer Survey 2 (Telegram Bot, AI Multi-Provider, Midtrans, Export Engine)

**Type**: Hard Handoff (Survey Phase Complete)  
**Agent**: explorer_survey_2  
**Target Recipient**: Orchestrator (ffea170e-96ab-46c8-ba88-cc2c8db6b61f)  
**Working Directory**: `C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\explorer_survey_2`  
**Report Artifact**: `C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\explorer_survey_2\report.md`  

---

## 1. Observation
1. **Request Requirements (R2, AI Engine, Midtrans, Export Engine)**:
   - In `C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\ORIGINAL_REQUEST.md`:
     - Line 19: `AI Engine: Multi-provider service (Google Gemini 1.5/2.0 Flash sebagai default multimodal untuk teks natural, OCR foto struk, dan audio Voice Note STT; failover ke OpenAI GPT-4o-mini & DeepSeek).`
     - Line 20: `Telegram Bot: Hybrid mode — endpoint webhook /api/telegram/webhook (idempotent dengan update_id tracking) + skrip dev runner (npm run bot:dev) untuk pengujian lokal tanpa HTTPS tunnel.`
     - Line 21: `Payment: Midtrans Snap API + Webhook notifikasi pembayaran otomatis serta manual approval di admin dashboard.`
     - Line 22: `Export Engine: Generator PDF (pdfkit/jspdf) dan Excel (xlsx) on-demand dengan signed URL Supabase Storage.`
     - Line 23: `Timezone: 100% Asia/Jakarta (WIB) untuk semua timestamp, reminder, dan reply bot.`
     - Lines 44-55 (R2 details):
       - "Webhook endpoint publik `/api/telegram/webhook` yang mengecek keunikan `update_id` pada `telegram_processed_updates` sebelum memproses pesan."
       - "API wrapper Telegram: `getMe`, `setWebhook`, `sendMessage`, `sendPhoto`."
       - "NLP Parser (LLM Structured Output): memahami nominal slang Indonesia (`15rb`, `15ribu`, `1.5jt`, `1,5jt`, `500k`, `2.500.000`) dan mengkategorikan transaksi serta wallet default secara cerdas."
       - "Vision OCR Struk (Pro only): ekstraksi item struk belanja, harga per item, nama merchant, dan membuat 1 transaksi induk beserta breakdown `transaction_items`."
       - "Voice Note STT (semua paket, durasi maks 60 detik): transkripsi audio ke teks via Gemini/Whisper, kemudian diproses ke pipeline NLP dengan penambahan baris `🎙️ Transkrip: \"[hasil]\"` pada reply."
       - "Format reply presisi pengeluaran dan pemasukan sesuai template part 4 dengan tanggal/jam WIB dan progress bar visual budget (`█` dan `░`)."
       - "Command Telegram: `/saldo`, `/hari ini`, `/minggu ini`, `/bulan ini`, `/budget`, `/sheet`, `/bantuan`."
       - "AI Financial Advisor proaktif untuk user Pro (peringatan saat pengeluaran melompat >50% atau mendekati batas pemasukan)."
       - "Reminder harian terjadwal (maksimal 2x/hari sesuai pengaturan user)."
       - "Pembatasan paket Starter: maksimal 50 transaksi/bulan, tolak foto struk & advisor dengan pesan edukatif + ajakan upgrade."
     - Lines 36-41 (Database schema relations):
       - `telegram_processed_updates`: `update_id (bigint primary key), processed_at (timestamptz)`
       - `ai_providers`: `id, provider_name, api_key_encrypted, is_active, priority, mode ('single' | 'failover')`
       - `ai_logs`: `id, user_id, provider_name, model, prompt_tokens, completion_tokens, latency_ms, purpose, status, error_message`
       - `subscriptions`: `id, user_id, plan ('starter' | 'pro'), status, midtrans_order_id, midtrans_payment_type, midtrans_status, starts_at, expires_at`
       - `export_history`: `id, user_id, file_name, file_url, file_type, period, status, created_at`
2. **Current Codebase State**:
   - `list_dir` on `C:\Users\nadil\.gemini\antigravity\scratch\tatadana`: only `.agents` exists.
   - `find_by_name` on `C:\Users\nadil\.gemini\antigravity\scratch\tatadana`: 0 files found.
   - Project is greenfield in scratch directory.

---

## 2. Logic Chain
1. *From Observation 1 (Line 20, 44-45)*: Telegram webhook deliveries are subject to network retries; to avoid duplicate financial transactions, atomic persistence into `telegram_processed_updates` with `ON CONFLICT (update_id) DO NOTHING` must be the very first operation upon receiving the payload. If the update is already present, immediately return `200 OK`.
2. *From Observation 1 (Line 20)*: For local development on Windows (`localhost:3000`), no public HTTPS endpoint exists without tunneling. Therefore, `scripts/bot-dev.ts` (`npm run bot:dev`) must run long-polling (`getUpdates`), delete active webhooks, and invoke the identical message dispatcher (`handleTelegramUpdate`) to preserve 100% logic parity.
3. *From Observation 1 (Line 47)*: Indonesian slang numbers (`15rb`, `1.5jt`, `500k`, `ceban`, `gocap`) require both regex normalization and LLM Structured Output (Zod schema) injecting user categories and wallets to guarantee consistent JSON schema outputs (`amount`, `category_id`, `type`, `wallet_id`).
4. *From Observation 1 (Line 48, 54)*: Vision OCR receipt scanning is restricted to Pro users. Starter attempts must be short-circuited with an educational message and upgrade link. For Pro, Gemini Flash multimodal vision processes the image directly, creating 1 parent transaction in `transactions` and line items in `transaction_items`.
5. *From Observation 1 (Line 49)*: Voice notes apply to all tiers but must enforce `duration <= 60` seconds. Telegram `.oga` audio is processed by Gemini Flash (native multimodal audio) or Whisper, and the resulting transcript is piped into the NLP slang parser. The reply format must prepend `🎙️ Transkrip: "[hasil]"`.
6. *From Observation 1 (Line 50)*: Precision replies require formatting in Asia/Jakarta (WIB) with a 10-block visual progress bar (`█` and `░`) indicating monthly budget consumption.
7. *From Observation 1 (Line 19, 37-38)*: The AI Engine must wrap Gemini (primary), OpenAI GPT-4o-mini/Whisper (failover), and DeepSeek V3 in a unified service that records latency and token telemetry in `ai_logs`.
8. *From Observation 1 (Line 21, 39)*: Midtrans Snap payments require `order_id` generation, Snap token creation, SHA-512 webhook signature verification (`hash(order_id + status_code + gross_amount + ServerKey)`), automated subscription upgrade to Pro, and an admin manual approval endpoint.
9. *From Observation 1 (Line 22, 36)*: The Export Engine generates PDF (`pdfkit`) and Excel (`xlsx`) statements on-demand, stores them in private Supabase Storage bucket `tatadana-exports`, generates 60-minute signed URLs, and registers them in `export_history` accessible via web UI and `/sheet` bot command.

---

## 3. Caveats
1. **Network Sandbox & API Keys**: Live testing of Telegram Bot, Gemini API, and Midtrans requires real environment variables (`TELEGRAM_BOT_TOKEN`, `GEMINI_API_KEY`, `MIDTRANS_SERVER_KEY`). In the current development environment, mock/stub services must be supported for offline/unit test execution.
2. **DeepSeek Multimodal Limitation**: DeepSeek V3 is text-only. If failover is triggered for Vision OCR or Voice Note STT, it must failover to OpenAI (`gpt-4o-mini` / `whisper-1`) rather than DeepSeek.
3. **No Caveats on Specifications**: All functional requirements for R2, AI Engine, Midtrans, and Export Engine are fully resolved and detailed in `report.md`.

---

## 4. Conclusion
The functional specifications, API contracts, database interactions, error-handling protocols, and prompt architectures for Telegram Bot Engine (R2), AI Multi-Provider Engine, Midtrans Payment Engine, and Export Engine are complete, comprehensive, and ready for milestone decomposition and worker implementation.

The complete survey report has been generated at:
`C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\explorer_survey_2\report.md`.

---

## 5. Verification Method
1. **Inspection Verification**:
   - Inspect `C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\explorer_survey_2\report.md` to review the architecture diagrams, API contracts, Zod schemas, Indonesian slang mapping dictionary, and failure mode matrix.
2. **Contract Completeness Check**:
   - Verify that all endpoints (`/api/telegram/webhook`, `/api/payment/create-snap-token`, `/api/payment/midtrans-webhook`, `/api/reports/export`, `/api/cron/reminders`) have defined request/response formats, security tokens, and error status codes.
   - Verify that all 8 Telegram commands (`/start`, `/saldo`, `/hari ini`, `/minggu ini`, `/bulan ini`, `/budget`, `/sheet`, `/bantuan`) have response templates with WIB time and visual progress bars.
3. **Invalidation Conditions**:
   - If Telegram webhook allows duplicate processing of the same `update_id`.
   - If Starter tier users can process photo receipts or exceed 50 transactions/month.
   - If Voice notes > 60 seconds are accepted.
   - If Midtrans webhook processes payloads without validating the SHA-512 signature.
