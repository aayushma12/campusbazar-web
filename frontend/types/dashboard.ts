import { normalizeOrder, type Order } from '@/types/order';
import { normalizeProduct, type Product } from '@/types/product';

export interface DashboardStats {
  totalProducts: number;
  totalPurchases: number;
  totalSales: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  orderStatusStats: Record<string, number>;
}

export interface DashboardPayload {
  stats: DashboardStats;
  recentOrders: Order[];
  recentProducts: Product[];
  wishlistCount: number;
  cartCount: number;
  purchases: Order[];
  sales: Order[];
  products: Product[];
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeProducts(payload: unknown[]): Product[] {
  if (!Array.isArray(payload)) return [];
  return payload
    .map((item) => normalizeProduct(item))
    .filter((item): item is Product => item !== null);
}

export function normalizeOrders(payload: unknown[]): Order[] {
  if (!Array.isArray(payload)) return [];
  return payload
    .map((item) => normalizeOrder(item))
    .filter((item): item is Order => item !== null);
}

export function normalizeDashboardStats(payload: Record<string, unknown>): DashboardStats {
  const orderStatusStatsRaw = payload.orderStatusStats;

  return {
    totalProducts: toNumber(payload.totalProducts),
    totalPurchases: toNumber(payload.totalPurchases),
    totalSales: toNumber(payload.totalSales),
    totalRevenue: toNumber(payload.totalRevenue),
    pendingOrders: toNumber(payload.pendingOrders),
    completedOrders: toNumber(payload.completedOrders),
    orderStatusStats:
      orderStatusStatsRaw && typeof orderStatusStatsRaw === 'object' && !Array.isArray(orderStatusStatsRaw)
        ? Object.fromEntries(
            Object.entries(orderStatusStatsRaw).map(([key, value]) => [key, toNumber(value)])
          )
        : {},
  };
}

export function buildFallbackStats(input: {
  products: Product[];
  purchases: Order[];
  sales: Order[];
}): DashboardStats {
  const { products, purchases, sales } = input;

  const completedOrders = sales.filter((order) =>
    ['completed', 'done', 'paid'].includes(order.status)
  );
  const pendingOrders = sales.filter((order) =>
    ['pending', 'processing', 'accepted', 'handed_over', 'disputed'].includes(order.status)
  );

  const orderStatusStats = sales.reduce<Record<string, number>>((acc, order) => {
    acc[order.status] = (acc[order.status] ?? 0) + 1;
    return acc;
  }, {});

  return {
    totalProducts: products.length,
    totalPurchases: purchases.length,
    totalSales: sales.length,
    totalRevenue: completedOrders.reduce((sum, order) => sum + order.amount, 0),
    pendingOrders: pendingOrders.length,
    completedOrders: completedOrders.length,
    orderStatusStats,
  };
}
