import {
  Scraper,
  SearchMode,
  type Profile,
} from "agent-twitter-client";

const cookiePath = "cookies.txt";

export interface Mention {
  tweetId: string;
  username: string;
  displayname: string;
  tweet: string;
}

export class XClient {
  scraper: Scraper;
  me: Profile | undefined;

  constructor() {
    this.scraper = new Scraper();
  }

  init = async () => {
    if (Bun.file(cookiePath).size > 0) {
      console.log("Loading cookies from file");

      const cookies = await Bun.file(cookiePath).text();
      const cookieArray = cookies.split("\n");
      await this.scraper.setCookies(cookieArray);
    } else {
      console.log("No cookies found, logging in");
      if (!process.env.TWITTER_USERNAME) {
        throw new Error("TWITTER_USERNAME must be set");
      }
      if (!process.env.TWITTER_PASSWORD) {
        throw new Error("TWITTER_PASSWORD must be set");
      }
      if (!process.env.TWITTER_EMAIL) {
        throw new Error("TWITTER_EMAIL must be set");
      }

      if (!process.env.TWITTER_2FA_CODE) {
        throw new Error("TWITTER_2FA_CODE must be set");
      }

      await this.scraper.login(
        process.env.TWITTER_USERNAME,
        process.env.TWITTER_PASSWORD,
        process.env.TWITTER_EMAIL,
        process.env.TWITTER_2FA_CODE
      );

      const cookies = await this.scraper.getCookies();

      await Bun.file(cookiePath).write(cookies.join("\n"));
    }

    const me: Profile | undefined = await this.scraper.me();
    if (!me) {
      throw new Error("Failed to get profile");
    }

    this.me = me;
  };

  replyToTweet = async (tweetId: string, text: string) => {
    if (!this.me) {
      throw new Error("Not logged in, must call init() first");
    }
    if (!this.me.username) {
      throw new Error("No username found, must call init() first");
    }

    const response = await this.scraper.sendTweet(text, tweetId);
    if (response) {
      console.log("Tweet sent successfully");
    } else {
      console.log("Failed to send tweet");
    }
  };

  getMentions = async (): Promise<Mention[]> => {
    if (!this.me) {
      throw new Error("Not logged in, must call init() first");
    }
    if (!this.me.username) {
      throw new Error("No username found, must call init() first");
    }
    const tweets = this.scraper.searchTweets(
      this.me.username,
      20,
      SearchMode.Latest
    );

    const mentions: Mention[] = [];

    let tweet = await tweets.next();

    const foundedTweet: string[] = [];
    while (!tweet.done) {
      const tweetData = tweet.value;
      if (tweetData && tweetData.id && !foundedTweet.includes(tweetData.id)) {
        foundedTweet.push(tweetData.id);
        const { text } = tweetData;
        if (tweetData.username != this.me.username) {
          for (const mention of tweetData.mentions) {
            if (mention.username == this.me.username) {
              mentions.push({
                tweetId: tweetData.id,
                username: tweetData.username || "",
                displayname: tweetData.name || "",
                tweet: text || "",
              });
            }
          }
        }
      }
      tweet = await tweets.next();
    }

    return mentions;
  };
}
