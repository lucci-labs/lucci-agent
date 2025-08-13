import { XClient } from "../x";

const main = async () => {
  const xClient = new XClient();
  await xClient.init();
  await xClient.getReplies()
};

main()
