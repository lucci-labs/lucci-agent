import type { TelegramClient } from "../clients/telegram";

export class News {
  telegramClient: TelegramClient;
  supportedChannels: string[] = ["CoinDeskGlobal"];
  supportedId: string[] = [];

  constructor(telegramClient: TelegramClient) {
    this.telegramClient = telegramClient;
  }

  init = async () => {
    for (const channel of this.supportedChannels) {
      const channelId = await this.telegramClient.getChannelId(channel);
      this.supportedId.push(channelId);
    }
  }

  onMessage = async (event: any) => {
  }

  startListening = async () => {
    await this.telegramClient.addChannelListener(this.onMessage)
  }
}