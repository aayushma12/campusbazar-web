"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUsersQuery } from "@/auth/queries";
import {
    Users,
    Search,
    Filter,
    MoreVertical,
    UserCheck,
    UserX,
    Mail,
    Phone,
    Calendar,
} from "lucide-react";

export default function UserManagementPage() {
    const { isAdmin } = useAuthStore();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterRole, setFilterRole] = useState("all");

    useEffect(() => {
        if (!isAdmin()) {
            router.push("/dashboard");
        }
    }, [isAdmin, router]);

    const { data: usersData, isLoading } = useUsersQuery();
    const users = ((usersData as any)?.data || []).filter((u: any) => u.role === 'user');

    const filteredUsers = users.filter((user: any) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole === "all" || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

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
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Export
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Add User
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
                            className="pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none appearance-none bg-white min-w-[150px] cursor-pointer"
                        >
                            <option value="all">All Roles</option>
                            <option value="user">Users</option>
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
                                {users.length}
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
                                0
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
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">0</h3>
                        </div>
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <Users className="w-5 h-5 text-indigo-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table - Professional Style */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Join Date
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
                            ) : filteredUsers.length === 0 ? (
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
                                filteredUsers.map((user: any) => (
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
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full bg-green-500`}></span>
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-md transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
