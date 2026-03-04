"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
    useMarkAllNotificationsRead,
    useMarkNotificationRead,
    useNotificationRealtime,
    useNotifications,
    useUnreadNotificationCount,
} from '@/hooks/useNotifications';
import { timeAgo } from '@/lib/formatters';

export default function NotificationBell() {
    const { isAuthenticated } = useAuth();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const page = 1;
    const limit = 8;

    const { data: notificationsData, isLoading } = useNotifications(page, limit);
    const { data: unreadData } = useUnreadNotificationCount();
    const { mutateAsync: markRead, isPending: markingSingle } = useMarkNotificationRead(page, limit);
    const { mutateAsync: markAllRead, isPending: markingAll } = useMarkAllNotificationsRead(page, limit);

    useNotificationRealtime(isAuthenticated);

    useEffect(() => {
        const onClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    const notifications = notificationsData?.data?.notifications ?? [];
    const unreadCount = useMemo(() => {
        const fromCounter = unreadData?.data?.unreadCount;
        if (typeof fromCounter === 'number') return fromCounter;
        return notifications.filter((n) => !n.isRead).length;
    }, [notifications, unreadData?.data?.unreadCount]);

    if (!isAuthenticated) return null;

    const handleMarkRead = async (id?: string) => {
        if (!id) return;
        await markRead(id);
    };

    const handleMarkAllRead = async () => {
        await markAllRead();
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((prev) => !prev)}
                title="Notifications"
                aria-label="Notifications"
                className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600 hover:text-green-600 transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full inline-flex items-center justify-center ring-2 ring-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-84 max-w-[90vw] bg-white rounded-2xl shadow-xl shadow-gray-200/80 border border-gray-100 overflow-hidden z-50 animate-fade-up">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-bold text-gray-900">Notifications</p>
                            <p className="text-xs text-gray-500">
                                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up ✨'}
                            </p>
                        </div>
                        <button
                            onClick={handleMarkAllRead}
                            disabled={markingAll || unreadCount === 0}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Mark all read
                        </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                        {isLoading ? (
                            <div className="p-4 text-sm text-gray-500">Loading notifications...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-4 text-sm text-gray-500">No notifications yet.</div>
                        ) : (
                            notifications.map((notification) => (
                                <button
                                    key={notification.id || notification._id}
                                    onClick={() => handleMarkRead(notification.id || notification._id)}
                                    disabled={markingSingle}
                                    className={`w-full text-left px-4 py-3 transition-colors hover:bg-gray-50 ${
                                        notification.isRead ? 'bg-white' : 'bg-emerald-50/40'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={`text-sm ${notification.isRead ? 'font-medium text-gray-700' : 'font-semibold text-gray-900'}`}>
                                            {notification.title}
                                        </p>
                                        {!notification.isRead && <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                                    </div>
                                    <p className={`mt-1 text-xs ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                                        {notification.message}
                                    </p>
                                    <p className="mt-1 text-[11px] text-gray-400">{timeAgo(notification.createdAt)}</p>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
