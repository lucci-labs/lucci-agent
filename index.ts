import { Scraper } from "agent-twitter-client";
import { generateTweet } from "./agent";
import { Api, client, TelegramClient } from "telegram";
import { NewMessage } from "telegram/events";
import axios from "axios";
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

const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN!;
const pageId = process.env.FACEBOOK_PAGE_ID!;

const scraper = new Scraper();

const postTweet = async (message: string) => {
  await scraper.sendTweet(message);
};

export async function postToFacebook(message: string) {
  try {
    const url = `https://graph.facebook.com/${pageId}/feed`;
    await axios.post(url, {
      message,
      access_token: pageAccessToken,
    });
  } catch (err: any) {
    console.error('❌ Error posting to Facebook:', err.response?.data || err.message);
  }
}
const handleMessage = async (event: NewMessage) => {
  // @ts-ignore
  const message = event.message;
  const fromChannelId = message.peerId.channelId.toString();
  if (fromChannelId != listenToChannel) {
    return;
  }
  let link;
  for (const entity of message.entities) {
    if (entity.url) {
      link = entity.url;
      break;
    }
  }
  const generatedTweet = await generateTweet(message.message);
  await postToFacebook(generatedTweet);
  if (link) {
    await postTweet(generatedTweet + "\n" + link);
  } else {
    await postTweet(generatedTweet);
  }
};

const getChannelId = async (client: TelegramClient, channelName: string): Promise<any> => {
  const channel = await client.getEntity(channelName);
  const targetChannelId = (channel as Api.Channel).id;
  return targetChannelId.toString()
}

const main = async () => {
  await scraper.setCookies(cookies as any);
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
