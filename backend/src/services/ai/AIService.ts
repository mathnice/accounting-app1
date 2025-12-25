// AI Service Interface and Types

export interface ParsedTransaction {
  amount: number | null;
  type: 'income' | 'expense';
  categoryName: string;
  note: string;
  confidence: number;
}

export interface ObjectRecognitionResult {
  objectName: string;
  categoryName: string;
  confidence: number;
}

export interface ReceiptRecognitionResult {
  merchantName: string | null;
  amount: number | null;
  date: string | null;
  items: Array<{ name: string; price: number }>;
  categoryName: string;
  confidence: number;
}

export interface ImageRecognitionResult {
  mode: 'object' | 'receipt';
  object?: ObjectRecognitionResult;
  receipt?: ReceiptRecognitionResult;
}

export interface CategorySuggestion {
  categoryName: string;
  confidence: number;
}

// AI Service Interface
export interface IAIService {
  /**
   * Parse natural language text to extract transaction information
   */
  parseTransactionText(text: string): Promise<ParsedTransaction>;
  
  /**
   * Recognize image content (object or receipt)
   */
  recognizeImage(imageBase64: string, mode: 'object' | 'receipt'): Promise<ImageRecognitionResult>;
  
  /**
   * Suggest categories based on description
   */
  suggestCategories(description: string): Promise<CategorySuggestion[]>;
}

// Default/fallback values
export const defaultParsedTransaction: ParsedTransaction = {
  amount: null,
  type: 'expense',
  categoryName: '其他支出',
  note: '',
  confidence: 0,
};

export const defaultObjectResult: ObjectRecognitionResult = {
  objectName: '未知物品',
  categoryName: '其他支出',
  confidence: 0,
};

export const defaultReceiptResult: ReceiptRecognitionResult = {
  merchantName: null,
  amount: null,
  date: null,
  items: [],
  categoryName: '其他支出',
  confidence: 0,
};
