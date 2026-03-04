"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import {
  Home,
  User,

  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  Users,
  LayoutDashboard,
  ShoppingBag,
  Package,
  MessageCircle,
  GraduationCap,
} from "lucide-react";
import { useGetConversations } from "@/hooks/useChat";
import NotificationBell from "@/components/layout/NotificationBell";

const SIDEBAR_HIDDEN_SESSION_KEY = "campusbazar:dashboard-sidebar-hidden";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  type NavItem = {
    href: string;
    icon: any;
    label: string;
    badge?: number;
  };

  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const logout = useAuthStore((state) => state.logout);
  const isAdminUser = isAdmin();
  const { data: conversationsData } = useGetConversations();
  const totalChats = conversationsData?.data?.length ?? 0;
  const totalUnread = (conversationsData?.data ?? []).reduce(
    (sum: number, conv: any) => sum + (conv?.unreadCount ?? 0),
    0
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopView, setIsDesktopView] = useState(false);
  const [desktopSidebarHidden, setDesktopSidebarHidden] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const syncSidebarState = (desktopMatch: boolean) => {
      setIsDesktopView(desktopMatch);

      if (desktopMatch) {
        const storedHidden = sessionStorage.getItem(SIDEBAR_HIDDEN_SESSION_KEY) === "true";
        setDesktopSidebarHidden(storedHidden);
        setIsSidebarOpen(!storedHidden);
      } else {
        setIsSidebarOpen(false);
      }
    };

    syncSidebarState(mediaQuery.matches);

    const handleViewportChange = (event: MediaQueryListEvent) => {
      syncSidebarState(event.matches);
    };

    mediaQuery.addEventListener("change", handleViewportChange);
    setMounted(true);

    return () => {
      mediaQuery.removeEventListener("change", handleViewportChange);
    };
  }, []);

  useEffect(() => {
    if (!mounted || !isDesktopView) return;
    sessionStorage.setItem(
      SIDEBAR_HIDDEN_SESSION_KEY,
      String(desktopSidebarHidden)
    );
  }, [mounted, isDesktopView, desktopSidebarHidden]);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router, mounted]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const toggleSidebar = () => {
    if (isDesktopView) {
      setDesktopSidebarHidden((prev) => !prev);
    }
    setIsSidebarOpen((prev) => !prev);
  };

  // Navigation items for regular users
  const userNavItems: NavItem[] = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/products", icon: Package, label: "Products" },
    { href: "/dashboard/my-products", icon: Package, label: "My Products" },
    { href: "/orders/purchases", icon: ShoppingBag, label: "Orders" },
    { href: "/tutor", icon: GraduationCap, label: "Tutor" },
    {
      href: "/chat",
      icon: MessageCircle,
      label: "Chat",
      badge: totalUnread > 0 ? totalUnread : totalChats > 0 ? totalChats : undefined,
    },
    { href: "/dashboard/profile", icon: User, label: "Profile" },
  ];
  const isUserNavItemActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/orders/purchases") return pathname.startsWith("/orders");
    if (href === "/chat") return pathname.startsWith("/chat") || pathname.startsWith("/messages");
    return pathname === href || pathname.startsWith(`${href}/`);
  };


  // Navigation items for admin
  const adminNavItems: NavItem[] = [
    { href: "/dashboard/admin", icon: LayoutDashboard, label: "Admin Overview" },
    { href: "/dashboard/admin/users", icon: Users, label: "User Management" },
    { href: "/dashboard/admin/panel", icon: Shield, label: "System Settings" },
  ];



  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Sidebar Edge Toggle (always visible) */}
      <button
        onClick={toggleSidebar}
        aria-label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
        aria-expanded={isSidebarOpen}
        aria-controls="dashboard-sidebar"
        className={`fixed top-5 z-50 p-2.5 bg-slate-800 text-white shadow-lg hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80 transition-all duration-300 ${
          isSidebarOpen
            ? "left-72 -translate-x-1/2 rounded-xl"
            : "left-0 translate-x-0 rounded-r-xl rounded-l-none"
        }`}
      >
        {isSidebarOpen ? (
          isDesktopView ? <ChevronLeft className="w-5 h-5" /> : <X className="w-5 h-5" />
        ) : (
          isDesktopView ? <ChevronRight className="w-5 h-5" /> : <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {!isDesktopView && isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar - Professional Dark Theme */}
      <aside
        id="dashboard-sidebar"
        className={`fixed top-0 left-0 h-full w-72 bg-slate-900 text-slate-100 z-40 transform transition-transform duration-300 ease-in-out border-r border-slate-800 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">CB</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white tracking-tight">CampusBazar</h1>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-slate-800/50">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-300 font-semibold border border-emerald-500/20">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-slate-300/80 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <div className="mb-2 px-3 text-xs font-semibold text-slate-400/80 uppercase tracking-wider">
              {pathname.startsWith("/dashboard/admin") ? "Admin Panel" : "Student Workspace"}
            </div>
            {(pathname.startsWith("/dashboard/admin") && isAdminUser ? adminNavItems : userNavItems).map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith("/dashboard/admin")
                ? pathname === item.href
                : isUserNavItemActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group ${isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/25"
                    : "text-slate-200/85 hover:text-white hover:bg-slate-800/70"
                    }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-300/75 group-hover:text-white"}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge !== undefined && !pathname.startsWith("/dashboard/admin") && (
                    <span
                      className={`ml-auto min-w-5 h-5 px-1.5 text-[11px] rounded-full inline-flex items-center justify-center font-bold ${
                        isActive ? "bg-white/20 text-white" : "bg-emerald-500/20 text-emerald-200"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-200/85 hover:text-white hover:bg-slate-800/70 rounded-md transition-all group"
            >
              <LogOut className="w-5 h-5 group-hover:text-red-400 transition-colors" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`min-h-screen transition-[margin] duration-300 ease-in-out ${
          isDesktopView && isSidebarOpen ? "lg:ml-72" : "lg:ml-0"
        }`}
      >
        <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-6">
          {pathname.startsWith("/dashboard/admin") && (
            <div className="flex justify-end">
              <NotificationBell />
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
