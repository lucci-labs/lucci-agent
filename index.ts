import { Agent } from "./agent";
import { TwitterClient } from "./clients";
import { NewsClient } from "./news";

const main = async () => {
  console.log("Start Lucci...");
  const twitterClient = new TwitterClient();
  const agent = new Agent(twitterClient);
  // const newClient = new NewsClient(agent.onNews)

  const content = await agent.generateContent(`
    We're introducing the launch of VIP#3:"TomoMasterDAO & tDAO Sunset: A Roadmap for Closure

1/ Key Details To Mark:
- Snapshot Voting: April 10th - April 12th, 2025 (2pm, UTC+7)
- Snapshot of $VIC balances: April 9th, 2025 (12PM, UTC+7)
- To succeed, this proposal must reach a 10,000 $VIC quorum (With a majority voting "yes" and receiving over 50% of the votes)

2/ Snapshot Details:
The following accounts will be ineligible to vote for VIP #3 at the time of the snapshot:
📍 Stakers who have unstaked $VIC but not claimed within 48 hours.
📍 Resigned Masternode stakers still within the 30-day claim period.
📍 Liquid stakers using VicPool.

🗣️ Join the discussion: https://forum.viction.xyz/t/vip-3-tomomasterdao-tdao-sunset-a-roadmap-for-closure/3150
    `);

  console.log("Content:", content);
};

main();
