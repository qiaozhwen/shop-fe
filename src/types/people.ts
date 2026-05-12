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
export interface UserInfo {
  id: ID;
  username: string;
  nickname: string;
  role: StaffRole | 'ADMIN';
  storeId?: ID;
  storeName?: string;
  avatar?: string;
}

export interface LoginDTO {
  username: string;
  password: string;
}

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
