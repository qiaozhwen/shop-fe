import client from '../client';
import { unwrap, getList } from '../helper';
import type { InventoryItem } from '@/types/inventory';
import type { PageQuery } from '@/types/common';

export const inventoryApi = {
  list: (params?: PageQuery & { storeId?: number; categoryId?: number }) =>
    getList<InventoryItem>('/inventory', params),
  create: (body: Omit<InventoryItem, 'id' | 'totalWeight'>) =>
    unwrap<InventoryItem>(client.post('/inventory', body)),
  adjust: (id: number, body: { delta: number; reason: string }) =>
    unwrap<InventoryItem>(client.post(`/inventory/${id}/adjust`, body)),
  remove: (id: number) => unwrap<void>(client.delete(`/inventory/${id}`)),
};
