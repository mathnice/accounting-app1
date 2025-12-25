import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API base URL - change this to your backend URL
// const API_BASE_URL = 'http://10.0.2.2:3000/api'; // Android emulator localhost
// const API_BASE_URL = 'http://localhost:3000/api'; // iOS simulator
const API_BASE_URL = 'http://10.69.106.40:3000/api'; // Physical device (your computer's IP)

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add InsForge token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem('insforge-auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<{ error: { message: string } }>) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
