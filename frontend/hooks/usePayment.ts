'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { esewaApi } from '@/lib/esewaApi';
import { DASHBOARD_KEYS } from '@/hooks/useDashboard';
import type { PaymentVerifyRequest } from '@/types/payment';

export const PAYMENT_KEYS = {
    all: ['payments'] as const,
    history: () => [...PAYMENT_KEYS.all, 'history'] as const,
};

export function usePaymentHistory() {
    return useQuery({
        queryKey: PAYMENT_KEYS.history(),
        queryFn: esewaApi.getHistory,
        staleTime: 1000 * 60 * 2, // 2 min
    });
}

export function useVerifyPayment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: PaymentVerifyRequest) => esewaApi.verify(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: PAYMENT_KEYS.history() });
            qc.invalidateQueries({ queryKey: DASHBOARD_KEYS.all });
        },
    });
}

export function useInitPayment() {
    return useMutation({
        mutationFn: (productId: string) => esewaApi.init(productId),
    });
}

export function useInitCartPayment() {
    return useMutation({
        mutationFn: (cartItems: any[]) => esewaApi.initCart(cartItems),
    });
}
