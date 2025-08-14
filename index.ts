import { TelegramClient } from "telegram";
import { Agent } from "./agent";

const main = async () => {
  const agent = new Agent();
  await agent.init();
  await agent.start();
};

main().catch((error) => {
  console.error("Error initializing runtime:", error);
});
