import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { poultryApi } from '@/api/modules/poultryApi';
import type { PageQuery } from '@/types/common';

export function usePoultry(params?: PageQuery) {
  return useQuery({
    queryKey: ['poultry', params],
    queryFn: () => poultryApi.list(params),
  });
}

export function useAllPoultry() {
  return useQuery({
    queryKey: ['poultry', 'all'],
    queryFn: () => poultryApi.list({ page: 1, pageSize: 999 }),
    select: (d) => d.list,
    staleTime: 60_000,
  });
}

export function usePoultryMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['poultry'] });
  return {
    create: useMutation({ mutationFn: poultryApi.create, onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, ...body }: { id: number } & Partial<Parameters<typeof poultryApi.create>[0]>) =>
        poultryApi.update(id, body),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: poultryApi.remove, onSuccess: invalidate }),
  };
}
