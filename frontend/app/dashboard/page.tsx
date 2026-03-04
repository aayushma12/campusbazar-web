"use client";

import {
  BadgeDollarSign,
  CheckCircle2,
  Clock,
  Package,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  Star,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useDashboardData } from "@/hooks/useDashboard";
import { useAuth } from "@/hooks/useAuth";
import { formatDate, formatPrice, timeAgo } from "@/lib/formatters";
import { getProductId } from "@/types/product";
import { getOrderId, isCompletedOrder } from "@/types/order";
import { getUserId } from "@/types/user";

function getOrderRefUserId(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return getUserId(value as any);
}

function getOrderProductTitle(order: any): string {
  if (order?.productId && typeof order.productId === "object") {
    return order.productId.title || "Untitled product";
  }
  if (Array.isArray(order?.productIds) && order.productIds.length > 0) {
    return order.productIds.length > 1
      ? `Cart (${order.productIds.length} items)`
      : order.productIds[0]?.title || "Untitled product";
  }
  return "Order";
}

function getOrderProductId(order: any): string {
  if (order?.productId && typeof order.productId === "object") {
    return getProductId(order.productId);
  }
  if (typeof order?.productId === "string") return order.productId;
  if (Array.isArray(order?.productIds) && order.productIds.length > 0) {
    return getProductId(order.productIds[0]);
  }
  return "";
}

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useDashboardData();

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-105 bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-2xl font-black text-gray-900 mb-2">Please sign in</h2>
        <p className="text-gray-500 mb-5">You need to be authenticated to view dashboard metrics.</p>
        <Link href="/login" className="px-5 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors">
          Go to Login
        </Link>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-105 bg-white rounded-2xl border border-red-100 flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-2xl font-black text-gray-900 mb-2">Unable to load dashboard</h2>
        <p className="text-gray-500 mb-5 max-w-lg">
          {(error as Error | undefined)?.message || "Something went wrong while fetching your dashboard data."}
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-5 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  const role = user.role;
  const isAdmin = role === "admin";
  const isSeller = role === "seller" || role === "user";
  const isBuyer = role === "student" || role === "buyer" || role === "user";

  const purchasePendingOrders = data.purchases.filter((order) =>
    order.status === "pending" ||
    order.status === "processing" ||
    order.status === "accepted" ||
    order.status === "handed_over" ||
    order.status === "disputed"
  ).length;
  const purchaseCompletedOrders = data.purchases.filter((order) => isCompletedOrder(order.status)).length;

  const statsCards: Array<{
    title: string;
    value: string | number;
    icon: any;
  }> = [];

  if (isAdmin || isSeller) {
    statsCards.push(
      { title: "Total Products", value: data.stats.totalProducts, icon: Package },
      { title: "Total Sales", value: data.stats.totalSales, icon: TrendingUp },
      { title: "Revenue", value: formatPrice(data.stats.totalRevenue), icon: BadgeDollarSign },
    );
  }

  if (isAdmin || isBuyer) {
    statsCards.push(
      { title: "Total Purchases", value: data.stats.totalPurchases, icon: ShoppingBag },
      { title: "My Pending Orders", value: purchasePendingOrders, icon: Clock },
      { title: "My Completed Orders", value: purchaseCompletedOrders, icon: CheckCircle2 },
      { title: "Wishlist", value: data.wishlistCount, icon: Star },
      { title: "Cart", value: data.cartCount, icon: ShoppingCart },
    );
  }

  const userId = getUserId(user);
  const recentOrders = data.recentOrders.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Welcome back, <span className="text-green-600">{user.name || "User"}</span>! 👋
            </h1>
            <p className="text-sm text-gray-500">
              Live dashboard data is synced with your account.
            </p>
          </div>
          {user.profilePicture && (
            <div className="shrink-0">
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm ring-1 ring-gray-100"
              />
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-gray-300 transition-all group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2 tracking-tight">{stat.value}</h3>
                </div>
                <div className="p-2 rounded-lg bg-green-50 ring-1 ring-inset ring-gray-100">
                  <Icon className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-green-600" />
            Recent Orders
          </h2>
          <Link href="/orders/purchases" className="text-sm font-semibold text-green-600 hover:text-green-700">
            View all
          </Link>
        </div>

        <div className="divide-y divide-gray-100">
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => {
              const orderId = getOrderId(order);
              const productId = getOrderProductId(order);
              const orderTitle = getOrderProductTitle(order);
              const isSale = getOrderRefUserId(order.sellerId) === userId;
              const isCompleted = isCompletedOrder(order.status);

              return (
                <Link
                  key={orderId}
                  href={productId ? `/products/${productId}` : '/orders/purchases'}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="relative w-12 h-12 rounded-lg bg-green-50 overflow-hidden shrink-0 flex items-center justify-center">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5 gap-2">
                      <h4 className="text-sm font-bold text-gray-900 truncate">{orderTitle}</h4>
                      <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap">
                        {order.createdAt ? timeAgo(order.createdAt) : "Just now"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {isSale ? "Sale" : "Purchase"} • {formatPrice(order.amount)} • {isCompleted ? "Completed" : order.status}
                    </p>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="p-10 text-center">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm text-gray-500">No recent orders yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Products */}
      {(isAdmin || isSeller) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              Recent Products
            </h2>
            <Link href="/sell/new" className="text-sm font-semibold text-green-600 hover:text-green-700">
              Add Product
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {data.recentProducts.length > 0 ? (
              data.recentProducts.map((product) => {
                const id = getProductId(product);
                return (
                  <Link
                    key={id}
                    href={`/products/${id}`}
                    className="flex items-center justify-between gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{product.title}</p>
                      <p className="text-xs text-gray-500">
                        {product.createdAt ? formatDate(product.createdAt) : "No date"}
                      </p>
                    </div>
                    <p className="text-sm font-black text-gray-900">{formatPrice(product.price)}</p>
                  </Link>
                );
              })
            ) : (
              <div className="p-10 text-center text-sm text-gray-500">No products listed yet.</div>
            )}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh data
        </button>
      </div>
    </div>
  );
}