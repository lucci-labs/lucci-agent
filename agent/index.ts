import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { TelegramService } from "../telegram";
import { generateNewsInstruction } from "./prompts/tweet";
import { CacheService } from "../cache";

export class Agent {
  private readonly newsChannelId: string;
  private readonly agentChanelId: number;
  private readonly telegramService: TelegramService;
  private readonly cacheService: CacheService;

  constructor() {
    if (!process.env.NEWS_LISTEN_CHANNEL) {
      throw new Error("NEWS_LISTEN_CHANNEL environment variable is not set");
    }
    if (!process.env.AGENT_CHANNEL_ID) {
      throw new Error("AGENT_CHANNEL_ID environment variable is not set");
    }
    this.agentChanelId = Number(process.env.AGENT_CHANNEL_ID);
    this.newsChannelId = process.env.NEWS_LISTEN_CHANNEL;
    this.telegramService = new TelegramService();
    this.cacheService = new CacheService();
  }

  async init() {
    await this.telegramService.init();
    await this.cacheService.init();
  }

  async start() {
    try {
      console.log("Running Agent...");
      this.telegramService.subscribeToChannel(this.newsChannelId, this.onNewsReceived.bind(this));
    } catch (error) {
      throw new Error(`Failed to start Agent: ${error}`);
    }
  }
  
  async __test() {
  }

  async getSourceNews(news: string): Promise<string> {
    try {
      const cachedNews = await this.cacheService.get(news);
      return cachedNews || "";
    } catch (error) {
      return "";
    }
  }

  async generateResponse(instruction: string): Promise<string> {
    try {
      const { text } = await generateText({
        model: google("gemini-2.0-flash-lite"),
        prompt: instruction,
      });

      if (!text || text.trim().length === 0 || text.includes("ignore")) {
        return "";
      }

      return text;
    } catch (error) {
      console.error("Error generating response:", error);
      return ""
    }
  }

  async postNews(news: string) {
    await this.telegramService.sendMessage(this.agentChanelId, news);
  }

  async onNewsReceived(news: string) {
    const rewrittenNews = await this.generateResponse(generateNewsInstruction(news));
    if (rewrittenNews) {
      await this.cacheService.set(rewrittenNews, news);
      await this.postNews(rewrittenNews);
    }
  }
}
