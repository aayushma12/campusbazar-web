'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    useGetConversations,
    useStartConversation,
    useStartTutorConversation,
    useGetMessages,
    useSendMessage,
    useMarkRead,
} from '@/hooks/useChat';
import { useAuthStore } from '@/store/authStore';
import {
    Send,
    Search,
    Package,
    ArrowLeft,
    Loader2,
    MessageCircle,
    User,
    CheckCheck,
    Check,
} from 'lucide-react';
import Link from 'next/link';
import { timeAgo } from '@/lib/formatters';
import { toast } from 'sonner';
import type { ChatMessage } from '@/lib/chatApi';

export interface ChatWorkspaceProps {
    initialConversationId?: string | null;
}

export default function ChatWorkspace({ initialConversationId = null }: ChatWorkspaceProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuthStore();

    const conversationIdParam = searchParams.get('id');
    const productIdParam = searchParams.get('productId');
    const requestIdParam = searchParams.get('requestId');

    const { data: conversationsData, isLoading: convsLoading } = useGetConversations();
    const conversations = conversationsData?.data ?? [];

    const [activeConversationId, setActiveConversationId] = useState<string | null>(
        initialConversationId || conversationIdParam
    );
    const [messageText, setMessageText] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([]);

    const { mutateAsync: startConversation } = useStartConversation();
    const { mutateAsync: startTutorConversation } = useStartTutorConversation();
    const { mutateAsync: sendMessage, isPending: isSending } = useSendMessage();
    const { mutateAsync: markAsRead } = useMarkRead();

    const { data: messagesData, isLoading: msgsLoading } = useGetMessages(activeConversationId || '');
    const messages: ChatMessage[] = messagesData?.data ?? [];

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const lastMarkedIncomingMessageRef = useRef<string | null>(null);

    const mergedMessages: ChatMessage[] = useMemo(() => {
        const all = [...messages, ...optimisticMessages];
        const byId = new Map<string, ChatMessage>();

        for (const msg of all) {
            if (!msg?._id) continue;
            byId.set(msg._id, msg);
        }

        return Array.from(byId.values()).sort((a, b) => {
            const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
            return aTime - bTime;
        });
    }, [messages, optimisticMessages]);

    const latestUnreadIncomingMessageId = useMemo(() => {
        for (let idx = mergedMessages.length - 1; idx >= 0; idx -= 1) {
            const msg = mergedMessages[idx];
            if (!msg?._id) continue;
            if (msg.senderId === user?.id) continue;
            if (msg.read) continue;
            return msg._id;
        }

        return null;
    }, [mergedMessages, user?.id]);

    useEffect(() => {
        if (initialConversationId) {
            setActiveConversationId(initialConversationId);
        }
    }, [initialConversationId]);

    useEffect(() => {
        async function initChat() {
            if (initialConversationId) {
                return;
            }

            if (conversationIdParam) {
                setActiveConversationId(conversationIdParam);
                return;
            }

            if (requestIdParam) {
                try {
                    const res = await startTutorConversation(requestIdParam);
                    if (res.success) {
                        const convId = res.data.id || res.data._id;
                        if (!convId) {
                            toast.error('Unable to open chat right now');
                            return;
                        }
                        setActiveConversationId(convId);
                        router.replace(`/chat/${convId}`);
                    }
                } catch (err: any) {
                    toast.error(err?.response?.data?.message || 'Chat is available only after tutor request acceptance');
                }
                return;
            }

            if (productIdParam) {
                try {
                    const res = await startConversation(productIdParam);
                    if (res.success) {
                        const convId = res.data.id || res.data._id;
                        if (!convId) {
                            toast.error('Unable to start chat right now');
                            return;
                        }
                        setActiveConversationId(convId);
                        router.replace(`/chat/${convId}`);
                    }
                } catch (err: any) {
                    toast.error(err?.response?.data?.message || 'Failed to start conversation');
                }
            }
        }

        initChat();
    }, [
        productIdParam,
        requestIdParam,
        conversationIdParam,
        initialConversationId,
        startConversation,
        startTutorConversation,
        router,
    ]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mergedMessages.length]);

    useEffect(() => {
        if (!activeConversationId || !latestUnreadIncomingMessageId) {
            return;
        }

        const dedupeKey = `${activeConversationId}:${latestUnreadIncomingMessageId}`;
        if (lastMarkedIncomingMessageRef.current === dedupeKey) {
            return;
        }

        lastMarkedIncomingMessageRef.current = dedupeKey;
        markAsRead(activeConversationId).catch(() => {
            if (lastMarkedIncomingMessageRef.current === dedupeKey) {
                lastMarkedIncomingMessageRef.current = null;
            }
        });
    }, [activeConversationId, latestUnreadIncomingMessageId, markAsRead]);

    useEffect(() => {
        setOptimisticMessages([]);
        lastMarkedIncomingMessageRef.current = null;
    }, [activeConversationId]);

    const activeConversation = conversations.find(
        (c) => c.id === activeConversationId || c._id === activeConversationId
    );
    const activeOtherParticipant = activeConversation?.participants?.find((p: any) => p.id !== user?.id);
    const activeOtherRoleLabel =
        activeConversation?.chatType === 'tutor'
            ? activeOtherParticipant?.role === 'student'
                ? 'Student'
                : 'Tutor'
            : 'Seller';

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageText.trim() || !activeConversationId || isSending) return;

        const text = messageText.trim();
        setMessageText('');
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const optimistic: ChatMessage = {
            _id: tempId,
            conversationId: activeConversationId,
            senderId: user?.id || '',
            text,
            read: false,
            createdAt: new Date().toISOString(),
            senderName: user?.name,
            senderRole: 'unknown',
            messageType: 'text',
        };

        setOptimisticMessages((prev) => [...prev, optimistic]);

        try {
            const sent = await sendMessage({ conversationId: activeConversationId, text });
            setOptimisticMessages((prev) => prev.filter((m) => m._id !== tempId));

            if (sent?.data?._id) {
                setOptimisticMessages((prev) => [...prev, sent.data]);
                setTimeout(() => {
                    setOptimisticMessages((prev) => prev.filter((m) => m._id !== sent.data._id));
                }, 500);
            }
        } catch (error: unknown) {
            const backendMessage =
                error && typeof error === 'object' && 'response' in error
                    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined;

            const fallbackMessage =
                error && typeof error === 'object' && 'message' in error
                    ? String((error as { message?: string }).message ?? '')
                    : '';

            toast.error(backendMessage || fallbackMessage || 'Failed to send message');
            setOptimisticMessages((prev) => prev.filter((m) => m._id !== tempId));
            setMessageText(text);
        }
    };

    if (convsLoading && conversations.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 bg-gray-50 flex overflow-hidden"
            style={{ top: 'var(--navbar-height,64px)' }}
        >
            <aside
                className={`${
                    isSidebarOpen ? 'w-full md:w-80 lg:w-96' : 'w-0'
                } absolute md:relative z-20 h-full bg-white border-r border-gray-100 transition-all duration-300 overflow-hidden flex flex-col`}
            >
                <div className="p-6 border-b border-gray-50">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Chat</h1>
                    <div className="mt-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500 transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.length > 0 ? (
                        conversations.map((chat) => {
                            const chatId = chat.id || chat._id || '';
                            const otherParticipant =
                                chat.participants?.find((p: any) => p.id !== user?.id) || { name: 'User' };
                            const isActive = chatId === activeConversationId;
                            const otherRole = (otherParticipant as any)?.role;
                            const roleLabel =
                                chat.chatType === 'tutor'
                                    ? otherRole === 'student'
                                        ? 'Student'
                                        : 'Tutor'
                                    : 'Seller';

                            return (
                                <button
                                    key={chatId}
                                    onClick={() => {
                                        setActiveConversationId(chatId);
                                        router.push(`/chat/${chatId}`);
                                        if (window.innerWidth < 768) setIsSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-4 p-4 transition-all border-l-4 ${
                                        isActive
                                            ? 'bg-green-50 border-green-600'
                                            : 'bg-white border-transparent hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="relative w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
                                        {chat.productId?.images?.[0] ? (
                                            <img
                                                src={chat.productId.images[0]}
                                                alt={chat.productId?.title || 'Chat'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Package className="w-6 h-6 text-gray-300 m-auto mt-3" />
                                        )}
                                        {chat.unreadCount > 0 && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">
                                                {chat.unreadCount}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 text-left min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h4 className="text-sm font-bold text-gray-900 truncate">
                                                {otherParticipant?.name || 'User'}
                                            </h4>
                                            <span className="text-[10px] font-semibold text-gray-400">
                                                {timeAgo(chat.updatedAt)}
                                            </span>
                                        </div>
                                        <p className="text-[11px] font-bold text-green-600 mb-1 truncate uppercase tracking-wider">
                                            {chat.chatType === 'tutor'
                                                ? `Tutor Request • ${roleLabel}`
                                                : chat.productId?.title || 'Product Chat'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate font-medium">
                                            {chat.lastMessage?.text || 'New inquiry started'}
                                        </p>
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 p-8 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <MessageCircle className="w-8 h-8 text-gray-200" />
                            </div>
                            <p className="text-sm text-gray-400 font-medium">No chats yet.</p>
                        </div>
                    )}
                </div>
            </aside>

            <main className="flex-1 flex flex-col bg-white relative">
                {activeConversationId ? (
                    <>
                        <header className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between bg-white shadow-sm z-10">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center text-gray-400">
                                        {activeConversation?.participants?.find((p) => p.id !== user?.id)
                                            ?.profilePicture ? (
                                            <img
                                                src={activeConversation?.participants?.find((p) => p.id !== user?.id)?.profilePicture}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900 truncate">
                                            {activeOtherParticipant?.name || 'Loading...'}
                                        </h3>
                                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest leading-none">
                                            {activeConversation?.chatType === 'tutor'
                                                ? activeOtherRoleLabel
                                                : activeConversation?.productId?.title || 'Product Chat'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {activeConversation?.chatType !== 'tutor' && activeConversation?.productId?.id && (
                                <Link
                                    href={`/products/${activeConversation?.productId.id}`}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold transition-all border border-gray-100"
                                >
                                    <Package className="w-4 h-4 text-green-600" />
                                    <span className="hidden sm:inline">View Item</span>
                                </Link>
                            )}
                        </header>

                        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-[#fbfcfd]">
                            {msgsLoading && mergedMessages.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                                </div>
                            ) : (
                                <>
                                    {mergedMessages.map((msg) => {
                                        const isMine = msg.senderId === user?.id;
                                        return (
                                            <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] md:max-w-[70%] ${isMine ? 'order-2' : ''}`}>
                                                    <div
                                                        className={`p-4 rounded-3xl ${
                                                            isMine
                                                                ? 'bg-green-600 text-white rounded-tr-none shadow-lg shadow-green-100'
                                                                : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm'
                                                        }`}
                                                    >
                                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                                    </div>
                                                    <div
                                                        className={`flex items-center gap-1.5 mt-2 ${
                                                            isMine ? 'justify-end' : 'justify-start'
                                                        }`}
                                                    >
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                            {new Date(msg.createdAt).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </span>
                                                        {isMine &&
                                                            (msg.read ? (
                                                                <CheckCheck className="w-3 h-3 text-green-500" />
                                                            ) : (
                                                                <Check className="w-3 h-3 text-gray-300" />
                                                            ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        <footer className="p-4 md:p-6 border-t border-gray-50 bg-white">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-4 max-w-5xl mx-auto">
                                <div className="flex-1 relative">
                                    <textarea
                                        rows={1}
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                        placeholder="Type your message..."
                                        className="w-full pl-6 pr-12 py-4 bg-gray-50 border-none rounded-4xl text-sm focus:ring-2 focus:ring-green-500 transition-all resize-none max-h-32"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!messageText.trim() || isSending}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-all shadow-md shadow-green-100 disabled:opacity-50 disabled:scale-95 active:scale-90"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>
                        </footer>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#fbfcfd]">
                        <div className="w-24 h-24 bg-white rounded-4xl shadow-xl shadow-gray-100 flex items-center justify-center mb-8 border border-gray-50">
                            <MessageCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Select a Chat</h2>
                        <p className="text-gray-500 mt-3 max-w-sm font-medium leading-relaxed">
                            Choose a conversation to view your persistent message history.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
