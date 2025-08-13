// ===== Test News Generator =====
import { generateText } from "ai";
import { lucciTweetPrompt } from "../agent/prompts/newsAggegator";
import { google } from "@ai-sdk/google";

export const testNews = async () => {
  const news = [
    { content: `🔥Ae hoàn thành checklist của Soneium nhé

Con hàng L2 của Sony hết badges giờ lại tòi ra cái mới, cơ mà lần này là role Discord + cày free nên ae cứ triển nha.

➡️https://discord.com/invite/soneium

Ae join Discord của Soneium, gắng chat hỗ trợ các thứ nhiều để lên lv3 là sẽ lụm được role "Soneian" nhé!

Hiện tại chỉ mới 15K users có được role này thôi nên vẫn thơm, cố gắng làm sớm để lụm sớm kẻo càng về sau càng khó nha ae🤑

➡️https://soneium.guild.xyz/

Xong xuôi ae join vào Guild trên của Soneium nữa là được, tầm này uptrend rồi cứ cố gắng đấm kèo nhiều tăng cơ hội nhận airdrop thôi😁`, source: "CoinDesk" },
    { content: `Mốc 12/8 lạm phát tháng 7 công bố đã qua và anh em đã vượt qua thành công. Vĩ mô, trong ngắn hạn trong Q3, nói chung là tích cực dành cho các tài sản đầu tư rủi ro.

Các Mốc thời gian tiếp theo trong Q3 cần lưu ý là 

26/8 - Thời gian đưa ra bình luận về đề nghị về thay đổi dự trữ bắt buộc kêt thúc

29/8 - PCE tháng 7, FED thường nhìn vào chỉ số này để đánh giá tình hình lạm phát hơn là nhìn vào CPI

5/9 - Tỷ lệ thất nghiệp tháng 8

Và cuối cùng là FOMC 17/9

Market luôn forward looking. Thị trường tăng hiện tại được dẫn dắt bởi kỳ vọng giảm lãi nhưng có lẽ phần lớn hơn là kỳ vọng vào điểu chỉnh hạ dự trữ bắt buộc.

Kiến thức trong SGK nói cho chúng ta rằng giảm SLR là công cụ để bơm thanh khoản mạnh nhất, mạnh hơn cả giảm lãi suất và nghiệp vụ thị trường mở (mua trái phiếu - bơm thanh khoản, bản trái phiếu - hút thanh khoản). 

Điều đó cũng có nghĩa có xác suất có khả năng sell the news nếu thông tin SLR ra mà không làm thoả mãn thị trường..`, source: "CoinTelegraph" },
    { content: `PETER THIEL ĐẦU TƯ VÀO ETHZILLA, ĐẨY MẠNH TÍCH TRỮ ETH

🔹 Peter Thiel, tỷ phú công nghệ và đồng sáng lập PayPal, vừa mua 7.5% cổ phần của 180 Life Sciences, đây là công ty biotech đã chuyển hướng sang tích trữ Ethereum và đổi tên thành ETHZilla
🔹 Chỉ vài tuần trước, Thiel và quỹ Founders Fund đã mua 9.1% cổ phần của BitMine, công ty do Tom Lee (Fundstrat) làm chủ tịch, hiện nắm hơn 5 tỷ USD ETH và có kế hoạch huy động thêm 20 tỷ USD để mua thêm
🔹 Thiel quan tâm đến Ethereum từ rất sớm, từng tài trợ 100,000 USD cho Vitalik Buterin vào năm 2014 để phát triển giao thức
🔹 Peter Thiel có lịch sử đầu tư sâu vào crypto, từng rót vốn vào sàn Bullish, Bitpanda, Ethereum Layer 2 Layer N và Polymarket.`, source: "DefiLlama" }
  ];
  

  const prompt = lucciTweetPrompt(news, {
    riskAppetite: "medium",
  });

  const { text } = await generateText({
    model: google("gemini-2.0-flash-exp"),
    prompt: prompt,
  });

  console.log(text);
};

// Chạy thử
testNews();
