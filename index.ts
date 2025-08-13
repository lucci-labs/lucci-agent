import { TelegramClient } from "telegram";
import { Agent } from "./agent";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const telegramAppId = Number(process.env.TELEGRAM_APP_ID) || 0;
const telegramAppHash = process.env.TELEGRAM_APP_HASH || "";
const listenToChannel = process.env.TELEGRAM_LISTEN_CHANNEL || "";
const stringSession = "my_session";


const main = async () => {
  // const agent = new Agent(TELEGRAM_BOT_TOKEN);
  // await agent.init();
  // await agent.start();

  const client = new TelegramClient(
    stringSession,
    telegramAppId,
    telegramAppHash,
    {
      connectionRetries: 5,
    }
  );
};

main().catch((error) => {
  console.error("Error initializing runtime:", error);
});
