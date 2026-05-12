import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '@/api/modules/inventoryApi';
import type { PageQuery } from '@/types/common';

export function useInventory(params?: PageQuery & { storeId?: number; categoryId?: number }) {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: () => inventoryApi.list(params),
  });
}

export function useInventoryMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['inventory'] });
  return {
    create: useMutation({ mutationFn: inventoryApi.create, onSuccess: invalidate }),
    adjust: useMutation({
      mutationFn: ({ id, ...body }: { id: number; delta: number; reason: string }) =>
        inventoryApi.adjust(id, body),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: inventoryApi.remove, onSuccess: invalidate }),
  };
}
