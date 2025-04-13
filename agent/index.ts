import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { tweetPrompt } from "./prompts/tweetPrompt";
import type { TwitterClient } from "../clients";

export class Agent {
  twitterClient: TwitterClient;
  constructor(twitterClient: TwitterClient) {
    this.twitterClient = twitterClient;
  }

  generateContent = async (baseTweet: string): Promise<string> => {
    const { text } = await generateText({
      model: google("gemini-2.0-flash-exp"),
      prompt: tweetPrompt(baseTweet),
    });

    return text;
  };

  onNews = async (news: string, link?: string, image?: string) => {
    const content = await this.generateContent(news);
    console.log("Generated content:", content);
  };
}
