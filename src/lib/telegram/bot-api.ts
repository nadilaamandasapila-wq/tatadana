import { TelegramBotInfo } from '@/types';

export interface TelegramFileResult {
  file_id: string;
  file_unique_id: string;
  file_size?: number;
  file_path?: string;
}

export class TelegramBotApi {
  private token: string;
  private baseUrl: string;

  constructor(token?: string) {
    this.token = token || process.env.TELEGRAM_BOT_TOKEN || '';
    this.baseUrl = `https://api.telegram.org/bot${this.token}`;
  }

  private isDemoToken(): boolean {
    return !this.token || this.token.startsWith('demo_') || this.token.includes('test');
  }

  async getMe(): Promise<{ ok: boolean; result?: TelegramBotInfo; description?: string }> {
    if (this.isDemoToken()) {
      return {
        ok: true,
        result: {
          id: 7123456789,
          is_bot: true,
          first_name: 'TataDana FinBot',
          username: 'tatadana_demo_bot',
        },
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/getMe`);
      return await res.json();
    } catch (err: any) {
      return { ok: false, description: err.message };
    }
  }

  async setWebhook(
    url: string,
    secretToken?: string
  ): Promise<{ ok: boolean; description?: string }> {
    if (this.isDemoToken()) {
      return { ok: true, description: 'Webhook set successfully (Demo Mode)' };
    }

    try {
      const body: Record<string, any> = { url };
      if (secretToken) body.secret_token = secretToken;

      const res = await fetch(`${this.baseUrl}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return await res.json();
    } catch (err: any) {
      return { ok: false, description: err.message };
    }
  }

  async deleteWebhook(
    dropPendingUpdates: boolean = false
  ): Promise<{ ok: boolean; description?: string }> {
    if (this.isDemoToken()) {
      return { ok: true, description: 'Webhook deleted successfully (Demo Mode)' };
    }

    try {
      const res = await fetch(`${this.baseUrl}/deleteWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drop_pending_updates: dropPendingUpdates }),
      });
      return await res.json();
    } catch (err: any) {
      return { ok: false, description: err.message };
    }
  }

  async sendMessage(
    chatId: number | string,
    text: string,
    options: { parse_mode?: 'HTML' | 'MarkdownV2'; reply_to_message_id?: number } = {}
  ): Promise<{ ok: boolean; result?: any; description?: string }> {
    if (this.isDemoToken()) {
      return { ok: true, result: { message_id: Math.floor(Math.random() * 10000) } };
    }

    try {
      const res = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: options.parse_mode || 'HTML',
          reply_to_message_id: options.reply_to_message_id,
        }),
      });
      return await res.json();
    } catch (err: any) {
      return { ok: false, description: err.message };
    }
  }

  async sendPhoto(
    chatId: number | string,
    photoUrlOrFileId: string,
    options: { caption?: string; parse_mode?: 'HTML' | 'MarkdownV2'; reply_to_message_id?: number } = {}
  ): Promise<{ ok: boolean; result?: any; description?: string }> {
    if (this.isDemoToken()) {
      return {
        ok: true,
        result: {
          message_id: Math.floor(Math.random() * 10000),
          photo: [{ file_id: photoUrlOrFileId }],
        },
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          photo: photoUrlOrFileId,
          caption: options.caption,
          parse_mode: options.parse_mode || 'HTML',
          reply_to_message_id: options.reply_to_message_id,
        }),
      });
      return await res.json();
    } catch (err: any) {
      return { ok: false, description: err.message };
    }
  }

  async sendChatAction(
    chatId: number | string,
    action: 'typing' | 'upload_photo' | 'record_voice' | 'upload_document' | string
  ): Promise<{ ok: boolean; result?: boolean; description?: string }> {
    if (this.isDemoToken()) {
      return { ok: true, result: true };
    }

    try {
      const res = await fetch(`${this.baseUrl}/sendChatAction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          action,
        }),
      });
      return await res.json();
    } catch (err: any) {
      return { ok: false, description: err.message };
    }
  }

  async getFile(fileId: string): Promise<{
    ok: boolean;
    result?: TelegramFileResult;
    description?: string;
  }> {
    if (this.isDemoToken()) {
      return {
        ok: true,
        result: {
          file_id: fileId,
          file_unique_id: `uniq_${fileId}`,
          file_size: 1024,
          file_path: fileId.includes('voice') ? `voice/${fileId}.ogg` : `photos/${fileId}.jpg`,
        },
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/getFile?file_id=${encodeURIComponent(fileId)}`);
      return await res.json();
    } catch (err: any) {
      return { ok: false, description: err.message };
    }
  }

  async downloadFile(filePath: string): Promise<Buffer> {
    if (this.isDemoToken()) {
      if (filePath.includes('voice') || filePath.endsWith('.ogg')) {
        return Buffer.from('demo_voice_note_audio_tatadana');
      }
      return Buffer.from('demo_receipt_image_tatadana');
    }

    const fileUrl = `https://api.telegram.org/file/bot${this.token}/${filePath}`;
    const res = await fetch(fileUrl);
    if (!res.ok) {
      throw new Error(`Failed to download file from Telegram: ${res.status} ${res.statusText}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}

/**
 * Live test helper for settings page and connection checks
 */
export async function testBotConnection(token: string): Promise<{
  ok: boolean;
  botUsername?: string;
  webhookSet?: boolean;
  error?: string;
}> {
  if (!token || token.trim().length === 0) {
    return { ok: false, error: 'Token Telegram bot tidak boleh kosong.' };
  }

  // Demo token bypass for instant localhost testing
  if (token.startsWith('demo_') || token.includes('test')) {
    return {
      ok: true,
      botUsername: 'tatadana_demo_bot',
      webhookSet: true,
    };
  }

  try {
    const api = new TelegramBotApi(token);
    const meRes = await api.getMe();
    if (!meRes.ok || !meRes.result) {
      return { ok: false, error: meRes.description || 'Gagal memverifikasi token dengan Telegram API' };
    }

    let webhookSet = false;
    const publicUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (publicUrl && publicUrl.startsWith('https://')) {
      const webhookUrl = `${publicUrl}/api/telegram/webhook`;
      const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
      const setRes = await api.setWebhook(webhookUrl, secret);
      webhookSet = setRes.ok;
    } else {
      webhookSet = true;
    }

    return {
      ok: true,
      botUsername: meRes.result.username,
      webhookSet,
    };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Koneksi jaringan ke Telegram gagal' };
  }
}
