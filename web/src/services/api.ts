import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to get InsForge token from localStorage
// InsForge SDK stores token with key pattern: insforge-{baseUrl}-token
const getInsforgeToken = (): string | null => {
  // Try to find InsForge token in localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('insforge') && key.includes('token'))) {
      const value = localStorage.getItem(key);
      if (value) {
        // If it's a JSON string, try to parse it
        try {
          const parsed = JSON.parse(value);
          if (parsed.accessToken) return parsed.accessToken;
          if (typeof parsed === 'string') return parsed;
        } catch {
          // Not JSON, return as-is
          return value;
        }
      }
    }
  }
  return null;
};

// Request interceptor - add InsForge token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getInsforgeToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError<{ error: { code: string; message: string } }>) => {
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        console.log('Unauthorized request');
      } else if (data?.error?.message) {
        message.error(data.error.message);
      } else {
        message.error('Request failed, please try again');
      }
    } else if (error.request) {
      message.error('Network error, please check your connection');
    } else {
      message.error('Request failed');
    }
    
    return Promise.reject(error);
  }
);

export default api;

// API response type
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
