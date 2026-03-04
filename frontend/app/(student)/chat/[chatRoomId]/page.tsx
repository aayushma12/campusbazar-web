import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import ChatWorkspace from '@/components/chat/ChatWorkspace';

interface ChatDetailPageProps {
    params: Promise<{ chatRoomId: string }>;
}

export default async function ChatDetailPage({ params }: ChatDetailPageProps) {
    const { chatRoomId } = await params;

    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                </div>
            }
        >
            <ChatWorkspace initialConversationId={chatRoomId} />
        </Suspense>
    );
}
