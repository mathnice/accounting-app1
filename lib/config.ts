// Next.js server-side configuration
// API KEY is stored securely in server-side environment variables

export const config = {
  // JWT config
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // AI Service config - API KEY is securely accessed from environment
  ai: {
    provider: (process.env.AI_PROVIDER || 'deepseek') as 'doubao' | 'deepseek' | 'zhipu',
    apiKey: process.env.AI_API_KEY || '',
    baseUrl: process.env.AI_BASE_URL || '',
    timeout: parseInt(process.env.AI_TIMEOUT || '30000', 10),
    models: {
      doubao: {
        text: process.env.AI_DOUBAO_TEXT_MODEL || 'doubao-pro-32k',
        vision: process.env.AI_DOUBAO_VISION_MODEL || 'doubao-vision-pro-32k',
      },
      deepseek: {
        text: process.env.AI_DEEPSEEK_TEXT_MODEL || 'deepseek-chat',
        vision: process.env.AI_DEEPSEEK_VISION_MODEL || 'deepseek-chat',
      },
      zhipu: {
        text: process.env.AI_ZHIPU_TEXT_MODEL || 'glm-4-plus',
        vision: process.env.AI_ZHIPU_VISION_MODEL || 'glm-4v-plus',
      },
    },
  },

  // Encryption config
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
};

export default config;
