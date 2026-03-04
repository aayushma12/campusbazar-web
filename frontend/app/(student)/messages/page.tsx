'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LegacyMessagesRedirectPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const id = searchParams.get('id');
        const requestId = searchParams.get('requestId');
        const productId = searchParams.get('productId');

        if (id) {
            router.replace(`/chat/${id}`);
            return;
        }

        const nextQuery = new URLSearchParams();
        if (requestId) nextQuery.set('requestId', requestId);
        if (productId) nextQuery.set('productId', productId);

        const query = nextQuery.toString();
        router.replace(query ? `/chat?${query}` : '/chat');
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
    );
}
