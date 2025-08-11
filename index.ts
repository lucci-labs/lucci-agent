import { Agent } from "./agent";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";

const main = async () => {
  const agent = new Agent(TELEGRAM_BOT_TOKEN);
  await agent.init();
  await agent.start();
}

main().catch((error) => {
  console.error("Error initializing runtime:", error);
});