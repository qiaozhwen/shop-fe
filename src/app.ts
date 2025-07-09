// 运行时配置
import { removeToken } from '@/utils/auth';
import { history } from 'umi';

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<{ name: string }> {
  return { name: '@umijs/max' };
}

export const layout = () => {
  return {
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    menu: {
      locale: false,
    },
  };
};

// 请求响应拦截器
export const request = {
  timeout: 10000,

  requestInterceptors: [
    (url: string, options: any) => {
      const token = sessionStorage.getItem('token');
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return { url, options };
    },
  ],
  responseInterceptors: [
    [
      (response: any) => {
        // Intercept successful responses to check for business error codes.
        const { data } = response as any;
        if (data?.code === 401) {
          removeToken();
          history.push('/login');
        }
        return response;
      },
      (error: any) => {
        // Intercept failed responses to handle HTTP errors.
        if (error.response?.status === 401) {
          removeToken();
          history.push('/login');
        }
        return Promise.reject(error);
      },
    ],
  ],
};
