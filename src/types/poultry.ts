import type { ID } from './common';

// 活禽品类
export type PriceUnit = 'JIN' | 'KG' | 'PIECE'; // 斤 / 千克 / 只

export interface PoultryCategory {
  id: ID;
  code: string;
  name: string;          // 例如：三黄鸡 / 麻鸭 / 老鹅 / 乳鸽 / 鹌鹑 / 兔
  species: '鸡' | '鸭' | '鹅' | '鸽' | '鹌鹑' | '兔' | '其他';
  unit: PriceUnit;
  basePrice: number;     // 单价 元/单位
  processingFee: number; // 加工费 元/只
  avgWeight: number;     // 平均重量（斤）
  description?: string;
  enabled: boolean;
  imageUrl?: string;
}

// 加工方式
export type ProcessMethod =
  | 'ALIVE'        // 活禽不加工
  | 'SLAUGHTER'    // 现杀（带毛带内脏，去血）
  | 'PLUCK'        // 脱毛
  | 'EVISCERATE'   // 净膛（去内脏）
  | 'CHOP'         // 切块
  | 'TRIM_HEAD_FEET' // 去头去脚
  | 'PACK';        // 真空分装

export const PROCESS_METHOD_LABEL: Record<ProcessMethod, string> = {
  ALIVE: '活禽',
  SLAUGHTER: '现杀',
  PLUCK: '脱毛',
  EVISCERATE: '净膛',
  CHOP: '切块',
  TRIM_HEAD_FEET: '去头去脚',
  PACK: '真空分装',
};
