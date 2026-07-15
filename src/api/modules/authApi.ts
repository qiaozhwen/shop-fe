import client from '../client';
import type {
  PasswordLoginDTO,
  LoginResponse,
  SmsSendDTO,
  SmsSendResult,
  SmsLoginDTO,
  SsoStartDTO,
  SsoStartResult,
  SsoExchangeDTO,
  SsoExchangeResponse,
  BindPhoneDTO,
  SetPasswordDTO,
  ResetPasswordDTO,
  RefreshDTO,
  SsoProvider,
  Subject,
} from '@/types/auth';

// 这些端点走「裸返回」（新后端契约），不会被 Result<T> 包装。
// client.ts 拦截器已处理：无 code 字段则直接返回 response.data。

export const authApi = {
  loginWithPassword: (body: PasswordLoginDTO) =>
    client.post<unknown, LoginResponse>('/api/auth/login', body),

  sendSms: (body: SmsSendDTO) =>
    client.post<unknown, SmsSendResult>('/api/admin/auth/sms/send', body),

  loginWithSms: (body: SmsLoginDTO) =>
    client.post<unknown, LoginResponse>('/api/admin/auth/sms/login', body),

  startSso: (provider: SsoProvider, body: SsoStartDTO) =>
    client.post<unknown, SsoStartResult>(
      `/api/admin/auth/sso/${provider.toLowerCase()}/start`,
      body,
    ),

  exchangeSso: (provider: SsoProvider, body: SsoExchangeDTO) =>
    client.post<unknown, SsoExchangeResponse>(
      `/api/admin/auth/sso/${provider.toLowerCase()}/exchange`,
      body,
    ),

  /** 携带 BIND_PENDING token 调用；client 通过 config.useBindToken 标记。 */
  bindPhone: (body: BindPhoneDTO, bindToken: string) =>
    client.post<unknown, LoginResponse>(
      '/api/admin/auth/bind-phone',
      body,
      { headers: { Authorization: `Bearer ${bindToken}` }, useBindToken: true } as any,
    ),

  bindProvider: (provider: SsoProvider, code: string) =>
    client.post<unknown, void>(`/api/admin/auth/bind/${provider.toLowerCase()}`, { code }),

  unbindProvider: (provider: SsoProvider) =>
    client.delete<unknown, void>(`/api/admin/auth/bind/${provider.toLowerCase()}`),

  setPassword: (body: SetPasswordDTO) =>
    client.post<unknown, void>('/api/admin/auth/set-password', body),

  resetPassword: (body: ResetPasswordDTO) =>
    client.post<unknown, void>('/api/admin/auth/reset-password', body),

  me: () =>
    client.get<unknown, Subject>('/api/admin/me'),

  logout: (refreshToken?: string) =>
    client.post<unknown, void>('/api/admin/auth/logout', { refreshToken }),

  refresh: (body: RefreshDTO) =>
    client.post<unknown, LoginResponse>('/api/auth/refresh', body),
};
