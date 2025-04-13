import { NewMessage, type NewMessageEvent } from "telegram/events";
import { TelegramClient } from "telegram";
import { Api } from "telegram";
// @ts-ignore
import input from "input";

export type OnNewsFunction = (
  news: string,
  link?: string,
  image?: string
) => Promise<void>;

const session = "telegram_session";

export class NewsClient {
  client: TelegramClient | null = null;
  supportedChannels: string[] = ["CoinDeskGlobal"];
  supportedId: string[] = [];
  onNews: OnNewsFunction;

  constructor(onNews: OnNewsFunction) {
    this.onNews = onNews;
  }

  getChannelId = async (channelName: string): Promise<any> => {
    if (this.client) {
      const channel = await this.client.getEntity(channelName);
      const targetChannelId = (channel as any).id;
      return targetChannelId.toString();
    } else {
      throw Error("Telegram client is not initialized");
    }
  };

  init = async () => {
    if (!process.env.TELEGRAM_APP_ID) {
      throw new Error("env missing: TELEGRAM_APP_ID is not set");
    }
    if (!process.env.TELEGRAM_APP_HASH) {
      throw new Error("env missing: TELEGRAM_APP_HASH is not set");
    }
    this.client = new TelegramClient(
      session,
      Number(process.env.TELEGRAM_APP_ID),
      process.env.TELEGRAM_APP_HASH,
      {
        connectionRetries: 5,
      }
    );

    await this.client.start({
      phoneNumber: async () => await input.text("Input phone number: "),
      password: async () => await input.text("Input 2fa: "),
      phoneCode: async () => await input.text("Input Telegram code: "),
      onError: (err) => console.log(err),
    });
    for (const channel of this.supportedChannels) {
      const channelId = await this.getChannelId(channel);
      this.supportedId.push(channelId);
    }
  };

  onMessage = async (event: NewMessageEvent) => {
    const fromChannelId =
      event.message.peerId instanceof Api.PeerChannel
        ? event.message.peerId.channelId.toString()
        : undefined;

    if (!fromChannelId || !this.supportedId.includes(fromChannelId)) {
      return;
    }

    const news = event.message.message;

    await this.onNews(news);
  };

  startListening = async () => {
    if (!this.client) {
      throw new Error("Telegram client is not initialized, must run init first");
    }
    this.client.addEventHandler(this.onMessage, new NewMessage({}));
  };
}
