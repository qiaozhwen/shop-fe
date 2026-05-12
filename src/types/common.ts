// 通用类型
export interface PageQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

export interface PageResult<T> {
  list: T[];
  total: number;
}

export interface Result<T> {
  code: number;
  message: string;
  data: T;
}

export type ID = number;
