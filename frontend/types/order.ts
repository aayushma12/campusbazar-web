import { getProductId, normalizeProduct, type Product } from '@/types/product';
import { getUserId, normalizeUser, type User } from '@/types/user';

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'processing'
  | 'handed_over'
  | 'completed'
  | 'done'
  | 'paid'
  | 'cancelled'
  | 'failed'
  | 'disputed'
  | string;

export interface Order {
  id: string;
  _id?: string;
  status: OrderStatus;
  amount: number;
  price: number;
  quantity: number;
  transactionUUID?: string;
  productId?: string | Product;
  productIds?: Array<string | Product>;
  sellerId?: string | User;
  buyerId?: string | User;
  createdAt?: string;
  updatedAt?: string;
}

function getId(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const id = obj.id ?? obj._id;
    return typeof id === 'string' ? id : '';
  }
  return '';
}

export function getOrderId(value: unknown): string {
  return getId(value);
}

export function isCompletedOrder(status: string): boolean {
  return status === 'completed' || status === 'done' || status === 'paid';
}

function normalizeProductRef(value: unknown): string | Product | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;

  const normalized = normalizeProduct(value);
  if (normalized) return normalized;

  const fallbackId = getProductId(value);
  return fallbackId || undefined;
}

function normalizeUserRef(value: unknown): string | User | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;

  const normalized = normalizeUser(value);
  if (normalized) return normalized;

  const fallbackId = getUserId(value);
  return fallbackId || undefined;
}

export function normalizeOrder(value: unknown): Order | null {
  if (!value || typeof value !== 'object') return null;

  const obj = value as Record<string, any>;
  const id = getOrderId(obj);
  if (!id) return null;

  const amount = Number(obj.amount ?? 0);
  const price = Number(obj.price ?? amount ?? 0);
  const quantity = Number.isFinite(Number(obj.quantity)) ? Number(obj.quantity) : 1;

  return {
    id,
    _id: typeof obj._id === 'string' ? obj._id : undefined,
    status: String(obj.status ?? 'pending'),
    amount: Number.isFinite(amount) && amount > 0 ? amount : price * Math.max(1, quantity),
    price: Number.isFinite(price) ? price : 0,
    quantity: Math.max(1, quantity),
    transactionUUID: typeof obj.transactionUUID === 'string' ? obj.transactionUUID : undefined,
    productId: normalizeProductRef(obj.productId),
    productIds: Array.isArray(obj.productIds)
      ? obj.productIds
          .map((item: unknown) => normalizeProductRef(item))
          .filter((item): item is string | Product => Boolean(item))
      : undefined,
    sellerId: normalizeUserRef(obj.sellerId),
    buyerId: normalizeUserRef(obj.buyerId),
    createdAt: typeof obj.createdAt === 'string' ? obj.createdAt : undefined,
    updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : undefined,
  };
}
