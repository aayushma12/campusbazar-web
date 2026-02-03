"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUsersQuery } from "@/auth/queries";
import {
    BarChart3,
    Users,
    Package,
    TrendingUp,
    Activity,
    Shield,
    Clock,
    ArrowUpRight,
} from "lucide-react";

export default function AdminDashboardPage() {
    const user = useAuthStore((state) => state.user);
    const role = useAuthStore((state) => state.user?.role);
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const { data: usersData, isLoading: isLoadingUsers } = useUsersQuery();

    useEffect(() => {
        setMounted(true);
    }, []);

    const users = ((usersData as any)?.data || []).filter((u: any) => u.role === 'user');
    const totalUsers = users.length;
    const recentUsers = users.slice(0, 5); // Get latest 5 regular users

    useEffect(() => {
        if (mounted && role !== "admin") {
            router.push("/dashboard");
        }
    }, [role, router, mounted]);

    if (!mounted || role !== "admin") {
        return null;
    }

    const stats = [
        {
            title: "Total Users",
            value: isLoadingUsers ? "..." : totalUsers.toString(),
            change: "+12%",
            icon: Users,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-50",
            textColor: "text-blue-600",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Welcome back, <span className="font-semibold text-indigo-600">{user?.name || "Admin"}</span>. Here's what's happening today.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                        Download Report
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-all">
                        + New Campaign
                    </button>
                </div>
            </div>

            {/* Stats Grid - Professional Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-gray-300 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                                </div>
                                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                    <Icon className={`w-5 h-5 ${stat.textColor}`} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                <span className="text-green-600 font-medium flex items-center">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    {stat.change}
                                </span>
                                <span className="text-gray-400 ml-2">vs last month</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Section with SVG Mockup */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Growth Chart (2/3 width) */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">User Growth</h2>
                            <p className="text-sm text-gray-500">New user registrations over time</p>
                        </div>
                        <select className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    {/* Simulated SVG Chart - Workable Look */}
                    <div className="h-64 w-full bg-gray-50/50 rounded-lg border border-dashed border-gray-200 relative overflow-hidden flex items-end px-4 pb-0">
                        {/* Grid Lines */}
                        <div className="absolute inset-x-0 top-1/4 h-px bg-gray-200/50"></div>
                        <div className="absolute inset-x-0 top-2/4 h-px bg-gray-200/50"></div>
                        <div className="absolute inset-x-0 top-3/4 h-px bg-gray-200/50"></div>

                        {/* CSS Line Chart using SVG */}
                        <svg className="w-full h-full absolute inset-0 text-indigo-500" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M0,200 C100,150 200,220 300,100 S400,180 500,50 S600,100 800,20 L800,300 L0,300 Z"
                                fill="url(#chartGradient)"
                                className="text-indigo-500"
                            />
                            <path
                                d="M0,200 C100,150 200,220 300,100 S400,180 500,50 S600,100 800,20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        </svg>

                        {/* Tooltip Simulation */}
                        <div className="absolute top-1/3 left-1/3 bg-gray-900 text-white text-xs py-1 px-2 rounded shadow-lg">
                            Active: 1,204
                        </div>
                    </div>
                </div>

                {/* Activity Feed (1/3 width) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Registrations</h2>
                    <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                        {isLoadingUsers ? (
                            <div className="flex flex-col items-center justify-center h-48 space-y-2">
                                <Activity className="w-8 h-8 text-indigo-200 animate-pulse" />
                                <p className="text-xs text-gray-400">Loading activity...</p>
                            </div>
                        ) : recentUsers.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-sm text-gray-500">No recent activity</p>
                            </div>
                        ) : (
                            recentUsers.map((u: any) => (
                                <div key={u.id} className="flex gap-4">
                                    <div className="mt-1 relative">
                                        <div className="w-2 h-2 rounded-full bg-green-500 ring-4 ring-green-50"></div>
                                        <div className="absolute top-3 left-1 w-px h-full bg-gray-100 -ml-[0.5px]"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            New user <span className="text-indigo-600 font-semibold">{u.name}</span> joined
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                                                {u.role}
                                            </span>
                                            <p className="text-[11px] text-gray-400 flex items-center">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Just now"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <button
                        onClick={() => router.push("/dashboard/admin/users")}
                        className="w-full mt-4 py-2 text-sm text-center text-gray-600 hover:text-indigo-600 font-medium border-t border-gray-100 transition-colors flex items-center justify-center gap-2"
                    >
                        View All Users
                        <ArrowUpRight className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 max-w-sm">
                    <button
                        onClick={() => router.push("/dashboard/admin/users")}
                        className="p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group text-left"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                <Users className="w-5 h-5 text-indigo-600 group-hover:text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600">Manage Users</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Manage accounts & roles</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
