import express from 'express';
import helmet from 'helmet';
import config from './config';
import { connectDatabase } from './config/database';
import './types/express'; // 导入扩展的 Express 类型
import { corsMiddleware } from './middlewares/cors';
import { loggerMiddleware } from './middlewares/logger';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { insforgeAuthMiddleware } from './middlewares/insforgeAuth';
import routes from './routes';

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS middleware
app.use(corsMiddleware);

// Request logging
app.use(loggerMiddleware);

// Parse JSON request body
app.use(express.json({ limit: '10mb' }));

// Parse URL encoded request body
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// InsForge auth middleware - extract user from token
app.use(insforgeAuthMiddleware);

// API routes
app.use('/api', routes);

// 404 ����
app.use(notFoundHandler);

// ȫ�ִ�����
app.use(errorHandler);

// ����������
const startServer = async () => {
  try {
    // �������ݿ�
    await connectDatabase();
    
    // ����������
    app.listen(config.port, () => {
      console.log(`������������ http://localhost:${config.port}`);
      console.log(`����: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('����������ʧ��:', error);
    process.exit(1);
  }
};

// ����ֱ������ʱ�������������ǲ��Ի�����
if (require.main === module) {
  startServer();
}

export { app, startServer };
