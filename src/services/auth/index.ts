import { request } from '@umijs/max';

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  username: string;
}

/** 登录接口 */
export async function login(params: LoginParams) {
  return request<LoginResult>('/api/auth/login', {
    method: 'POST',
    data: params,
  });
}
