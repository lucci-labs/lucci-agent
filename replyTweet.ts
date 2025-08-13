import { XClient } from "./x";
import dbHandler from "./cache";
import { replyPrompt } from "./agent/prompts/reply";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

const isReplyProcessed = async (replyId: string): Promise<boolean> => {
  try {
    await dbHandler.get(replyId);
    return true;
  } catch (error) {
    return false;
  }
};

const main = async () => {
  await dbHandler.open();
  const xClient = new XClient();
  await xClient.init();

  while (true) {
    const replies = await xClient.getReplies();
    for (const reply of replies) {
      if (await isReplyProcessed(reply.id)) {
        console.log(`Reply ${reply.id} already processed, skipping.`);
        continue;
      }

      const prompt = replyPrompt(reply.parentTweet, reply.text);

      const { text } = await generateText({
        model: google("gemini-2.0-flash-exp"),
        prompt: prompt,
      });
      await xClient.replyToTweet(reply.id, text);
      // Mark the reply as processed
      await dbHandler.set(reply.id, true);

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Throttle to avoid rate limits
    }

    await new Promise((resolve) => setTimeout(resolve, 5 * 60000)); // Check for new replies every minute
  }
};

main();
