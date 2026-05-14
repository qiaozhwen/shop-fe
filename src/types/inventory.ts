import type { ID } from './common';

export type HealthStatus = 'HEALTHY' | 'OBSERVED' | 'SICK' | 'QUARANTINE';

export interface InventoryItem {
  id: ID;
  storeId: ID;
  storeName: string;
  categoryId: ID;
  categoryName: string;
  batchNo: string;        // 入栏批次
  quantity: number;       // 当前只数
  avgWeight: number;      // 平均重量（斤）
  totalWeight: number;    // 总重（斤）
  health: HealthStatus;
  inStockAt: string;      // 入栏时间
  supplierName?: string;
  remark?: string;
}

export interface InventoryAdjustDTO {
  id: ID;
  delta: number;          // +入栏 / -出栏
  reason: string;
}
