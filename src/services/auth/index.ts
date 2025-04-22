import { request } from 'umi';

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
}

/** 登录接口 */
export async function login(params: LoginParams) {
  return request<LoginResult>('/api/login', {
    method: 'POST',
    data: params,
  });
}
