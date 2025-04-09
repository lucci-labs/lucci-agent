import { Scraper } from "agent-twitter-client";
import { generateTweet } from "./agent";
import cache from "./cache";

const username = process.env.TWITTER_USERNAME || "";
const password = process.env.TWITTER_PASSWORD || "";
const email = process.env.TWITTER_EMAIL || "";
const twoFaceSecret = process.env.TWITTER_2FA_SECRET || "";

const getRandomDelay = () => {
  const min = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  const max = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const sleep = () => {
  const ms = getRandomDelay();
  console.log(
    `Waiting for ${ms / (60 * 60 * 1000)} hours before the next tweet...`
  );
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const main = async () => {
  try {
    const scraper = new Scraper();
    await cache.open();
    await scraper.login(username, password, email, twoFaceSecret);
    // const cookie = await scraper.getCookies();
    // console.log(cookie);
    // await scraper.setCookies(cookies as any);

    let lastCrawlTweetId;
    try {
      lastCrawlTweetId = await cache.get("lastCrawlTweetId");
    } catch (error) {
      lastCrawlTweetId = null;
    }

    console.log(`Last crawled tweet ID: ${lastCrawlTweetId}`);

    while (true) {
      const res = await scraper.getUserTweets("1852674305517342720", 1);

      const tweet = res.tweets[0];
      if (!tweet) {
        console.log("No tweet found.");
        await sleep();
        continue;
      }
      if (lastCrawlTweetId && tweet.id === lastCrawlTweetId) {
        console.log("No new tweets found.");
        await sleep();
        continue;
      }
      if (!tweet.text) {
        await sleep();
        continue;
      }
      const generatedTweet = await generateTweet(tweet.text);
      const sendTweetRes = await scraper.sendTweet(generatedTweet);
      console.log("Send tweet:", sendTweetRes);
      // await cache.set("lastCrawlTweetId", tweet.id);
      await sleep();
    }
  } catch (error: any) {
    console.error("Error fetching tweets:", error);
  }
};

main();
