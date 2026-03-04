'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '@/lib/orderApi';
import { DASHBOARD_KEYS } from '@/hooks/useDashboard';
import { PAYMENT_KEYS } from '@/hooks/usePayment';

export const ORDERS_KEYS = {
  all: ['orders'] as const,
  purchases: () => [...ORDERS_KEYS.all, 'purchases'] as const,
  sales: () => [...ORDERS_KEYS.all, 'sales'] as const,
};

export function useMyPurchases() {
  return useQuery({
    queryKey: ORDERS_KEYS.purchases(),
    queryFn: orderApi.getMyPurchases,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30,
  });
}

export function useMySales() {
  return useQuery({
    queryKey: ORDERS_KEYS.sales(),
    queryFn: orderApi.getMySales,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30,
  });
}

export function useCompleteOrder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => orderApi.completeOrder(orderId),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ORDERS_KEYS.purchases(), refetchType: 'active' }),
        qc.invalidateQueries({ queryKey: ORDERS_KEYS.sales(), refetchType: 'active' }),
        qc.invalidateQueries({ queryKey: DASHBOARD_KEYS.all, refetchType: 'active' }),
        qc.invalidateQueries({ queryKey: PAYMENT_KEYS.history(), refetchType: 'active' }),
      ]);
    },
  });
}
