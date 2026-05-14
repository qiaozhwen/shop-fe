import client from './client';
import type { PageQuery, PageResult } from '@/types/common';

// 兼容两种返回：
//   1) 老协议（mock 返回 Result<T>）：response 拦截器透传 res（含 code/message/data），这里取 res.data
//   2) 新协议（裸 JSON）：response 拦截器已返回 data 本身，这里直接返回
export const unwrap = <T>(p: Promise<any>): Promise<T> =>
  p.then((r) => {
    if (r && typeof r === 'object' && 'data' in r && 'code' in r) {
      return r.data as T;
    }
    return r as T;
  });

export const getList = <T>(url: string, params?: PageQuery & Record<string, any>) =>
  unwrap<PageResult<T>>(client.get(url, { params }));

