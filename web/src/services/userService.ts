import api, { ApiResponse } from './api';

export interface User {
  _id: string;
  email: string;
  nickname: string;
  avatar: string;
  emailVerified: boolean;
  reminderEnabled: boolean;
  reminderTime: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// User registration
export const register = (data: {
  email: string;
  code: string;
  password: string;
  nickname?: string;
}): Promise<ApiResponse<LoginResponse>> => {
  return api.post('/users/register', data);
};

// Login with email and password
export const login = (data: {
  email: string;
  password: string;
}): Promise<ApiResponse<LoginResponse>> => {
  return api.post('/users/login', data);
};

// Login with verification code
export const codeLogin = (data: {
  email: string;
  code: string;
}): Promise<ApiResponse<LoginResponse>> => {
  return api.post('/users/login/code', data);
};

// Send verification code
export const sendCode = (data: {
  email: string;
  type: 'register' | 'login' | 'reset';
}): Promise<ApiResponse<{ message: string }>> => {
  return api.post('/users/code/send', data);
};

// Reset password
export const resetPassword = (data: {
  email: string;
  code: string;
  newPassword: string;
}): Promise<ApiResponse<{ message: string }>> => {
  return api.post('/users/password/reset', data);
};

// Get profile
export const getProfile = (): Promise<ApiResponse<{ user: User }>> => {
  return api.get('/users/profile');
};

// Update profile
export const updateProfile = (data: {
  nickname?: string;
  avatar?: string;
  reminderEnabled?: boolean;
  reminderTime?: string;
}): Promise<ApiResponse<{ user: User }>> => {
  return api.put('/users/profile', data);
};

// Change password
export const changePassword = (data: {
  oldPassword: string;
  newPassword: string;
}): Promise<ApiResponse<{ message: string }>> => {
  return api.put('/users/password', data);
};
