import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesOrderApi } from '@/api/modules/salesOrderApi';
import type { PageQuery } from '@/types/common';
import type { OrderStatus } from '@/types/order';

export function useSalesOrders(params?: PageQuery & { status?: OrderStatus; storeId?: number }) {
  return useQuery({
    queryKey: ['salesOrders', params],
    queryFn: () => salesOrderApi.list(params),
  });
}

export function useSalesOrder(id?: number) {
  return useQuery({
    queryKey: ['salesOrders', id],
    queryFn: () => salesOrderApi.get(id!),
    enabled: !!id,
  });
}

export function useSalesOrderMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['salesOrders'] });
    qc.invalidateQueries({ queryKey: ['processingTasks'] });
    qc.invalidateQueries({ queryKey: ['inventory'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  };
  return {
    create: useMutation({ mutationFn: salesOrderApi.create, onSuccess: invalidate }),
    updateStatus: useMutation({
      mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
        salesOrderApi.updateStatus(id, status),
      onSuccess: invalidate,
    }),
  };
}
