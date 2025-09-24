

import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
import { Cage, HarvestedCage, ReportType, AIHealthReport } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-2.5-flash';

let chat: Chat | null = null;

const getChat = (allCages: Cage[], harvestedCages: HarvestedCage[]): Chat => {
    if (chat) {
        return chat;
    }
    const cageSummary = allCages.map(c => ({
        id: c.id,
        currentWeight: c.currentWeight,
        progress: c.progress,
        farmingDays: Math.round((new Date().getTime() - new Date(c.startDate).getTime()) / (1000 * 60 * 60 * 24)),
        totalCost: c.costs.seed + c.costs.feed + c.costs.medicine
    }));
    const harvestedSummary = harvestedCages.map(h => ({
        id: h.id,
        finalWeight: h.finalWeight,
        profit: h.profit,
        revenue: h.revenue,
        totalCost: h.totalCost,
    }));
    
    const systemInstruction = `You are the 'Thịnh Ý AI Advisor', a proactive and comprehensive management assistant for a crab farm. Your responses must be in Vietnamese.
    Use the provided farm data to answer user questions. Be concise, insightful, and helpful.
    IMPORTANT: Format your responses using Markdown. Use tables for comparisons (e.g., top 3 cages), bullet points for lists, and bold text for emphasis. When presenting any monetary values (costs, revenue, profit), always format them using dots as thousand separators and add the 'VND' suffix (e.g., 25.000 VND).
    Current farm data:
    - Active Cages: ${JSON.stringify(cageSummary)}
    - Harvested Cages: ${JSON.stringify(harvestedSummary)}`;
    
    chat = ai.chats.create({
        model,
        config: {
            systemInstruction,
        },
    });
    return chat;
};


export async function* getAIStreamedResponse(query: string, allCages: Cage[], harvestedCages: HarvestedCage[]): AsyncGenerator<string> {
    try {
        const chatInstance = getChat(allCages, harvestedCages);
        const result = await chatInstance.sendMessageStream({ message: query });

        for await (const chunk of result) {
            yield chunk.text;
        }
    } catch (error) {
        console.error("Error getting streamed response from Gemini:", error);
        yield "Xin lỗi, đã có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.";
    }
}


export const getHealthCheckAnalysis = async (cage: Cage): Promise<AIHealthReport> => {
    const prompt = `Phân tích sức khỏe của lồng cua dựa trên dữ liệu sau đây và trả về một đối tượng JSON.
    Dữ liệu:
    - ID Lồng: ${cage.id}
    - Ngày bắt đầu nuôi: ${new Date(cage.startDate).toLocaleDateString('vi-VN')}
    - Trọng lượng ban đầu: ${cage.initialWeight}g
    - Trọng lượng hiện tại: ${cage.currentWeight}g
    - Số cua chết: ${cage.deadCrabCount}
    - Tổng chi phí: ${(cage.costs.seed + cage.costs.feed + cage.costs.medicine).toLocaleString('vi-VN')} VND
    - Lịch sử tăng trưởng gần nhất: ${cage.growthHistory.slice(-5).join(', ')}g
    - Cảnh báo AI có sẵn: ${cage.aiAlert ? 'Có' : 'Không'}

    Hãy tuân thủ nghiêm ngặt schema JSON sau.`;

    const responseSchema: any = {
      type: Type.OBJECT,
      properties: {
        healthStatus: { type: Type.STRING, enum: ['KHỎE MẠNH', 'CẦN CHÚ Ý', 'NGUY CƠ CAO'], description: "Tình trạng sức khỏe tổng quát." },
        statusColor: { type: Type.STRING, enum: ['green', 'yellow', 'red'], description: "Màu tương ứng với trạng thái." },
        summary: { type: Type.STRING, description: "Một câu tóm tắt ngắn gọn tình hình." },
        keyObservations: { 
            type: Type.ARRAY, 
            description: "Liệt kê các quan sát chính, cả tốt và xấu.",
            items: {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING, description: "Nội dung quan sát." },
                    isPositive: { type: Type.BOOLEAN, description: "Quan sát này là tích cực hay tiêu cực." }
                }
            }
        },
        recommendation: { type: Type.STRING, description: "Một đề xuất hành động cụ thể." }
      },
      required: ['healthStatus', 'statusColor', 'summary', 'keyObservations', 'recommendation']
    };

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema,
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error getting structured health check analysis from Gemini:", error);
        // Fallback to a structured error response
        return {
            healthStatus: 'NGUY CƠ CAO',
            statusColor: 'red',
            summary: "Không thể thực hiện phân tích AI.",
            keyObservations: [
                { text: "Đã xảy ra lỗi khi kết nối với máy chủ AI.", isPositive: false },
                { text: "Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.", isPositive: false }
            ],
            recommendation: "Nếu sự cố tiếp diễn, vui lòng liên hệ với bộ phận hỗ trợ kỹ thuật."
        };
    }
};

const getFarmingDays = (startDateString: string): number => {
    const start = new Date(startDateString);
    const diffDays = Math.max(1, Math.floor((new Date().getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    return diffDays;
};

export const getAIReport = async (reportType: ReportType, allCages: Cage[], harvestedCages: HarvestedCage[]): Promise<{title: string, content: string}> => {
    let title = '';
    let prompt = '';

    const cageSummary = allCages.map(c => ({ 
        id: c.id, 
        currentWeight: c.currentWeight, 
        farmingDays: getFarmingDays(c.startDate),
        growthRate: ((c.currentWeight - c.initialWeight) / getFarmingDays(c.startDate)).toFixed(2),
        totalCost: c.costs.seed + c.costs.feed + c.costs.medicine,
        progress: c.progress,
        deadCrabCount: c.deadCrabCount,
    }));

    const harvestedSummary = harvestedCages.map(h => ({
        id: h.id,
        finalWeight: h.finalWeight,
        profit: h.profit,
        revenue: h.revenue,
        totalCost: h.costs.seed + h.costs.feed + h.costs.medicine
    }));

    switch(reportType) {
        case ReportType.Overview:
            title = "Báo cáo Tổng quan";
            const totalActiveCages = allCages.length;
            const totalHarvestedCages = harvestedCages.length;
            const averageWeight = (allCages.reduce((sum, c) => sum + c.currentWeight, 0) / (totalActiveCages || 1)).toFixed(2);
            const totalProfit = harvestedCages.reduce((sum, h) => sum + h.profit, 0);
            const totalActiveCost = allCages.reduce((sum, c) => sum + c.costs.seed + c.costs.feed + c.costs.medicine, 0);
            const cagesWithAIAlerts = allCages.filter(c => c.aiAlert).length;
            const totalDeadCrabs = allCages.reduce((sum, c) => sum + c.deadCrabCount, 0);

            prompt = `Tạo một báo cáo tổng quan chi tiết bằng tiếng Việt về trang trại cua với dữ liệu sau.
            Trình bày kết quả dưới dạng HTML. Bắt đầu bằng một đoạn văn tóm tắt ngắn (2-3 câu) về tình hình chung của trang trại.
            Sau đó, tạo một bảng (sử dụng class của Tailwind CSS: "w-full text-sm text-left text-gray-500", thead với "text-xs text-gray-700 uppercase bg-gray-50", và tbody rows với "bg-white border-b") để hiển thị các chỉ số quan trọng.
            Bảng nên có hai cột: "Chỉ số" và "Giá trị".
            
            Dữ liệu để tạo báo cáo:
            - Tổng số lồng đang nuôi: ${totalActiveCages}
            - Tổng số lồng đã thu hoạch: ${totalHarvestedCages}
            - Trọng lượng trung bình (đang nuôi): ${averageWeight}g
            - Tổng lợi nhuận (đã thu hoạch): ${totalProfit.toLocaleString('vi-VN')} VND
            - Tổng chi phí (đang nuôi): ${totalActiveCost.toLocaleString('vi-VN')} VND
            - Số lồng có cảnh báo AI: ${cagesWithAIAlerts}
            - Tổng số cua chết đã ghi nhận: ${totalDeadCrabs}

            Cuối cùng, dựa trên các số liệu trên, đặc biệt là số cua chết và cảnh báo AI, tạo một div với class "mt-4 p-3 bg-blue-50 rounded-lg" và đưa ra một "Đề xuất AI" ngắn gọn (1-2 câu) với tiêu đề h3 để cải thiện hoạt động. Ví dụ: "Tập trung kiểm tra các lồng có cảnh báo AI hoặc tỷ lệ chết cao để xử lý sớm." hoặc "Hiệu suất tốt, tiếp tục duy trì chế độ chăm sóc hiện tại."
            `;
            break;
        case ReportType.Performance:
            title = "Báo cáo Hiệu suất";
            prompt = `Phân tích hiệu suất tăng trưởng của các lồng cua. Dưới đây là dữ liệu tóm tắt của tất cả các lồng đang nuôi.
            Dữ liệu: ${JSON.stringify(cageSummary)}
            Hãy xác định 3 lồng có tốc độ tăng trưởng (growthRate) cao nhất và 3 lồng thấp nhất.
            Trình bày kết quả dưới dạng HTML với tiêu đề rõ ràng cho mỗi nhóm và một bảng đơn giản (sử dụng class của Tailwind CSS) cho mỗi nhóm, hiển thị ID lồng, trọng lượng hiện tại, tốc độ tăng trưởng (g/ngày) và số cua chết. Cuối cùng, đưa ra một nhận xét ngắn gọn về nguyên nhân có thể gây ra sự khác biệt, có tính đến cả số cua chết.`;
            break;
        case ReportType.HarvestReady:
             title = "Báo cáo Lồng Sẵn sàng Thu hoạch";
             prompt = `Dựa trên dữ liệu lồng cua, xác định các lồng đã sẵn sàng hoặc sắp sẵn sàng để thu hoạch. Mục tiêu thu hoạch là 500g.
             Dữ liệu: ${JSON.stringify(cageSummary)}
             Hãy liệt kê các lồng có tiến độ (progress) từ 90% trở lên.
             Trình bày kết quả dưới dạng HTML, sử dụng bảng (với class của Tailwind CSS) với các cột: ID Lồng, Trọng lượng hiện tại, Tiến độ (%), và một nhận xét ngắn về việc chuẩn bị thu hoạch. Nếu không có lồng nào, hãy thông báo.`;
             break;
        case ReportType.Profit:
            title = "Báo cáo Lợi nhuận";
            prompt = `Phân tích lợi nhuận từ các lồng đã thu hoạch.
            Dữ liệu: ${JSON.stringify(harvestedSummary)}
            Hãy tính tổng doanh thu, tổng chi phí và tổng lợi nhuận.
            Trình bày kết quả dưới dạng HTML. Bắt đầu với các thẻ div hiển thị các con số tổng quan. Sau đó, hiển thị một bảng (sử dụng class của Tailwind CSS) chi tiết từng lồng đã thu hoạch với các cột: ID Lồng, Doanh thu, Chi phí, Lợi nhuận. Cuối cùng, đưa ra một phân tích ngắn gọn về tình hình lợi nhuận.`;
            break;
        case ReportType.Inventory:
            title = "Báo cáo Quản lý Kho (Mô phỏng)";
            prompt = `Tạo một báo cáo mô phỏng về quản lý kho vật tư (thức ăn, thuốc) bằng tiếng Việt.
            Dựa trên tổng chi phí thức ăn và thuốc từ tất cả lồng đang nuôi và đã thu hoạch.
            - Tổng chi phí thức ăn (đang nuôi): ${allCages.reduce((s, c) => s + c.costs.feed, 0).toLocaleString('vi-VN')} VND
            - Tổng chi phí thuốc (đang nuôi): ${allCages.reduce((s, c) => s + c.costs.medicine, 0).toLocaleString('vi-VN')} VND
            Hãy ước tính lượng tiêu thụ và đề xuất kế hoạch nhập kho cho tháng tới. Giả định giá thức ăn là 50,000 VND/kg và thuốc là 200,000 VND/lọ.
            Trình bày dưới dạng HTML với các đề mục rõ ràng.`;
            break;
    }

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        // Basic cleanup to remove markdown backticks if any
        const cleanedContent = response.text.replace(/```html/g, '').replace(/```/g, '');
        return { title, content: cleanedContent };
    } catch (error) {
        console.error(`Error generating report for ${reportType}:`, error);
        return { title, content: `<p class="text-red-500">Đã xảy ra lỗi khi tạo báo cáo. Vui lòng thử lại.</p>` };
    }
};