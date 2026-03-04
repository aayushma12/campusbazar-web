"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useDeleteUserMutation, useUsersQuery } from "@/auth/queries";
import {
    Users,
    Search,
    Filter,
    Trash2,
    UserCheck,
    UserX,
    Calendar,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

type SortField = "name" | "email" | "createdAt" | "role" | "status";

export default function UserManagementPage() {
    const { isAdmin } = useAuthStore();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterRole, setFilterRole] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortField, setSortField] = useState<SortField>("createdAt");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    useEffect(() => {
        if (!isAdmin()) {
            router.push("/dashboard");
        }
    }, [isAdmin, router]);

    const { data: usersData, isLoading, isError, error } = useUsersQuery();
    const deleteUserMutation = useDeleteUserMutation();

    const users = usersData ?? [];

    const safeDate = (value?: string) => {
        const d = value ? new Date(value) : null;
        return d && !Number.isNaN(d.getTime()) ? d : null;
    };

    const filteredUsers = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return users.filter((user: any) => {
            const matchesSearch =
                !q ||
                user.name?.toLowerCase().includes(q) ||
                user.email?.toLowerCase().includes(q);

            const matchesRole = filterRole === "all" || user.role === filterRole;

            const normalizedStatus = user.status === "active" ? "active" : "inactive";
            const matchesStatus = filterStatus === "all" || normalizedStatus === filterStatus;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchQuery, filterRole, filterStatus]);

    const sortedUsers = useMemo(() => {
        const copy = [...filteredUsers];
        copy.sort((a: any, b: any) => {
            let aVal: string | number = "";
            let bVal: string | number = "";

            if (sortField === "createdAt") {
                aVal = safeDate(a.createdAt)?.getTime() ?? 0;
                bVal = safeDate(b.createdAt)?.getTime() ?? 0;
            } else if (sortField === "status") {
                aVal = a.status === "active" ? 1 : 0;
                bVal = b.status === "active" ? 1 : 0;
            } else {
                aVal = String(a[sortField] ?? "").toLowerCase();
                bVal = String(b[sortField] ?? "").toLowerCase();
            }

            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });
        return copy;
    }, [filteredUsers, sortField, sortDirection]);

    const totalPages = Math.max(1, Math.ceil(sortedUsers.length / PAGE_SIZE));
    const paginatedUsers = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return sortedUsers.slice(start, start + PAGE_SIZE);
    }, [sortedUsers, page]);

    useEffect(() => {
        setPage(1);
    }, [searchQuery, filterRole, filterStatus, sortField, sortDirection]);

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const activeCount = users.filter((u: any) => u.status === "active").length;
    const inactiveCount = users.length - activeCount;
    const now = new Date();
    const newThisMonth = users.filter((u: any) => {
        const d = safeDate(u.createdAt);
        return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
            return;
        }
        setSortField(field);
        setSortDirection(field === "createdAt" ? "desc" : "asc");
    };

    const handleDeleteUser = async (user: any) => {
        if (user.role === "admin") {
            toast.error("Admin accounts cannot be deleted.");
            return;
        }

        const confirmed = window.confirm(
            `Delete user \"${user.name}\" (${user.email})? This action cannot be undone.`
        );
        if (!confirmed) return;

        const toastId = toast.loading("Deleting user...");
        try {
            await deleteUserMutation.mutateAsync(user.id || user._id);
            toast.success("User deleted successfully.", { id: toastId });
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? err?.message ?? "Failed to delete user.", {
                id: toastId,
            });
        }
    };

    if (!isAdmin()) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Management</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View and manage user accounts and permissions.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => router.push('/dashboard/admin')}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all flex items-center gap-2"
                    >
                        <Filter className="w-4 h-4" />
                        Back to Admin
                    </button>
                </div>
            </div>

            {/* Filters and Search - Professional Style */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                        />
                    </div>

                    {/* Role Filter */}
                    <div className="relative">
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none appearance-none bg-white min-w-37.5 cursor-pointer"
                        >
                            <option value="all">All Roles</option>
                            <option value="user">Users</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none appearance-none bg-white min-w-37.5 cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active Users</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                {activeCount}
                            </h3>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg">
                            <UserCheck className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Inactive Users</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                {inactiveCount}
                            </h3>
                        </div>
                        <div className="p-2 bg-red-50 rounded-lg">
                            <UserX className="w-5 h-5 text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">New This Month</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{newThisMonth}</h3>
                        </div>
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <Users className="w-5 h-5 text-indigo-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table - Professional Style */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {isError && (
                    <div className="mx-6 mt-6 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                        Failed to load users: {(error as any)?.response?.data?.message || error?.message || "Unknown error"}
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <button onClick={() => toggleSort("name")} className="inline-flex items-center gap-1 hover:text-gray-700">
                                        User <ArrowUpDown className="w-3.5 h-3.5" />
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <button onClick={() => toggleSort("role")} className="inline-flex items-center gap-1 hover:text-gray-700">
                                        Role <ArrowUpDown className="w-3.5 h-3.5" />
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <button onClick={() => toggleSort("status")} className="inline-flex items-center gap-1 hover:text-gray-700">
                                        Status <ArrowUpDown className="w-3.5 h-3.5" />
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <button onClick={() => toggleSort("createdAt")} className="inline-flex items-center gap-1 hover:text-gray-700">
                                        Registration Date <ArrowUpDown className="w-3.5 h-3.5" />
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                        </div>
                                        <p className="text-gray-500 mt-2">Loading users...</p>
                                    </td>
                                </tr>
                            ) : paginatedUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Users className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="text-gray-900 font-medium">No users found</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Try adjusting your search or filters
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedUsers.map((user: any) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === "admin"
                                                    ? "bg-purple-100 text-purple-800"
                                                    : "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                    {user.role === 'admin' ? 'Admin' : 'User'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.status === "active"
                                                    ? "bg-green-50 text-green-700 border-green-100"
                                                    : "bg-amber-50 text-amber-700 border-amber-100"
                                                    }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.status === "active" ? "bg-green-500" : "bg-amber-500"}`}></span>
                                                {user.status === "active" ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteUser(user)}
                                                disabled={deleteUserMutation.isPending || user.role === 'admin'}
                                                className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                aria-label={`Delete ${user.name}`}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/40">
                    <p className="text-sm text-gray-600">
                        Showing <span className="font-semibold">{sortedUsers.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}</span> to{" "}
                        <span className="font-semibold">{Math.min(page * PAGE_SIZE, sortedUsers.length)}</span> of{" "}
                        <span className="font-semibold">{sortedUsers.length}</span> users
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" /> Prev
                        </button>
                        <span className="text-sm text-gray-600">
                            Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span>
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
