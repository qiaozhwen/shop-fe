import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { toast } from 'sonner';
import { mockAdapter } from './mock';
import { useAuthStore } from '@/store/useAuthStore';
import { toastAuthError } from '@/lib/auth-error';

const useMock = (import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false';
const apiPrefix = import.meta.env.VITE_API_PREFIX || '';

function shouldPrefixApi(url?: string) {
  if (!apiPrefix || !url) return false;
  return (
    url.startsWith('/') && !url.startsWith(`${apiPrefix}/`) && url !== apiPrefix
  );
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** 标记此请求使用 BIND_PENDING token（由调用方手动塞 Authorization 头）。 */
    useBindToken?: boolean;
    /** 标记此请求是 refresh 本身，避免无限递归。 */
    isRefresh?: boolean;
    /** 内部：是否已重试过。 */
    _retried?: boolean;
  }
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8080',
  timeout: 10000,
  ...(useMock ? { adapter: mockAdapter as any } : {}),
});

// ── 请求拦截器：注入 access token（除非显式 useBindToken / isRefresh） ──
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (!useMock && shouldPrefixApi(config.url)) {
    config.url = `${apiPrefix}${config.url}`;
  }

  if (!config.useBindToken && !config.isRefresh) {
    const token = useAuthStore.getState().accessToken;
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── 响应拦截器：解包 + 401 自动 refresh ──

let refreshing: Promise<string | null> | null = null;
const waitQueue: Array<(token: string | null) => void> = [];

async function doRefresh(): Promise<string | null> {
  const { refreshToken, setTokens, clear } = useAuthStore.getState();
  if (!refreshToken) {
    clear();
    return null;
  }
  try {
    const res = await client.post<any, any>(
      '/api/auth/refresh',
      { refreshToken },
      { isRefresh: true } as AxiosRequestConfig,
    );
    setTokens(res, res.subject);
    return res.accessToken as string;
  } catch {
    clear();
    return null;
  }
}

function flushQueue(token: string | null) {
  while (waitQueue.length) {
    const cb = waitQueue.shift();
    cb?.(token);
  }
}

client.interceptors.response.use(
  (response) => {
    // 兼容老的 Result<T> 包装
    const res = response.data;
    if (res && typeof res === 'object' && 'code' in res && 'data' in res) {
      if (res.code !== undefined && res.code !== 200) {
        toast.error(res.message || '请求失败');
        return Promise.reject(new Error(res.message || '请求失败'));
      }
      return res; // 老协议保留二次解包习惯（helper.unwrap 取 .data）
    }
    // 新协议：直接返回 data 本身
    return res;
  },
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as AxiosRequestConfig | undefined;

    // 401：尝试 refresh（refresh 本身 / bind-pending 请求 / 已重试过 → 不再尝试）
    if (
      status === 401 &&
      original &&
      !original.isRefresh &&
      !original.useBindToken &&
      !original._retried
    ) {
      original._retried = true;

      if (!refreshing) {
        refreshing = doRefresh().finally(() => {
          const t = refreshing;
          refreshing = null;
          // 等队列起飞之前置空，避免并发竞争
          t?.then(flushQueue);
        });
      }

      const newToken = await new Promise<string | null>((resolve) => {
        waitQueue.push(resolve);
      });

      if (newToken) {
        original.headers = {
          ...(original.headers || {}),
          Authorization: `Bearer ${newToken}`,
        };
        return client.request(original);
      }

      toast.error('登录已过期，请重新登录');
      if (
        typeof window !== 'undefined' &&
        window.location.pathname !== '/login'
      ) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // 其余错误：交给 auth-error 统一映射；失败再 fallback
    const handled = toastAuthError(error);
    if (!handled) {
      toast.error((error as any).message || '网络错误');
    }
    return Promise.reject(error);
  },
);

export default client;
