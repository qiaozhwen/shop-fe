import type { ID } from './common';

// 会员
export type MemberLevel = 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';

export const MEMBER_LEVEL_LABEL: Record<MemberLevel, string> = {
  BRONZE: '铜牌',
  SILVER: '银牌',
  GOLD: '金牌',
  DIAMOND: '钻石',
};

export interface Member {
  id: ID;
  cardNo: string;
  name: string;
  phone: string;
  level: MemberLevel;
  points: number;
  balance: number;
  totalConsumption: number;
  registerStoreName: string;
  registeredAt: string;
  remark?: string;
}

// 员工
export type StaffRole = 'MANAGER' | 'CASHIER' | 'BUTCHER' | 'HELPER';

export const STAFF_ROLE_LABEL: Record<StaffRole, string> = {
  MANAGER: '店长',
  CASHIER: '收银员',
  BUTCHER: '屠宰师傅',
  HELPER: '帮工',
};

export interface Staff {
  id: ID;
  name: string;
  phone: string;
  role: StaffRole;
  storeId: ID;
  storeName: string;
  enabled: boolean;
  hireDate: string;
  remark?: string;
}

// 用户/鉴权
/** @deprecated 请使用 `@/types/auth` 中的 `Subject`（新的 staff 鉴权契约）。 */
export interface UserInfo {
  id: ID;
  username: string;
  nickname: string;
  role: StaffRole | 'ADMIN';
  storeId?: ID;
  storeName?: string;
  avatar?: string;
}

/** @deprecated 旧的用户名+密码登录 DTO，新接口用 `@/types/auth#PasswordLoginDTO`。 */
export interface LoginDTO {
  username: string;
  password: string;
}

/** @deprecated 旧的登录响应，新接口用 `@/types/auth#LoginResponse`。 */
export interface LoginResult {
  token: string;
  user: UserInfo;
}

// 价格
export interface PricingItem {
  id: ID;
  categoryId: ID;
  categoryName: string;
  storeId?: ID;
  storeName?: string;
  date: string;
  price: number;     // 当日单价
  processingFee: number;
  promotionPrice?: number;
}
