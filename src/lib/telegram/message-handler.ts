import { demoStore } from '../mock/store';
import { TelegramBotApi } from './bot-api';
import * as templates from './templates';
import { AIProviderManager } from '../ai/provider-manager';
import { parseReceiptImage } from '../ai/ocr-service';
import { transcribeVoiceNote } from '../ai/voice-service';
import { generateAdvisorInsights } from '../ai/advisor';
import { createAdminClient } from '../supabase/admin';

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    date: number;
    text?: string;
    photo?: Array<{ file_id: string; file_size?: number }>;
    voice?: { file_id: string; duration: number; mime_type?: string };
    caption?: string;
  };
}

// In-memory set of processed update_ids for instant atomic deduplication
const processedUpdateIds = new Set<number>();

/**
 * Returns YYYY-MM-DD in Asia/Jakarta timezone
 */
function getJakartaDateStr(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    return date.toISOString().split('T')[0];
  }
}

/**
 * Returns YYYY-MM in Asia/Jakarta timezone
 */
function getJakartaMonthStr(date: Date = new Date()): string {
  return getJakartaDateStr(date).substring(0, 7);
}

export async function handleTelegramUpdate(
  update: TelegramUpdate
): Promise<{ handled: boolean; replyText?: string }> {
  if (!update || typeof update.update_id !== 'number') {
    return { handled: false };
  }

  const { update_id, message } = update;

  // 1. Atomic Idempotency Check: discard if already processed in memory or demo store
  if (processedUpdateIds.has(update_id) || demoStore.isTelegramUpdateProcessed(update_id)) {
    return { handled: true };
  }

  const supabase = createAdminClient();
  if (supabase) {
    try {
      // Atomic insert into telegram_processed_updates table
      const { error } = await supabase.from('telegram_processed_updates').insert({
        update_id,
        chat_id: message?.chat?.id,
      });

      if (error) {
        // Postgres error code 23505 = unique_violation (duplicate update_id)
        if (error.code === '23505' || error.message?.includes('duplicate key')) {
          processedUpdateIds.add(update_id);
          demoStore.markTelegramUpdateProcessed(update_id);
          return { handled: true };
        }
      }
    } catch {
      // Gracefully proceed in offline/local mock mode
    }
  }

  processedUpdateIds.add(update_id);
  demoStore.markTelegramUpdateProcessed(update_id);

  if (!message || !message.chat) {
    return { handled: true };
  }

  const chatId = message.chat.id;
  const botApi = new TelegramBotApi();

  // 2. Resolve User & Associated Financial Data (Multi-User Support with Demo Fallback)
  let user: any = null;
  let wallets: any[] = [];
  let categories: any[] = [];
  let budgets: any[] = [];
  let transactions: any[] = [];
  let isDbActive = false;

  if (supabase) {
    try {
      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('telegram_chat_id', chatId)
        .maybeSingle();

      if (dbProfile) {
        user = dbProfile;
        isDbActive = true;

        const [wRes, cRes, bRes, tRes] = await Promise.all([
          supabase.from('wallets').select('*').eq('user_id', user.id),
          supabase.from('categories').select('*').or(`user_id.eq.${user.id},is_default.eq.true`),
          supabase.from('budgets').select('*, category:categories(*)').eq('user_id', user.id),
          supabase.from('transactions').select('*').eq('user_id', user.id),
        ]);

        wallets = wRes.data || [];
        categories = cRes.data || [];
        budgets = bRes.data || [];
        transactions = tRes.data || [];
      }
    } catch {
      // DB offline, fall through to demo store
    }
  }

  if (!user) {
    user = demoStore.getUser();
    wallets = demoStore.getWallets();
    categories = demoStore.getCategories();
    budgets = demoStore.getBudgets();
    transactions = demoStore.getTransactions();
  }

  const isPro = user.subscription_tier === 'pro';
  const defaultWallet =
    wallets.find((w: any) => w.is_default) ||
    wallets[0] || { id: 'wal_default', name: 'Tunai', balance: 0, type: 'cash' };

  // Helper to send reply
  const sendReply = async (text: string) => {
    await botApi.sendMessage(chatId, text, { parse_mode: 'HTML' });
    return { handled: true, replyText: text };
  };

  // Helper to record transaction
  const recordTransaction = async (txData: any) => {
    // Record in demoStore for immediate UI/simulator sync
    const newTx = demoStore.addTransaction(txData);

    // If Supabase is active, persist to PostgreSQL
    if (isDbActive && supabase) {
      try {
        const { data: insertedTx } = await supabase
          .from('transactions')
          .insert({
            user_id: txData.user_id,
            wallet_id: txData.wallet_id,
            category_id: txData.category_id,
            type: txData.type,
            amount: txData.amount,
            notes: txData.notes,
            source: txData.source,
            destination_wallet_id: txData.destination_wallet_id,
            transaction_date: txData.transaction_date,
          })
          .select()
          .single();

        if (insertedTx && txData.items && txData.items.length > 0) {
          const itemsToInsert = txData.items.map((it: any) => ({
            transaction_id: insertedTx.id,
            item_name: it.item_name,
            quantity: it.quantity || 1,
            price: it.price || it.amount,
            total_amount: it.total_amount || it.amount,
            category_id: it.category_id,
          }));
          await supabase.from('transaction_items').insert(itemsToInsert);
        }
      } catch (err) {
        console.warn('Could not persist transaction to Supabase:', err);
      }
    }

    return newTx;
  };

  // 3. Handle Commands (8 standard commands)
  const rawText = (message.text || message.caption || '').trim();
  const normalizedText = rawText.toLowerCase().replace(/@\w+_bot/g, '').trim();
  const firstWord = normalizedText.split(/\s+/)[0];

  if (rawText.startsWith('/')) {
    if (firstWord === '/start') {
      return await sendReply(
        `👋 Halo <b>${message.from?.first_name || 'Sobat TataDana'}</b>!\n` +
          `Selamat datang di <b>TataDana FinBot</b>.\n\n` +
          `Bot ini terhubung dengan akun TataDana Anda. Anda dapat langsung mengetikkan transaksi harian, mengirim foto struk belanja, atau pesan suara.\n\n` +
          templates.formatHelpMessage()
      );
    }

    if (firstWord === '/saldo') {
      return await sendReply(templates.formatSaldo(wallets));
    }

    if (firstWord === '/hari' || normalizedText.startsWith('/hari ini')) {
      const todayStr = getJakartaDateStr();
      const todayTxs = transactions.filter((t: any) =>
        (t.transaction_date || t.date || '').startsWith(todayStr)
      );
      const income = todayTxs
        .filter((t: any) => t.type === 'income')
        .reduce((acc: number, t: any) => acc + (t.amount || 0), 0);
      const expense = todayTxs
        .filter((t: any) => t.type === 'expense')
        .reduce((acc: number, t: any) => acc + (t.amount || 0), 0);
      return await sendReply(
        templates.formatSummaryReport('Hari Ini', income, expense, todayTxs.length)
      );
    }

    if (firstWord === '/minggu' || normalizedText.startsWith('/minggu ini')) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
      const weekTxs = transactions.filter(
        (t: any) => new Date(t.transaction_date || t.date) >= sevenDaysAgo
      );
      const income = weekTxs
        .filter((t: any) => t.type === 'income')
        .reduce((acc: number, t: any) => acc + (t.amount || 0), 0);
      const expense = weekTxs
        .filter((t: any) => t.type === 'expense')
        .reduce((acc: number, t: any) => acc + (t.amount || 0), 0);
      return await sendReply(
        templates.formatSummaryReport('7 Hari Terakhir', income, expense, weekTxs.length)
      );
    }

    if (firstWord === '/bulan' || normalizedText.startsWith('/bulan ini')) {
      const currentMonthStr = getJakartaMonthStr();
      const monthTxs = transactions.filter((t: any) =>
        (t.transaction_date || t.date || '').startsWith(currentMonthStr)
      );
      const income = monthTxs
        .filter((t: any) => t.type === 'income')
        .reduce((acc: number, t: any) => acc + (t.amount || 0), 0);
      const expense = monthTxs
        .filter((t: any) => t.type === 'expense')
        .reduce((acc: number, t: any) => acc + (t.amount || 0), 0);
      return await sendReply(
        templates.formatSummaryReport('Bulan Ini', income, expense, monthTxs.length)
      );
    }

    if (firstWord === '/budget' || firstWord === '/anggaran') {
      const budgetList = budgets.map((b: any) => ({
        categoryName:
          b.category?.name ||
          categories.find((c: any) => c.id === b.category_id)?.name ||
          'Kategori',
        spent: b.spent || 0,
        limit: b.monthly_limit || b.amount || 0,
      }));
      return await sendReply(templates.formatBudgetStatus(budgetList));
    }

    if (firstWord === '/sheet' || firstWord === '/laporan' || firstWord === '/ekspor') {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const exportLink = `${appUrl}/reports`;
      return await sendReply(
        `📄 <b>LAPORAN & EKSPOR DATA</b>\n\n` +
          `Laporan keuangan lengkap Anda siap diunduh dalam format PDF & Excel (.xlsx).\n\n` +
          `👉 <a href="${exportLink}">Klik di sini untuk mengunduh laporan di Dashboard</a>`
      );
    }

    if (firstWord === '/bantuan' || firstWord === '/help') {
      return await sendReply(templates.formatHelpMessage());
    }
  }

  // 4. Starter Tier Transaction Limit: max 50 transactions/month
  const currentMonthStr = getJakartaMonthStr();
  const monthlyTxCount = transactions.filter((t: any) =>
    (t.transaction_date || t.date || '').startsWith(currentMonthStr)
  ).length;

  if (!isPro && monthlyTxCount >= 50) {
    return await sendReply(
      `🚫 <b>Batas Transaksi Starter Tercapai (50/bln)</b>\n\n` +
        templates.formatUpgradeMessage('Transaksi Bulanan Tanpa Batas')
    );
  }

  // 5. Handle Photos (Receipt OCR — Pro feature)
  if (message.photo && message.photo.length > 0) {
    if (!isPro) {
      return await sendReply(templates.formatUpgradeMessage('Scan OCR Foto Struk Belanja'));
    }

    await botApi.sendChatAction(chatId, 'upload_photo');

    // Download largest photo from Telegram API
    const highestPhoto = message.photo[message.photo.length - 1];
    let imageBuffer: Buffer;

    try {
      const fileInfo = await botApi.getFile(highestPhoto.file_id);
      if (fileInfo.ok && fileInfo.result?.file_path) {
        imageBuffer = await botApi.downloadFile(fileInfo.result.file_path);
      } else {
        imageBuffer = Buffer.from('mock_receipt_image');
      }
    } catch {
      imageBuffer = Buffer.from('mock_receipt_image');
    }

    const ocrResult = await parseReceiptImage(imageBuffer, 'image/jpeg', user.id);
    const targetCat =
      categories.find((c: any) => c.name === 'Belanja' || c.name === 'Makanan & Minuman') ||
      categories[0] || { id: 'cat_belanja', name: 'Belanja' };

    const newTx = await recordTransaction({
      user_id: user.id,
      wallet_id: defaultWallet.id,
      category_id: targetCat.id,
      type: 'expense',
      amount: ocrResult.total_amount,
      notes: `Struk Belanja: ${ocrResult.merchant_name}`,
      raw_input: `[Foto Struk] ${ocrResult.merchant_name}`,
      source: 'telegram_ocr',
      transaction_date: new Date().toISOString(),
      items: ocrResult.items.map((it, idx) => ({
        id: `item_${Date.now()}_${idx}`,
        transaction_id: '',
        item_name: it.name,
        quantity: 1,
        price: it.amount,
        total_amount: it.amount,
        category_id: targetCat.id,
        created_at: new Date().toISOString(),
      })),
    });

    const reply = templates.formatTransactionSuccess(newTx, defaultWallet.name, targetCat.name);
    return await sendReply(reply);
  }

  // 6. Handle Voice Note (Voice Note STT — available for all tiers, max 60s)
  if (message.voice) {
    const duration = message.voice.duration || 0;
    if (duration > 60) {
      return await sendReply(
        `⏱️ <b>Durasi Voice Note Terlalu Panjang (${duration} detik)</b>\n\n` +
          `Maksimal durasi pesan suara yang didukung adalah 60 detik. Silakan kirimkan rekaman yang lebih singkat.`
      );
    }

    await botApi.sendChatAction(chatId, 'record_voice');

    let audioBuffer: Buffer;
    try {
      const fileInfo = await botApi.getFile(message.voice.file_id);
      if (fileInfo.ok && fileInfo.result?.file_path) {
        audioBuffer = await botApi.downloadFile(fileInfo.result.file_path);
      } else {
        audioBuffer = Buffer.from('mock_audio_ogg');
      }
    } catch {
      audioBuffer = Buffer.from('mock_audio_ogg');
    }

    const mimeType = message.voice.mime_type || 'audio/ogg';
    const transcript = await transcribeVoiceNote(audioBuffer, mimeType, user.id);

    const parsed = await AIProviderManager.parseText(
      transcript,
      {
        categories: categories.map((c: any) => c.name),
        wallets: wallets.map((w: any) => w.name),
      },
      user.id
    );

    const targetCat =
      categories.find((c: any) => c.name.toLowerCase() === parsed.category_name?.toLowerCase()) ||
      categories[0] || { id: 'cat_default', name: 'Umum' };

    const newTx = await recordTransaction({
      user_id: user.id,
      wallet_id: defaultWallet.id,
      category_id: targetCat.id,
      type: parsed.type,
      amount: parsed.amount > 0 ? parsed.amount : 50000,
      notes: parsed.notes || transcript,
      raw_input: transcript,
      source: 'telegram_voice',
      transaction_date: new Date().toISOString(),
    });

    const reply = templates.formatVoiceTransactionSuccess(
      transcript,
      newTx,
      defaultWallet.name,
      targetCat.name
    );
    return await sendReply(reply);
  }

  // 7. Handle Natural Language Text Transactions
  if (rawText) {
    await botApi.sendChatAction(chatId, 'typing');

    const parsed = await AIProviderManager.parseText(
      rawText,
      {
        categories: categories.map((c: any) => c.name),
        wallets: wallets.map((w: any) => w.name),
      },
      user.id
    );

    if (parsed.amount <= 0) {
      return await sendReply(
        `🤔 <b>Nominal tidak terdeteksi.</b>\n\nPastikan Anda menyertakan nominal transaksi, contoh:\n` +
          ` • <i>Makan siang 25rb</i>\n • <i>Beli bensin 50k</i>\n • <i>Gaji masuk 15jt</i>`
      );
    }

    const targetCat =
      categories.find((c: any) => c.name.toLowerCase() === parsed.category_name?.toLowerCase()) ||
      categories[0] || { id: 'cat_default', name: 'Lain-lain' };

    let destWalletId: string | undefined;
    if (parsed.type === 'transfer' && parsed.destination_wallet_name) {
      const destW = wallets.find(
        (w: any) => w.name.toLowerCase() === parsed.destination_wallet_name?.toLowerCase()
      );
      if (destW) destWalletId = destW.id;
    }

    const newTx = await recordTransaction({
      user_id: user.id,
      wallet_id: defaultWallet.id,
      category_id: targetCat.id,
      type: parsed.type,
      amount: parsed.amount,
      notes: parsed.notes || rawText,
      raw_input: rawText,
      source: 'telegram_text',
      destination_wallet_id: destWalletId,
      transaction_date: new Date().toISOString(),
    });

    // Budget monitoring for the transaction category
    let budgetInfo: { spent: number; limit: number } | undefined;
    const categoryBudget = budgets.find((b: any) => b.category_id === targetCat.id);
    if (categoryBudget) {
      budgetInfo = {
        spent: (categoryBudget.spent || 0) + (parsed.type === 'expense' ? parsed.amount : 0),
        limit: categoryBudget.monthly_limit || categoryBudget.amount || 0,
      };
    }

    let reply = templates.formatTransactionSuccess(
      newTx,
      defaultWallet.name,
      targetCat.name,
      budgetInfo
    );

    // AI Financial Advisor for Pro Users on Expenses
    if (isPro && parsed.type === 'expense') {
      const insight = await generateAdvisorInsights({
        userId: user.id,
        categoryName: targetCat.name,
        currentAmount: parsed.amount,
        monthlySpent: categoryBudget?.spent || parsed.amount,
        monthlyLimit: categoryBudget?.monthly_limit,
      });

      if (insight) {
        reply += `\n\n🤖 <b>AI Financial Advisor:</b>\n${insight.title}\n<i>${insight.message}</i>`;
      }
    }

    return await sendReply(reply);
  }

  return { handled: false };
}
