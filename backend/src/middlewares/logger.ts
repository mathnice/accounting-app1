import morgan from 'morgan';
import config from '../config';

// 请求日志中间件
export const loggerMiddleware = morgan(
  config.nodeEnv === 'production' ? 'combined' : 'dev'
);
