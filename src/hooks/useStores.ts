import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storeApi } from '@/api/modules/storeApi';
import type { PageQuery } from '@/types/common';
import type { StoreStatus } from '@/types/store';

export interface StoreQuery extends PageQuery {
  status?: StoreStatus;
}

export function useStores(params?: StoreQuery) {
  return useQuery({
    queryKey: ['stores', params],
    queryFn: () => storeApi.list(params),
  });
}

export function useAllStores() {
  return useQuery({
    queryKey: ['stores', 'all'],
    queryFn: () => storeApi.list({ page: 1, pageSize: 999 }),
    select: (d) => d.list,
    staleTime: 60_000,
  });
}

export function useCreateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: storeApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stores'] }),
  });
}

export function useUpdateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: { id: number } & Parameters<typeof storeApi.update>[1]) =>
      storeApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stores'] }),
  });
}

export function useDeleteStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: storeApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stores'] }),
  });
}
