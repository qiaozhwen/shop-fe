import client from '../client';
import { unwrap, getList } from '../helper';
import type { Member, Staff, PricingItem, LoginDTO, LoginResult, UserInfo } from '@/types/people';
import type { PageQuery } from '@/types/common';

export const memberApi = {
  list: (params?: PageQuery) => getList<Member>('/members', params),
  create: (body: Omit<Member, 'id' | 'points' | 'balance' | 'totalConsumption' | 'registeredAt'>) =>
    unwrap<Member>(client.post('/members', body)),
  update: (id: number, body: Partial<Member>) => unwrap<Member>(client.put(`/members/${id}`, body)),
};

export const staffApi = {
  list: (params?: PageQuery & { role?: string; storeId?: number }) =>
    getList<Staff>('/staff', params),
  create: (body: Omit<Staff, 'id'>) => unwrap<Staff>(client.post('/staff', body)),
  update: (id: number, body: Partial<Staff>) => unwrap<Staff>(client.put(`/staff/${id}`, body)),
  remove: (id: number) => unwrap<void>(client.delete(`/staff/${id}`)),
};

export const pricingApi = {
  list: (params?: PageQuery) => getList<PricingItem>('/pricing', params),
  update: (id: number, body: Partial<PricingItem>) =>
    unwrap<PricingItem>(client.put(`/pricing/${id}`, body)),
};

export const authApi = {
  login: (body: LoginDTO) => unwrap<LoginResult>(client.post('/auth/login', body)),
  me: () => unwrap<UserInfo>(client.get('/auth/me')),
};
