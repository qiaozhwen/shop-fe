import type { ID } from './common';
import type { ProcessMethod } from './poultry';

export type ProcessingStatus =
  | 'WAIT_SLAUGHTER' // 待宰杀
  | 'SLAUGHTERING'   // 宰杀中
  | 'PLUCKING'       // 脱毛
  | 'EVISCERATING'   // 净膛
  | 'PACKING'        // 分装
  | 'DELIVERED'      // 已交付
  | 'CANCELED';

export const PROCESSING_STATUS_LABEL: Record<ProcessingStatus, string> = {
  WAIT_SLAUGHTER: '待宰杀',
  SLAUGHTERING: '宰杀中',
  PLUCKING: '脱毛',
  EVISCERATING: '净膛',
  PACKING: '分装',
  DELIVERED: '已交付',
  CANCELED: '已取消',
};

export const PROCESSING_FLOW: ProcessingStatus[] = [
  'WAIT_SLAUGHTER',
  'SLAUGHTERING',
  'PLUCKING',
  'EVISCERATING',
  'PACKING',
  'DELIVERED',
];

export interface ProcessingTask {
  id: ID;
  taskNo: string;
  orderNo: string;
  storeName: string;
  categoryName: string;
  quantity: number;
  weight: number;
  methods: ProcessMethod[];
  workerId?: ID;
  workerName?: string;
  status: ProcessingStatus;
  priority: 'NORMAL' | 'URGENT';
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  remark?: string;
}
