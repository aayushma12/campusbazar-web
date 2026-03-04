import api from '@/lib/api';
import { normalizeOrder, type Order } from '@/types/order';

export interface OrderListResponse {
  success: boolean;
  data: Order[];
  total?: number;
}

export interface OrderItemResponse {
  success: boolean;
  data: Order;
}

function normalizeOrderList(payload: unknown): Order[] {
  if (!Array.isArray(payload)) return [];
  return payload.map((item) => normalizeOrder(item)).filter((item): item is Order => item !== null);
}

function normalizeOrderItem(payload: unknown): Order | null {
  return normalizeOrder(payload);
}

export const orderApi = {
  getMyPurchases: async (): Promise<OrderListResponse> => {
    const { data } = await api.get<OrderListResponse>('/orders/my-purchases');
    return {
      ...data,
      data: normalizeOrderList(data?.data),
    };
  },

  getMySales: async (): Promise<OrderListResponse> => {
    const { data } = await api.get<OrderListResponse>('/orders/my-sales');
    return {
      ...data,
      data: normalizeOrderList(data?.data),
    };
  },

  completeOrder: async (orderId: string): Promise<OrderItemResponse> => {
    const { data } = await api.patch<OrderItemResponse>(`/orders/${orderId}/complete`);
    const normalized = normalizeOrderItem(data?.data);
    if (!normalized) {
      throw new Error('Invalid order payload returned from complete order API');
    }
    return {
      ...data,
      data: normalized,
    };
  },

  getOrderById: async (orderId: string): Promise<OrderItemResponse> => {
    const { data } = await api.get<OrderItemResponse>(`/orders/${orderId}`);
    const normalized = normalizeOrderItem(data?.data);
    if (!normalized) {
      throw new Error('Invalid order payload returned from get order API');
    }
    return {
      ...data,
      data: normalized,
    };
  }
};
