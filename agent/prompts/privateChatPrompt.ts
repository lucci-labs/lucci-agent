// private-chat-prompt.ts

export type CommandItem = {
  cmd: string;                    // ví dụ: "/group set"
  desc: string;                   // tác dụng ngắn gọn
  syntax?: string;                // cú pháp chuẩn
  examples?: string[];            // 1-3 ví dụ
  category?: string;              // ví dụ: "Setup", "Rules", "KB"
  aliases?: string[];             // alias như "/g set"
};

function renderCatalog(items: CommandItem[]): string {
  // Gộp theo category (nếu có), ngắn gọn để làm “cheatsheet” cho model
  const byCat = new Map<string, CommandItem[]>();
  for (const it of items) {
    const k = it.category || "General";
    if (!byCat.has(k)) byCat.set(k, []);
    byCat.get(k)!.push(it);
  }
  const blocks: string[] = [];
  for (const [cat, list] of byCat) {
    const lines = list.map(it => {
      const ex = it.examples?.[0] ? `\n  ví dụ: ${it.examples[0]}` : "";
      const syn = it.syntax ? `\n  cú pháp: ${it.syntax}` : "";
      const al = it.aliases?.length ? `\n  alias: ${it.aliases.join(", ")}` : "";
      return `- ${it.cmd}: ${it.desc}${syn}${ex}${al}`;
    }).join("\n");
    blocks.push(`[${cat}]\n${lines}`);
  }
  return blocks.join("\n\n");
}

/**
 * DM assistant cho moderator: chỉ HƯỚNG DẪN dùng lệnh.
 * - Không nhận yêu cầu setup bằng ngôn ngữ tự nhiên.
 * - Nếu user hỏi “làm sao…”, trả lời: “Dùng lệnh …” + đưa cú pháp & ví dụ.
 * - Nếu user gửi /help hoặc /commands: trả về cheatsheet ngắn.
 * - Nếu user gửi "/<cmd>" hoặc "<cmd> help": chỉ show hướng dẫn chi tiết cho lệnh đó.
 * - Nếu không khớp lệnh: gợi ý /commands.
 * - Ngôn ngữ: mặc định VI; nếu message thuần EN → tự trả lời EN.
 * - Trả về PLAIN TEXT, tối đa ~8 dòng.
 */
export const privateChatPrompt = (message: string, commands: CommandItem[]): string => `
<SYSTEM>
You are "Lucci" in private chat with a community moderator.
Your ONLY job: guide how to use bot commands to set up the group.
Do NOT accept or execute natural-language configuration. Never invent commands.
Always reply concisely (≤8 lines), plain text, no JSON.

Language policy:
- Default Vietnamese. If user's message is clearly English-only, answer in English.

Routing:
- If message is "/start" or "/help" or "help": show a short cheatsheet (top 6 commands).
- If message is "/commands": list all commands grouped by category (compact).
- If message looks like "/<cmd>" or ends with "help" for a known command: show that command's purpose, syntax, 1–2 examples, common pitfalls.
- If message asks "how to ..." (natural language): answer with the exact command(s) to use (no freeform setup).
- If unknown: say it's not recognized and suggest "/commands".
</SYSTEM>

<COMMANDS_CATALOG>
${renderCatalog(commands)}
</COMMANDS_CATALOG>

<USER_MESSAGE>
${message}
</USER_MESSAGE>

<STYLE>
- Bullet ngắn, rõ, có cú pháp + 1 ví dụ.
- Trỏ thêm lệnh liên quan (follow-ups) nếu còn bước kế tiếp (ví dụ: /group set → /rules add → /kb add → /sync).
- Không vượt quá 8 dòng trừ khi liệt kê /commands.
</STYLE>
`.trim();
