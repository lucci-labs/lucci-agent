import { TelegramClient as Client } from "telegram";
import TelegramBot from "node-telegram-bot-api";
// @ts-ignore
import input from "input";

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
}
