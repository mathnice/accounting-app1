import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server config
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JWT config
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // CORS config
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  
  // SMTP config for email
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  
  // Encryption config
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
  
  // AI Service config
  ai: {
    provider: (process.env.AI_PROVIDER || 'doubao') as 'doubao' | 'deepseek' | 'zhipu',
    apiKey: process.env.AI_API_KEY || '',
    baseUrl: process.env.AI_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3',
    timeout: parseInt(process.env.AI_TIMEOUT || '30000', 10),
    // Model names
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
};

export default config;
