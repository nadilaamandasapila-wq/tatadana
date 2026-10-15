# Dispatch Assignment: AI Engine & Export Specialist (M2)

Working Directory: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\worker_ai_export_m2
Project Root: C:\Users\nadil\.gemini\antigravity\scratch\tatadana
Original Request Path: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\ORIGINAL_REQUEST.md
Project Plan: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\PROJECT.md
Audit Report: C:\Users\nadil\.gemini\antigravity\scratch\tatadana\.agents\teamwork\explorer_codebase_audit\report.md

## Exclusive File Ownership:
- `src/lib/ai/**`
- `src/lib/export/**`
- `src/app/api/reports/export/route.ts`
- `tests/nlp-parser.test.ts`

## Mandatory Integrity Warning:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Mission:
You are the AI Engine & Export Specialist for TataDana.
1. Read `ORIGINAL_REQUEST.md` and `PROJECT.md`.
2. Address M2 audit findings:
   - Ensure the AI Multi-Provider Engine (`src/lib/ai/`) correctly handles Gemini default, OpenAI failover, and DeepSeek failover, writing telemetry to `ai_logs`.
   - Ensure the Indonesian Slang NLP parser (`src/lib/ai/nlp-parser.ts`) parses all nominal slang forms: `15rb`, `1.5jt`, `500k`, `2.500.000`, `ceban`, `gocap`, etc.
   - Ensure Vision OCR (`ocr-service.ts`) extracts merchant, date, and line-item breakdowns.
   - Ensure Voice Note STT (`voice-service.ts`) transcribes audio <= 60s and attaches `🎙️ Transkrip: "[hasil]"`.
   - **Fix Export Engine**:
     - Fix `pdf-generator.ts` and `/api/reports/export/route.ts`:
       Produce genuine PDF binary data (or clean structured PDF binary with `%PDF-1.4` headers or standard PDF buffer generator using a lightweight native generator or standard PDF stream) so when requested with `format=pdf`, the response content-type is `application/pdf` and downloadable as a valid `.pdf` file.
     - Excel generator (`excel-generator.ts`): Ensure `.xlsx` generation formats IDR currency columns and provides summary totals.
     - Support Supabase Storage signed URLs when storage is available, with direct streaming download fallback.
3. Test your code using `npx tsx tests/nlp-parser.test.ts` and test export generation.
4. Write `changes.md` and `handoff.md` in your working directory.
5. Send completion message to parent orchestrator (`f97a728b-f0fe-408f-8312-c163fb72bca4`).
