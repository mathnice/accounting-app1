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

// Request interceptor - add InsForge token from localStorage
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get InsForge token from localStorage (set by @insforge/sdk)
    // InsForge SDK uses 'insforge-auth-token' key
    const token = localStorage.getItem('insforge-auth-token');
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
