import { Request, Response } from 'express';
import { insforge } from '../config/insforgeDb';
import { generateCode, storeCode, verifyCode, canSendCode } from '../services/verificationService';
import { sendVerificationEmail } from '../services/emailService';

// 获取用户统计数据
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '请先登录' },
      });
    }

    // 获取所有交易记录
    const { data: transactions } = await insforge.database
      .from('transactions')
      .select('date')
      .eq('user_id', userId);

    // 获取账户数量
    const { data: accounts } = await insforge.database
      .from('accounts')
      .select('id')
      .eq('user_id', userId);

    // 计算记账天数（唯一日期数）
    const uniqueDates = new Set((transactions || []).map((t: any) => t.date));
    const recordingDays = uniqueDates.size;

    // 交易笔数
    const transactionCount = (transactions || []).length;

    // 账户数量
    const accountCount = (accounts || []).length;

    // 首次记账日期
    let firstRecordDate: string | null = null;
    if (transactions && transactions.length > 0) {
      const dates = transactions.map((t: any) => t.date).sort();
      firstRecordDate = dates[0];
    }

    return res.json({
      success: true,
      data: {
        recordingDays,
        transactionCount,
        accountCount,
        firstRecordDate,
      },
    });
  } catch (error: any) {
    console.error('[Profile Controller] Get stats error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message || '获取统计数据失败' },
    });
  }
};

// 上传用户头像 - 已弃用，头像现在保存在本地设备
export const uploadAvatar = async (req: Request, res: Response) => {
  return res.status(400).json({
    success: false,
    error: { code: 'DEPRECATED', message: '头像功能已改为本地存储，无需上传' },
  });
};

// 请求密码修改验证码
export const requestPasswordOTP = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userEmail = req.user?.email;

    if (!userId || !userEmail) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '请先登录' },
      });
    }

    console.log(`[Profile Controller] Requesting password OTP for user ${userEmail}`);

    // 检查是否可以发送验证码
    const { canSend, waitSeconds } = canSendCode(`pwd_${userEmail}`);
    if (!canSend) {
      return res.status(429).json({
        success: false,
        error: { code: 'TOO_FREQUENT', message: `请${waitSeconds}秒后再试` },
      });
    }

    // 生成验证码
    const code = generateCode();
    
    // 存储验证码（使用 pwd_ 前缀区分密码修改验证码）
    storeCode(`pwd_${userEmail}`, code);

    // 发送验证码邮件
    const result = await sendVerificationEmail(userEmail, code);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: { code: 'EMAIL_ERROR', message: result.message || '发送验证码失败' },
      });
    }

    return res.json({
      success: true,
      data: {
        message: '验证码已发送到您的邮箱',
        expiresIn: 300, // 5分钟有效期
      },
    });
  } catch (error: any) {
    console.error('[Profile Controller] Request OTP error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message || '发送验证码失败' },
    });
  }
};

// 修改密码
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userEmail = req.user?.email;
    const { otp, newPassword } = req.body;

    if (!userId || !userEmail) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '请先登录' },
      });
    }

    if (!otp || typeof otp !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: '请输入验证码' },
      });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: '密码长度至少8位' },
      });
    }

    console.log(`[Profile Controller] Changing password for user ${userEmail}`);

    // 验证验证码
    const verifyResult = verifyCode(`pwd_${userEmail}`, otp);
    if (!verifyResult.valid) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_OTP', message: verifyResult.message },
      });
    }

    // 使用 InsForge Auth API 更新密码
    // 注意：这需要 InsForge 支持管理员 API 来更新用户密码
    // 如果 InsForge 不支持，我们需要使用其他方式
    try {
      const response = await fetch(`${process.env.INSFORGE_BASE_URL || 'https://y758dmj4.us-east.insforge.app'}/api/auth/users/${userId}/password`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.INSFORGE_ADMIN_KEY || process.env.INSFORGE_ANON_KEY}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!response.ok) {
        // 如果 InsForge 不支持此 API，返回提示信息
        console.log('[Profile Controller] InsForge password update API not available');
        return res.status(400).json({
          success: false,
          error: { code: 'PASSWORD_ERROR', message: '密码修改功能暂不可用，请联系管理员' },
        });
      }
    } catch (apiError) {
      console.error('[Profile Controller] InsForge API error:', apiError);
      return res.status(400).json({
        success: false,
        error: { code: 'PASSWORD_ERROR', message: '密码修改功能暂不可用' },
      });
    }

    return res.json({
      success: true,
      data: {
        message: '密码修改成功',
      },
    });
  } catch (error: any) {
    console.error('[Profile Controller] Change password error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message || '密码修改失败' },
    });
  }
};

// 导出交易数据
export const exportTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '请先登录' },
      });
    }

    console.log(`[Profile Controller] Exporting transactions for user ${userId}`);

    // 获取所有交易记录
    const { data: transactions } = await insforge.database
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    // 获取分类信息
    const { data: categories } = await insforge.database
      .from('categories')
      .select('*')
      .eq('user_id', userId);

    // 获取账户信息
    const { data: accounts } = await insforge.database
      .from('accounts')
      .select('*')
      .eq('user_id', userId);

    const categoryMap = new Map((categories || []).map((c: any) => [c.id, c.name]));
    const accountMap = new Map((accounts || []).map((a: any) => [a.id, a.name]));

    if (!transactions || transactions.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_DATA', message: '暂无交易记录可导出' },
      });
    }

    // 生成 CSV
    const headers = ['日期', '类型', '金额', '分类', '账户', '备注'];
    const rows = transactions.map((tx: any) => {
      const type = tx.type === 'income' ? '收入' : '支出';
      const amount = (tx.amount / 100).toFixed(2);
      const category = categoryMap.get(tx.category_id) || '未分类';
      const account = accountMap.get(tx.account_id) || '未知账户';
      const note = (tx.note || '').replace(/,/g, '，'); // 替换逗号避免 CSV 问题
      return [tx.date, type, amount, category, account, note].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;

    return res.json({
      success: true,
      data: {
        csv,
        filename,
        count: transactions.length,
      },
    });
  } catch (error: any) {
    console.error('[Profile Controller] Export error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message || '导出失败' },
    });
  }
};
