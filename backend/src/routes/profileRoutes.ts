import { Router } from 'express';
import { getUserStats, uploadAvatar, requestPasswordOTP, changePassword, exportTransactions } from '../controllers/profileController';
import { requireAuth } from '../middlewares/insforgeAuth';

const router = Router();

// All profile routes require authentication
router.use(requireAuth);

// GET /api/profile/stats - 获取用户统计数据
router.get('/stats', getUserStats);

// POST /api/profile/avatar - 上传用户头像
router.post('/avatar', uploadAvatar);

// POST /api/profile/password/request-otp - 请求密码修改验证码
router.post('/password/request-otp', requestPasswordOTP);

// POST /api/profile/password/change - 修改密码
router.post('/password/change', changePassword);

// GET /api/profile/export - 导出交易数据
router.get('/export', exportTransactions);

export default router;
