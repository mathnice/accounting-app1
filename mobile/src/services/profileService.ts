import api from './api';

// 用户统计数据
export interface UserStats {
  recordingDays: number;
  transactionCount: number;
  accountCount: number;
  firstRecordDate: string | null;
}

// 获取用户统计数据
export const getUserStats = async (): Promise<{ data: UserStats }> => {
  return api.get('/profile/stats');
};

// 上传头像
export const uploadAvatar = async (imageBase64: string): Promise<{ data: { avatarUrl: string } }> => {
  return api.post('/profile/avatar', { image: imageBase64 });
};

// 请求密码修改验证码
export const requestPasswordOTP = async (): Promise<{ data: { message: string; expiresIn: number } }> => {
  return api.post('/profile/password/request-otp', {});
};

// 修改密码
export const changePassword = async (otp: string, newPassword: string): Promise<{ data: { message: string } }> => {
  return api.post('/profile/password/change', { otp, newPassword });
};

// 导出交易数据
export interface ExportResult {
  csv: string;
  filename: string;
  count: number;
}

export const exportTransactions = async (): Promise<{ data: ExportResult }> => {
  return api.get('/profile/export');
};
