import { Scraper } from "agent-twitter-client";

const twitterCookies = "twitter-cookies";

export class TwitterClient {
  scraper: Scraper;

  constructor() {
    this.scraper = new Scraper();
    this.scraper.getCookies
  }
}