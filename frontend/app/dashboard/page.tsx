"use client";

import { useAuthStore } from "@/store/authStore";
import { useProfileQuery } from "@/auth/profileQueries";
import { Package, TrendingUp, Users, Activity } from "lucide-react";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { data: profile, isLoading: profileLoading } = useProfileQuery();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || profileLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = [
    { title: "Total Listings", value: "0", icon: Package, color: "text-blue-600", bgColor: "bg-blue-50" },
    { title: "Active Requests", value: "0", icon: Activity, color: "text-green-600", bgColor: "bg-green-50" },
    { title: "Favorites", value: "0", icon: TrendingUp, color: "text-purple-600", bgColor: "bg-purple-50" },
    { title: "Messages", value: "0", icon: Users, color: "text-orange-600", bgColor: "bg-orange-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Welcome back, <span className="text-indigo-600">{profile?.name || "User"}</span>! 👋
            </h1>
            <p className="text-sm text-gray-500">
              Here's what's happening with your account today.
            </p>
          </div>
          {profile?.profilePicture && (
            <div className="shrink-0">
              <img
                src={profile.profilePicture}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm ring-1 ring-gray-100"
              />
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-gray-300 transition-all group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2 tracking-tight">{stat.value}</h3>
                </div>
                <div className={`p-2 rounded-lg ${stat.bgColor} ring-1 ring-inset ring-gray-100`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
