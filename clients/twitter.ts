import { Scraper } from "agent-twitter-client";
const fs = require("fs");

const twitterCookies = "twitter-cookies";

export class TwitterClient {
  scraper: Scraper;

  constructor() {
    this.scraper = new Scraper();
    this.scraper.getCookies
  }

  init = async () => {
    if (fs.existsSync(twitterCookies)) {
      const cookies = fs.readFileSync(twitterCookies, "utf-8");
      await this.scraper.setCookies(cookies);
    } else {
      if (!process.env.TWITTER_USERNAME) {
        throw new Error("env missing: TWITTER_USERNAME is not set");
      }
      if (!process.env.TWITTER_PASSWORD) {
        throw new Error("env missing: TWITTER_PASSWORD is not set");
      }

      await this.scraper.login(process.env.TWITTER_USERNAME, process.env.TWITTER_PASSWORD);
      const cookies = await this.scraper.getCookies();
      fs.writeFileSync(twitterCookies, cookies, "utf-8");
    }
  }
}