import { generateText } from "ai";
import { tweetPromptV2 } from "../agent/prompts/tweetv2";
import { google } from "@ai-sdk/google";

const main = async () => {
  const tweetBase = `OKX announced a strategic upgrade to X Layer and will permanently burn 65,256,712.097 OKB from historical buybacks and reserves. The OKB smart contract will be upgraded to remove minting and manual burns, fixing total supply at 21 million. OKTChain will be phased out, with OKT swapped for OKB based on the July 13–Aug 12, 2025 average closing price. Following the news, OKB briefly hit an all-time high of $134 before retreating to around $129. — link`
  const prompt = tweetPromptV2(tweetBase, {
    allowEmoji: true
  });

  const { text } = await generateText({
    model: google("gemini-2.0-flash-exp"),
    prompt: prompt,
  });

  console.log(text);
}

main()