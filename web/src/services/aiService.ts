import api from './api';

// AI 智能客服聊天
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: string;
}

export const chatWithAI = (
  message: string,
  history: ChatMessage[] = []
): Promise<{ data: ChatResponse }> => {
  return api.post('/ai/chat', { message, history });
};

// AI 记账月度总结
export interface CategoryStat {
  categoryName: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface MonthlySummaryStats {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  topCategories?: CategoryStat[];
}

export interface MonthlySummaryResponse {
  summary: string;
  stats: MonthlySummaryStats;
}

export const getMonthlySummary = (
  year?: number,
  month?: number
): Promise<{ data: MonthlySummaryResponse }> => {
  const params: Record<string, number> = {};
  if (year) params.year = year;
  if (month) params.month = month;
  return api.get('/ai/summary', { params });
};

// 智能记账结果
export interface SmartBookingResult {
  amount: number | null;
  type: 'income' | 'expense';
  categoryName: string;
  categoryId: string | null;
  accountId: string | null;
  note: string;
  date: string | null;
  items?: Array<{ name: string; price: number }>;
  confidence: number;
}

// 智能记账 - 文字输入
export const smartBookingText = (
  text: string
): Promise<{ data: SmartBookingResult }> => {
  return api.post('/ai/smart-booking/text', { text });
};

// 智能记账 - 图片识别
export const smartBookingImage = (
  imageBase64: string
): Promise<{ data: SmartBookingResult }> => {
  return api.post('/ai/smart-booking/image', { image: imageBase64 });
};
