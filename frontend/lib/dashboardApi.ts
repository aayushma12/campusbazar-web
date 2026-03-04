import api from '@/lib/api';
import {
  buildFallbackStats,
  normalizeDashboardStats,
  normalizeOrders,
  normalizeProducts,
  type DashboardPayload,
  type DashboardStats,
} from '@/types/dashboard';
import { isCompletedOrder } from '@/types/order';

export interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

function extractArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];

  if (payload && typeof payload === 'object') {
    const maybeData = (payload as Record<string, unknown>).data;
    if (Array.isArray(maybeData)) return maybeData as T[];
  }

  return [];
}

function extractObject<T>(payload: unknown): T | null {
  if (!payload || typeof payload !== 'object') return null;

  const data = (payload as Record<string, unknown>).data;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return data as T;
  }

  if (!Array.isArray(payload)) {
    return payload as T;
  }

  return null;
}

async function getWithFallback<T>(primary: string, fallback?: string): Promise<T> {
  try {
    const response = await api.get<T>(primary);
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    const shouldTryFallback = Boolean(fallback) && (status === 404 || status === 405);

    if (!shouldTryFallback || !fallback) {
      throw error;
    }

    const fallbackResponse = await api.get<T>(fallback);
    return fallbackResponse.data;
  }
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats | null> => {
    const payload = await getWithFallback<ApiEnvelope<Record<string, unknown>>>('/orders/my-sales/metrics', '/dashboard/stats');
    const statsObject = extractObject<Record<string, unknown>>(payload);
    if (!statsObject) return null;
    return normalizeDashboardStats(statsObject);
  },

  getMyPurchases: async () => {
    const payload = await getWithFallback<ApiEnvelope<unknown[]>>('/orders/my-purchases', '/payment/history');
    return normalizeOrders(extractArray(payload));
  },

  getMySales: async () => {
    const payload = await getWithFallback<ApiEnvelope<unknown[]>>('/orders/my-sales', '/payment/history');
    return normalizeOrders(extractArray(payload));
  },

  getMyProducts: async () => {
    const payload = await getWithFallback<ApiEnvelope<unknown[]>>('/products/my-products', '/products/my-listings');
    return normalizeProducts(extractArray(payload));
  },

  getWishlist: async (): Promise<number> => {
    const payload = await getWithFallback<ApiEnvelope<unknown[]>>('/wishlist');
    return extractArray(payload).length;
  },

  getCart: async (): Promise<number> => {
    const payload = await getWithFallback<ApiEnvelope<unknown[]>>('/cart');
    return extractArray(payload).length;
  },

  getDashboardPayload: async (): Promise<DashboardPayload> => {
    const [stats, purchases, sales, products, wishlistCount, cartCount] = await Promise.all([
      dashboardApi.getStats().catch(() => null),
      dashboardApi.getMyPurchases().catch(() => []),
      dashboardApi.getMySales().catch(() => []),
      dashboardApi.getMyProducts().catch(() => []),
      dashboardApi.getWishlist().catch(() => 0),
      dashboardApi.getCart().catch(() => 0),
    ]);

    const fallbackStats = buildFallbackStats({ products, purchases, sales });
    const liveSalesRevenue = sales
      .filter((order) => isCompletedOrder(order.status))
      .reduce((sum, order) => sum + order.amount, 0);

    const liveSalesPending = sales.filter((order) =>
      order.status === 'pending' ||
      order.status === 'processing' ||
      order.status === 'accepted' ||
      order.status === 'handed_over' ||
      order.status === 'disputed'
    ).length;

    const liveSalesCompleted = sales.filter((order) => isCompletedOrder(order.status)).length;

    const liveOrderStatusStats = sales.reduce<Record<string, number>>((acc, order) => {
      acc[order.status] = (acc[order.status] ?? 0) + 1;
      return acc;
    }, {});

    const mergedStats: DashboardStats = {
      ...fallbackStats,
      ...(stats ?? {}),
      totalProducts: products.length,
      totalPurchases: purchases.length,
      totalSales: sales.length,
      totalRevenue: liveSalesRevenue,
      pendingOrders: liveSalesPending,
      completedOrders: liveSalesCompleted,
      orderStatusStats: {
        ...(stats?.orderStatusStats ?? {}),
        ...liveOrderStatusStats,
      },
    };

    const recentOrders = [...purchases, ...sales]
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 8);

    const recentProducts = [...products]
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 6);

    return {
      stats: mergedStats,
      recentOrders,
      recentProducts,
      wishlistCount,
      cartCount,
      purchases,
      sales,
      products,
    };
  },
};
