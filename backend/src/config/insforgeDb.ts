import { createClient } from '@insforge/sdk';

const INSFORGE_BASE_URL = process.env.INSFORGE_BASE_URL || 'https://y758dmj4.us-east.insforge.app';
const INSFORGE_ANON_KEY = process.env.INSFORGE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NjIyMTl9.ygm6DaZk7BZCjo2VyJdkVkkRfgL3gYWlzzXu5wFCBA4';

export const insforge = createClient({
  baseUrl: INSFORGE_BASE_URL,
  anonKey: INSFORGE_ANON_KEY,
});

// 初始化数据库表（如果不存在）
export const initInsforgeDb = async () => {
  console.log('InsForge database client initialized');
  console.log('Base URL:', INSFORGE_BASE_URL);
};
