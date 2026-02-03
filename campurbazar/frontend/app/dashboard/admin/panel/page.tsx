"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Shield, Settings, Database, Lock, Bell, Mail } from "lucide-react";

export default function AdminPanelPage() {
    const { isAdmin } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isAdmin()) {
            router.push("/dashboard");
        }
    }, [isAdmin, router]);

    const adminSettings = [
        {
            title: "System Settings",
            description: "Configure system-wide preferences",
            icon: Settings,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Database Management",
            description: "Database maintenance & backups",
            icon: Database,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Security & Permissions",
            description: "Manage roles and security",
            icon: Lock,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
        {
            title: "Notifications",
            description: "Notification templates",
            icon: Bell,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
        },
        {
            title: "Email Configuration",
            description: "Set up email servers",
            icon: Mail,
            color: "text-pink-600",
            bgColor: "bg-pink-50",
        },
        {
            title: "Admin Tools",
            description: "Advanced administrative tools",
            icon: Shield,
            color: "text-indigo-600",
            bgColor: "bg-indigo-50",
        },
    ];

    if (!isAdmin()) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        <Shield className="w-8 h-8 text-indigo-600 stroke-[2.5px]" />
                        System Settings
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Configure system-wide administrative settings and preferences.
                    </p>
                </div>
            </div>

            {/* Admin Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {adminSettings.map((setting, index) => {
                    const Icon = setting.icon;
                    return (
                        <button
                            key={index}
                            className="bg-white rounded-xl shadow-sm hover:border-indigo-500 border border-gray-200 p-5 transition-all group text-left"
                        >
                            <div className="flex items-center gap-4 mb-3">
                                <div className={`w-10 h-10 ${setting.bgColor} rounded-lg flex items-center justify-center group-hover:bg-indigo-600 transition-colors`}>
                                    <Icon className={`w-5 h-5 ${setting.color} group-hover:text-white transition-colors`} />
                                </div>
                                <h3 className="font-semibold text-gray-900">{setting.title}</h3>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">{setting.description}</p>
                        </button>
                    );
                })}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* System Information - (2/3 width) */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Database className="w-5 h-5 text-indigo-600" />
                        System Information
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { label: "Platform Version", value: "v1.0.0", status: "stable" },
                            { label: "Server Status", value: "Online", status: "success" },
                            { label: "Database Status", value: "Connected", status: "success" },
                            { label: "API Status", value: "Running", status: "success" },
                            { label: "Last Backup", value: "Never", status: "warning" },
                            { label: "Uptime", value: "N/A", status: "none" },
                        ].map((info, idx) => (
                            <div key={idx} className="p-4 bg-gray-50/50 rounded-lg border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{info.label}</p>
                                <div className="flex items-center gap-2">
                                    <p className={`text-sm font-semibold ${info.status === 'success' ? 'text-green-600' : 'text-gray-900'}`}>{info.value}</p>
                                    {info.status === 'success' && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Admin Actions (1/3 width) */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 flex flex-col">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Admin Actions</h2>
                    <div className="flex-1 flex flex-col items-center justify-center py-8">
                        <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-dashed border-gray-200">
                            <Shield className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 text-center">No Admin Activity</p>
                        <p className="text-xs text-gray-500 mt-1 text-center">
                            Activity logging is currently in maintenance.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
