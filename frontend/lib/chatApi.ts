import api from './api';

export interface ChatConversation {
    id: string;
    _id?: string;
    chatType?: 'product' | 'tutor';
    requestId?: string;
    productId?: {
        id: string;
        title: string;
        images: string[];
        price: number;
    };
    participants: {
        id: string;
        name: string;
        profilePicture?: string;
        role?: 'student' | 'tutor' | 'buyer' | 'seller' | 'admin' | 'unknown';
    }[];
    lastMessage?: {
        text: string;
        createdAt: string;
        senderId: string;
    };
    unreadCount: number;
    updatedAt: string;
}

export interface ChatMessage {
    _id: string;
    conversationId: string;
    senderId: string;
    senderName?: string;
    senderRole?: 'student' | 'tutor' | 'buyer' | 'seller' | 'admin' | 'unknown';
    text: string;
    messageType?: 'text';
    read: boolean;
    createdAt: string;
    updatedAt?: string;
}

async function getWithFallback<T>(primaryPath: string, fallbackPath?: string): Promise<T> {
    try {
        const { data } = await api.get<T>(primaryPath);
        return data;
    } catch (error: any) {
        const status = error?.response?.status;
        if (!fallbackPath || (status !== 404 && status !== 405)) {
            throw error;
        }

        const { data } = await api.get<T>(fallbackPath);
        return data;
    }
}

async function postWithFallback<T>(primaryPath: string, body: unknown, fallbackPath?: string): Promise<T> {
    try {
        const { data } = await api.post<T>(primaryPath, body);
        return data;
    } catch (error: any) {
        const status = error?.response?.status;
        if (!fallbackPath || (status !== 404 && status !== 405)) {
            throw error;
        }

        const { data } = await api.post<T>(fallbackPath, body);
        return data;
    }
}

async function patchWithFallback<T>(primaryPath: string, body: unknown, fallbackPath?: string): Promise<T> {
    try {
        const { data } = await api.patch<T>(primaryPath, body);
        return data;
    } catch (error: any) {
        const status = error?.response?.status;
        if (!fallbackPath || (status !== 404 && status !== 405)) {
            throw error;
        }

        const { data } = await api.patch<T>(fallbackPath, body);
        return data;
    }
}

function normalizeMessage(raw: any): ChatMessage {
    return {
        _id: raw?._id,
        conversationId: raw?.conversationId || raw?.chatRoomId,
        senderId: raw?.senderId,
        senderName: raw?.senderName,
        senderRole: raw?.senderRole,
        text: raw?.text || raw?.message || '',
        messageType: 'text',
        read: Boolean(raw?.read),
        createdAt: raw?.createdAt || raw?.timestamp,
        updatedAt: raw?.updatedAt,
    };
}

export const chatApi = {
    getConversations: async (): Promise<{ success: boolean; data: ChatConversation[] }> => {
        const { data } = await api.get('/chats');
        return data;
    },

    startConversation: async (productId: string): Promise<{ success: boolean; data: ChatConversation }> => {
        const { data } = await api.post('/chats', { productId });
        return data;
    },

    startTutorConversation: async (requestId: string): Promise<{ success: boolean; data: ChatConversation }> => {
        try {
            const { data } = await api.get(`/chat/${requestId}`);
            return data;
        } catch (error: any) {
            const status = error?.response?.status;
            if (status !== 404 && status !== 405) {
                throw error;
            }

            const { data } = await api.post(`/chats/tutor/${requestId}`);
            return data;
        }
    },

    getMessages: async (conversationId: string, page = 1): Promise<{ success: boolean; data: ChatMessage[] }> => {
        const payload = await getWithFallback<any>(
            `/chat/messages/${conversationId}?page=${page}`,
            `/chats/${conversationId}/messages?page=${page}`
        );

        if (Array.isArray(payload?.messages)) {
            return {
                success: Boolean(payload?.success),
                data: payload.messages.map((message: any) => normalizeMessage(message)),
            };
        }

        const data = Array.isArray(payload?.data) ? payload.data : [];
        return {
            success: Boolean(payload?.success),
            data: data.map((message: any) => normalizeMessage(message)),
        };
    },

    sendMessage: async (conversationId: string, text: string): Promise<{ success: boolean; data: ChatMessage }> => {
        try {
            const { data } = await api.post('/chat/message', {
                chatRoomId: conversationId,
                message: text,
            });

            return {
                success: Boolean(data?.success),
                data: normalizeMessage(data?.data),
            };
        } catch (error: any) {
            const status = error?.response?.status;
            if (status !== 404 && status !== 405) {
                throw error;
            }

            const { data } = await api.post(`/chats/${conversationId}/messages`, { text });
            return {
                success: Boolean(data?.success),
                data: normalizeMessage(data?.data),
            };
        }
    },

    markRead: async (conversationId: string): Promise<{ success: boolean; data: { updated: number } }> => {
        try {
            const data = await patchWithFallback<{ success: boolean; data: { updated: number } }>(
                `/chats/${conversationId}/messages/read`,
                {},
                `/chat/${conversationId}/messages/read`
            );
            return data;
        } catch (error: any) {
            const status = error?.response?.status;

            // Final fallback for legacy method mismatches in some environments.
            if (status === 404 || status === 405) {
                try {
                    const { data } = await api.post<{ success: boolean; data: { updated: number } }>(
                        `/chats/${conversationId}/messages/read`,
                        {}
                    );
                    return data;
                } catch {
                    // ignore and return safe default
                }
            }

            // Non-fatal for UX: unread badge may lag, but chat remains usable.
            return { success: false, data: { updated: 0 } };
        }
    }
};
