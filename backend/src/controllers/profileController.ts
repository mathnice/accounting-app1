import { Request, Response } from 'express';
import { insforge } from '../config/insforgeDb';

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

// 上传用户头像
export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { image } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '请先登录' },
      });
    }

    if (!image || typeof image !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: '请上传图片' },
      });
    }

    console.log(`[Profile Controller] Uploading avatar for user ${userId}`);

    // 将 base64 转换为 Buffer
    let imageBuffer: Buffer;
    let contentType = 'image/jpeg';
    
    if (image.startsWith('data:')) {
      const matches = image.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        contentType = matches[1];
        imageBuffer = Buffer.from(matches[2], 'base64');
      } else {
        imageBuffer = Buffer.from(image, 'base64');
      }
    } else {
      imageBuffer = Buffer.from(image, 'base64');
    }

    // 生成文件名
    const extension = contentType.split('/')[1] || 'jpg';
    const fileName = `avatars/${userId}_${Date.now()}.${extension}`;

    // 创建 Blob 对象用于上传 - 使用 Uint8Array 来避免类型问题
    const uint8Array = new Uint8Array(imageBuffer);
    const blob = new Blob([uint8Array], { type: contentType });

    // 上传到 InsForge Storage
    const { data: uploadData, error: uploadError } = await insforge.storage
      .from('user-avatars')
      .upload(fileName, blob);

    if (uploadError) {
      console.error('[Profile Controller] Upload error:', uploadError);
      return res.status(500).json({
        success: false,
        error: { code: 'UPLOAD_ERROR', message: '头像上传失败' },
      });
    }

    // 从上传结果获取 URL
    const avatarUrl = uploadData?.url || '';

    console.log(`[Profile Controller] Avatar uploaded: ${avatarUrl}`);

    return res.json({
      success: true,
      data: {
        avatarUrl,
      },
    });
  } catch (error: any) {
    console.error('[Profile Controller] Upload avatar error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message || '头像上传失败' },
    });
  }
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

    // 使用 InsForge Auth 发送密码重置邮件
    // InsForge 会自动发送包含 OTP 的邮件
    const response = await fetch(`${process.env.INSFORGE_BASE_URL || 'https://y758dmj4.us-east.insforge.app'}/api/auth/password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json({
        success: false,
        error: { code: 'OTP_ERROR', message: data.message || '发送验证码失败' },
      });
    }

    return res.json({
      success: true,
      data: {
        message: '验证码已发送到您的邮箱',
        expiresIn: 600, // 10分钟有效期
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

    // 使用 InsForge Auth 验证 OTP 并修改密码
    const response = await fetch(`${process.env.INSFORGE_BASE_URL || 'https://y758dmj4.us-east.insforge.app'}/api/auth/password/reset/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: userEmail,
        otp,
        newPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json({
        success: false,
        error: { code: 'PASSWORD_ERROR', message: data.message || '密码修改失败' },
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
