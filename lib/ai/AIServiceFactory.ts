import { aiConfig, AIProvider } from './config';
import { IAIService } from './AIService';
import { DeepSeekAIService } from './DeepSeekAIService';

// Singleton instance
let aiServiceInstance: IAIService | null = null;

/**
 * Factory function to get AI service instance based on configuration
 * API KEY is securely accessed from server environment variables
 */
export function getAIService(): IAIService {
  if (aiServiceInstance) {
    return aiServiceInstance;
  }

  const provider = aiConfig.provider as AIProvider;

  console.log(`[AI] Initializing AI service with provider: ${provider}`);

  switch (provider) {
    case 'deepseek':
      aiServiceInstance = new DeepSeekAIService();
      break;
    case 'zhipu':
    case 'doubao':
    default:
      // Default to DeepSeek for simplicity
      aiServiceInstance = new DeepSeekAIService();
      break;
  }

  return aiServiceInstance;
}

/**
 * Check if AI service is configured
 */
export function isAIServiceConfigured(): boolean {
  return !!aiConfig.apiKey;
}

export default getAIService;
