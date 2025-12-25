// 验证码服务 - 生成、存储和验证验证码
interface VerificationCode {
  code: string;
  email: string;
  expiresAt: number;
  createdAt: number;
}

// 内存存储验证码（生产环境应使用Redis）
const verificationCodes: Map<string, VerificationCode> = new Map();

// 生成6位数字验证码
export const generateCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 存储验证码
export const storeCode = (email: string, code: string): void => {
  const normalizedEmail = email.toLowerCase().trim();
  
  // 验证码5分钟有效
  const expiresAt = Date.now() + 5 * 60 * 1000;
  
  verificationCodes.set(normalizedEmail, {
    code,
    email: normalizedEmail,
    expiresAt,
    createdAt: Date.now(),
  });
  
  console.log(`验证码已存储: ${normalizedEmail} -> ${code}`);
};

// 验证验证码
export const verifyCode = (email: string, code: string): { valid: boolean; message: string } => {
  const normalizedEmail = email.toLowerCase().trim();
  const stored = verificationCodes.get(normalizedEmail);
  
  if (!stored) {
    return { valid: false, message: '请先获取验证码' };
  }
  
  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(normalizedEmail);
    return { valid: false, message: '验证码已过期，请重新获取' };
  }
  
  if (stored.code !== code) {
    return { valid: false, message: '验证码错误' };
  }
  
  // 验证成功后删除验证码
  verificationCodes.delete(normalizedEmail);
  return { valid: true, message: '验证成功' };
};

// 检查是否可以发送新验证码（防止频繁发送）
export const canSendCode = (email: string): { canSend: boolean; waitSeconds: number } => {
  const normalizedEmail = email.toLowerCase().trim();
  const stored = verificationCodes.get(normalizedEmail);
  
  if (!stored) {
    return { canSend: true, waitSeconds: 0 };
  }
  
  // 60秒内不能重复发送
  const timeSinceCreated = Date.now() - stored.createdAt;
  const waitTime = 60 * 1000 - timeSinceCreated;
  
  if (waitTime > 0) {
    return { canSend: false, waitSeconds: Math.ceil(waitTime / 1000) };
  }
  
  return { canSend: true, waitSeconds: 0 };
};

// 清理过期验证码
export const cleanupExpiredCodes = (): void => {
  const now = Date.now();
  for (const [email, data] of verificationCodes.entries()) {
    if (now > data.expiresAt) {
      verificationCodes.delete(email);
    }
  }
};

// 每分钟清理一次过期验证码
setInterval(cleanupExpiredCodes, 60 * 1000);
