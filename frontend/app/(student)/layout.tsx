'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

/**
 * Layout for protected student routes (/sell/*, /wishlist/*, /chat/*, /orders/*, /profile/*).
 * Redirects to /login if the user is not authenticated.
 */
export default function StudentLayout({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/login?from=' + window.location.pathname);
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
                    <p className="text-gray-500 font-medium text-sm">Loading…</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return <>{children}</>;
}
