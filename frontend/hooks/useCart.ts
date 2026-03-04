'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '@/lib/cartApi';
import { DASHBOARD_KEYS } from '@/hooks/useDashboard';
import toast from 'react-hot-toast';

export const CART_KEYS = {
    all: ['cart'] as const,
    list: () => [...CART_KEYS.all, 'list'] as const,
};

export function useCart() {
    return useQuery({
        queryKey: CART_KEYS.list(),
        queryFn: cartApi.get,
        staleTime: 1000 * 60 * 5, // 5 min
    });
}

export function useAddToCart() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ productId, quantity }: { productId: string; quantity?: number }) =>
            cartApi.add(productId, quantity),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: CART_KEYS.list() });
            qc.invalidateQueries({ queryKey: DASHBOARD_KEYS.all });
            toast.success('Added to cart! 🛒');
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || 'Failed to add to cart');
        }
    });
}

export function useUpdateCartQuantity() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
            cartApi.updateQuantity(id, quantity),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: CART_KEYS.list() });
            qc.invalidateQueries({ queryKey: DASHBOARD_KEYS.all });
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update quantity')
    });
}

export function useRemoveFromCart() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => cartApi.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: CART_KEYS.list() });
            qc.invalidateQueries({ queryKey: DASHBOARD_KEYS.all });
            toast.success('Removed from cart');
        },
        onError: () => toast.error('Failed to remove item')
    });
}

export function useClearCart() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: cartApi.clear,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: CART_KEYS.list() });
            qc.invalidateQueries({ queryKey: DASHBOARD_KEYS.all });
        }
    });
}
