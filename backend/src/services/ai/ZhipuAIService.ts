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

export class ZhipuAIService implements IAIService {
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
      console.log('[AI] Parsing transaction text with ZhipuAI:', text);

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
        console.error('[AI] Empty response from ZhipuAI');
        return defaultParsedTransaction;
      }

      console.log('[AI] Raw response:', content);

      const parsed = this.parseJsonResponse<ParsedTransaction>(content);
      return {
        ...defaultParsedTransaction,
        ...parsed,
      };
    } catch (error) {
      console.error('[AI] Error parsing transaction text with ZhipuAI:', error);
      return defaultParsedTransaction;
    }
  }

  async recognizeImage(imageBase64: string, mode: 'object' | 'receipt'): Promise<ImageRecognitionResult> {
    try {
      console.log('[AI] Recognizing image with ZhipuAI, mode:', mode);

      const prompt = mode === 'object'
        ? aiPrompts.objectRecognition
        : aiPrompts.receiptRecognition;

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
        console.error('[AI] Empty response from ZhipuAI');
        return this.getDefaultImageResult(mode);
      }

      console.log('[AI] Raw response:', content);

      if (mode === 'object') {
        const parsed = this.parseJsonResponse<Partial<typeof defaultObjectResult>>(content);
        return {
          mode: 'object',
          object: { ...defaultObjectResult, ...parsed },
        };
      } else {
        const parsed = this.parseJsonResponse<Partial<typeof defaultReceiptResult>>(content);
        return {
          mode: 'receipt',
          receipt: { ...defaultReceiptResult, ...parsed },
        };
      }
    } catch (error) {
      console.error('[AI] Error recognizing image with ZhipuAI:', error);
      return this.getDefaultImageResult(mode);
    }
  }

  async suggestCategories(description: string): Promise<CategorySuggestion[]> {
    try {
      console.log('[AI] Suggesting categories with ZhipuAI:', description);

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
        console.error('[AI] Empty response from ZhipuAI');
        return [];
      }

      console.log('[AI] Raw response:', content);

      const parsed = this.parseJsonResponse<{suggestions: CategorySuggestion[]}>(content);
      return parsed?.suggestions || [];
    } catch (error) {
      console.error('[AI] Error suggesting categories with ZhipuAI:', error);
      return [];
    }
  }

  private parseJsonResponse<T>(response: string): T | null {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/) || response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as T;
      }
      return JSON.parse(response) as T;
    } catch (error) {
      console.error('[AI] Failed to parse JSON response:', response, error);
      return null;
    }
  }

  private getDefaultImageResult(mode: 'object' | 'receipt'): ImageRecognitionResult {
    if (mode === 'object') {
      return {
        mode: 'object',
        object: defaultObjectResult,
      };
    } else {
      return {
        mode: 'receipt',
        receipt: defaultReceiptResult,
      };
    }
  }
}