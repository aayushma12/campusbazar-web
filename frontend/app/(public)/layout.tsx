import { ReactNode } from 'react';

/**
 * Public route group layout — inherits the root Navbar & MobileBottomNav from app/layout.tsx.
 * This file exists only to define the (public) route group.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
