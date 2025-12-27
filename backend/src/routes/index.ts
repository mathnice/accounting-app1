import { Router } from 'express';
import userRoutes from './userRoutes';
import categoryRoutes from './categoryRoutes';
import accountRoutes from './accountRoutes';
import transactionRoutes from './transactionRoutes';
import statisticsRoutes from './statisticsRoutes';
import syncRoutes from './syncRoutes';
import aiRoutes from './aiRoutes';
import verificationRoutes from './verificationRoutes';
import profileRoutes from './profileRoutes';

const router = Router();

// �������ӿ�
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString()
    }
  });
});

// �û�ģ��·��
router.use('/users', userRoutes);

// ����ģ��·��
router.use('/categories', categoryRoutes);

// �˻�ģ��·��
router.use('/accounts', accountRoutes);

// ���׼�¼ģ��·��
router.use('/transactions', transactionRoutes);

// ͳ��ģ��·��
router.use('/statistics', statisticsRoutes);

// ͬ��ģ��·��
router.use('/sync', syncRoutes);

// AI ģ��·��
router.use('/ai', aiRoutes);

// 验证码模块路由
router.use('/verification', verificationRoutes);

// 个人资料模块路由
router.use('/profile', profileRoutes);

export default router;
