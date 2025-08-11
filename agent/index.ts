import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import TelegramBot from "node-telegram-bot-api";
import { privateChatPrompt } from "./prompts/privateChatPrompt";

export class Agent {
  private readonly bot: TelegramBot;
  constructor(botToken: string) {
    this.bot = new TelegramBot(botToken);

    this.bot.on("message", this.onMessage.bind(this));
  }

  isGroupMessage(msg: TelegramBot.Message): boolean {
    return msg.chat.type === "group" || msg.chat.type === "supergroup";
  }

  async generateResponse(instruction: string): Promise<string> {
    try {
      const { text } = await generateText({
        model: google("gemini-2.0-flash-exp"),
        prompt: instruction,
      });

      return text;
    } catch (error) {
      console.error("Error generating response:", error);
      throw error;
    }
  }

  async init() {}

  async start() {
    try {
      console.log("Bot is running...");
      await this.bot.startPolling();
    } catch (error) {
      console.error("Error starting bot:", error);
    }
  }

  async onMessage(msg: TelegramBot.Message) {
    try {
      console.log("Received message:", msg);
      if (this.isGroupMessage(msg)) {
        console.log("Ignoring group message.");
        return;
      }
      const response = await this.generateResponse(privateChatPrompt(msg.text || ""));
      await this.bot.sendMessage(
        msg.chat.id,
        response
      );
    } catch (error) {
      console.error("Error handling message:", error);
    }
  }
}
