import { Router } from 'express';
import * as syncController from '../controllers/syncController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// 所有接口都需要认证
router.use(authMiddleware);

// 推送本地变更
router.post('/push', syncController.pushChanges);

// 拉取服务端变更
router.get('/pull', syncController.pullChanges);

// 创建备份
router.post('/backup', syncController.createBackup);

// 恢复备份
router.post('/restore', syncController.restoreBackup);

export default router;
