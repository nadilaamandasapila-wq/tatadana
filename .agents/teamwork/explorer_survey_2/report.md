# TataDana Survey Report: Telegram Bot Engine (R2), AI Multi-Provider Engine, Midtrans Payment, and Export Engine

**Author**: Explorer 2 (Survey Phase)  
**Date**: 2026-10-13  
**Target Project**: TataDana Fintech SaaS (`C:\Users\nadil\.gemini\antigravity\scratch\tatadana`)  
**Scope**: R2 Telegram Bot Engine, Webhook, NLP/Vision/STT Pipelines, Multi-Provider AI Architecture, Midtrans Snap & Webhook, and Export Engine.

---

## 1. Executive Summary & Architecture Overview

TataDana is an Indonesian personal finance SaaS built on Next.js 14/15 App Router, Supabase (PostgreSQL, Auth, Storage, Realtime), multi-provider AI, Midtrans payment processing, and a hybrid Telegram Bot.

This report establishes the technical specification, API contracts, execution flows, and integration blueprints for the four backend computational engines:
1. **Telegram Bot Engine (R2)**: Webhook endpoint, idempotency deduplication, development long-polling runner, complete command suite, precision reply formatting with visual progress bars, proactive budget/reminder notifications, and tier limit enforcement.
2. **AI Multi-Provider Engine**: Unified service abstraction routing across Google Gemini (primary default multimodal), OpenAI GPT-4o-mini/Whisper (failover), and DeepSeek V3 (text failover), backed by database-driven credentials and telemetry logs.
3. **Midtrans Payment & Subscription Engine**: Snap payment modal initialization, SHA-512 cryptographically verified webhook notifications, automated subscription activation, and administrative manual approval fallbacks.
4. **Export Engine**: Server-side on-demand generator for branded PDF statements and multi-tab Excel workbooks uploaded to Supabase Storage with expiring private signed URLs.

```
                      +------------------------------------------+
                      |         Telegram Bot API Gateway         |
                      +--------------------+---------------------+
                                           |
                    HTTPS Webhook POST     |   Long-Polling (dev)
                    /api/telegram/webhook  |   npm run bot:dev
                                           v
+-----------------------------------------------------------------------------------+
|                            Telegram Engine Dispatcher                             |
|  - Check & write idempotency (telegram_processed_updates)                         |
|  - Resolve User & Profile (telegram_user_id -> profiles)                         |
|  - Check Plan Limits (Starter: max 50 tx/mo, block OCR/Advisor; Pro: unlimited)   |
+--------+------------------------+------------------------+------------------------+
         |                        |                        |                        |
         v Text                   v Photo Receipt (Pro)    v Voice Note (max 60s)   v Commands
+-----------------+      +-----------------+      +-----------------+      +-----------------+
| Indonesian NLP  |      | Multimodal OCR  |      | Speech-to-Text  |      | /saldo, /budget |
| Slang Parser    |      | (Gemini Flash)  |      | (Gemini/Whisper)|      | /hari ini, etc. |
+--------+--------+      +--------+--------+      +--------+--------+      +--------+--------+
         |                        |                        |                        |
         +------------------------+------------------------+                        |
                                  |                                                 |
                                  v                                                 |
+-----------------------------------------------------------------------------------+
|                           AI Multi-Provider Service                               |
|   Primary: Gemini 1.5/2.0 Flash ---> Failover: OpenAI GPT-4o-mini ---> DeepSeek   |
|   Database Configuration: ai_providers | Audit Telemetry: ai_logs                 |
+---------------------------------+-------------------------------------------------+
                                  |
                                  v
+-----------------------------------------------------------------------------------+
|                        Core Financial & Storage Engine                            |
|   Supabase Postgres: transactions, transaction_items, wallets, categories, budgets |
|   Export Engine: PDF (pdfkit) & Excel (xlsx) -> Supabase Storage Signed URLs      |
|   Midtrans Engine: Snap API -> Webhook SHA-512 verification -> subscriptions      |
+-----------------------------------------------------------------------------------+
```

---

## 2. Telegram Bot Engine (R2) Specification

### 2.1 Webhook Endpoint `/api/telegram/webhook`
- **Route Location**: `app/api/telegram/webhook/route.ts`
- **HTTP Method**: `POST`
- **Webhook Security**:
  - Configured with a secret token when registering the webhook via `setWebhook`:
    `secret_token = process.env.TELEGRAM_WEBHOOK_SECRET`
  - The incoming request header `x-telegram-bot-api-secret-token` MUST match `process.env.TELEGRAM_WEBHOOK_SECRET`.
  - If header is missing or mismatched, reject immediately with `401 Unauthorized` without processing.
- **Fast Response Contract**:
  - Telegram requires an HTTP `200 OK` response within a few seconds, or it will retry delivery with exponential backoff for up to 24 hours.
  - The webhook endpoint acknowledges `200 OK` after successfully acquiring the idempotency lock and dispatching processing.

### 2.2 `update_id` Idempotency Architecture
Telegram retries unacknowledged updates. Duplicate deliveries can cause double-counting of expenses.

- **Database Table**: `telegram_processed_updates`
  ```sql
  CREATE TABLE telegram_processed_updates (
    update_id BIGINT PRIMARY KEY,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```
- **Atomic Locking Protocol**:
  ```typescript
  // Atomic insert with conflict detection
  const { data, error } = await supabase
    .from('telegram_processed_updates')
    .insert({ update_id: update.update_id })
    .select('update_id')
    .maybeSingle();

  if (error || !data) {
    // Conflict occurred -> update was already received & locked
    return NextResponse.json({ ok: true, note: 'duplicate_ignored' }, { status: 200 });
  }
  // Proceed with message handling
  ```

### 2.3 Dev Runner (`npm run bot:dev`) Architecture
Developing locally without an HTTPS public tunnel requires an isolated polling mechanism.

- **Script Path**: `scripts/bot-dev.ts` (executed via `tsx scripts/bot-dev.ts`)
- **Execution Flow**:
  1. Calls `getWebhookInfo` via Telegram Bot API. If a webhook URL is configured, prompts or automatically calls `deleteWebhook({ drop_pending_updates: false })`.
  2. Enters a persistent `while (isRunning)` polling loop using `getUpdates({ offset, timeout: 30, allowed_updates: ['message', 'callback_query'] })`.
  3. Dispatches each update into the **exact same pipeline function** (`handleTelegramUpdate(update)`) as the production webhook.
  4. Advances `offset = update.update_id + 1` upon processing.
  5. Listens to `SIGINT` / `SIGTERM` to allow clean shutdown.

### 2.4 Telegram API Wrapper Specification
Lightweight, typed native fetch client wrapping the Telegram Bot API:
`https://api.telegram.org/bot<TOKEN>/`

Methods required:
1. `getMe()`: Returns bot metadata (id, is_bot, first_name, username).
2. `setWebhook({ url, secret_token, allowed_updates })`: Registers webhook endpoint.
3. `deleteWebhook({ drop_pending_updates })`: Cleans webhook for dev polling.
4. `sendMessage({ chat_id, text, parse_mode: 'HTML', reply_markup })`: Sends formatted message.
5. `sendPhoto({ chat_id, photo, caption, parse_mode: 'HTML' })`: Sends receipt images or reports.
6. `sendChatAction({ chat_id, action: 'typing' | 'upload_photo' | 'record_voice' })`: Real-time typing indicators during AI execution.
7. `getFile({ file_id })`: Resolves `file_path` for user-uploaded voice notes and receipt photos.
8. `downloadFile(file_path)`: Streams binary payload from `https://api.telegram.org/file/bot<TOKEN>/<file_path>`.

*HTML parse mode is recommended over MarkdownV2 to avoid escaping pitfalls with standard punctuation (`.`, `-`, `!`).*

### 2.5 User Linkage & Telegram Deep-Linking
- User accounts in TataDana are identified by `profiles.telegram_user_id` (bigint) and `profiles.telegram_chat_id` (bigint).
- **Linking Flow via Settings**:
  1. In Dashboard Settings -> Tab Telegram, user clicks "Hubungkan Bot".
  2. Backend creates a short-lived random token (e.g., `connect_a8f9c1...`) linked to the authenticated user ID (stored in DB or cache with 15-minute TTL).
  3. UI presents deep-link: `https://t.me/<BotUsername>?start=connect_<token>`.
  4. User clicks and presses "Start" in Telegram.
  5. Bot receives `/start connect_<token>`:
     - Validates token against pending tokens.
     - Updates `profiles`:
       `telegram_user_id = message.from.id`,
       `telegram_chat_id = message.chat.id`,
       `telegram_connected_at = NOW()`.
     - Sends welcome confirmation in Telegram:
       ```
       🎉 <b>Akun TataDana Berhasil Terhubung!</b>
       
       Halo <b>{user_name}</b>, akun Telegram kamu sudah terhubung dengan TataDana.
       Mulai sekarang, kamu bisa mencatat pengeluaran semudah kirim chat ke teman.
       
       Coba kirim:
       • <i>beli kopi 25rb</i>
       • <i>gajian 5jt</i>
       • Atau kirim foto struk / pesan suara!
       ```
- **Unlinked Message Handling**:
  If a message arrives from an unknown `telegram_user_id`:
  ```
  👋 <b>Halo dari TataDana!</b>
  
  Akun Telegram kamu belum terhubung dengan akun TataDana.
  Silakan login ke https://tatadana.id lalu buka menu <b>Settings > Telegram</b> untuk menghubungkan akun kamu.
  ```

### 2.6 Telegram Command Suite
All commands execute in timezone **Asia/Jakarta (WIB)**.

| Command | Description | Response Content |
|---|---|---|
| `/start` | Welcome / Connection handler | Account status, onboarding guide, and example inputs. |
| `/saldo` | Wallet balances overview | List of all wallets with balances, default wallet marked `⭐`, and total net worth. |
| `/hari ini` | Today's transactions | Today's summary (WIB 00:00 - 23:59), total income, total expense, and list of transactions. |
| `/minggu ini` | Weekly transactions | Current week summary (Monday to Sunday WIB), total net flow, and top category breakdown. |
| `/bulan ini` | Monthly transactions | Month-to-date summary (1st to current date WIB), income vs expense, savings rate, and top 3 expenses. |
| `/budget` | Monthly budget status | Visual progress bars for all active category budgets, % used, and remaining budget. |
| `/sheet` | Financial export | Generates signed URL to latest PDF & Excel report with direct download link. |
| `/bantuan` | Help & command guide | Instructions for text, photo OCR, voice note formats, and all available commands. |

### 2.7 Precision Response Formatting & Visual Progress Bar
Responses must strictly follow the required design system with formatted currency, category emojis, timestamps in WIB, and 10-block progress bars.

#### Visual Progress Bar Specification
- **Length**: 10 blocks.
- **Filled Character**: `█` (`\u2588`)
- **Empty Character**: `░` (`\u2591`)
- **Formula**:
  $$\text{Percentage} = \min\left(100, \max\left(0, \text{round}\left(\frac{\text{Spent}}{\text{Budget}} \times 100\right)\right)\right)$$
  $$\text{Filled Blocks} = \min\left(10, \max\left(0, \text{round}\left(\frac{\text{Percentage}}{10}\right)\right)\right)$$
  $$\text{Empty Blocks} = 10 - \text{Filled Blocks}$$
- Over-budget condition ($\text{Spent} > \text{Budget}$): Display `[██████████] {Percentage}% ⚠️ Over Budget Rp {OverAmount}`.

#### Precision Expense Template (HTML mode):
```html
✅ <b>Pengeluaran Berhasil Dicatat!</b>

💸 <b>Jumlah:</b> Rp 25.000
📁 <b>Kategori:</b> 🍜 Makanan & Minuman
💳 <b>Dompet:</b> 💵 Cash
📝 <b>Catatan:</b> beli bakso
🕒 <b>Waktu:</b> 13 Okt 2026, 14:35 WIB

📊 <b>Budget Kategori (Makanan & Minuman):</b>
[████████░░] 80% (Rp 800.000 / Rp 1.000.000)
Sisa budget: Rp 200.000

💵 <b>Saldo Dompet:</b> Rp 475.000
```

#### Precision Income Template:
```html
✅ <b>Pemasukan Berhasil Dicatat!</b>

💰 <b>Jumlah:</b> Rp 5.000.000
📁 <b>Kategori:</b> 💼 Gaji
💳 <b>Dompet:</b> 🏦 Rekening BCA
📝 <b>Catatan:</b> Gajian bulan Oktober
🕒 <b>Waktu:</b> 13 Okt 2026, 14:30 WIB

💵 <b>Saldo Dompet:</b> Rp 12.450.000
```

#### Voice Note Template (with Transcript prefix):
```html
🎙️ <b>Transkrip:</b> "<i>tadi siang beli nasi padang 25 ribu pakai gopay</i>"

✅ <b>Pengeluaran Berhasil Dicatat!</b>

💸 <b>Jumlah:</b> Rp 25.000
📁 <b>Kategori:</b> 🍜 Makanan & Minuman
💳 <b>Dompet:</b> 📱 GoPay
📝 <b>Catatan:</b> beli nasi padang
🕒 <b>Waktu:</b> 13 Okt 2026, 14:40 WIB

📊 <b>Budget Kategori (Makanan & Minuman):</b>
[█████████░] 85% (Rp 850.000 / Rp 1.000.000)
Sisa budget: Rp 150.000

💵 <b>Saldo Dompet:</b> Rp 175.000
```

### 2.8 Budget Threshold Alerts & Daily Reminders
1. **Budget Threshold Alerts (80% and 100%)**:
   - Monitored within `budgets` table (`alert_80_sent`, `alert_100_sent`).
   - Triggered immediately after any expense insertion.
   - If `spent / amount >= 0.80` and `alert_80_sent == false`:
     - Dispatches Telegram alert:
       ```html
       ⚠️ <b>Peringatan Budget 80%!</b>
       
       Pengeluaran kategori <b>🍜 Makanan & Minuman</b> telah mencapai <b>82%</b> dari budget bulanan (Rp 820.000 / Rp 1.000.000).
       Sisa budget: <b>Rp 180.000</b>.
       ```
     - Sets `alert_80_sent = true`.
   - If `spent / amount >= 1.00` and `alert_100_sent == false`:
     - Dispatches Telegram warning:
       ```html
       🚨 <b>Perhatian: Budget 100% Terlampaui!</b>
       
       Pengeluaran kategori <b>🍜 Makanan & Minuman</b> telah mencapai <b>105%</b> dari budget (Rp 1.050.000 / Rp 1.000.000).
       Kamu telah melebihi budget sebesar <b>Rp 50.000</b>.
       ```
     - Sets `alert_100_sent = true`.
   - Both flags reset on the 1st day of each new month.

2. **Daily Reminders Scheduled Flow**:
   - Endpoint: `/api/cron/reminders` (authenticated via `Authorization: Bearer process.env.CRON_SECRET`).
   - Executes hourly.
   - Evaluates users with `reminder_enabled = true` and `reminder_time` matching the current WIB hour.
   - Maximum 2 reminders per day.
   - Queries `transactions` for transactions created by the user today (WIB).
   - If 0 transactions found, sends Telegram prompt:
     ```html
     👋 <b>Halo! Jangan Lupa Catat Keuangan Hari Ini</b>
     
     Belum ada pengeluaran atau pemasukan yang kamu catat hari ini nih.
     Sudah bayar makan siang, belanja, atau jajan? Kirim chat, foto struk, atau voice note sekarang ya!
     ```

### 2.9 Plan Limits Enforcement (Starter vs Pro)
| Capability | Starter Plan | Pro Plan | Enforcement Point |
|---|---|---|---|
| Monthly Transactions | Max 50 transactions / month | Unlimited | Pre-insert check in `transactions` service |
| Photo Receipt OCR | Blocked | Fully Enabled | Bot image handler & Web upload handler |
| Voice Note STT | Enabled (max 60 seconds) | Enabled (max 60 seconds) | Audio duration validator |
| AI Financial Advisor | Disabled | Proactive alerts & analysis | Post-transaction analyzer |
| Export Engine | Basic reports | PDF & Excel signed URLs | Report generation endpoint |

#### Starter Monthly Transaction Limit Rejection Message:
```html
⚠️ <b>Batas Transaksi Bulanan Tercapai</b>

Paket <b>Starter</b> kamu memiliki batas maksimal 50 transaksi per bulan. Kamu telah mencapai batas tersebut bulan ini.

Tingkatkan ke <b>TataDana Pro</b> untuk transaksi tanpa batas, scan struk foto AI, dan AI Financial Advisor!
👉 <a href="https://tatadana.id/pricing">Upgrade ke Pro Sekarang</a>
```

#### Starter Photo OCR Rejection Message:
```html
✨ <b>Fitur TataDana Pro</b>

Scan struk otomatis dengan AI Vision adalah fitur eksklusif paket <b>TataDana Pro</b>.
Dengan Pro, kamu cukup memfoto struk belanjaan dan AI akan langsung merinci setiap barang dan harganya secara otomatis!

👉 <a href="https://tatadana.id/pricing">Pelajari & Upgrade ke Pro</a>
```

---

## 3. AI Multi-Provider Engine Specification

### 3.1 Provider Hierarchy & Orchestration
TataDana implements a unified `AIService` supporting three providers:
1. **Google Gemini (Default Primary)**:
   - Models: `gemini-1.5-flash` or `gemini-2.0-flash`.
   - Capabilities: High token throughput, multimodal native vision for receipts, native OGG/Opus audio parsing for voice notes.
2. **OpenAI (Failover 1)**:
   - Models: `gpt-4o-mini` (Text & Vision), `whisper-1` (Audio STT).
3. **DeepSeek (Failover 2)**:
   - Models: `deepseek-chat` (DeepSeek-V3).
   - Role: Text parsing and financial advisory failover.

### 3.2 Database Schema Integration
- **Provider Registry (`ai_providers`)**:
  ```sql
  CREATE TABLE ai_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name VARCHAR(50) NOT NULL CHECK (provider_name IN ('gemini', 'openai', 'deepseek')),
    api_key_encrypted TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    priority INT NOT NULL DEFAULT 1,
    mode VARCHAR(20) NOT NULL DEFAULT 'failover' CHECK (mode IN ('single', 'failover')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```
- **Telemetry & Observability (`ai_logs`)**:
  ```sql
  CREATE TABLE ai_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    provider_name VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    prompt_tokens INT,
    completion_tokens INT,
    latency_ms INT NOT NULL,
    purpose VARCHAR(50) NOT NULL CHECK (purpose IN ('text_parse', 'receipt_ocr', 'voice_stt', 'advisor', 'onboarding')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'error')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```

### 3.3 Failover & Circuit Breaker Execution Logic
```typescript
interface ExecutionPlan {
  provider_name: 'gemini' | 'openai' | 'deepseek';
  priority: number;
}

async function executeWithFailover<T>(
  purpose: 'text_parse' | 'receipt_ocr' | 'voice_stt' | 'advisor',
  userId: string | null,
  operation: (provider: AIProviderClient) => Promise<T>
): Promise<T> {
  const providers = await getActiveProvidersOrdered();
  let lastError: Error | null = null;

  for (const provider of providers) {
    const startTime = Date.now();
    try {
      const result = await operation(provider);
      const latencyMs = Date.now() - startTime;
      
      // Async fire-and-forget log
      logAITelemetry({
        userId,
        providerName: provider.name,
        model: provider.defaultModel,
        purpose,
        status: 'success',
        latencyMs
      });
      
      return result;
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      logAITelemetry({
        userId,
        providerName: provider.name,
        model: provider.defaultModel,
        purpose,
        status: 'error',
        latencyMs,
        errorMessage: err.message
      });
      lastError = err;
      
      // In 'single' mode, do not try next provider
      if (provider.mode === 'single') {
        throw err;
      }
    }
  }

  throw new Error(`All AI providers failed. Last error: ${lastError?.message}`);
}
```

### 3.4 Indonesian Slang NLP Parser
- **Target Expressions**:
  - `15rb`, `15ribu`, `15 rebu` $\rightarrow$ 15,000
  - `1.5jt`, `1,5jt`, `1.5 juta` $\rightarrow$ 1,500,000
  - `500k` $\rightarrow$ 500,000
  - `2.500.000` $\rightarrow$ 2,500,000
  - Traditional Jakarta slang: `ceban` (10k), `gocap` (50k), `seceng` (1k), `noceng` (2k), `cepek` (100k), `goceng` (5k), `goti` (50jt).
- **Transaction Types**:
  - `expense`: `beli`, `bayar`, `jajan`, `makan`, `ngopi`, `bensin`, `parkir`, `ongkir`, `pulsa`, `kuota`, `sewa`, `kos`, `patungan`.
  - `income`: `gajian`, `gaji`, `bonus`, `dapat transferan`, `terima uang`, `freelance`, `penjualan`, `dikasih ortu`.
  - `transfer`: `transfer ke bca 100rb`, `tf gopay ke dana 50k`, `pindah saldo 200rb ke rekening mandiri`.
- **Structured Output Zod Schema**:
  ```typescript
  import { z } from 'zod';

  export const NLPTransactionSchema = z.object({
    is_financial_transaction: z.boolean().describe('True if the text records a financial transaction, false if casual chat'),
    type: z.enum(['income', 'expense', 'transfer']).default('expense'),
    amount: z.number().positive().describe('Numeric nominal value in IDR (e.g. 15000 for 15rb)'),
    category_name: z.string().describe('Suggested category name based on user categories'),
    category_emoji: z.string().describe('Emoji representative of category (e.g. 🍜, 🚗, 💼)'),
    wallet_name: z.string().nullable().describe('Target or source wallet mentioned (Cash, BCA, GoPay, etc.) or null for default'),
    destination_wallet_name: z.string().nullable().describe('Destination wallet if type is transfer, otherwise null'),
    notes: z.string().describe('Clean concise description of transaction'),
    date_relative: z.enum(['today', 'yesterday', 'earlier']).default('today'),
    confidence: z.number().min(0).max(1)
  });
  ```
- **Prompt Engineering**:
  The system prompt injects the user's active wallets and categories to guarantee alignment with user data:
  ```
  Anda adalah asisten keuangan pribadi Indonesia cerdas untuk TataDana.
  Tugas Anda adalah mengekstrak transaksi keuangan dari kalimat informal/slang Indonesia.
  
  Kamus Nominal Slang:
  - 'k', 'rb', 'ribu', 'rebu' = x 1.000 (contoh: 15rb = 15000, 25k = 25000)
  - 'jt', 'juta' = x 1.000.000 (contoh: 1.5jt atau 1,5jt = 1500000)
  - 'm', 'miliar', 'milyar' = x 1.000.000.000
  - 'ceban' = 10000, 'gocap' = 50000, 'goceng' = 5000, 'cepek' = 100000
  
  Kategori User yang Tersedia: {user_categories_list}
  Dompet User yang Tersedia: {user_wallets_list}
  Waktu Sekarang: {current_time_wib} WIB
  ```

### 3.5 Multimodal Vision OCR Receipt Pipeline (Pro Only)
- **Input**: JPEG/PNG image buffer of shopping receipts (Indomaret, Alfamart, restaurants, supermarkets, SPBU, etc.).
- **Execution**:
  - Image buffer is passed to Gemini multimodal endpoint (`inlineData: { mimeType: 'image/jpeg', data: base64 }`).
- **Structured Extraction Schema**:
  ```typescript
  export const ReceiptOCRSchema = z.object({
    merchant_name: z.string().describe('Store or merchant name printed on receipt'),
    receipt_date: z.string().nullable().describe('ISO timestamp or formatted date on receipt in WIB'),
    items: z.array(z.object({
      name: z.string().describe('Clean product name'),
      amount: z.number().positive().describe('Total price for this line item in IDR'),
      quantity: z.number().default(1),
      category_suggestion: z.string().describe('Mapped category name')
    })).min(1),
    subtotal: z.number().nullable(),
    tax: z.number().nullable().default(0),
    discount: z.number().nullable().default(0),
    total_amount: z.number().positive().describe('Final total paid amount in IDR'),
    payment_method: z.string().nullable().describe('Cash, Debit, QRIS, Credit, etc.')
  });
  ```
- **Database Transaction**:
  Inserts 1 master record into `transactions` (`input_type = 'receipt'`, `amount = total_amount`) plus $N$ line item records into `transaction_items` (`transaction_id`, `name`, `amount`, `category_id`).
  Deducts `total_amount` from user's default wallet balance.

### 3.6 Voice Note STT Pipeline (All Tiers, max 60s)
1. **Duration Verification**:
   Telegram voice update provides `message.voice.duration` (seconds).
   If `duration > 60`:
   Returns: `⚠️ Durasi Voice Note maksimal 60 detik ya. Rekamanmu berdurasi ${duration} detik. Coba rekam lebih singkat ya!`
2. **Audio Fetching**:
   Downloads `.oga` (Ogg Opus) audio buffer from Telegram file endpoint.
3. **STT Transcription**:
   - Primary: Gemini Flash natively accepts `audio/ogg` via `inlineData`.
   - Prompt: "Transkripsikan rekaman audio suara bahasa Indonesia ini secara akurat kata demi kata tanpa komentar tambahan."
   - Failover: OpenAI Whisper (`whisper-1`).
4. **Pipeline Chaining**:
   The resulting transcript text is forwarded directly into the **Indonesian Slang NLP Parser**.
5. **Persistence**:
   Saves transaction with `input_type = 'voice'` and `voice_transcript = transcript`.
6. **Reply Contract**:
   Must prepend: `🎙️ <b>Transkrip:</b> "<i>{transcript}</i>"\n\n` followed by standard transaction template.

### 3.7 Proactive AI Financial Advisor (Pro Only)
The advisor evaluates the user's transaction patterns asynchronously after an expense is saved.
- **Trigger Condition 1 (Expense Spike)**:
  Single transaction amount exceeds 150% of the user's historical 30-day average transaction in that category.
- **Trigger Condition 2 (Income Ceiling Breach)**:
  Cumulative expenses this month exceed 90% of total income recorded this month.
- **Tone & Persona**: Empathetic, witty, non-judgmental Indonesian financial planner.
- **Example Response**:
  ```html
  💡 <b>AI Advisor TataDana</b>
  
  Pengeluaran sebesar <b>Rp 450.000</b> di kategori <b>Hiburan</b> tergolong cukup besar dibandingkan rata-rata biasanya (Rp 120.000).
  Pastikan alokasi pos kebutuhan pokokmu bulan ini tetap aman sampai gajian ya!
  ```

---

## 4. Midtrans Payment & Subscription Engine

### 4.1 Subscription Models & Pricing Tiers
- **Starter**: Rp49.000 / bulan (or default free tier) with 50 transactions/month limit.
- **Pro**: Rp99.000 sekali bayar (Lifetime / One-time payment) as specified in R5 pricing section.

### 4.2 Snap Payment Initiation (`/api/payment/create-snap-token`)
- **Route**: `app/api/payment/create-snap-token/route.ts`
- **Method**: `POST`
- **Auth**: User session required.
- **Flow**:
  1. Generate unique order ID: `TD-PRO-${user.id.slice(0, 8)}-${Date.now()}`.
  2. Instantiate Midtrans Snap Client with `MIDTRANS_SERVER_KEY`.
  3. Create transaction parameters:
     ```typescript
     const parameter = {
       transaction_details: {
         order_id: orderId,
         gross_amount: 99000
       },
       customer_details: {
         first_name: userProfile.full_name,
         email: userProfile.email,
         phone: userProfile.phone_number || undefined
       },
       item_details: [{
         id: 'TATADANA-PRO-LIFETIME',
         price: 99000,
         quantity: 1,
         name: 'TataDana Pro (Akses Seumur Hidup)'
       }]
     };
     const snapResponse = await snap.createTransaction(parameter);
     ```
  4. Insert record into `subscriptions`:
     ```sql
     INSERT INTO subscriptions (
       user_id, plan, status, midtrans_order_id, midtrans_status
     ) VALUES (
       userId, 'pro', 'pending', orderId, 'pending'
     );
     ```
  5. Return `{ token: snapResponse.token, redirect_url: snapResponse.redirect_url }`.

### 4.3 Webhook Notification Handler (`/api/payment/midtrans-webhook`)
- **Route**: `app/api/payment/midtrans-webhook/route.ts`
- **Method**: `POST`
- **Cryptographic Signature Verification**:
  Midtrans delivers a SHA-512 `signature_key` computed as:
  $$\text{Expected Signature} = \text{SHA512}(\text{order\_id} + \text{status\_code} + \text{gross\_amount} + \text{MIDTRANS\_SERVER\_KEY})$$
  ```typescript
  import crypto from 'crypto';

  const payload = await request.json();
  const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status, payment_type } = payload;

  const rawSignature = `${order_id}${status_code}${gross_amount}${process.env.MIDTRANS_SERVER_KEY}`;
  const computedSignature = crypto.createHash('sha512').update(rawSignature).digest('hex');

  if (computedSignature !== signature_key) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  }
  ```

### 4.4 Transaction Status Lifecycle & State Machine
| `transaction_status` | `fraud_status` | Resulting `subscriptions.status` | Action Taken |
|---|---|---|---|
| `capture` | `accept` | `active` | Activate Pro subscription, record `starts_at = NOW()`, notify user via Telegram |
| `settlement` | - | `active` | Activate Pro subscription, record `starts_at = NOW()`, notify user via Telegram |
| `pending` | - | `pending` | Keep pending state |
| `deny` | - | `expired` / `failed` | Mark subscription failed |
| `expire` | - | `expired` | Mark subscription expired |
| `cancel` | - | `expired` | Mark subscription cancelled |

#### Automated Pro Upgrade Notification via Telegram:
Upon successful settlement, if the user has an active `telegram_chat_id`, the bot sends:
```html
🎉 <b>Selamat! Akun Kamu Resmi Upgrade ke TataDana Pro!</b>

Terima kasih atas pembayaranmu. Semua fitur Pro kini telah aktif:
✨ Pencatatan transaksi tanpa batas
📸 Scan struk belanja otomatis dengan AI Vision
💡 AI Financial Advisor proaktif
📊 Export laporan PDF & Excel kapan saja

Selamat menikmati pengalaman mengatur keuangan yang lebih rapi!
```

### 4.5 Admin Manual Approval & Audit Logging
In case of manual bank transfer verification or stuck payment gateway webhooks, superadmins can approve payments directly via the Admin Dashboard.
- **Endpoint**: `POST /api/admin/subscriptions/approve`
- **Security**: Guarded by `role = 'admin'` check.
- **Audit Logging**: Must insert record into `admin_audit_logs`:
  ```sql
  INSERT INTO admin_audit_logs (
    admin_user_id, action, target_user_id, target_resource, details
  ) VALUES (
    adminId, 'manual_subscription_approval', targetUserId, 'subscriptions',
    jsonb_build_object('order_id', orderId, 'reason', reason)
  );
  ```

---

## 5. Export Engine Specification (PDF & Excel)

### 5.1 On-Demand Generation Pipeline
- **Endpoint**: `POST /api/reports/export`
- **Input Parameters**:
  - `format`: `'pdf' | 'xlsx'`
  - `period`: `'monthly' | 'custom' | 'yearly'`
  - `month`: integer (1-12)
  - `year`: integer (e.g. 2026)
  - `start_date`, `end_date`: optional ISO date strings
- **Processing Flow**:
  1. Validate user session.
  2. Query transactions for the specified period joined with `categories`, `wallets`, and `transaction_items`.
  3. Calculate net statistics: Total Income, Total Expense, Net Cashflow, Category totals.
  4. Generate document buffer in memory (`pdfkit` for PDF, `xlsx` for Excel).
  5. Upload buffer to Supabase Storage private bucket `tatadana-exports`.
  6. Generate a 60-minute expiring Supabase Storage Signed URL.
  7. Insert metadata into `export_history`.
  8. Return download URL to client.

### 5.2 PDF Document Layout & Styling Specification
- **Library**: `pdfkit` (Node server environment)
- **Palette**:
  - Primary Accent: `#F97316` (TataDana Orange 500)
  - Dark Neutral: `#1E293B` (Slate 800)
  - Background Neutral: `#F8FAFC` (Slate 50)
  - Income Green: `#10B981` (Emerald 500)
  - Expense Red: `#EF4444` (Red 500)
- **Document Structure**:
  1. **Header Banner**: TataDana logo, title "Laporan Keuangan Pribadi", Subtitle: "Periode: {PeriodLabel} (WIB)".
  2. **Profile Card**: User Full Name, Email, Generated Date & Time (WIB).
  3. **Executive Summary KPI Cards** (3 cards side-by-side):
     - Total Pemasukan: Rp X
     - Total Pengeluaran: Rp Y
     - Arus Kas Bersih (Net Cashflow): Rp (X - Y)
  4. **Category Breakdown Table**: Category Name, Transaction Count, Total Amount, % of Total Expense.
  5. **Transaction Ledger Table**: Date (DD/MM/YYYY HH:mm WIB), Description / Merchant, Category, Wallet, Type, Amount.
  6. **Footer**: "TataDana — Aplikasi Manajemen Keuangan Pribadi Indonesia. Halaman {Page} dari {TotalPages}".

### 5.3 Excel (.xlsx) Generation Specification
- **Library**: `xlsx` (SheetJS) or `exceljs`
- **Worksheet 1: "Ringkasan"**:
  - Title block with company branding and period.
  - KPI table (Total Income, Total Expense, Net Balance).
  - Category summary table with sum and percentage.
- **Worksheet 2: "Daftar Transaksi"**:
  - Columns:
    `No`, `Tanggal (WIB)`, `Tipe`, `Kategori`, `Dompet`, `Jumlah (Rp)`, `Catatan`, `Metode Input`
  - Number format applied to amount columns: `_("Rp"* #,##0_);_("Rp"* (#,##0);_("Rp"* "-"_);_(@_)`
  - Auto-fitted column widths for clean viewing in Microsoft Excel & Google Sheets.

### 5.4 Supabase Storage Private Bucket & Signed URLs
- **Bucket Name**: `tatadana-exports` (Private, non-public).
- **Storage Policy**:
  - Service role / Server action has upload permissions.
  - Authenticated users can only read their own files:
    `bucket_id = 'tatadana-exports' AND (storage.foldername(name))[1] = auth.uid()::text`.
- **Signed URL Generation**:
  ```typescript
  const filePath = `${userId}/${Date.now()}_tatadana_laporan_${period}.${format}`;
  
  await supabaseAdmin.storage
    .from('tatadana-exports')
    .upload(filePath, fileBuffer, {
      contentType: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      upsert: true
    });

  const { data: signedData, error: signError } = await supabaseAdmin.storage
    .from('tatadana-exports')
    .createSignedUrl(filePath, 3600); // 1 hour validity
  ```

### 5.5 Export History Tracking (`export_history`)
```sql
CREATE TABLE export_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('pdf', 'xlsx')),
  period VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'processing', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 5.6 Telegram `/sheet` Command Integration
When a user executes `/sheet` or `/laporan` in Telegram:
1. Verifies user plan (if Starter: suggests upgrade or provides quick web link).
2. Triggers the export generator for the current month.
3. Obtains the signed download URL.
4. Replies directly in Telegram:
   ```html
   📊 <b>Laporan Keuangan Bulan Ini Siap!</b>
   
   Periode: <b>Oktober 2026</b>
   
   📥 <a href="{signedPdfUrl}">Unduh Laporan PDF</a>
   📥 <a href="{signedXlsxUrl}">Unduh Laporan Excel (.xlsx)</a>
   
   <i>Link unduhan berlaku selama 60 menit. Kamu juga bisa melihat riwayat lengkap di dashboard web TataDana.</i>
   ```

---

## 6. Complete API Contracts & Schemas

### 6.1 Telegram Webhook `/api/telegram/webhook`
```typescript
// Request Header
{
  "content-type": "application/json",
  "x-telegram-bot-api-secret-token": "<SECRET_TOKEN>"
}

// Request Body (Telegram Update)
{
  "update_id": 123456789,
  "message": {
    "message_id": 101,
    "from": {
      "id": 987654321,
      "is_bot": false,
      "first_name": "Budi",
      "username": "budi_santoso"
    },
    "chat": {
      "id": 987654321,
      "type": "private"
    },
    "date": 1791880000,
    "text": "beli kopi kenangan 25rb",
    "photo": [ ... ],
    "voice": {
      "file_id": "AwADBAAD...",
      "duration": 5,
      "mime_type": "audio/ogg"
    }
  }
}

// Response Body
{
  "ok": true,
  "processed": true
}
```

### 6.2 Midtrans Webhook `/api/payment/midtrans-webhook`
```typescript
// Request Body
{
  "transaction_time": "2026-10-13 15:30:22",
  "transaction_status": "settlement",
  "transaction_id": "d8b3...-...",
  "status_message": "midtrans payment notification",
  "status_code": "200",
  "signature_key": "c3ab4...",
  "payment_type": "qris",
  "order_id": "TD-PRO-usr123-1791880000",
  "merchant_id": "G123456789",
  "gross_amount": "99000.00",
  "fraud_status": "accept",
  "currency": "IDR"
}

// Response Body
{
  "status": "success",
  "order_id": "TD-PRO-usr123-1791880000"
}
```

### 6.3 Export API `/api/reports/export`
```typescript
// Request Body
{
  "format": "pdf", // or "xlsx"
  "period": "monthly", // or "yearly", "custom"
  "month": 10,
  "year": 2026,
  "startDate": null,
  "endDate": null
}

// Response Body (200 OK)
{
  "success": true,
  "data": {
    "id": "e2f1...",
    "fileName": "tatadana_laporan_10_2026.pdf",
    "fileType": "pdf",
    "downloadUrl": "https://<supabase-id>.supabase.co/storage/v1/object/sign/tatadana-exports/...",
    "expiresIn": 3600
  }
}
```

---

## 7. Error Handling & Edge Cases Matrix

| Component | Failure Scenario | Trigger Cause | Handling & Mitigation Strategy |
|---|---|---|---|
| **Telegram Webhook** | Duplicate update delivery | Network latency or Telegram retry | Idempotency lock via `telegram_processed_updates`. Duplicate update returns `200 OK` instantly with no DB mutation. |
| **Telegram Webhook** | Secret token mismatch | Malicious spoofed HTTP request | Returns `401 Unauthorized` without database access or update processing. |
| **Telegram Webhook** | Unlinked user message | Unknown `telegram_user_id` | Polite onboarding reply with deep-link URL to connect account in dashboard settings. |
| **Bot Voice Note** | Audio exceeding 60 seconds | User uploads long voice note | Reject immediately with explanation: "Durasi Voice Note maksimal 60 detik ya..." |
| **Bot Voice Note** | Inaudible / silent voice note | Background noise or empty audio | Return polite prompt: "Suara tidak terdengar jelas, coba rekam ulang ya!". |
| **Bot Photo OCR** | Blurry receipt / unreadable | Poor camera focus or lighting | Return prompt: "Gambar struk kurang jelas terbaca. Coba foto lebih dekat dan terang ya!". |
| **Bot Photo OCR** | Starter plan user uploads photo | Feature restriction | Return friendly educational upgrade CTA without consuming AI vision tokens. |
| **Transaction Limit** | Starter user reaches 50 tx/mo | Monthly cap reached | Reject insert with message explaining 50 tx limit + upgrade CTA link. |
| **AI Multi-Provider** | Gemini API 429 Rate Limit | High traffic / quota exhaustion | Catch 429, log error in `ai_logs`, failover immediately to OpenAI GPT-4o-mini / Whisper. |
| **AI Multi-Provider** | All AI providers down | Global network / upstream failure | Fallback to deterministic regex parser for standard expressions (`beli <item> <nominal>`), return transaction. |
| **Midtrans Webhook** | Signature mismatch | Tampered notification payload | Return `403 Forbidden` without updating subscription records. |
| **Midtrans Payment** | User cancels payment modal | User clicks close in Snap | Subscription remains `pending` until expiry; user can re-trigger payment anytime. |
| **Export Engine** | No transactions in period | Fresh user or empty month | Generate valid PDF/Excel with 0-value summary and friendly empty state message. |
| **Export Engine** | Supabase Storage signed URL expired | User clicks link after 1 hour | User can click re-export or refresh link from the dashboard Export History table. |

---

## 8. Dependencies, Environment Variables & Integration

### 8.1 Required npm Dependencies
```json
{
  "dependencies": {
    "@google/genai": "^0.1.1",
    "@supabase/ssr": "^0.5.1",
    "@supabase/supabase-js": "^2.45.4",
    "crypto": "^1.0.1",
    "date-fns": "^3.6.0",
    "date-fns-tz": "^3.1.3",
    "exceljs": "^4.4.0",
    "midtrans-client": "^1.3.1",
    "openai": "^4.68.0",
    "pdfkit": "^0.15.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^20.14.0",
    "@types/pdfkit": "^0.13.5",
    "tsx": "^4.19.1",
    "typescript": "^5.4.5"
  }
}
```

### 8.2 Required Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Telegram Bot
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ
TELEGRAM_WEBHOOK_SECRET=your-secure-webhook-secret
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=TataDanaBot

# AI Engine
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
DEEPSEEK_API_KEY=your-deepseek-api-key

# Midtrans
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxx
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxx
MIDTRANS_IS_PRODUCTION=false

# System & Cron
CRON_SECRET=your-cron-auth-secret
APP_TIMEZONE=Asia/Jakarta
NEXT_PUBLIC_APP_URL=https://tatadana.id
```

---

## 9. Conclusion
This survey establishes the complete blueprint for TataDana's computational backends:
1. The **Telegram Bot Engine (R2)** operates idempotently and seamlessly switches between production webhooks and local development long-polling.
2. The **AI Multi-Provider Engine** delivers resilient multimodal intelligence with automatic failover and audit logging.
3. The **Midtrans Engine** provides a secure, signature-verified billing pipeline.
4. The **Export Engine** delivers production-grade PDF and Excel financial reports backed by Supabase Storage signed URLs.
