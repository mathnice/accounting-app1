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
