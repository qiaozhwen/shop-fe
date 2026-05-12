import client from '../client';
import { unwrap, getList } from '../helper';
import type { Store, StoreCreateDTO } from '@/types/store';
import type { PageQuery } from '@/types/common';

export const storeApi = {
  list: (params?: PageQuery & Record<string, any>) =>
    getList<Store>('/stores', params),
  get: (id: number) => unwrap<Store>(client.get(`/stores/${id}`)),
  create: (body: StoreCreateDTO) => unwrap<Store>(client.post('/stores', body)),
  update: (id: number, body: Partial<StoreCreateDTO>) =>
    unwrap<Store>(client.put(`/stores/${id}`, body)),
  remove: (id: number) => unwrap<void>(client.delete(`/stores/${id}`)),
};
