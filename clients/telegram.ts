import { TelegramClient as Client } from "telegram";
import TelegramBot from "node-telegram-bot-api";
import { NewMessage, NewMessageEvent } from "telegram/events";


export class TelegramClient {
  botClient: TelegramBot | null = null;

  constructor() {}

  init = async () => {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error("env missing: TELEGRAM_BOT_TOKEN is not set");
    }
    this.botClient = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
  }

  postContent = async (chatId: string, content: string) => { 
    if (this.botClient) {
      await this.botClient.sendMessage(chatId, content);
    } else {
      console.error("Bot client is not initialized");
    }
  }
}
