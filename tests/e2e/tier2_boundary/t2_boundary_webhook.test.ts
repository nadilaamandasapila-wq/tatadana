import { describe, it, expect } from '../harness';
import { handleTelegramUpdate, TelegramUpdate } from '../../../src/lib/telegram/message-handler';

describe('Tier 2: Boundary & Corner Cases — Webhook Ingestion & Idempotency', () => {
  it('WH-B1: Empty update or missing message payload handles gracefully without throw', async () => {
    const emptyUpdate: any = { update_id: 88888 };
    const res = await handleTelegramUpdate(emptyUpdate);
    expect(res.handled).toBe(true);
    expect(res.replyText).toBeUndefined();
  });

  it('WH-B2: Update with missing chat object handles gracefully', async () => {
    const noChatUpdate: any = {
      update_id: 88889,
      message: {
        message_id: 1,
        from: { id: 123, is_bot: false, first_name: 'Tester' },
        date: 1234567,
      },
    };
    const res = await handleTelegramUpdate(noChatUpdate);
    expect(res.handled).toBe(true);
    expect(res.replyText).toBeUndefined();
  });

  it('WH-B3: Non-numeric and conversational text prompts user with example guidance', async () => {
    const textUpdate: TelegramUpdate = {
      update_id: 88890,
      message: {
        message_id: 2,
        from: { id: 987654321, is_bot: false, first_name: 'Ahmad' },
        chat: { id: 987654321, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: 'Selamat pagi admin tatadana',
      },
    };

    const res = await handleTelegramUpdate(textUpdate);
    expect(res.handled).toBe(true);
    expect(Boolean(res.replyText)).toBe(true);
    expect(res.replyText!).toContain('Nominal tidak terdeteksi');
    expect(res.replyText!).toContain('Makan siang 25rb');
  });

  it('WH-B4: Rapid consecutive duplicate updates are discarded', async () => {
    const updateId = 88891;
    const update: TelegramUpdate = {
      update_id: updateId,
      message: {
        message_id: 3,
        from: { id: 987654321, is_bot: false, first_name: 'Ahmad' },
        chat: { id: 987654321, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: 'kopi 15rb',
      },
    };

    // First attempt -> handled and reply generated
    const firstRes = await handleTelegramUpdate(update);
    expect(firstRes.handled).toBe(true);
    expect(Boolean(firstRes.replyText)).toBe(true);

    // Second replay attempt -> handled but discarded (no duplicate reply generated)
    const secondRes = await handleTelegramUpdate(update);
    expect(secondRes.handled).toBe(true);
    expect(secondRes.replyText).toBeUndefined();

    // Third replay attempt -> discarded
    const thirdRes = await handleTelegramUpdate(update);
    expect(thirdRes.handled).toBe(true);
    expect(thirdRes.replyText).toBeUndefined();
  });

  it('WH-B5: Message with whitespace-only caption or text', async () => {
    const spaceUpdate: TelegramUpdate = {
      update_id: 88892,
      message: {
        message_id: 4,
        from: { id: 987654321, is_bot: false, first_name: 'Ahmad' },
        chat: { id: 987654321, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: '     ',
      },
    };

    const res = await handleTelegramUpdate(spaceUpdate);
    expect(res.handled).toBe(true);
  });
});
