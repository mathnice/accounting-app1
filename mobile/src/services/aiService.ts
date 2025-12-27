import api from './api';

// Types
export interface ParsedTransaction {
  amount: number | null;
  type: 'income' | 'expense';
  categoryId: string | null;
  categoryName: string;
  note: string;
  confidence: number;
}

export interface ObjectRecognitionResult {
  objectName: string;
  categoryName: string;
  categoryId: string | null;
  confidence: number;
}

export interface ReceiptRecognitionResult {
  merchantName: string | null;
  amount: number | null;
  date: string | null;
  items: Array<{ name: string; price: number }>;
  categoryName: string;
  categoryId: string | null;
  confidence: number;
}

export interface ImageRecognitionResult {
  mode: 'object' | 'receipt';
  categoryId: string | null;
  object?: ObjectRecognitionResult;
  receipt?: ReceiptRecognitionResult;
}

export interface CategorySuggestion {
  categoryName: string;
  categoryId: string | null;
  confidence: number;
}

// Parse speech text to transaction
export const parseSpeechText = async (text: string): Promise<{ data: ParsedTransaction }> => {
  return api.post('/ai/speech', { text });
};

// Recognize image (object or receipt)
export const recognizeImage = async (
  imageBase64: string,
  mode: 'object' | 'receipt'
): Promise<{ data: ImageRecognitionResult }> => {
  return api.post('/ai/image', { image: imageBase64, mode });
};

// Suggest categories based on description
export const suggestCategories = async (
  description: string
): Promise<{ data: { suggestions: CategorySuggestion[] } }> => {
  return api.post('/ai/categories', { description });
};


// AI 智能客服聊天
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: string;
}

export const chatWithAI = async (
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

export const getMonthlySummary = async (
  year?: number,
  month?: number
): Promise<{ data: MonthlySummaryResponse }> => {
  const params: any = {};
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
export const smartBookingText = async (
  text: string
): Promise<{ data: SmartBookingResult }> => {
  return api.post('/ai/smart-booking/text', { text });
};

// 智能记账 - 图片识别
export const smartBookingImage = async (
  imageBase64: string
): Promise<{ data: SmartBookingResult }> => {
  return api.post('/ai/smart-booking/image', { image: imageBase64 });
};
