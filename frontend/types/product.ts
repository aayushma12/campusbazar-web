import { getUserId, isUserDeleted, normalizeUser, type User } from '@/types/user';

export type ProductCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';
export type ProductStatus = 'available' | 'reserved' | 'sold' | string;

export interface Category {
  id: string;
  _id?: string;
  name: string;
  parentId?: string;
}

export interface Seller extends User {}

export interface Product {
  id: string;
  _id?: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  campus: string;
  condition: ProductCondition;
  status: ProductStatus;
  negotiable: boolean;
  images: string[];
  category?: string | Category;
  categoryId?: string | Category;
  ownerId?: string | Seller;
  seller?: Seller;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  campus?: string;
  condition?: ProductCondition;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductResponse {
  success: boolean;
  data: Product | null;
}

export const CAMPUS_OPTIONS = [
  'Pulchowk Campus',
  'Thapathali Campus',
  'Patan Campus',
  'Bhaktapur Campus',
  'Kirtipur Campus',
  'Lalitpur Campus',
  'Baneshwor Campus',
  'Kupondole Campus',
] as const;

export const CONDITION_OPTIONS: Array<{ value: ProductCondition; label: string }> = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

export const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'price:asc', label: 'Price: Low to High' },
  { value: 'price:desc', label: 'Price: High to Low' },
];

export const CONDITION_LABELS: Record<ProductCondition, string> = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

export const CONDITION_COLORS: Record<ProductCondition, string> = {
  new: '#16A34A',
  like_new: '#0D9488',
  good: '#2563EB',
  fair: '#D97706',
  poor: '#DC2626',
};

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

export function getProductId(product: unknown): string {
  if (!product || typeof product !== 'object') return '';
  const obj = product as Record<string, unknown>;
  return getId(obj) || getId(obj.productId);
}

export function getCategoryId(category: unknown): string {
  return getId(category);
}

export function normalizeProductImages(images: unknown): string[] {
  if (!Array.isArray(images)) return [];
  return images.filter((item): item is string => typeof item === 'string' && item.length > 0);
}

function normalizeCategory(value: unknown): Category | null {
  if (!value || typeof value !== 'object') return null;
  const obj = value as Record<string, unknown>;
  const id = getId(obj);
  if (!id) return null;

  return {
    id,
    _id: typeof obj._id === 'string' ? obj._id : undefined,
    name: String(obj.name ?? 'General'),
    parentId: typeof obj.parentId === 'string' ? obj.parentId : undefined,
  };
}

export function normalizeProduct(value: unknown): Product | null {
  if (!value || typeof value !== 'object') return null;
  const obj = value as Record<string, any>;
  const id = getProductId(obj);
  if (!id) return null;

  const rawOwner = obj.seller ?? obj.ownerId;
  const ownerId = getUserId(rawOwner);

  // Hide orphan listings (e.g. seller account deleted) from public product feeds.
  if (!ownerId) return null;

  // Hide listings whose seller has been soft-deleted by admin.
  if (isUserDeleted(rawOwner)) return null;

  const conditionRaw = String(obj.condition ?? 'good') as ProductCondition;
  const condition: ProductCondition = CONDITION_LABELS[conditionRaw] ? conditionRaw : 'good';

  const seller = normalizeUser(rawOwner);
  const categoryObject = normalizeCategory(obj.category ?? obj.categoryId);

  return {
    id,
    _id: typeof obj._id === 'string' ? obj._id : undefined,
    title: String(obj.title ?? 'Untitled Product'),
    description: String(obj.description ?? ''),
    price: Number(obj.price ?? 0),
    quantity: Number.isFinite(Number(obj.quantity)) ? Number(obj.quantity) : 0,
    campus: String(obj.campus ?? seller?.campus ?? 'Unknown Campus'),
    condition,
    status: String(obj.status ?? 'available'),
    negotiable: Boolean(obj.negotiable),
    images: normalizeProductImages(obj.images),
    category: categoryObject ?? (getId(obj.category) || undefined),
    categoryId: categoryObject ?? (getId(obj.categoryId) || undefined),
    ownerId: seller ?? ownerId,
    seller: seller ?? undefined,
    views: Number.isFinite(Number(obj.views)) ? Number(obj.views) : 0,
    createdAt: typeof obj.createdAt === 'string' ? obj.createdAt : undefined,
    updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : undefined,
  };
}
