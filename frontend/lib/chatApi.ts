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

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object';
}

function extractStatus(error: unknown): number | undefined {
    if (!isRecord(error)) return undefined;
    const response = error.response;
    if (!isRecord(response)) return undefined;
    const status = response.status;
    return typeof status === 'number' ? status : undefined;
}

function isTransientError(error: unknown): boolean {
    const status = extractStatus(error);
    if (status === 408 || status === 429 || status === 502 || status === 503 || status === 504) {
        return true;
    }

    if (!isRecord(error)) return false;
    const code = error.code;
    if (typeof code !== 'string') return false;

    return (
        code === 'ECONNABORTED' ||
        code === 'ERR_NETWORK' ||
        code === 'ETIMEDOUT' ||
        code === 'ECONNRESET'
    );
}

function generateMessageId(raw: Record<string, unknown>): string {
    const sender = typeof raw.senderId === 'string' ? raw.senderId : 'unknown';
    const createdAt = typeof raw.createdAt === 'string'
        ? raw.createdAt
        : typeof raw.timestamp === 'string'
            ? raw.timestamp
            : new Date().toISOString();
    const text = typeof raw.text === 'string'
        ? raw.text
        : typeof raw.message === 'string'
            ? raw.message
            : '';
    return `msg-${sender}-${createdAt}-${text.slice(0, 16)}`;
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
    const messageId = raw?._id || raw?.id || (isRecord(raw) ? generateMessageId(raw) : `msg-${Date.now()}`);

    return {
        _id: String(messageId),
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
        const attempts: Array<{ path: string; body: Record<string, unknown> }> = [
            { path: '/chat/message', body: { chatRoomId: conversationId, message: text } },
            { path: '/chat/message', body: { conversationId, text } },
            { path: `/chat/messages/${conversationId}`, body: { message: text } },
            { path: `/chat/${conversationId}/message`, body: { message: text } },
            { path: `/chats/${conversationId}/messages`, body: { text } },
            { path: `/chats/${conversationId}/messages`, body: { message: text } },
            { path: '/chats/message', body: { conversationId, text } },
        ];

        let lastError: unknown;

        for (const attempt of attempts) {
            let transientRetries = 1;

            while (transientRetries >= 0) {
                try {
                    const { data } = await api.post(attempt.path, attempt.body);
                    const rawMessage = data?.data ?? data?.message ?? data;

                    return {
                        success: Boolean(data?.success ?? true),
                        data: normalizeMessage(rawMessage),
                    };
                } catch (error: unknown) {
                    lastError = error;

                    if (isTransientError(error) && transientRetries > 0) {
                        transientRetries -= 1;
                        continue;
                    }

                    const status = extractStatus(error);
                    const shouldTryNextContract = status === 400 || status === 404 || status === 405 || status === 422;

                    if (!shouldTryNextContract) {
                        throw error;
                    }

                    break;
                }
            }
        }

        throw lastError;
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
