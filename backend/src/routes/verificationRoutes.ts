// 验证码路由
import { Router } from 'express';
import { sendCode, checkCode } from '../controllers/verificationController';

const router = Router();

// 发送验证码
router.post('/send', sendCode);

// 验证验证码
router.post('/verify', checkCode);

export default router;
