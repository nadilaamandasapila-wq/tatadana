import assert from 'assert';
import {
  renderProgressBar,
  formatTransactionSuccess,
  formatVoiceTransactionSuccess,
  formatBudgetStatus,
  formatSaldo,
  formatSummaryReport,
  formatHelpMessage,
  formatUpgradeMessage,
} from '../src/lib/telegram/templates';
import { formatWIB } from '../src/lib/utils/date';
import { formatRupiah } from '../src/lib/utils/currency';
import { TelegramBotApi, testBotConnection } from '../src/lib/telegram/bot-api';
import { handleTelegramUpdate, TelegramUpdate } from '../src/lib/telegram/message-handler';
import { demoStore } from '../src/lib/mock/store';

async function runTests() {
  console.log('🧪 [Test Suite] Running Telegram Templates, Bot API & Message Handler Tests...\n');

  // 1. Visual Progress Bar Tests (10 blocks: █ and ░)
  console.log('1️⃣ Testing Visual Progress Bar...');
  const bar0 = renderProgressBar(0, 1000000);
  assert.strictEqual(bar0, '[░░░░░░░░░░] 0%');
  console.log(`  ✓ 0% bar: ${bar0}`);

  const bar25 = renderProgressBar(250000, 1000000);
  assert.strictEqual(bar25, '[██░░░░░░░░] 25%');
  console.log(`  ✓ 25% bar: ${bar25}`);

  const bar50 = renderProgressBar(500000, 1000000);
  assert.strictEqual(bar50, '[█████░░░░░] 50%');
  console.log(`  ✓ 50% bar: ${bar50}`);

  const bar75 = renderProgressBar(750000, 1000000);
  assert.strictEqual(bar75, '[███████░░░] 75%');
  console.log(`  ✓ 75% bar: ${bar75}`);

  const bar80 = renderProgressBar(800000, 1000000);
  assert.strictEqual(bar80, '[████████░░] 80%');
  console.log(`  ✓ 80% bar: ${bar80}`);

  const bar100 = renderProgressBar(1000000, 1000000);
  assert.strictEqual(bar100, '[██████████] 100%');
  console.log(`  ✓ 100% bar: ${bar100}`);

  const bar150 = renderProgressBar(1500000, 1000000);
  assert.strictEqual(bar150, '[██████████] 150%');
  console.log(`  ✓ 150% bar: ${bar150}`);

  // 2. WIB Timezone Formatting
  console.log('\n2️⃣ Testing WIB Timezone Formatting...');
  const testDate = new Date('2026-10-15T03:30:00Z'); // 03:30 UTC = 10:30 WIB
  const wibFormatted = formatWIB(testDate);
  assert(wibFormatted.includes('WIB'), 'Formatted date must include WIB timezone indicator');
  console.log(`  ✓ WIB formatting: ${wibFormatted}`);

  // 3. Currency Formatting
  console.log('\n3️⃣ Testing Currency Formatting...');
  const formattedRupiah = formatRupiah(1500000);
  assert.strictEqual(formattedRupiah, 'Rp 1.500.000');
  console.log(`  ✓ Rupiah formatting: ${formattedRupiah}`);

  // 4. Telegram Templates
  console.log('\n4️⃣ Testing Templates & Command Output...');
  const wallets = demoStore.getWallets();
  const saldoOutput = formatSaldo(wallets);
  assert(saldoOutput.includes('INFORMASI SALDO'), 'formatSaldo must contain INFORMASI SALDO');
  console.log('  ✓ formatSaldo contains INFORMASI SALDO');

  const budgetOutput = formatBudgetStatus([
    { categoryName: 'Makanan & Minuman', spent: 800000, limit: 1000000 },
    { categoryName: 'Transportasi', spent: 1200000, limit: 1000000 },
  ]);
  assert(budgetOutput.includes('STATUS ANGGARAN'), 'formatBudgetStatus must contain STATUS ANGGARAN');
  assert(budgetOutput.includes('Waspada (≥80%)'), 'formatBudgetStatus must show warning badge');
  assert(budgetOutput.includes('Overbudget!'), 'formatBudgetStatus must show overbudget badge');
  console.log('  ✓ formatBudgetStatus contains STATUS ANGGARAN and badges');

  const upgradeOutput = formatUpgradeMessage('Scan OCR Foto Struk Belanja');
  assert(upgradeOutput.includes('Fitur Eksklusif Pro'), 'formatUpgradeMessage must contain Fitur Eksklusif Pro');
  assert(upgradeOutput.includes('Scan OCR Foto Struk Belanja'), 'formatUpgradeMessage must contain feature name');
  assert(upgradeOutput.includes('Rp99.000'), 'formatUpgradeMessage must contain Rp99.000');
  console.log('  ✓ formatUpgradeMessage contains Pro education CTA');

  // 5. TelegramBotApi Wrapper Methods
  console.log('\n5️⃣ Testing TelegramBotApi Client Wrapper...');
  const bot = new TelegramBotApi('demo_token');

  const meRes = await bot.getMe();
  assert.strictEqual(meRes.ok, true);
  assert.strictEqual(meRes.result?.username, 'tatadana_demo_bot');
  console.log('  ✓ bot.getMe() verified');

  const webhookRes = await bot.setWebhook('https://example.com/webhook', 'secret_token_123');
  assert.strictEqual(webhookRes.ok, true);
  console.log('  ✓ bot.setWebhook() verified');

  const delWebhookRes = await bot.deleteWebhook(true);
  assert.strictEqual(delWebhookRes.ok, true);
  console.log('  ✓ bot.deleteWebhook() verified');

  const msgRes = await bot.sendMessage(123456, '<b>Halo Sobat TataDana!</b>');
  assert.strictEqual(msgRes.ok, true);
  console.log('  ✓ bot.sendMessage() verified');

  const photoRes = await bot.sendPhoto(123456, 'https://example.com/receipt.jpg', { caption: 'Test receipt' });
  assert.strictEqual(photoRes.ok, true);
  console.log('  ✓ bot.sendPhoto() verified');

  const actionRes = await bot.sendChatAction(123456, 'typing');
  assert.strictEqual(actionRes.ok, true);
  console.log('  ✓ bot.sendChatAction() verified');

  const fileRes = await bot.getFile('test_file_id_123');
  assert.strictEqual(fileRes.ok, true);
  assert(Boolean(fileRes.result?.file_path), 'file_path must be returned');
  console.log(`  ✓ bot.getFile() verified: path=${fileRes.result?.file_path}`);

  const buffer = await bot.downloadFile(fileRes.result!.file_path!);
  assert(Buffer.isBuffer(buffer), 'downloadFile must return a Buffer');
  assert(buffer.length > 0, 'downloaded buffer must not be empty');
  console.log(`  ✓ bot.downloadFile() verified: bytes=${buffer.length}`);

  const testConnRes = await testBotConnection('demo_token');
  assert.strictEqual(testConnRes.ok, true);
  assert.strictEqual(testConnRes.botUsername, 'tatadana_demo_bot');
  console.log('  ✓ testBotConnection() helper verified');

  // 6. Message Handler Idempotency & Command Verification
  console.log('\n6️⃣ Testing Message Handler & Idempotency...');
  const update1: TelegramUpdate = {
    update_id: 88801,
    message: {
      message_id: 901,
      from: { id: 987654321, is_bot: false, first_name: 'Ahmad' },
      chat: { id: 987654321, type: 'private' },
      date: Math.floor(Date.now() / 1000),
      text: 'kopi susu 18rb',
    },
  };
  const res1 = await handleTelegramUpdate(update1);
  assert.strictEqual(res1.handled, true);
  assert(res1.replyText?.includes('Rp 18.000'), 'Reply must contain formatted amount');
  console.log('  ✓ handleTelegramUpdate text transaction verified');

  // Duplicate update_id must be discarded
  const resDup = await handleTelegramUpdate(update1);
  assert.strictEqual(resDup.handled, true);
  assert.strictEqual(resDup.replyText, undefined, 'Duplicate update must not produce a reply');
  console.log('  ✓ Atomic update_id idempotency verified');

  console.log('\n🎉 All Telegram Engine & Template tests passed successfully!\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
