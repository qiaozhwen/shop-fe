import { request } from 'umi';

export interface HistoricalAmount {
  id: string;
  date: string;
  amount: number;
}

export async function queryList() {
  return request<HistoricalAmount[]>('/api/historical-amount');
}

export async function addItem(params: { date: string; amount: number }) {
  return request('/api/historical-amount', {
    method: 'POST',
    data: params,
  });
}

export async function deleteItem(id: string) {
  return request(`/api/historical-amount/${id}`, {
    method: 'DELETE',
  });
}