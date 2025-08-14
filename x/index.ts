import { Scraper, SearchMode, type Profile } from "agent-twitter-client";

const cookiePath = "cookies.txt";

interface Reply {
  username: string;
  text: string;
}

export interface Mention {
  id: string;
  text: string;
  username: string;
  parentTweets: Reply[];
}

export class XService {
  scraper: Scraper;
  me: Profile | undefined;

  constructor() {
    this.scraper = new Scraper();
  }

  init = async () => {
    if (await Bun.file(cookiePath).exists()) {
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

      if (!process.env.TWITTER_2FA_SECRET) {
        throw new Error("TWITTER_2FA_SECRET must be set");
      }

      await this.scraper.login(
        process.env.TWITTER_USERNAME,
        process.env.TWITTER_PASSWORD,
        process.env.TWITTER_EMAIL,
        process.env.TWITTER_2FA_SECRET
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

  sendTweet = async (text: string): Promise<Response> => {
    return this.scraper.sendTweet(text);
  };

  replyToTweet = async (tweetId: string, text: string) => {
    const response = await this.scraper.sendTweet(text, tweetId);
    if (response) {
      console.log("Tweet sent successfully");
    } else {
      console.log("Failed to send tweet");
    }
  };

  getTweet = async (tweetId: string) => {
    if (!this.me) {
      throw new Error("Not logged in, must call init() first");
    }
    if (!this.me.username) {
      throw new Error("No username found, must call init() first");
    }
    const tweet = await this.scraper.getTweet(tweetId);
    return tweet;
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
      1,
      SearchMode.Latest
    );

    const mentions: Mention[] = [];

    let tweet = await tweets.next();

    const foundedTweet: string[] = [];
    while (!tweet.done) {
      let tweetData = tweet.value;
      if (tweetData && tweetData.id && !foundedTweet.includes(tweetData.id)) {
        foundedTweet.push(tweetData.id);
        const { text } = tweetData;
        if (tweetData.username != this.me.username) {
          let haveMention = false;
          for (const mention of tweetData.mentions) {
            if (mention.username == this.me.username) {
              haveMention = true;
            }
          }

          if (haveMention) {
            let mention: Mention = {
              username: tweetData.username || "",
              text: text || "",
              id: tweetData.id,
              parentTweets: [],
            };
            let tweet = tweetData;
            while (tweet && tweet.isReply && tweet.inReplyToStatusId) {
              const parentTweet = await this.scraper.getTweet(
                tweet.inReplyToStatusId
              );
              if (parentTweet) {
                mention.parentTweets.push({
                  text: parentTweet.text || "",
                  username: parentTweet.username || "",
                });
                tweet = parentTweet;
                continue;
              }
              break;
            }

            mentions.push(mention);
          }
        }
      }
      tweet = await tweets.next();
    }

    return mentions;
  };
}
