import client from '../client';
import { unwrap, getList } from '../helper';
import type { Supplier, PurchaseOrder, LossRecord } from '@/types/biz';
import type { PageQuery } from '@/types/common';

export const supplierApi = {
  list: (params?: PageQuery) => getList<Supplier>('/suppliers', params),
  create: (body: Omit<Supplier, 'id'>) => unwrap<Supplier>(client.post('/suppliers', body)),
  update: (id: number, body: Partial<Supplier>) => unwrap<Supplier>(client.put(`/suppliers/${id}`, body)),
  remove: (id: number) => unwrap<void>(client.delete(`/suppliers/${id}`)),
};

export const purchaseApi = {
  list: (params?: PageQuery) => getList<PurchaseOrder>('/purchases', params),
  create: (body: Omit<PurchaseOrder, 'id' | 'orderNo' | 'amount' | 'status' | 'createdAt'>) =>
    unwrap<PurchaseOrder>(client.post('/purchases', body)),
  receive: (id: number) => unwrap<PurchaseOrder>(client.post(`/purchases/${id}/receive`)),
};

export const lossApi = {
  list: (params?: PageQuery) => getList<LossRecord>('/losses', params),
  create: (body: Omit<LossRecord, 'id'>) => unwrap<LossRecord>(client.post('/losses', body)),
};
