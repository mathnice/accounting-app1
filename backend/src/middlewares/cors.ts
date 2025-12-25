import cors from 'cors';
import config from '../config';

// CORS 中间件配置
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // 允许没有 origin 的请求（如移动端或 Postman）
    if (!origin) {
      return callback(null, true);
    }
    
    // 检查是否在允许列表中
    if (config.corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // 开发环境允许所有来源
    if (config.nodeEnv === 'development') {
      return callback(null, true);
    }
    
    callback(new Error('不允许的跨域请求'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition']
});
