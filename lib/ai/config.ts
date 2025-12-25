import { config } from '../config';

// AI Provider types
export type AIProvider = 'doubao' | 'deepseek' | 'zhipu';

// AI Configuration - API KEY is securely accessed from server environment
export const aiConfig = {
  provider: config.ai.provider,
  apiKey: config.ai.apiKey,
  baseUrl: config.ai.baseUrl,
  timeout: config.ai.timeout,

  get textModel(): string {
    return config.ai.models[this.provider].text;
  },

  get visionModel(): string {
    return config.ai.models[this.provider].vision;
  },

  providerUrls: {
    doubao: 'https://ark.cn-beijing.volces.com/api/v3',
    deepseek: 'https://api.deepseek.com/v1',
    zhipu: 'https://open.bigmodel.cn/api/paas/v4',
  },

  getBaseUrl(): string {
    if (config.ai.baseUrl) {
      return config.ai.baseUrl;
    }
    return this.providerUrls[this.provider];
  },
};

export default aiConfig;
