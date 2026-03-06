'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '@/lib/chatApi';

export const CHAT_KEYS = {
    all: ['chats'] as const,
    conversations: () => [...CHAT_KEYS.all, 'list'] as const,
};

export function useGetConversations() {
    return useQuery({
        queryKey: CHAT_KEYS.conversations(),
        queryFn: chatApi.getConversations,
        staleTime: 1000 * 60 * 2, // 2 min
    });
}

export function useStartConversation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (productId: string) => chatApi.startConversation(productId),
        onSuccess: () => qc.invalidateQueries({ queryKey: CHAT_KEYS.conversations() }),
    });
}

export function useStartTutorConversation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (requestId: string) => chatApi.startTutorConversation(requestId),
        onSuccess: () => qc.invalidateQueries({ queryKey: CHAT_KEYS.conversations() }),
    });
}

export function useGetMessages(conversationId: string) {
    return useQuery({
        queryKey: [...CHAT_KEYS.all, 'messages', conversationId],
        queryFn: () => chatApi.getMessages(conversationId),
        enabled: !!conversationId,
        refetchInterval: 3000, // Background polling for simple real-time (ideally sockets)
    });
}

export function useSendMessage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ conversationId, text }: { conversationId: string; text: string }) =>
            chatApi.sendMessage(conversationId, text),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: [...CHAT_KEYS.all, 'messages', variables.conversationId] });
            qc.invalidateQueries({ queryKey: CHAT_KEYS.conversations() });
        },
    });
}

export function useMarkRead() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (conversationId: string) => chatApi.markRead(conversationId),
        onSuccess: (_, conversationId) => {
            qc.setQueryData<
                { success: boolean; data: Array<{ id?: string; _id?: string; unreadCount?: number }> } | undefined
            >(CHAT_KEYS.conversations(), (current) => {
                if (!current?.data) return current;

                return {
                    ...current,
                    data: current.data.map((conversation) => {
                        const matches =
                            conversation?.id === conversationId || conversation?._id === conversationId;

                        if (!matches) return conversation;
                        return { ...conversation, unreadCount: 0 };
                    }),
                };
            });
        },
    });
}
