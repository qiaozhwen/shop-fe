import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memberApi, staffApi, pricingApi } from '@/api/modules/peopleApi';
import { dashboardApi } from '@/api/modules/dashboardApi';
import type { PageQuery } from '@/types/common';

export function useMembers(params?: PageQuery) {
  return useQuery({ queryKey: ['members', params], queryFn: () => memberApi.list(params) });
}
export function useMemberMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['members'] });
  return {
    create: useMutation({ mutationFn: memberApi.create, onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, ...body }: { id: number } & Partial<Parameters<typeof memberApi.create>[0]>) =>
        memberApi.update(id, body),
      onSuccess: invalidate,
    }),
  };
}

export function useStaff(params?: PageQuery & { role?: string; storeId?: number }) {
  return useQuery({ queryKey: ['staff', params], queryFn: () => staffApi.list(params) });
}
export function useAllStaff() {
  return useQuery({
    queryKey: ['staff', 'all'],
    queryFn: () => staffApi.list({ page: 1, pageSize: 999 }),
    select: (d) => d.list,
    staleTime: 60_000,
  });
}
export function useStaffMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['staff'] });
  return {
    create: useMutation({ mutationFn: staffApi.create, onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, ...body }: { id: number } & Partial<Parameters<typeof staffApi.create>[0]>) =>
        staffApi.update(id, body),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: staffApi.remove, onSuccess: invalidate }),
  };
}

export function usePricing(params?: PageQuery) {
  return useQuery({ queryKey: ['pricing', params], queryFn: () => pricingApi.list(params) });
}
export function usePricingMutations() {
  const qc = useQueryClient();
  return {
    update: useMutation({
      mutationFn: ({ id, ...body }: { id: number } & Partial<Parameters<typeof pricingApi.update>[1]>) =>
        pricingApi.update(id, body),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['pricing'] }),
    }),
  };
}

export function useDashboard() {
  return useQuery({ queryKey: ['dashboard', 'summary'], queryFn: () => dashboardApi.summary() });
}
