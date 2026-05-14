export type SsoProvider = 'WECHAT' | 'ALIPAY';
export type SmsPurpose = 'BIND_PHONE' | 'SMS_LOGIN' | 'RESET_PASSWORD' | 'SET_PASSWORD';
export type SubjectRole = 'STAFF_DEFAULT' | 'STAFF' | 'MANAGER' | 'ADMIN';

export interface Subject {
  type: 'STAFF';
  id: number;
  phone: string;
  nickname?: string;
  avatarUrl?: string;
  roles: SubjectRole[];
  hasPassword?: boolean;
  boundProviders?: SsoProvider[];
}

export interface TokenPair {
  tokenType: 'Bearer';
  accessToken: string;
  accessTokenExpiresIn: number;   // seconds
  refreshToken: string;
  refreshTokenExpiresIn: number;  // seconds
}

export interface LoginResponse extends TokenPair {
  subject: Subject;
}

export interface BindPendingResponse {
  status: 'BIND_PENDING';
  bindToken: string;
  bindTokenExpiresIn: number;
  provider: SsoProvider;
  profile: { nickname?: string; avatarUrl?: string };
}

export type SsoExchangeResponse = LoginResponse | BindPendingResponse;

export const isBindPending = (
  r: SsoExchangeResponse,
): r is BindPendingResponse => (r as BindPendingResponse).status === 'BIND_PENDING';

export interface PasswordLoginDTO { phone: string; password: string }
export interface SmsLoginDTO { phone: string; code: string }
export interface SmsSendDTO { phone: string; purpose: SmsPurpose }
export interface SmsSendResult { phone: string; expiresIn: number; resendAfter: number }
export interface SsoStartDTO { redirectUri: string }
export interface SsoStartResult { qrUrl: string; state: string }
export interface SsoExchangeDTO { code: string; state: string }
export interface BindPhoneDTO { phone: string; smsCode: string }
export interface SetPasswordDTO {
  newPassword: string;
  oldPassword?: string;   // 已有密码时必填
  smsCode?: string;       // 首次设密码时必填
}
export interface ResetPasswordDTO { phone: string; smsCode: string; newPassword: string }
export interface RefreshDTO { refreshToken: string }
