import { aiConfig, AIProvider } from '../../config/ai';
import { IAIService } from './AIService';
import { DoubaoAIService } from './DoubaoAIService';
import { DeepSeekAIService } from './DeepSeekAIService';
import { ZhipuAIService } from './ZhipuAIService';

// Singleton instance
let aiServiceInstance: IAIService | null = null;

/**
 * Factory function to get AI service instance based on configuration
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
      aiServiceInstance = new ZhipuAIService();
      break;
    case 'doubao':
    default:
      aiServiceInstance = new DoubaoAIService();
      break;
  }

  return aiServiceInstance;
}

/**
 * Reset the AI service instance (useful for testing or config changes)
 */
export function resetAIService(): void {
  aiServiceInstance = null;
}

/**
 * Check if AI service is configured
 */
export function isAIServiceConfigured(): boolean {
  return !!aiConfig.apiKey;
}

export default getAIService;
