"use client";

import { useAuthStore } from "@/store/authStore";
import { useProfileQuery } from "@/auth/profileQueries";
import { Package, TrendingUp, Users, Activity } from "lucide-react";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [mounted, setMounted] = useState(false);
  const { data: profile, isLoading: profileLoading } = useProfileQuery();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Listings",
      value: "0",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Requests",
      value: "0",
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Favorites",
      value: "0",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Messages",
      value: "0",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Welcome back, <span className="text-indigo-600">{user?.name || "User"}</span>! 👋
            </h1>
            <p className="text-sm text-gray-500">
              Here's what's happening with your account today.
            </p>
          </div>
          {profile?.profilePicture && (
            <div className="flex-shrink-0">
              <img
                src={profile.profilePicture}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm ring-1 ring-gray-100"
              />
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid - Clean & Minimal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-gray-300 transition-all group"
            >
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

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <div className="flex gap-1.5 p-1 bg-gray-50 rounded-lg border border-gray-100">
              <button className="px-3 py-1 text-xs font-medium text-gray-600 bg-white rounded shadow-sm border border-gray-200">All</button>
              <button className="px-3 py-1 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">Pending</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-5 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group group relative flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-600 transition-all duration-300">
                <Package className="w-6 h-6 text-indigo-600 group-hover:text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">Create Listing</h3>
              <p className="text-xs text-gray-500 mt-1">Post a new item</p>
            </button>

            <button className="p-5 bg-white border border-gray-200 rounded-xl hover:border-purple-500 hover:shadow-md transition-all group relative flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-600 transition-all duration-300">
                <Activity className="w-6 h-6 text-purple-600 group-hover:text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">Request Tutor</h3>
              <p className="text-xs text-gray-500 mt-1">Find study help</p>
            </button>

            <button className="p-5 bg-white border border-gray-200 rounded-xl hover:border-green-500 hover:shadow-md transition-all group relative flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-600 transition-all duration-300">
                <Users className="w-6 h-6 text-green-600 group-hover:text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">Browse Items</h3>
              <p className="text-xs text-gray-500 mt-1">Explore market</p>
            </button>
          </div>
        </div>

        {/* Activity Feed (1/3 width) */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="flex-1 flex flex-col items-center justify-center py-8">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-dashed border-gray-200">
              <Activity className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-900">No Activity Yet</p>
            <p className="text-xs text-gray-500 mt-1 text-center max-w-[180px]">
              When you start using the app, your activity will show up here.
            </p>
          </div>
          <button className="w-full mt-6 py-2.5 bg-gray-50 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-all border border-gray-200 uppercase tracking-tighter">
            View All History
          </button>
        </div>
      </div>
    </div>
  );
}
