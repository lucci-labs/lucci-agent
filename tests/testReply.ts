import { generateText } from "ai";
import { replyPrompt } from "../agent/prompts/reply";
import { google } from "@ai-sdk/google";

const main = async () => {
  const tweetBase = `OKX nâng cấp X Layer. Đốt 65,256,712.097 $OKB.
Tổng cung $OKB cố định ở 21 triệu. OKTChain ngừng hoạt động, OKT đổi thành OKB. Giá $OKB đạt đỉnh $134 rồi giảm. #crypto #exchange`
  const comment = `BNB đã tăng, OKX đã tăng, Liệu MNT có thể là tiếp theo.`;
  const prompt = replyPrompt(tweetBase, comment);

  const { text } = await generateText({
    model: google("gemini-2.0-flash-exp"),
    prompt: prompt,
  });

  console.log(text);
}

main()