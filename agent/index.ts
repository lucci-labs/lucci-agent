import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import TelegramBot from "node-telegram-bot-api";
import { privateChatPrompt, type CommandItem } from "./prompts/privateChatPrompt";
import { cmPrompt, type CmParams } from "./prompts/cmPrompt";

export const commands: CommandItem[] = [
  {
    cmd: "/setup",
    desc: "Khởi chạy wizard 6 bước (group → bio → rules → kb → style → sync)",
    examples: ["/setup"],
    category: "Setup"
  },
  {
    cmd: "/group set",
    desc: "Cập nhật tên/audience/goal cho group",
    syntax: `/group set name="Lucci Labs" audience="builders" goal="support"`,
    examples: [`/group set name="Lucci Labs" audience="builders" goal="support"`],
    category: "Setup",
    aliases: ["/g set"]
  },
  {
    cmd: "/rules add",
    desc: "Thêm rule",
    syntax: `/rules add "No spam/pump"`,
    examples: [`/rules add "No spam/pump"`],
    category: "Rules"
  },
  {
    cmd: "/rules list",
    desc: "Xem danh sách rule",
    examples: ["/rules list"],
    category: "Rules"
  },
  {
    cmd: "/kb add",
    desc: "Thêm mục kiến thức (FAQ)",
    syntax: `/kb add faq-ama "AMA Thứ Tư 20:00" https://calendar.lucci.example`,
    examples: [`/kb add faq-submit "Form: https://app.lucci.example/form"`],
    category: "Knowledge"
  },
  {
    cmd: "/kb list",
    desc: "Xem danh sách KB",
    examples: ["/kb list"],
    category: "Knowledge"
  },
  {
    cmd: "/style set",
    desc: "Đặt style trả lời",
    syntax: `/style set language=vi tone=casual emojis=false length=short`,
    examples: [`/style set language=vi tone=neutral emojis=true`],
    category: "Style"
  },
  {
    cmd: "/sync",
    desc: "Đồng bộ cấu hình vào agent",
    examples: ["/sync"],
    category: "Admin"
  }
];

export const lucciLabsParams: CmParams = {
  message: "",
  admins: ["@admin"],
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

export class Agent {
  private readonly bot: TelegramBot;
  constructor(botToken: string) {
    this.bot = new TelegramBot(botToken);

    this.bot.on("message", this.onMessage.bind(this));
  }

  isGroupMessage(msg: TelegramBot.Message): boolean {
    return msg.chat.type === "group" || msg.chat.type === "supergroup";
  }

  async sendMessage(
    chatId: number,
    message: string,
    inlineKeyboard: any = [],
    force_reply: boolean = false
  ): Promise<any> {
    return await this.bot.sendMessage(chatId, message, {
      parse_mode: "Markdown",
      disable_web_page_preview: true,
      protect_content: true,
      reply_markup: {
        force_reply,
        inline_keyboard: inlineKeyboard,
      },
    });
  }

  async generateResponse(instruction: string): Promise<string> {
    try {
      const { text } = await generateText({
        model: google("gemini-2.0-flash-lite"),
        prompt: instruction,
      });

      return text;
    } catch (error) {
      console.error("Error generating response:", error);
      throw error;
    }
  }

  async init() {}

  async start() {
    try {
      console.log("Bot is running...");
      await this.bot.startPolling();
    } catch (error) {
      console.error("Error starting bot:", error);
    }
  }

  async onMessage(msg: TelegramBot.Message) {
    try {
      if (this.isGroupMessage(msg)) {
        console.log("Ignoring group message.");
        return;
      }
      lucciLabsParams.message = msg.text || "";
      lucciLabsParams.sender = msg.from?.username || "unknown";
      console.log(cmPrompt(lucciLabsParams).length, "chars");
      const response = await this.generateResponse(cmPrompt(lucciLabsParams));
      await this.sendMessage(
        msg.chat.id,
        response
      );
    } catch (error) {
      console.error("Error handling message:", error);
    }
  }
}
