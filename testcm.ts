// test-cm.ts
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { CmPrompt, type CmParams } from "./agent/prompts/cmPrompt"; // prompt đã tạo

export const lucciLabsParams: CmParams = {
  message: "",
  groupInfo:
    "Group: Lucci Labs (official builders' hub). Audience: Lucci NFT holders, builders tạo AI community agents. Goal: support, product feedback, governance, showcase.",
  groupBio:
    "Direct, honest, confident; builder-first; bilingual VI/EN (default VI); meme-lite; ngắn gọn, zero-fluff.",
  groupRules: [
    "- Cấm shill/pump coin, cấm DM xin tiền/seed phrase.",
    "- Tôn trọng nhau; no hate/harassment/NSFW.",
    "- Câu hỏi support: đính kèm log/screenshot, follow template.",
    "- Dùng prefix: [Support] / [Idea] / [Bug] / [Gov] / [Showcase].",
    "- English/Vietnamese OK; tránh voice note; giữ on-topic.",
    "- Vi phạm nặng → escalate/mute; xem pinned để biết chi tiết."
  ].join("\n"),
  groupKnowledge: [
    "[kb-nft-rights] 1 Lucci NFT = 1 Agent Seat. Chuyển NFT → seat bị thu hồi sau 24h grace.",
    "[kb-create-agent] Tạo agent: Dashboard https://app.lucci.example → Connect wallet → Create Agent → chọn persona → lấy Agent Key.",
    "[kb-add-to-group] Thêm @LucciCMbot vào Telegram group (Admin: đọc/xoá/pin, chặn spam). Trong Dashboard → Link Group → dán group_id hoặc invite link.",
    "[kb-setup] Setup context: nhập Group Info/Bio/Rules/Knowledge trong Dashboard → bấm Sync hoặc chat /sync trong group.",
    "[kb-commands] /rules · /kb <id> · /sync · /status · /mod escalate · /mod ban <user_id> <reason>",
    "[kb-governance] Governance: Snapshot https://vote.lucci.example (1 NFT = 1 vote), quorum 10%, đề xuất mở thứ Hai hàng tuần.",
    "[kb-ama] AMA hàng tuần: Thứ Tư 20:00 (ICT). Lịch: https://calendar.lucci.example",
    "[kb-pricing] Giai đoạn early: miễn phí cho NFT holders; seat thêm cần NFT bổ sung hoặc sub.",
    "[kb-support] Support: #support thread trong group hoặc email support@lucci.example.",
    "[kb-privacy] Chat có thể được lưu để improve agent; gõ /privacy để opt-out logging của bạn."
  ].join("\n"),
  pinnedNotes: [
    "Start here → Docs: https://docs.lucci.example",
    "Dashboard: https://app.lucci.example  · Vote: https://vote.lucci.example",
    "Quickstart thread: t.me/c/lucci/123",
    "Mod on-duty: @mod_lucci · Escalation: /mod escalate",
    "AMA: Thứ Tư 20:00 (ICT) · Lịch: https://calendar.lucci.example"
  ].join(" | "),
  messageHistory: [
    "UserA: Lucci có tự xoá spam không?",
    "Mod: Có, nếu vi phạm rules (pump/scam) bot sẽ flag và xoá; cần cấp quyền admin.",
    "UserB: Mua NFT rồi thì tạo agent thế nào?",
    "Mod: Vào Dashboard → Create Agent → lấy Agent Key → add @LucciCMbot vào group → /sync.",
    "UserC: AMA tối nay có k?",
    "Mod: Có. Thứ Tư 20:00 (ICT). Xem [kb-ama].",
    "UserD: Can I set English-only replies?",
    "Mod: Yes, set language policy in Dashboard > Agent > Style, or /sync after set."
  ].join("\n"),
  now: new Date().toISOString()
};

export async function testCmPrompt() {
  lucciLabsParams.message = "Làm thế nào để setup Lucci?";
  const { text } = await generateText({
    model: google("gemini-2.0-flash-exp"),
    prompt: CmPrompt(lucciLabsParams),
  });

  console.log("RAW MODEL OUTPUT:\n", text);
  try {
    const json = JSON.parse(text);
    console.log("\nParsed:");
    console.log(" action:", json.action);
    console.log(" reason:", json.reason);
    if (json.reply) console.log(" reply:", json.reply);
  } catch (e) {
    console.error("\n⚠️ Output không phải JSON hợp lệ:", e);
  }
}

testCmPrompt().catch((err) => {
  console.error("Error testing CM prompt:", err);
});