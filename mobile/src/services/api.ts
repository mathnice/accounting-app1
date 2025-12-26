import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API base URL - change this to your backend URL
// const API_BASE_URL = 'http://10.0.2.2:3000/api'; // Android emulator localhost
// const API_BASE_URL = 'http://localhost:3000/api'; // iOS simulator
const API_BASE_URL = 'https://accounting-app1.onrender.com/api'; // Production API

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds timeout for Render free tier cold start
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add InsForge token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem('insforge-auth-token');
    console.log('[API] Token exists:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Log first 20 chars of token for debugging
      console.log('[API] Token prefix:', token.substring(0, 20) + '...');
    } else {
      console.log('[API] No token found in AsyncStorage');
    }
    console.log('[API] Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('[API] Response success:', response.config.url);
    return response.data;
  },
  async (error: AxiosError<{ error: { message: string } }>) => {
    console.error('[API] Error:', error.response?.status, error.response?.data || error.message);
    
    // 如果是 401 错误，可能是 token 过期，清除本地存储
    if (error.response?.status === 401) {
      console.log('[API] Token expired or invalid, clearing stored credentials');
      // 不自动清除，让用户重新登录时处理
    }
    
    // 如果是网络错误或超时，可能是 Render 休眠
    if (error.code === 'ECONNABORTED' || !error.response) {
      console.log('[API] Network error or timeout - Render may be waking up');
    }
    
    return Promise.reject(error);
  }
);

export default api;

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
