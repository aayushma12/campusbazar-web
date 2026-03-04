'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/dashboardApi';

export const DASHBOARD_KEYS = {
  all: ['dashboard'] as const,
  stats: () => [...DASHBOARD_KEYS.all, 'stats'] as const,
};

export function useDashboardData() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.stats(),
    queryFn: dashboardApi.getDashboardPayload,
    staleTime: 1000 * 10,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 5,
    retry: 2,
  });
}
