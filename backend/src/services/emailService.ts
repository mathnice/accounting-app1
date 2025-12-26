// 邮件服务 - 发送验证码邮件
// 支持多种邮件服务：阿里云邮件推送、QQ邮箱SMTP、Resend、Mailjet、自定义SMTP

import nodemailer from 'nodemailer';
import crypto from 'crypto';

// 生成邮件HTML模板
const generateEmailHTML = (code: string): string => {
  return `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <div style="background: linear-gradient(135deg, #6366F1, #8B5CF6); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">智能记账</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0;">邮箱验证</p>
      </div>
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 16px 16px;">
        <p style="color: #1e293b; font-size: 16px; margin-bottom: 20px;">您好！</p>
        <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">您正在注册智能记账账号，请使用以下验证码完成验证：</p>
        <div style="background: white; border: 2px dashed #6366F1; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 36px; font-weight: bold; color: #6366F1; letter-spacing: 8px;">${code}</span>
        </div>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">
          • 验证码有效期为 5 分钟<br>
          • 如非本人操作，请忽略此邮件
        </p>
      </div>
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
        此邮件由系统自动发送，请勿回复
      </p>
    </div>
  `;
};

// 使用阿里云邮件推送 API 发送邮件（推荐国内使用，免费200封/天）
const sendWithAliyun = async (email: string, code: string): Promise<{ success: boolean; message: string }> => {
  const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET;
  const fromEmail = process.env.ALIYUN_FROM_EMAIL;
  const fromAlias = process.env.ALIYUN_FROM_ALIAS || '智能记账';

  if (!accessKeyId || !accessKeySecret || !fromEmail) {
    return { success: false, message: '阿里云邮件推送未配置' };
  }

  // 阿里云 API 签名
  const timestamp = new Date().toISOString().replace(/\.\d{3}/, '');
  const nonce = crypto.randomUUID();
  
  const params: Record<string, string> = {
    Action: 'SingleSendMail',
    AccountName: fromEmail,
    AddressType: '1',
    FromAlias: fromAlias,
    HtmlBody: generateEmailHTML(code),
    ReplyToAddress: 'false',
    Subject: '【智能记账】邮箱验证码',
    ToAddress: email,
    Format: 'JSON',
    Version: '2015-11-23',
    AccessKeyId: accessKeyId,
    SignatureMethod: 'HMAC-SHA1',
    Timestamp: timestamp,
    SignatureVersion: '1.0',
    SignatureNonce: nonce,
  };

  // 按字母排序参数
  const sortedKeys = Object.keys(params).sort();
  const canonicalizedQueryString = sortedKeys
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  // 生成签名
  const stringToSign = `POST&${encodeURIComponent('/')}&${encodeURIComponent(canonicalizedQueryString)}`;
  const signature = crypto
    .createHmac('sha1', accessKeySecret + '&')
    .update(stringToSign)
    .digest('base64');

  params['Signature'] = signature;

  try {
    const response = await fetch('https://dm.aliyuncs.com/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params).toString(),
    });

    const data = await response.json() as { EnvId?: string; Code?: string; Message?: string };
    
    if (data.EnvId) {
      console.log(`[阿里云邮件] 验证码邮件已发送至: ${email}`);
      return { success: true, message: '验证码已发送' };
    }
    console.error('[阿里云邮件] 错误:', data);
    return { success: false, message: data.Message || '发送失败' };
  } catch (error) {
    console.error('[阿里云邮件] 发送失败:', error);
    return { success: false, message: '发送失败' };
  }
};

// 使用阿里云 SMTP 发送邮件（备选方案）
const sendWithAliyunSMTP = async (email: string, code: string): Promise<{ success: boolean; message: string }> => {
  const user = process.env.ALIYUN_SMTP_USER;
  const pass = process.env.ALIYUN_SMTP_PASS;
  const fromEmail = process.env.ALIYUN_FROM_EMAIL;

  if (!user || !pass || !fromEmail) {
    return { success: false, message: '阿里云SMTP未配置' };
  }

  const transporter = nodemailer.createTransport({
    host: 'smtpdm.aliyun.com',
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from: `"智能记账" <${fromEmail}>`,
      to: email,
      subject: '【智能记账】邮箱验证码',
      html: generateEmailHTML(code),
    });
    console.log(`[阿里云SMTP] 验证码邮件已发送至: ${email}`);
    return { success: true, message: '验证码已发送' };
  } catch (error) {
    console.error('[阿里云SMTP] 发送失败:', error);
    return { success: false, message: '发送失败' };
  }
};

// 使用 SendGrid API 发送邮件（推荐，免费100封/天）
const sendWithSendGrid = async (email: string, code: string): Promise<{ success: boolean; message: string }> => {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  
  if (!apiKey || !fromEmail) return { success: false, message: 'SendGrid未配置' };

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: { email: fromEmail, name: '智能记账' },
        subject: '【智能记账】邮箱验证码',
        content: [{ type: 'text/html', value: generateEmailHTML(code) }],
      }),
    });

    if (response.status === 202) {
      console.log(`[SendGrid] 验证码邮件已发送至: ${email}`);
      return { success: true, message: '验证码已发送' };
    }
    const data = await response.json() as { errors?: Array<{ message: string }> };
    console.error('[SendGrid] 错误:', data);
    return { success: false, message: data.errors?.[0]?.message || '发送失败' };
  } catch (error) {
    console.error('[SendGrid] 发送失败:', error);
    return { success: false, message: '发送失败' };
  }
};

// 使用 Resend API 发送邮件
const sendWithResend = async (email: string, code: string): Promise<{ success: boolean; message: string }> => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { success: false, message: 'Resend未配置' };

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: email,
        subject: '【智能记账】邮箱验证码',
        html: generateEmailHTML(code),
      }),
    });

    if (response.ok) {
      console.log(`[Resend] 验证码邮件已发送至: ${email}`);
      return { success: true, message: '验证码已发送' };
    }
    const data = await response.json() as { message?: string };
    console.error('[Resend] 错误:', data);
    return { success: false, message: data.message || '发送失败' };
  } catch (error) {
    console.error('[Resend] 发送失败:', error);
    return { success: false, message: '发送失败' };
  }
};

// 使用 Mailjet SMTP 发送邮件
const sendWithMailjet = async (email: string, code: string): Promise<{ success: boolean; message: string }> => {
  const apiKey = process.env.MAILJET_API_KEY;
  const secretKey = process.env.MAILJET_SECRET_KEY;
  const fromEmail = process.env.MAILJET_FROM_EMAIL;
  
  if (!apiKey || !secretKey || !fromEmail) {
    return { success: false, message: 'Mailjet未配置' };
  }

  const transporter = nodemailer.createTransport({
    host: 'in-v3.mailjet.com',
    port: 587,
    secure: false,
    auth: { user: apiKey, pass: secretKey },
  });

  try {
    await transporter.sendMail({
      from: `"智能记账" <${fromEmail}>`,
      to: email,
      subject: '【智能记账】邮箱验证码',
      html: generateEmailHTML(code),
    });
    console.log(`[Mailjet] 验证码邮件已发送至: ${email}`);
    return { success: true, message: '验证码已发送' };
  } catch (error) {
    console.error('[Mailjet] 发送失败:', error);
    return { success: false, message: '发送失败' };
  }
};

// 使用自定义 SMTP 发送邮件
const sendWithSMTP = async (email: string, code: string): Promise<{ success: boolean; message: string }> => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return { success: false, message: 'SMTP未配置' };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from: `"智能记账" <${user}>`,
      to: email,
      subject: '【智能记账】邮箱验证码',
      html: generateEmailHTML(code),
    });
    console.log(`[SMTP] 验证码邮件已发送至: ${email}`);
    return { success: true, message: '验证码已发送' };
  } catch (error) {
    console.error('[SMTP] 发送失败:', error);
    return { success: false, message: '发送失败' };
  }
};

// 使用 QQ 邮箱 SMTP 发送邮件（推荐，可发送到任意邮箱）
const sendWithQQMail = async (email: string, code: string): Promise<{ success: boolean; message: string }> => {
  const user = process.env.QQ_MAIL_USER;
  const pass = process.env.QQ_MAIL_PASS; // QQ邮箱授权码

  if (!user || !pass) {
    return { success: false, message: 'QQ邮箱未配置' };
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from: `"智能记账" <${user}>`,
      to: email,
      subject: '【智能记账】邮箱验证码',
      html: generateEmailHTML(code),
    });
    console.log(`[QQ邮箱] 验证码邮件已发送至: ${email}`);
    return { success: true, message: '验证码已发送' };
  } catch (error) {
    console.error('[QQ邮箱] 发送失败:', error);
    return { success: false, message: '发送失败' };
  }
};

// 主发送函数 - 按优先级尝试不同服务
export const sendVerificationEmail = async (
  email: string,
  code: string
): Promise<{ success: boolean; message: string }> => {
  // 1. 优先使用阿里云邮件推送 API（推荐国内使用，免费200封/天）
  if (process.env.ALIYUN_ACCESS_KEY_ID && process.env.ALIYUN_ACCESS_KEY_SECRET && process.env.ALIYUN_FROM_EMAIL) {
    const result = await sendWithAliyun(email, code);
    if (result.success) return result;
  }

  // 2. 尝试阿里云 SMTP
  if (process.env.ALIYUN_SMTP_USER && process.env.ALIYUN_SMTP_PASS) {
    const result = await sendWithAliyunSMTP(email, code);
    if (result.success) return result;
  }

  // 3. 尝试 SendGrid（免费100封/天）
  if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL) {
    const result = await sendWithSendGrid(email, code);
    if (result.success) return result;
  }

  // 4. 尝试 QQ 邮箱（可发送到任意邮箱，但云服务器可能阻止SMTP）
  if (process.env.QQ_MAIL_USER && process.env.QQ_MAIL_PASS) {
    const result = await sendWithQQMail(email, code);
    if (result.success) return result;
  }

  // 5. 尝试 Resend（免费版只能发送到已验证邮箱）
  if (process.env.RESEND_API_KEY) {
    const result = await sendWithResend(email, code);
    if (result.success) return result;
  }

  // 6. 尝试 Mailjet
  if (process.env.MAILJET_API_KEY) {
    const result = await sendWithMailjet(email, code);
    if (result.success) return result;
  }

  // 7. 尝试自定义 SMTP
  if (process.env.SMTP_HOST) {
    const result = await sendWithSMTP(email, code);
    if (result.success) return result;
  }

  // 8. 开发模式 - 打印到控制台
  console.log(`\n========================================`);
  console.log(`📧 验证码邮件（开发模式）`);
  console.log(`收件人: ${email}`);
  console.log(`验证码: ${code}`);
  console.log(`\n请配置以下任一服务以发送真实邮件：`);
  console.log(`- ALIYUN_ACCESS_KEY_ID + ALIYUN_ACCESS_KEY_SECRET + ALIYUN_FROM_EMAIL (推荐国内，免费200封/天)`);
  console.log(`- SENDGRID_API_KEY + SENDGRID_FROM_EMAIL (免费100封/天)`);
  console.log(`- QQ_MAIL_USER + QQ_MAIL_PASS (可发送到任意邮箱)`);
  console.log(`- RESEND_API_KEY (免费版只能发送到已验证邮箱)`);
  console.log(`========================================\n`);
  
  return { success: true, message: '验证码已发送（开发模式）' };
};
