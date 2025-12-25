import OpenAI from 'openai';
import { aiConfig, aiPrompts } from '../../config/ai';
import {
  IAIService,
  ParsedTransaction,
  ImageRecognitionResult,
  CategorySuggestion,
  defaultParsedTransaction,
  defaultObjectResult,
  defaultReceiptResult,
} from './AIService';

export class DeepSeekAIService implements IAIService {
  private client: OpenAI;
  private textModel: string;
  private visionModel: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: aiConfig.apiKey,
      baseURL: aiConfig.getBaseUrl(),
      timeout: aiConfig.timeout,
    });
    this.textModel = aiConfig.textModel;
    this.visionModel = aiConfig.visionModel;
  }

  async parseTransactionText(text: string): Promise<ParsedTransaction> {
    try {
      console.log('[AI:DeepSeek] Parsing transaction text:', text);
      
      const response = await this.client.chat.completions.create({
        model: this.textModel,
        messages: [
          { role: 'system', content: aiPrompts.transactionParse },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        console.error('[AI:DeepSeek] Empty response from API');
        return defaultParsedTransaction;
      }

      console.log('[AI:DeepSeek] Raw response:', content);
      
      const parsed = this.parseJsonResponse<ParsedTransaction>(content);
      return {
        ...defaultParsedTransaction,
        ...parsed,
      };
    } catch (error) {
      console.error('[AI:DeepSeek] Error parsing transaction text:', error);
      return defaultParsedTransaction;
    }
  }

  async recognizeImage(imageBase64: string, mode: 'object' | 'receipt'): Promise<ImageRecognitionResult> {
    try {
      console.log('[AI:DeepSeek] Recognizing image, mode:', mode);
      
      const prompt = mode === 'object' 
        ? aiPrompts.objectRecognition 
        : aiPrompts.receiptRecognition;

      // DeepSeek may have different vision API format
      // Using the same format as OpenAI for compatibility
      const response = await this.client.chat.completions.create({
        model: this.visionModel,
        messages: [
          { role: 'system', content: prompt },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') 
                    ? imageBase64 
                    : `data:image/jpeg;base64,${imageBase64}`,
                },
              },
              { type: 'text', text: '请识别这张图片' },
            ],
          },
        ],
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        console.error('[AI:DeepSeek] Empty response from API');
        return this.getDefaultImageResult(mode);
      }

      console.log('[AI:DeepSeek] Raw response:', content);

      if (mode === 'object') {
        const parsed = this.parseJsonResponse<Partial<typeof defaultObjectResult>>(content);
        return {
          mode: 'object',
          object: {
            ...defaultObjectResult,
            ...parsed,
          },
        };
      } else {
        const parsed = this.parseJsonResponse<Partial<typeof defaultReceiptResult>>(content);
        return {
          mode: 'receipt',
          receipt: {
            ...defaultReceiptResult,
            ...parsed,
          },
        };
      }
    } catch (error) {
      console.error('[AI:DeepSeek] Error recognizing image:', error);
      return this.getDefaultImageResult(mode);
    }
  }

  async suggestCategories(description: string): Promise<CategorySuggestion[]> {
    try {
      console.log('[AI:DeepSeek] Suggesting categories for:', description);
      
      const response = await this.client.chat.completions.create({
        model: this.textModel,
        messages: [
          { role: 'system', content: aiPrompts.categorySuggestion },
          { role: 'user', content: description },
        ],
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return [{ categoryName: '其他支出', confidence: 0.5 }];
      }

      const parsed = this.parseJsonResponse<{ suggestions: CategorySuggestion[] }>(content);
      return parsed.suggestions || [{ categoryName: '其他支出', confidence: 0.5 }];
    } catch (error) {
      console.error('[AI:DeepSeek] Error suggesting categories:', error);
      return [{ categoryName: '其他支出', confidence: 0.5 }];
    }
  }

  private parseJsonResponse<T>(content: string): T {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(content);
    } catch (error) {
      console.error('[AI:DeepSeek] Error parsing JSON response:', error);
      return {} as T;
    }
  }

  private getDefaultImageResult(mode: 'object' | 'receipt'): ImageRecognitionResult {
    if (mode === 'object') {
      return { mode: 'object', object: defaultObjectResult };
    }
    return { mode: 'receipt', receipt: defaultReceiptResult };
  }
}
