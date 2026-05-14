import type { ID } from './common';

export type StoreStatus = 'OPEN' | 'CLOSED' | 'RENOVATING';

export const STORE_STATUS_LABEL: Record<StoreStatus, string> = {
  OPEN: '营业中',
  CLOSED: '已关闭',
  RENOVATING: '装修中',
};

export const STORE_STATUS_COLOR: Record<StoreStatus, string> = {
  OPEN: 'green',
  CLOSED: 'red',
  RENOVATING: 'orange',
};

export interface Store {
  id: ID;
  code: string;
  name: string;
  address: string;
  phone: string;
  ownerName: string;
  managerId?: ID;
  status: StoreStatus;
  openTime?: string;
  closeTime?: string;
  remark?: string;
  createdAt?: string;
}

export interface StoreCreateDTO {
  code: string;
  name: string;
  address: string;
  phone: string;
  ownerName: string;
  status?: StoreStatus;
  openTime?: string;
  closeTime?: string;
  remark?: string;
}
