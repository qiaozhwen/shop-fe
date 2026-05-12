import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplierApi, purchaseApi, lossApi } from '@/api/modules/bizApi';
import type { PageQuery } from '@/types/common';

export function useSuppliers(params?: PageQuery) {
  return useQuery({ queryKey: ['suppliers', params], queryFn: () => supplierApi.list(params) });
}
export function useAllSuppliers() {
  return useQuery({
    queryKey: ['suppliers', 'all'],
    queryFn: () => supplierApi.list({ page: 1, pageSize: 999 }),
    select: (d) => d.list,
    staleTime: 60_000,
  });
}
export function useSupplierMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['suppliers'] });
  return {
    create: useMutation({ mutationFn: supplierApi.create, onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, ...body }: { id: number } & Partial<Parameters<typeof supplierApi.create>[0]>) =>
        supplierApi.update(id, body),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: supplierApi.remove, onSuccess: invalidate }),
  };
}

export function usePurchases(params?: PageQuery) {
  return useQuery({ queryKey: ['purchases', params], queryFn: () => purchaseApi.list(params) });
}
export function usePurchaseMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['purchases'] });
    qc.invalidateQueries({ queryKey: ['inventory'] });
  };
  return {
    create: useMutation({ mutationFn: purchaseApi.create, onSuccess: invalidate }),
    receive: useMutation({ mutationFn: purchaseApi.receive, onSuccess: invalidate }),
  };
}

export function useLosses(params?: PageQuery) {
  return useQuery({ queryKey: ['losses', params], queryFn: () => lossApi.list(params) });
}
export function useLossMutations() {
  const qc = useQueryClient();
  return {
    create: useMutation({
      mutationFn: lossApi.create,
      onSuccess: () => qc.invalidateQueries({ queryKey: ['losses'] }),
    }),
  };
}
