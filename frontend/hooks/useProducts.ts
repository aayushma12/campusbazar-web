'use client';

import {
    useInfiniteQuery,
    useQuery,
    useMutation,
    useQueryClient,
    InfiniteData,
} from '@tanstack/react-query';
import { productApi, categoryApi, wishlistApi } from '@/lib/productApi';
import { DASHBOARD_KEYS } from '@/hooks/useDashboard';
import type { ProductFilters, ProductsResponse } from '@/types/product';

// ─── Query Keys ─────────────────────────────────────────────────────────────

export const PRODUCT_KEYS = {
    all: ['products'] as const,
    lists: () => [...PRODUCT_KEYS.all, 'list'] as const,
    list: (filters: Omit<ProductFilters, 'page'>) =>
        [...PRODUCT_KEYS.lists(), filters] as const,
    details: () => [...PRODUCT_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...PRODUCT_KEYS.details(), id] as const,
    myListings: () => [...PRODUCT_KEYS.all, 'my-listings'] as const,
    wishlist: () => ['wishlist'] as const,
    categories: () => ['categories'] as const,
};

// ─── useGetProducts — Infinite scroll ────────────────────────────────────────

/**
 * Fetches paginated products with infinite scroll support.
 * Filters are applied via URL search params.
 */
export function useGetProducts(filters: Omit<ProductFilters, 'page'>) {
    return useInfiniteQuery<
        ProductsResponse,
        Error,
        InfiniteData<ProductsResponse>,
        ReturnType<typeof PRODUCT_KEYS.list>,
        number
    >({
        queryKey: PRODUCT_KEYS.list(filters),
        queryFn: ({ pageParam }) =>
            productApi.getAll({ ...filters, page: pageParam, limit: 12 }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { page, totalPages } = lastPage.pagination;
            return page < totalPages ? page + 1 : undefined;
        },
        staleTime: 1000 * 60 * 2, // 2 min
    });
}

// ─── useGetProductById ───────────────────────────────────────────────────────

export function useGetProductById(id: string) {
    return useQuery({
        queryKey: PRODUCT_KEYS.detail(id),
        queryFn: () => productApi.getById(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 min
    });
}

// ─── useGetMyListings ─────────────────────────────────────────────────────────

export function useGetMyListings(page = 1, limit = 12) {
    return useQuery({
        queryKey: [...PRODUCT_KEYS.myListings(), page, limit],
        queryFn: () => productApi.getMyListings(page, limit),
        staleTime: 1000 * 60 * 2,
    });
}

// ─── useCreateProduct ────────────────────────────────────────────────────────

export function useCreateProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (formData: FormData) => productApi.create(formData),
        onSuccess: () => {
            // Invalidate all product lists and my-listings
            qc.invalidateQueries({ queryKey: PRODUCT_KEYS.lists() });
            qc.invalidateQueries({ queryKey: PRODUCT_KEYS.myListings() });
            qc.invalidateQueries({ queryKey: DASHBOARD_KEYS.all });
        },
    });
}

// ─── useUpdateProduct ────────────────────────────────────────────────────────

export function useUpdateProduct(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (formData: FormData) => productApi.update(id, formData),
        onSuccess: () => {
            // Invalidate product detail + lists
            qc.invalidateQueries({ queryKey: PRODUCT_KEYS.detail(id) });
            qc.invalidateQueries({ queryKey: PRODUCT_KEYS.lists() });
            qc.invalidateQueries({ queryKey: PRODUCT_KEYS.myListings() });
            qc.invalidateQueries({ queryKey: DASHBOARD_KEYS.all });
        },
    });
}

// ─── useDeleteProduct ────────────────────────────────────────────────────────

export function useDeleteProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => productApi.delete(id),
        onSuccess: (_data, id) => {
            qc.removeQueries({ queryKey: PRODUCT_KEYS.detail(id) });
            qc.invalidateQueries({ queryKey: PRODUCT_KEYS.lists() });
            qc.invalidateQueries({ queryKey: PRODUCT_KEYS.myListings() });
            qc.invalidateQueries({ queryKey: DASHBOARD_KEYS.all });
        },
    });
}

// ─── useChangeProductStatus ────────────────────────────────────────────────

export function useChangeProductStatus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: 'available' | 'reserved' | 'sold' }) =>
            productApi.updateStatus(id, status),
        onSuccess: (_data, { id }) => {
            qc.invalidateQueries({ queryKey: PRODUCT_KEYS.detail(id) });
            qc.invalidateQueries({ queryKey: PRODUCT_KEYS.lists() });
            qc.invalidateQueries({ queryKey: PRODUCT_KEYS.myListings() });
            qc.invalidateQueries({ queryKey: DASHBOARD_KEYS.all });
        },
    });
}

// ─── useCategories ───────────────────────────────────────────────────────────

export function useCategories() {
    return useQuery({
        queryKey: PRODUCT_KEYS.categories(),
        queryFn: categoryApi.getAll,
        staleTime: 1000 * 60 * 30, // 30 min — categories rarely change
    });
}

export function useCreateCategory() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (name: string) => categoryApi.create(name),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: PRODUCT_KEYS.categories() });
        },
    });
}

// ─── useWishlist ─────────────────────────────────────────────────────────────

export function useWishlist() {
    return useQuery({
        queryKey: PRODUCT_KEYS.wishlist(),
        queryFn: wishlistApi.get,
        staleTime: 1000 * 60 * 5,
    });
}

// ─── useToggleWishlist — optimistic ──────────────────────────────────────────

export function useToggleWishlist() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async ({
            productId,
            isWishlisted,
        }: {
            productId: string;
            isWishlisted: boolean;
        }) => {
            if (isWishlisted) {
                return wishlistApi.remove(productId);
            } else {
                return wishlistApi.add(productId);
            }
        },
        onMutate: async ({ productId, isWishlisted }) => {
            await qc.cancelQueries({ queryKey: PRODUCT_KEYS.wishlist() });
            const previous = qc.getQueryData(PRODUCT_KEYS.wishlist());

            // Optimistic update
            qc.setQueryData(PRODUCT_KEYS.wishlist(), (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    data: isWishlisted
                        ? old.data.filter(
                            (w: any) => (w.productId?._id ?? w.productId?.id ?? w.productId) !== productId
                        )
                        : [...(old.data ?? []), { productId: { _id: productId, id: productId } }],
                };
            });

            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous !== undefined) {
                qc.setQueryData(PRODUCT_KEYS.wishlist(), context.previous);
            }
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: PRODUCT_KEYS.wishlist() });
            qc.invalidateQueries({ queryKey: DASHBOARD_KEYS.all });
        },
    });
}
