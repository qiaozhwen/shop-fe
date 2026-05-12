import axios from 'axios';
import { toast } from 'sonner';
import { mockAdapter } from './mock';

const useMock = (import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8080',
  timeout: 10000,
  ...(useMock ? { adapter: mockAdapter as any } : {}),
});

// 请求拦截器
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
client.interceptors.response.use(
  (response) => {
    // 解包 Result<T> 结构
    const res = response.data;
    if (res.code !== undefined && res.code !== 200) {
      toast.error(res.message || '请求失败');
      return Promise.reject(new Error(res.message || '请求失败'));
    }
    return res;
  },
  (error) => {
    if (error.response?.status === 401) {
      toast.error('登录已过期，请重新登录');
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else {
      toast.error(error.response?.data?.message || error.message || '网络错误');
    }
    return Promise.reject(error);
  }
);

export default client;
