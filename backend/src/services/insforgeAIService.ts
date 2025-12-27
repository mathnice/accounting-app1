import { insforge } from '../config/insforgeDb';

// AI 模型配置
const AI_MODEL = 'openai/gpt-4o';

// 智能记账 - 文字解析系统提示词
const SMART_BOOKING_TEXT_PROMPT = `你是一个智能记账助手，能够从用户的自然语言描述中提取记账信息。

请从用户输入中提取以下信息：
1. 金额（amount）：数字，单位为分（如用户说"50元"，返回5000）
2. 类型（type）：income（收入）或 expense（支出）
3. 分类名称（categoryName）：根据内容推断最合适的分类
4. 备注（note）：交易的简短描述
5. 日期（date）：如果提到日期则提取，格式为 YYYY-MM-DD，否则返回 null

常见支出分类：餐饮、交通、购物、娱乐、医疗、教育、住房、其他支出
常见收入分类：工资、奖金、投资、其他收入

请以 JSON 格式返回，示例：
{"amount": 5000, "type": "expense", "categoryName": "餐饮", "note": "午餐", "date": null, "confidence": 0.9}

注意：
- 如果无法确定金额，amount 返回 null
- confidence 表示你对解析结果的置信度（0-1）
- 只返回 JSON，不要有其他文字`;

// 智能记账 - 图片识别系统提示词
const SMART_BOOKING_IMAGE_PROMPT = `你是一个智能记账助手，能够从小票、账单、发票等图片中提取记账信息。

请仔细分析图片内容，提取以下信息：
1. 金额（amount）：总金额，单位为分（如50.00元返回5000）
2. 类型（type）：通常为 expense（支出），除非明确是收入
3. 分类名称（categoryName）：根据商家或商品类型推断
4. 备注（note）：商家名称或主要商品
5. 日期（date）：如果能识别日期，格式为 YYYY-MM-DD
6. 商品明细（items）：如果是小票，提取商品列表

常见支出分类：餐饮、交通、购物、娱乐、医疗、教育、住房、其他支出

请以 JSON 格式返回，示例：
{
  "amount": 5680,
  "type": "expense",
  "categoryName": "餐饮",
  "note": "星巴克咖啡",
  "date": "2025-12-27",
  "items": [{"name": "拿铁", "price": 3800}, {"name": "蛋糕", "price": 1880}],
  "confidence": 0.85
}

注意：
- 如果图片模糊或无法识别，返回 confidence 为 0
- 金额务必转换为分（乘以100）
- 只返回 JSON，不要有其他文字`;

// 系统提示词 - AI 智能客服
const ASSISTANT_SYSTEM_PROMPT = `你是一个记账 App 的专业助手，能帮助用户解答如何记账、分析收支、修改个人设置等问题。

你的职责包括：
1. 解答记账相关问题（如何添加收入/支出、如何分类、如何查看统计等）
2. 提供财务建议（如何省钱、如何规划预算等）
3. 解释 App 功能（账户管理、分类管理、数据导出等）
4. 帮助用户理解他们的消费习惯

请用简洁、友好的语气回答，回答要实用且易于理解。如果用户的问题与记账无关，请礼貌地引导他们回到记账相关话题。`;

// 系统提示词 - AI 记账总结
const SUMMARY_SYSTEM_PROMPT = `你是一个专业的财务分析师，擅长分析个人收支数据并提供有价值的建议。

请根据用户提供的收支数据，生成一份简短但有价值的财务分析报告，包括：
1. 本月总收入和总支出
2. 收支结余情况
3. 最高消费类别分析
4. 消费习惯观察
5. 具体的省钱建议（至少2-3条）

请用友好、鼓励的语气，让用户感到被理解和支持。报告要简洁明了，重点突出。`;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface TransactionData {
  type: 'income' | 'expense';
  amount: number;
  categoryName: string;
  date: string;
  note?: string;
}

export interface MonthlySummaryData {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactions: TransactionData[];
  categoryStats: {
    categoryName: string;
    amount: number;
    count: number;
    percentage: number;
  }[];
}

/**
 * AI 智能客服 - 聊天对话
 */
export const chatWithAssistant = async (
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> => {
  try {
    const messages: ChatMessage[] = [
      { role: 'system', content: ASSISTANT_SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    console.log('[InsForge AI] Sending chat request...');
    
    const completion = await insforge.ai.chat.completions.create({
      model: AI_MODEL,
      messages,
      temperature: 0.7,
      maxTokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || '抱歉，我暂时无法回答这个问题。';
    console.log('[InsForge AI] Chat response received');
    
    return response;
  } catch (error) {
    console.error('[InsForge AI] Chat error:', error);
    throw new Error('AI 服务暂时不可用，请稍后再试');
  }
};

/**
 * AI 记账总结 - 生成月度财务分析
 */
export const generateMonthlySummary = async (
  summaryData: MonthlySummaryData
): Promise<string> => {
  try {
    // 构建数据描述
    const dataDescription = buildDataDescription(summaryData);
    
    const messages: ChatMessage[] = [
      { role: 'system', content: SUMMARY_SYSTEM_PROMPT },
      { role: 'user', content: dataDescription },
    ];

    console.log('[InsForge AI] Generating monthly summary...');
    
    const completion = await insforge.ai.chat.completions.create({
      model: AI_MODEL,
      messages,
      temperature: 0.7,
      maxTokens: 1500,
    });

    const response = completion.choices[0]?.message?.content || '抱歉，无法生成本月总结。';
    console.log('[InsForge AI] Summary generated');
    
    return response;
  } catch (error) {
    console.error('[InsForge AI] Summary error:', error);
    throw new Error('AI 服务暂时不可用，请稍后再试');
  }
};

/**
 * 构建数据描述文本
 */
function buildDataDescription(data: MonthlySummaryData): string {
  const { year, month, totalIncome, totalExpense, balance, categoryStats, transactions } = data;
  
  let description = `请分析以下 ${year}年${month}月 的收支数据：\n\n`;
  
  // 总览
  description += `【收支总览】\n`;
  description += `- 总收入：¥${(totalIncome / 100).toFixed(2)}\n`;
  description += `- 总支出：¥${(totalExpense / 100).toFixed(2)}\n`;
  description += `- 结余：¥${(balance / 100).toFixed(2)}\n\n`;
  
  // 分类统计
  if (categoryStats.length > 0) {
    description += `【支出分类统计】\n`;
    categoryStats
      .filter(c => c.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .forEach((cat, index) => {
        description += `${index + 1}. ${cat.categoryName}：¥${(cat.amount / 100).toFixed(2)} (${cat.percentage.toFixed(1)}%，${cat.count}笔)\n`;
      });
    description += '\n';
  }
  
  // 交易明细（最多显示10条）
  if (transactions.length > 0) {
    description += `【近期交易明细】（共${transactions.length}笔）\n`;
    transactions.slice(0, 10).forEach(tx => {
      const typeLabel = tx.type === 'income' ? '收入' : '支出';
      description += `- ${tx.date} ${typeLabel} ¥${(tx.amount / 100).toFixed(2)} ${tx.categoryName}${tx.note ? ` (${tx.note})` : ''}\n`;
    });
  }
  
  return description;
}


// 智能记账结果接口
export interface SmartBookingResult {
  amount: number | null;
  type: 'income' | 'expense';
  categoryName: string;
  note: string;
  date: string | null;
  items?: Array<{ name: string; price: number }>;
  confidence: number;
}

/**
 * 智能记账 - 从文字描述中提取记账信息
 */
export const parseTextForBooking = async (text: string): Promise<SmartBookingResult> => {
  try {
    console.log('[InsForge AI] Parsing text for smart booking:', text.substring(0, 50));
    
    const completion = await insforge.ai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: SMART_BOOKING_TEXT_PROMPT },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
      maxTokens: 500,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    console.log('[InsForge AI] Text parsing response:', responseText);
    
    // 提取 JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        amount: result.amount,
        type: result.type || 'expense',
        categoryName: result.categoryName || '其他支出',
        note: result.note || '',
        date: result.date || null,
        confidence: result.confidence || 0.5,
      };
    }
    
    throw new Error('无法解析 AI 响应');
  } catch (error) {
    console.error('[InsForge AI] Text parsing error:', error);
    return {
      amount: null,
      type: 'expense',
      categoryName: '其他支出',
      note: text,
      date: null,
      confidence: 0,
    };
  }
};

/**
 * 智能记账 - 从图片中提取记账信息
 */
export const parseImageForBooking = async (imageBase64: string): Promise<SmartBookingResult> => {
  try {
    console.log('[InsForge AI] Parsing image for smart booking');
    
    // 确保图片格式正确
    let imageUrl = imageBase64;
    if (!imageBase64.startsWith('data:')) {
      imageUrl = `data:image/jpeg;base64,${imageBase64}`;
    }
    
    const completion = await insforge.ai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: SMART_BOOKING_IMAGE_PROMPT },
        { 
          role: 'user', 
          content: [
            { type: 'text', text: '请分析这张图片并提取记账信息' },
            { type: 'image_url', image_url: { url: imageUrl } },
          ] as any,
        },
      ],
      temperature: 0.3,
      maxTokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    console.log('[InsForge AI] Image parsing response:', responseText);
    
    // 提取 JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        amount: result.amount,
        type: result.type || 'expense',
        categoryName: result.categoryName || '其他支出',
        note: result.note || '',
        date: result.date || null,
        items: result.items,
        confidence: result.confidence || 0.5,
      };
    }
    
    throw new Error('无法解析 AI 响应');
  } catch (error) {
    console.error('[InsForge AI] Image parsing error:', error);
    return {
      amount: null,
      type: 'expense',
      categoryName: '其他支出',
      note: '图片识别失败',
      date: null,
      confidence: 0,
    };
  }
};
