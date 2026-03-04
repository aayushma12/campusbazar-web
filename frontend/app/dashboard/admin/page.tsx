"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useUsersQuery } from "@/auth/queries";
import { formatPrice } from "@/lib/formatters";
import { usePaymentHistory } from "@/hooks/usePayment";
import {
    BarChart3,
    Users,
    Package,
    TrendingUp,
    Activity,
    Shield,
    Clock,
    ArrowUpRight,
    CheckCircle2,
    XCircle,
    BadgeDollarSign,
} from "lucide-react";

export default function AdminDashboardPage() {
    const isAdmin = useAuthStore((state) => state.isAdmin);
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const { data: usersData, isLoading: isLoadingUsers } = useUsersQuery();
    const { data: paymentsData, isLoading: isLoadingPayments } = usePaymentHistory();

    useEffect(() => {
        setMounted(true);
    }, []);

    const users = (usersData || []).filter((u: any) => u.role === 'user');
    const totalUsers = users.length;
    const recentUsers = users.slice(0, 5);

    const transactions = (paymentsData as any)?.data || [];
    const successPayments = transactions.filter((t: any) => t.status === 'done').length;
    const failedPayments = transactions.filter((t: any) => t.status === 'failed' || t.status === 'cancelled').length;
    const totalTransactions = transactions.length;

    const growthAnalytics = useMemo(() => {
        const now = new Date();
        const months = Array.from({ length: 6 }, (_, idx) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleString('en-US', { month: 'short' });
            return { key, label };
        });

        const userCounts = months.map((m) => {
            return users.filter((u: any) => {
                if (!u?.createdAt) return false;
                const dt = new Date(u.createdAt);
                if (Number.isNaN(dt.getTime())) return false;
                const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
                return key === m.key;
            }).length;
        });

        const successfulPaymentCounts = months.map((m) => {
            return transactions.filter((t: any) => {
                if (t?.status !== 'done') return false;
                const dtValue = t?.createdAt || t?.updatedAt || t?.paidAt;
                if (!dtValue) return false;
                const dt = new Date(dtValue);
                if (Number.isNaN(dt.getTime())) return false;
                const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
                return key === m.key;
            }).length;
        });

        const revenueByMonth = months.map((m) => {
            return transactions.reduce((sum: number, t: any) => {
                if (t?.status !== 'done') return sum;
                const dtValue = t?.createdAt || t?.updatedAt || t?.paidAt;
                if (!dtValue) return sum;
                const dt = new Date(dtValue);
                if (Number.isNaN(dt.getTime())) return sum;
                const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
                if (key !== m.key) return sum;
                return sum + Number(t?.amount || 0);
            }, 0);
        });

        const maxSeries = Math.max(...userCounts, ...successfulPaymentCounts, 1);
        const chartPoints = userCounts
            .map((value, index) => {
                const x = (index / 5) * 100;
                const y = 100 - (value / maxSeries) * 100;
                return `${x},${y}`;
            })
            .join(' ');

        const latestRevenue = revenueByMonth[revenueByMonth.length - 1] || 0;

        return {
            months,
            userCounts,
            successfulPaymentCounts,
            revenueByMonth,
            maxSeries,
            chartPoints,
            latestRevenue,
        };
    }, [users, transactions]);

    useEffect(() => {
        if (mounted && !isAdmin()) {
            router.push("/dashboard");
        }
    }, [isAdmin, router, mounted]);

    if (!mounted || !isAdmin()) {
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
        {
            title: "Successful Payments",
            value: isLoadingPayments ? "..." : successPayments.toString(),
            change: "Live",
            icon: CheckCircle2,
            color: "from-green-500 to-green-600",
            bgColor: "bg-green-50",
            textColor: "text-green-600",
        },
        {
            title: "Failed Payments",
            value: isLoadingPayments ? "..." : failedPayments.toString(),
            change: "Alert",
            icon: XCircle,
            color: "from-red-500 to-red-600",
            bgColor: "bg-red-50",
            textColor: "text-red-600",
        },
        {
            title: "Total Transactions",
            value: isLoadingPayments ? "..." : totalTransactions.toString(),
            change: "Total",
            icon: BadgeDollarSign,
            color: "from-indigo-500 to-indigo-600",
            bgColor: "bg-indigo-50",
            textColor: "text-indigo-600",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Overview</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Viewing global platform statistics and user activities.
                    </p>
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
                                    <p className="text-sm font-medium text-gray-400 uppercase tracking-widest text-[10px]">{stat.title}</p>
                                    <h3 className="text-2xl font-black text-gray-900 mt-2">{stat.value}</h3>
                                </div>
                                <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                                    <Icon className={`w-5 h-5 ${stat.textColor}`} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-[10px] font-bold uppercase tracking-wider">
                                <span className={stat.textColor}>
                                    {stat.change}
                                </span>
                                <span className="text-gray-300 ml-2">Platform Data</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Section with SVG Mockup */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Growth Chart (2/3 width) */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-75">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Growth Analytics</h3>
                            <p className="text-xs text-gray-500 mt-1">Last 6 months • users, successful payments, and revenue trend</p>
                        </div>
                        <BarChart3 className="w-5 h-5 text-indigo-500" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                        <div className="rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">New Users (6m)</p>
                            <p className="text-lg font-black text-blue-900">{growthAnalytics.userCounts.reduce((a, b) => a + b, 0)}</p>
                        </div>
                        <div className="rounded-lg border border-green-100 bg-green-50/60 px-3 py-2">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-green-700">Successful Payments (6m)</p>
                            <p className="text-lg font-black text-green-900">{growthAnalytics.successfulPaymentCounts.reduce((a, b) => a + b, 0)}</p>
                        </div>
                        <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 px-3 py-2">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700">Latest Month Revenue</p>
                            <p className="text-lg font-black text-indigo-900">{formatPrice(growthAnalytics.latestRevenue)}</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                        <svg viewBox="0 0 100 100" className="w-full h-32" preserveAspectRatio="none" aria-label="User growth line chart">
                            <polyline
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="1"
                                points="0,100 100,100"
                            />
                            <polyline
                                fill="none"
                                stroke="#2563eb"
                                strokeWidth="2.5"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                points={growthAnalytics.chartPoints}
                            />
                        </svg>

                        <div className="mt-3 grid grid-cols-6 gap-2 items-end">
                            {growthAnalytics.months.map((month, idx) => {
                                const successVal = growthAnalytics.successfulPaymentCounts[idx] || 0;
                                const barHeight = Math.max(
                                    10,
                                    Math.round((successVal / growthAnalytics.maxSeries) * 70)
                                );
                                return (
                                    <div key={month.key} className="text-center">
                                        <div className="h-20 flex items-end justify-center">
                                            <div
                                                className="w-5 rounded-t bg-emerald-500/80"
                                                style={{ height: `${barHeight}%` }}
                                                title={`${month.label}: ${successVal} successful payments`}
                                            />
                                        </div>
                                        <p className="mt-1 text-[10px] font-semibold text-gray-500">{month.label}</p>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-3 flex items-center gap-4 text-[11px] text-gray-500">
                            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600" />User signups</span>
                            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Successful payments</span>
                        </div>
                    </div>
                </div>

                {/* Activity Feed (1/3 width) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
                    <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                        {isLoadingPayments ? (
                            <div className="flex flex-col items-center justify-center h-48 space-y-2">
                                <Activity className="w-8 h-8 text-indigo-200 animate-pulse" />
                                <p className="text-xs text-gray-400">Loading activity...</p>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-sm text-gray-500">No recent transactions</p>
                            </div>
                        ) : (
                            transactions.slice(0, 5).map((t: any) => (
                                <div key={t._id || t.id} className="flex gap-4">
                                    <div className="mt-1 relative">
                                        <div className={`w-2 h-2 rounded-full ${t.status === 'done' ? 'bg-green-500' : 'bg-red-500'} ring-4 ${t.status === 'done' ? 'ring-green-50' : 'ring-red-50'}`}></div>
                                        <div className="absolute top-3 left-1 w-px h-full bg-gray-100 -ml-[0.5px]"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">
                                            {t.productId?.title ||
                                                (t.productIds?.length ? (t.productIds.length > 1 ? `Cart (${t.productIds.length} items)` : t.productIds[0].title) :
                                                    (t.transactionUUID?.startsWith('BK-') ? 'Tutoring Session' : 'Unknown Product'))}
                                        </p>
                                        <div className="flex items-center justify-between gap-2 mt-1">
                                            <p className="text-[11px] text-gray-400 truncate max-w-25">
                                                {t.buyerId?.name || 'Buyer'} → {t.sellerId?.name || 'Seller'}
                                            </p>
                                            <p className="text-xs font-black text-gray-900 whitespace-nowrap">
                                                {formatPrice(t.amount)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <button
                        onClick={() => router.push("/dashboard/payments")}
                        className="w-full mt-4 py-2 text-sm text-center text-gray-600 hover:text-indigo-600 font-medium border-t border-gray-100 transition-colors flex items-center justify-center gap-2"
                    >
                        View All Payments
                        <ArrowUpRight className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <button
                        onClick={() => router.push("/dashboard/payments")}
                        className="p-4 bg-white border border-gray-200 rounded-xl hover:border-green-500 hover:shadow-md transition-all group text-left"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors">
                                <BadgeDollarSign className="w-5 h-5 text-green-600 group-hover:text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 group-hover:text-green-600">Payment History</h3>
                                <p className="text-xs text-gray-500 mt-0.5">View all success/failed payments</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
