// 验证码控制器
import { Request, Response } from 'express';
import { generateCode, storeCode, verifyCode, canSendCode } from '../services/verificationService';
import { sendVerificationEmail } from '../services/emailService';

// 发送验证码
export const sendCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: '请输入有效的邮箱地址',
      });
    }

    // 检查是否可以发送
    const { canSend, waitSeconds } = canSendCode(email);
    if (!canSend) {
      return res.status(429).json({
        success: false,
        message: `请${waitSeconds}秒后再试`,
        waitSeconds,
      });
    }

    // 生成验证码
    const code = generateCode();

    // 存储验证码
    storeCode(email, code);

    // 发送邮件
    const result = await sendVerificationEmail(email, code);

    if (result.success) {
      return res.json({
        success: true,
        message: '验证码已发送，请查收邮件',
      });
    } else {
      return res.status(500).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error('发送验证码错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，请稍后重试',
    });
  }
};

// 验证验证码
export const checkCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: '请提供邮箱和验证码',
      });
    }

    const result = verifyCode(email, code);

    if (result.valid) {
      return res.json({
        success: true,
        message: '验证成功',
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error('验证验证码错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，请稍后重试',
    });
  }
};
