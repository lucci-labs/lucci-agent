import type { NewMessageEvent } from "telegram/events";
import type { TelegramClient } from "../clients/telegram";
import { Api } from "telegram";

export type OnNewsFunction = (news: string, link?: string, image?: string) => Promise<void>;

export class NewsClient {
  telegramClient: TelegramClient;
  supportedChannels: string[] = ["CoinDeskGlobal"];
  supportedId: string[] = [];
  onNews: OnNewsFunction;

  constructor(telegramClient: TelegramClient, onNews: OnNewsFunction) {
    this.telegramClient = telegramClient;
    this.onNews = onNews;
  }

  init = async () => {
    for (const channel of this.supportedChannels) {
      const channelId = await this.telegramClient.getChannelId(channel);
      this.supportedId.push(channelId);
    }
  }

  onMessage = async (event: NewMessageEvent) => {
    const fromChannelId = event.message.peerId instanceof Api.PeerChannel
      ? event.message.peerId.channelId.toString()
      : undefined;

    if (!fromChannelId || !this.supportedId.includes(fromChannelId)) {
      return;
    }

    const news = event.message.message;

    await this.onNews(news);
  }

  startListening = async () => {
    await this.telegramClient.addChannelListener(this.onMessage)
  }
}