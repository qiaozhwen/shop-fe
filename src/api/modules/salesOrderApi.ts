import client from '../client';
import { unwrap, getList } from '../helper';
import type { SalesOrder, SalesOrderCreateDTO, OrderStatus } from '@/types/order';
import type { PageQuery } from '@/types/common';

export const salesOrderApi = {
  list: (params?: PageQuery & { status?: OrderStatus; storeId?: number }) =>
    getList<SalesOrder>('/sales-orders', params),
  get: (id: number) => unwrap<SalesOrder>(client.get(`/sales-orders/${id}`)),
  create: (body: SalesOrderCreateDTO) => unwrap<SalesOrder>(client.post('/sales-orders', body)),
  updateStatus: (id: number, status: OrderStatus) =>
    unwrap<SalesOrder>(client.put(`/sales-orders/${id}/status`, { status })),
};
