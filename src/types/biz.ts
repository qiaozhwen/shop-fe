import type { ID } from './common';

export interface Supplier {
  id: ID;
  name: string;
  contact: string;
  phone: string;
  address: string;
  category: string; // 供应品类
  level: 'A' | 'B' | 'C';
  enabled: boolean;
  remark?: string;
}

export type PurchaseStatus = 'DRAFT' | 'SUBMITTED' | 'RECEIVED' | 'CANCELED';

export interface PurchaseOrder {
  id: ID;
  orderNo: string;
  supplierId: ID;
  supplierName: string;
  storeId: ID;
  storeName: string;
  categoryName: string;
  quantity: number;
  totalWeight: number;
  unitPrice: number;
  amount: number;
  batchNo: string;
  status: PurchaseStatus;
  createdAt: string;
  receivedAt?: string;
  remark?: string;
}

export const PURCHASE_STATUS_LABEL: Record<PurchaseStatus, string> = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  RECEIVED: '已入栏',
  CANCELED: '已取消',
};

// 损耗
export type LossReason = 'DEAD' | 'SICK' | 'INJURY' | 'ESCAPED' | 'OTHER';

export const LOSS_REASON_LABEL: Record<LossReason, string> = {
  DEAD: '死亡',
  SICK: '病禽淘汰',
  INJURY: '受伤',
  ESCAPED: '逃逸',
  OTHER: '其他',
};

export interface LossRecord {
  id: ID;
  storeId: ID;
  storeName: string;
  categoryName: string;
  batchNo?: string;
  quantity: number;
  reason: LossReason;
  handler: string;       // 处理人
  disposeMethod: string; // 处理方式：无害化 / 焚烧 / 深埋
  occurredAt: string;
  remark?: string;
}
