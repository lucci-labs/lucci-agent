import { TelegramClient as Client } from "telegram";
import TelegramBot from "node-telegram-bot-api";
// @ts-ignore
import input from "input";
import { NewMessage } from "telegram/events";

const session = "telegram_session";

export class TelegramClient {
  client: Client | null = null;
  botClient: TelegramBot | null = null;

  constructor() {}

  initClient = async (appId: number, appHash: string) => {
    this.client = new Client(session, appId, appHash, {
      connectionRetries: 5,
    });

    await this.client.start({
      phoneNumber: async () => await input.text("Input phone number: "),
      password: async () => await input.text("Input 2fa: "),
      phoneCode: async () => await input.text("Input Telegram code: "),
      onError: (err) => console.log(err),
    });
  };

  initBot = async (token: string) => {
    this.botClient = new TelegramBot(token);
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

  addChannelListener = async (callback: (message: any) => void) => {
    if (this.client) {
      this.client.addEventHandler(callback, new NewMessage({}));
    } else {
      console.error("Telegram client is not initialized");
    }
  }
}
