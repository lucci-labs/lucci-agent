import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { tweetPrompt } from "./prompts/tweetPrompt";

export const generateTweet = async (baseTweet: string): Promise<string> => {
  const { text } = await generateText({
    model: google("gemini-2.0-flash-exp"),
    prompt: tweetPrompt(baseTweet),
  });

  return text
}
