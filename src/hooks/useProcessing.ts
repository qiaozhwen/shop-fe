import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { processingApi } from '@/api/modules/processingApi';
import type { PageQuery } from '@/types/common';
import type { ProcessingStatus } from '@/types/processing';

export function useProcessingTasks(params?: PageQuery & { status?: ProcessingStatus; active?: boolean }) {
  return useQuery({
    queryKey: ['processingTasks', params],
    queryFn: () => processingApi.list(params),
  });
}

export function useProcessingMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['processingTasks'] });
  return {
    advance: useMutation({ mutationFn: processingApi.advance, onSuccess: invalidate }),
    assign: useMutation({
      mutationFn: ({ id, workerId, workerName }: { id: number; workerId: number; workerName: string }) =>
        processingApi.assign(id, { workerId, workerName }),
      onSuccess: invalidate,
    }),
  };
}
