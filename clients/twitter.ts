import { Scraper } from "agent-twitter-client";

const twitterCookies = "twitter-cookies";

export class TwitterClient {
  scraper: Scraper;

  constructor() {
    this.scraper = new Scraper();
    this.scraper.getCookies;
  }

  init = async () => {
    if (await Bun.file(twitterCookies).exists()) {
      const cookies = await Bun.file(twitterCookies).text();
      await this.scraper.setCookies(cookies as any);
    } else {
      if (!process.env.TWITTER_USERNAME) {
        throw new Error("env missing: TWITTER_USERNAME is not set");
      }
      if (!process.env.TWITTER_PASSWORD) {
        throw new Error("env missing: TWITTER_PASSWORD is not set");
      }

      await this.scraper.login(
        process.env.TWITTER_USERNAME,
        process.env.TWITTER_PASSWORD,
        process.env.TWITTER_EMAIL,
        process.env.TWITTER_2FA_SECRET,
      );
      const cookies = await this.scraper.getCookies();
      await Bun.file(twitterCookies).write(cookies as any);
    }
  };
}
