import { Scraper } from "agent-twitter-client";

export class TwitterClient {
  scraper: Scraper;

  constructor() {
    this.scraper = new Scraper();
  }
}