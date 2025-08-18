import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { TelegramService } from "../telegram";
import { generateNewsInstruction } from "./prompts/tweet";
import { CacheService } from "../cache";
import { XService } from "../x";
import { generateReplyInstruction } from "./prompts/reply";

export class Agent {
  private readonly newsChannelId: string;
  private readonly agentChanelId: number;
  private readonly telegramService: TelegramService;
  private readonly xService: XService
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
    this.xService = new XService();
    this.cacheService = new CacheService();
  }

  async init() {
    await this.telegramService.init();
    await this.xService.init();
    await this.cacheService.init();
  }

  async start() {
    try {
      console.log("Running Agent...");
      this.telegramService.subscribeToChannel(this.newsChannelId, this.onNewsReceived.bind(this));
      setInterval(this.fetchMentions.bind(this), 1000 * 60 * 5); // Fetch reply every 5 minutes
    } catch (error) {
      throw new Error(`Failed to start Agent: ${error}`);
    }
  }
  
  async __test() {
    await this.fetchMentions()
  }

  async isProcessedMention(mentionId: string): Promise<boolean> {
    try {
      await this.cacheService.get(mentionId)
      return true; // If it exists, it means it has been processed
    } catch {
      return false
    }
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
    await this.xService.sendTweet(news);
  }

  async postReply(reply: string, mentionId: string) {
    await this.xService.replyToTweet(mentionId, reply);
  }

  async onNewsReceived(news: string) {
    const rewrittenNews = await this.generateResponse(generateNewsInstruction(news));
    if (rewrittenNews) {
      await this.cacheService.set(rewrittenNews, news);
      await this.postNews(rewrittenNews);
    }
  }

  async fetchMentions() {
    const mentions = await this.xService.getMentions()

    for (const mention of mentions) {
      if (!await this.isProcessedMention(mention.id)) {
        const sourceNews = []
        for (const parentTweet of mention.parentTweets) {
          const cachedNews = await this.getSourceNews(parentTweet.text);
          if (cachedNews) {
            sourceNews.push(cachedNews);
          }
        }

        const news = sourceNews.length > 0 ? sourceNews.join("\n") : "";
        const replyText = await this.generateResponse(generateReplyInstruction(mention, news));
        if (replyText) {
          await this.postReply(replyText, mention.id);
          await this.cacheService.set(mention.id, true); // Mark as processed
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second between processing mentions
      break;
    }
  }
}
