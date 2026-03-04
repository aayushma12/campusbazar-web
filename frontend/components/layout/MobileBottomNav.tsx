"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Home, Tag, History, User, LayoutGrid } from "lucide-react";

const NAV_ITEMS = [
    { href: "/", label: "Home", icon: Home },
    { href: "/products", label: "Browse", icon: LayoutGrid },
    { href: "/sell/new", label: "Sell", icon: Tag, highlight: true },
    { href: "/orders/purchases", label: "Orders", icon: History },
    { href: "/dashboard/profile", label: "Profile", icon: User },
];

export default function MobileBottomNav() {
    const pathname = usePathname();
    const { isAuthenticated, isLoading } = useAuth();

    // Hide on auth & admin pages
    const hide =
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/reset-password") ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/dashboard/admin");

    if (hide || isLoading || !isAuthenticated) return null;

    return (
        <nav
            className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
            aria-label="Mobile bottom navigation"
        >
            <div className="flex items-center justify-around h-16 px-2">
                {NAV_ITEMS.map(({ href, label, icon: Icon, highlight }) => {
                    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 group"
                            aria-label={label}
                        >
                            {highlight ? (
                                // Sell – elevated button
                                <span className="w-12 h-12 -mt-6 bg-linear-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-300/50 group-hover:scale-110 transition-transform">
                                    <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                                </span>
                            ) : (
                                <span
                                    className={`w-6 h-6 transition-colors ${isActive ? "text-green-600" : "text-gray-400 group-hover:text-green-500"
                                        }`}
                                >
                                    <Icon className="w-full h-full" strokeWidth={isActive ? 2.5 : 1.75} />
                                </span>
                            )}
                            {!highlight && (
                                <span
                                    className={`text-[10px] font-semibold tracking-wide transition-colors ${isActive ? "text-green-600" : "text-gray-400"
                                        }`}
                                >
                                    {label}
                                </span>
                            )}
                            {highlight && (
                                <span className="text-[10px] font-semibold text-green-600 mt-1">Sell</span>
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Safe area for iOS home bar */}
            <div className="h-[env(safe-area-inset-bottom)] bg-white" />
        </nav>
    );
}
