'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingApi, CreateBookingDto } from '@/lib/bookingApi';

export const useCreateBooking = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: CreateBookingDto) => bookingApi.create(dto),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
    });
};

export const useMyBookings = (role: 'student' | 'tutor' = 'student') =>
    useQuery({
        queryKey: ['bookings', role],
        queryFn: () => bookingApi.getMyBookings(role),
    });

export const useBooking = (id: string) =>
    useQuery({
        queryKey: ['booking', id],
        queryFn: () => bookingApi.getById(id),
        enabled: !!id,
    });

export const useInitiateBookingPayment = () =>
    useMutation({
        mutationFn: (bookingId: string) => bookingApi.initiatePayment(bookingId),
    });

export const useConfirmBookingPayment = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ bookingId, payload }: {
            bookingId: string;
            payload: { transactionCode: string; transactionUUID: string; amount: string };
        }) => bookingApi.confirmPayment(bookingId, payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
    });
};

export const useCancelBooking = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (bookingId: string) => bookingApi.cancel(bookingId),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
    });
};

export const useWallet = () =>
    useQuery({
        queryKey: ['wallet'],
        queryFn: () => bookingApi.getWallet(),
    });
