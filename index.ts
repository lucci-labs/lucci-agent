import { Agent } from "./agent";
import { TwitterClient } from "./clients";
import { NewsClient } from "./news";

const main = async () => {
  console.log("Start Lucci...");
  const twitterClient = new TwitterClient();
  const agent = new Agent(twitterClient);
  // const newClient = new NewsClient(agent.onNews)

  const content = await agent.generateContent(`
CoinShares reports $795 million in outflows from digital asset funds last week, the third consecutive week of outflows, bringing the total since February to $7.2 billion, nearly erasing year-to-date inflows. Bitcoin saw $751 million in outflows, and Ethereum $37.6 million.  — link    `);

  console.log("Content:", content);
};

main();
