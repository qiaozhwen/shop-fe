import client from './client';
import type { PageQuery, PageResult } from '@/types/common';

// 拦截器把 Result<T> 解包后返回 res（仍含 code/message/data）；这里再取 res.data。
export const unwrap = <T>(p: Promise<any>): Promise<T> => p.then((r) => r.data as T);

export const getList = <T>(url: string, params?: PageQuery & Record<string, any>) =>
  unwrap<PageResult<T>>(client.get(url, { params }));
