import { TelegramClient as Client } from "telegram";
import TelegramBot from "node-telegram-bot-api";
// @ts-ignore
import input from "input";
import { NewMessage, NewMessageEvent } from "telegram/events";

const session = "telegram_session";

export class TelegramClient {
  client: Client | null = null;
  botClient: TelegramBot | null = null;

  constructor() {}

  initClient = async () => {
    if (!process.env.TELEGRAM_APP_ID) {
      throw new Error("env missing: TELEGRAM_APP_ID is not set");
    }
    if (!process.env.TELEGRAM_APP_HASH) {
      throw new Error("env missing: TELEGRAM_APP_HASH is not set");
    }
    this.client = new Client(session, Number(process.env.TELEGRAM_APP_ID), process.env.TELEGRAM_APP_HASH, {
      connectionRetries: 5,
    });

    await this.client.start({
      phoneNumber: async () => await input.text("Input phone number: "),
      password: async () => await input.text("Input 2fa: "),
      phoneCode: async () => await input.text("Input Telegram code: "),
      onError: (err) => console.log(err),
    });
  };

  initBot = async () => {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error("env missing: TELEGRAM_BOT_TOKEN is not set");
    }
    this.botClient = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
  }

  getChannelId = async (channelName: string): Promise<any> => {
    if (this.client) {
      const channel = await this.client.getEntity(channelName);
      const targetChannelId = (channel as any).id;
      return targetChannelId.toString();
    } else {
      throw Error("Telegram client is not initialized");
    }
  }

  postContent = async (chatId: string, content: string) => { 
    if (this.botClient) {
      await this.botClient.sendMessage(chatId, content);
    } else {
      console.error("Bot client is not initialized");
    }
  }

  addChannelListener = async (callback: (message: NewMessageEvent) => Promise<void>) => {
    if (this.client) {
      this.client.addEventHandler(callback, new NewMessage({}));
    } else {
      console.error("Telegram client is not initialized");
    }
  }
}
