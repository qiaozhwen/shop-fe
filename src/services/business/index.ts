import { request } from '@umijs/max';

export interface HistoricalAmount {
  id: string;
  date: string;
  amount: number;
}

export async function queryList() {
  return request<HistoricalAmount[]>('/api/historicalAmount');
}

export async function addItem(params: { date: string; amount: number }) {
  return request('/api/historicalAmount', {
    method: 'POST',
    data: params,
  });
}

export async function deleteItem(id: string) {
  return request(`/api/historicalAmount/${id}`, {
    method: 'DELETE',
  });
}
