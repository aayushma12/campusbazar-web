'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '@/lib/notificationApi';
import { useAuthStore } from '@/store/authStore';

export const NOTIFICATION_KEYS = {
    all: ['notifications'] as const,
    list: (page = 1, limit = 20) => [...NOTIFICATION_KEYS.all, 'list', page, limit] as const,
    unread: () => [...NOTIFICATION_KEYS.all, 'unread'] as const,
};

function getSocketBaseUrl() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    return apiUrl.replace(/\/api\/v1\/?$/, '');
}

export function useNotifications(page = 1, limit = 20) {
    return useQuery({
        queryKey: NOTIFICATION_KEYS.list(page, limit),
        queryFn: () => notificationApi.list(page, limit),
        refetchInterval: 15000,
        staleTime: 1000 * 10,
    });
}

export function useUnreadNotificationCount() {
    return useQuery({
        queryKey: NOTIFICATION_KEYS.unread(),
        queryFn: notificationApi.unreadCount,
        refetchInterval: 15000,
        staleTime: 1000 * 10,
    });
}

export function useMarkNotificationRead(page = 1, limit = 20) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => notificationApi.markRead(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.list(page, limit) });
            qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unread() });
        },
    });
}

export function useMarkAllNotificationsRead(page = 1, limit = 20) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: notificationApi.markAllRead,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.list(page, limit) });
            qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unread() });
        },
    });
}

export function useNotificationRealtime(enabled: boolean) {
    const queryClient = useQueryClient();
    const accessToken = useAuthStore((state) => state.accessToken);

    useEffect(() => {
        if (!enabled || !accessToken) return;

        const socket = io(getSocketBaseUrl(), {
            transports: ['websocket'],
            auth: { token: `Bearer ${accessToken}` },
            reconnection: true,
        });

        const refreshNotifications = () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
        };

        socket.on('notification:created', refreshNotifications);

        return () => {
            socket.off('notification:created', refreshNotifications);
            socket.disconnect();
        };
    }, [enabled, accessToken, queryClient]);
}
