import type { ID } from './common';
import type { ProcessMethod } from './poultry';

export type OrderStatus =
  | 'PENDING'      // 待付款
  | 'PAID'         // 已付款，待加工
  | 'PROCESSING'   // 加工中
  | 'READY'        // 待提货
  | 'COMPLETED'    // 已完成
  | 'CANCELED'     // 已取消
  | 'REFUNDED';    // 已退款

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: '待付款',
  PAID: '待加工',
  PROCESSING: '加工中',
  READY: '待提货',
  COMPLETED: '已完成',
  CANCELED: '已取消',
  REFUNDED: '已退款',
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: 'orange',
  PAID: 'blue',
  PROCESSING: 'geekblue',
  READY: 'cyan',
  COMPLETED: 'green',
  CANCELED: 'default',
  REFUNDED: 'red',
};

export type PayMethod = 'CASH' | 'WECHAT' | 'ALIPAY' | 'CARD' | 'MEMBER';

export const PAY_METHOD_LABEL: Record<PayMethod, string> = {
  CASH: '现金',
  WECHAT: '微信',
  ALIPAY: '支付宝',
  CARD: '银行卡',
  MEMBER: '会员卡',
};

export interface SalesOrderItem {
  id?: ID;
  categoryId: ID;
  categoryName: string;
  quantity: number;     // 只数
  weight: number;       // 净重（斤）
  unitPrice: number;
  processMethod: ProcessMethod;
  processFee: number;
  subtotal: number;
  remark?: string;
}

export interface SalesOrder {
  id: ID;
  orderNo: string;
  storeId: ID;
  storeName: string;
  cashierId?: ID;
  cashierName?: string;
  memberId?: ID;
  memberName?: string;
  customerPhone?: string;
  items: SalesOrderItem[];
  totalAmount: number;
  discount: number;
  payable: number;
  payMethod?: PayMethod;
  status: OrderStatus;
  createdAt: string;
  paidAt?: string;
  completedAt?: string;
  remark?: string;
}

export interface SalesOrderCreateDTO {
  storeId: ID;
  memberId?: ID;
  customerPhone?: string;
  items: Omit<SalesOrderItem, 'id'>[];
  discount?: number;
  payMethod?: PayMethod;
  remark?: string;
}
