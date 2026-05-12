import client from '../client';
import { unwrap, getList } from '../helper';
import type { PoultryCategory } from '@/types/poultry';
import type { PageQuery } from '@/types/common';

export const poultryApi = {
  list: (params?: PageQuery) => getList<PoultryCategory>('/poultry-categories', params),
  create: (body: Omit<PoultryCategory, 'id'>) => unwrap<PoultryCategory>(client.post('/poultry-categories', body)),
  update: (id: number, body: Partial<PoultryCategory>) => unwrap<PoultryCategory>(client.put(`/poultry-categories/${id}`, body)),
  remove: (id: number) => unwrap<void>(client.delete(`/poultry-categories/${id}`)),
};
