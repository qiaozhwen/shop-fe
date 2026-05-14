import client from '../client';
import { unwrap, getList } from '../helper';
import type { ProcessingTask, ProcessingStatus } from '@/types/processing';
import type { PageQuery } from '@/types/common';

export const processingApi = {
  list: (params?: PageQuery & { status?: ProcessingStatus }) =>
    getList<ProcessingTask>('/processing-tasks', params),
  advance: (id: number) => unwrap<ProcessingTask>(client.post(`/processing-tasks/${id}/advance`)),
  assign: (id: number, body: { workerId: number; workerName: string }) =>
    unwrap<ProcessingTask>(client.post(`/processing-tasks/${id}/assign`, body)),
};
