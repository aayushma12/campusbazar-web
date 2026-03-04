import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import ChatWorkspace from '@/components/chat/ChatWorkspace';

export default function ChatListPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                </div>
            }
        >
            <ChatWorkspace />
        </Suspense>
    );
}
