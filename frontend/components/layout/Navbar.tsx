"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import {
    ShoppingBag,
    Heart,

    LogOut,
    User,
    LayoutDashboard,
    Shield,
    Search,
    Tag,
    ChevronDown,

    ShoppingCart,
    History,

} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import NotificationBell from "@/components/layout/NotificationBell";

function Avatar({ name, src, size = 9 }: { name?: string; src?: string | null; size?: number }) {
    const initials = (name ?? "U").charAt(0).toUpperCase();
    const sKey = `w-${size} h-${size}`;
    if (src) {
        return (
            <img
                src={src}
                alt={name ?? "User"}
                className={`w-${size} h-${size} rounded-full object-cover ring-2 ring-white ring-offset-1`}
            />
        );
    }
    return (
        <span
            className={`w-${size} h-${size} rounded-full bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-white ring-offset-1`}
        >
            {initials}
        </span>
    );
}

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
    const logout = useAuthStore((s) => s.logout);
    const { data: cartData } = useCart();
    const cartCount = cartData?.data?.length ?? 0;

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [mounted, setMounted] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => setMounted(true), []);

    // Close dropdown on outside click
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Hide navbar on full-auth pages & admin area (has its own sidebar)
    const hideNavbar =
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/reset-password") ||
        pathname.startsWith("/dashboard/admin") ||
        pathname.startsWith("/admin");

    if (!mounted || hideNavbar) return null;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchValue.trim()) {
            router.push(`/products?q=${encodeURIComponent(searchValue.trim())}`);
        }
    };

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        router.push("/");
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/90 backdrop-blur-xl shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center gap-4">
                    {/* Logo */}
                    <Link
                        href={isAuthenticated ? "/dashboard" : "/"}
                        className="flex items-center gap-2.5 shrink-0 group"
                    >
                        <div className="w-9 h-9 bg-linear-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                            <span className="text-white font-black text-sm">CB</span>
                        </div>
                        <span className="hidden sm:block text-lg font-black text-gray-900 tracking-tight">
                            Campus<span className="text-green-600">Bazar</span>
                        </span>
                    </Link>

                    {/* Search */}
                    <form
                        onSubmit={handleSearch}
                        className="flex-1 max-w-lg mx-4 hidden sm:flex"
                    >
                        <div className="relative w-full">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                                type="search"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                placeholder="Search textbooks, gadgets, furniture…"
                                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white transition-all placeholder:text-gray-400"
                            />
                        </div>
                    </form>

                    {/* Right actions */}
                    <div className="ml-auto flex items-center gap-1 sm:gap-2">
                        {/* Buy/Explore button */}
                        <Link
                            href="/products"
                            className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm font-semibold rounded-xl transition-all"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Buy
                        </Link>

                        {/* Sell button */}
                        {isAuthenticated && (
                            <Link
                                href="/sell/new"
                                className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all hover:shadow-md"
                            >
                                <Tag className="w-4 h-4" />
                                Sell
                            </Link>
                        )}

                        {/* Icon buttons – only when authenticated */}
                        {isAuthenticated && (
                            <>
                                <NotificationBell />
                                <Link
                                    href="/wishlist"
                                    title="Wishlist"
                                    className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600 hover:text-green-600 transition-colors"
                                >
                                    <Heart className="w-5 h-5" />
                                </Link>
                                <Link
                                    href="/cart"
                                    title="Cart"
                                    className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600 hover:text-green-600 transition-colors"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    {cartCount > 0 && (
                                        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                                <Link
                                    href="/orders/purchases"
                                    title="Order History"
                                    className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600 hover:text-green-600 transition-colors"
                                >
                                    <History className="w-5 h-5" />
                                </Link>
                            </>
                        )}

                        {/* Auth: Profile dropdown or login link */}
                        {!isLoading && (
                            <>
                                {isAuthenticated && user ? (
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => setDropdownOpen(!dropdownOpen)}
                                            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                                            aria-label="User menu"
                                        >
                                            <Avatar name={user.name} src={user.profilePicture} size={8} />
                                            <ChevronDown
                                                className={`w-3.5 h-3.5 text-gray-500 transition-transform hidden sm:block ${dropdownOpen ? "rotate-180" : ""
                                                    }`}
                                            />
                                        </button>

                                        {dropdownOpen && (
                                            <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl shadow-gray-200/80 border border-gray-100 overflow-hidden z-50 animate-fade-up">
                                                {/* User info */}
                                                <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                                    <p className="text-sm font-bold text-gray-900 truncate">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                    {isAdmin && (
                                                        <span className="mt-1 inline-block text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-semibold uppercase tracking-wider">
                                                            Admin
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Nav items */}
                                                <div className="py-1.5">
                                                    {isAdmin ? (
                                                        <DropItem
                                                            href="/dashboard/admin"
                                                            icon={<Shield className="w-4 h-4" />}
                                                            label="Admin Dashboard"
                                                            onClick={() => setDropdownOpen(false)}
                                                        />
                                                    ) : (
                                                        <DropItem
                                                            href="/dashboard"
                                                            icon={<LayoutDashboard className="w-4 h-4" />}
                                                            label="Dashboard"
                                                            onClick={() => setDropdownOpen(false)}
                                                        />
                                                    )}
                                                    <DropItem
                                                        href="/dashboard/profile"
                                                        icon={<User className="w-4 h-4" />}
                                                        label="My Profile"
                                                        onClick={() => setDropdownOpen(false)}
                                                    />
                                                    <DropItem
                                                        href="/orders/purchases"
                                                        icon={<ShoppingBag className="w-4 h-4" />}
                                                        label="My Orders"
                                                        onClick={() => setDropdownOpen(false)}
                                                    />
                                                </div>

                                                <div className="border-t border-gray-100 py-1.5">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        Sign Out
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href="/login"
                                            className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-green-600 transition-colors"
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-sm"
                                        >
                                            Join Free
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

// ─── Helper component ──────────────────────────────
function DropItem({
    href,
    icon,
    label,
    onClick,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-colors"
        >
            <span className="text-gray-400">{icon}</span>
            {label}
        </Link>
    );
}
