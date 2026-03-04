import api from './api';

export type NotificationType =
    | 'new_message'
    | 'new_order'
    | 'order_status_changed'
    | 'new_product_uploaded'
    | 'product_updated'
    | 'product_deleted'
    | 'product_sold'
    | 'order_completed'
    | 'admin_activity'
    | 'tutor_request_accepted'
    | 'system';

export interface AppNotification {
    id?: string;
    _id?: string;
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    referenceId?: string;
    isRead: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface NotificationListPayload {
    notifications: AppNotification[];
    unreadCount: number;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

function normalizeNotification(raw: any): AppNotification {
    return {
        id: raw?.id || raw?._id,
        _id: raw?._id || raw?.id,
        userId: String(raw?.userId ?? ''),
        title: String(raw?.title ?? ''),
        message: String(raw?.message ?? ''),
        type: (raw?.type ?? 'system') as NotificationType,
        referenceId: raw?.referenceId ? String(raw.referenceId) : undefined,
        isRead: Boolean(raw?.isRead),
        createdAt: raw?.createdAt || new Date().toISOString(),
        updatedAt: raw?.updatedAt,
    };
}

export const notificationApi = {
    list: async (page = 1, limit = 20): Promise<{ success: boolean; data: NotificationListPayload }> => {
        const { data } = await api.get('/notifications', { params: { page, limit } });

        const payload = data?.data ?? {};
        const notifications = Array.isArray(payload?.notifications)
            ? payload.notifications.map((item: any) => normalizeNotification(item))
            : [];

        return {
            success: Boolean(data?.success),
            data: {
                notifications,
                unreadCount: Number(payload?.unreadCount ?? 0),
                pagination: {
                    total: Number(payload?.pagination?.total ?? notifications.length),
                    page: Number(payload?.pagination?.page ?? page),
                    limit: Number(payload?.pagination?.limit ?? limit),
                    totalPages: Number(payload?.pagination?.totalPages ?? 1),
                },
            },
        };
    },

    unreadCount: async (): Promise<{ success: boolean; data: { unreadCount: number } }> => {
        const { data } = await api.get('/notifications/unread-count');
        return {
            success: Boolean(data?.success),
            data: {
                unreadCount: Number(data?.data?.unreadCount ?? 0),
            },
        };
    },

    markRead: async (id: string): Promise<{ success: boolean; data: AppNotification }> => {
        const { data } = await api.patch(`/notifications/${id}/read`);
        return {
            success: Boolean(data?.success),
            data: normalizeNotification(data?.data),
        };
    },

    markAllRead: async (): Promise<{ success: boolean; data: { updatedCount: number } }> => {
        const { data } = await api.patch('/notifications/read-all');
        return {
            success: Boolean(data?.success),
            data: {
                updatedCount: Number(data?.data?.updatedCount ?? 0),
            },
        };
    },
};
