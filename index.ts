import { Scraper } from "agent-twitter-client";
import { generateTweet } from "./agent";
import { Api, client, TelegramClient } from "telegram";
import { NewMessage } from "telegram/events";
// @ts-ignore
import input from "input";
import { cookies } from "./cookies";

const telegramAppId = Number(process.env.TELEGRAM_APP_ID) || 0;
const telegramAppHash = process.env.TELEGRAM_APP_HASH || "";
const listenToChannel = process.env.TELEGRAM_LISTEN_CHANNEL || "";
const stringSession = "my_session";

const username = process.env.TWITTER_USERNAME || "";
const password = process.env.TWITTER_PASSWORD || "";
const email = process.env.TWITTER_EMAIL || "";
const twoFaceSecret = process.env.TWITTER_2FA_SECRET || "";

const scraper = new Scraper();

const handleMessage = async (event: NewMessage) => {
  // @ts-ignore
  const message = event.message;
  const fromChannelId = message.peerId.channelId.toString();
  if (fromChannelId != listenToChannel) {
    return;
  }
  const link = message.media?.webpage?.url || "";
  const generatedTweet = await generateTweet(message.message);
  if (link) {
    await scraper.sendTweet(generatedTweet + "\n" + link);
  } else {
    await scraper.sendTweet(generatedTweet);
  }
};

const getChannelId = async (client: TelegramClient, channelName: string): Promise<any> => {
  const channel = await client.getEntity(channelName);
  const targetChannelId = (channel as Api.Channel).id;
  return targetChannelId.toString()
}

const main = async () => {
  // await scraper.setCookies(cookies as any);
  console.log("Logged in to Twitter");
  const client = new TelegramClient(
    stringSession,
    telegramAppId,
    telegramAppHash,
    {
      connectionRetries: 5,
    }
  );

  await client.start({
    phoneNumber: async () => await input.text("Input phone number: "),
    password: async () => await input.text("Input 2fa: "),
    phoneCode: async () => await input.text("Input Telegram code: "),
    onError: (err) => console.log(err),
  });
  console.log("Logged in to Telegram");
  // console.log(await getChannelId(client, "CoinDeskGlobal"))

  client.addEventHandler(handleMessage, new NewMessage({}));
};

main();
