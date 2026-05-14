import client from '../client';
import { unwrap } from '../helper';

export interface DashboardSummary {
  todaySales: number;
  todayOrders: number;
  poultryStock: number;
  todayLoss: number;
  processingPending: number;
  memberCount: number;
  storeCount: number;
  staffCount: number;
  salesTrend: { date: string; sales: number; orders: number }[];
  categoryRanking: { name: string; sales: number }[];
  stockByStore: { store: string; quantity: number }[];
}

export const dashboardApi = {
  summary: () => unwrap<DashboardSummary>(client.get('/dashboard/summary')),
};
