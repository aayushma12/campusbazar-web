"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLoginMutation, useAdminLoginMutation } from "@/auth/queries";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";

//login page
export default function LoginPage() {
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const [isAdminLogin, setIsAdminLogin] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const userLoginMutation = useLoginMutation();
    const adminLoginMutation = useAdminLoginMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            if (isAdminLogin) {
                // Admin login
                const response = await adminLoginMutation.mutateAsync({
                    email,
                    password,
                });

                if (response.accessToken) {
                    setAuth(
                        response.user,
                        response.accessToken,
                        response.refreshToken
                    );
                    router.push("/dashboard/admin");
                }
            } else {
                // User login
                const response = await userLoginMutation.mutateAsync({
                    email,
                    password,
                });

                if (response.accessToken) {
                    setAuth(
                        response.user,
                        response.accessToken,
                        response.refreshToken
                    );
                    router.push("/dashboard");
                }
            }
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Login failed. Please try again."
            );
        }
    };

    const isLoading = userLoginMutation.isPending || adminLoginMutation.isPending;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md">
                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-xl">CB</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Welcome Back
                        </h1>
                        <p className="text-sm text-gray-500">
                            Sign in to access your account
                        </p>
                    </div>

                    {/* Login Type Toggle */}
                    <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setIsAdminLogin(false)}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${!isAdminLogin
                                ? "bg-white text-indigo-600 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            User Login
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsAdminLogin(true)}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${isAdminLogin
                                ? "bg-white text-indigo-600 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Admin Login
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-gray-900 text-sm"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-gray-900 text-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg
                                        className="animate-spin h-4 w-4"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                `Sign in as ${isAdminLogin ? "Admin" : "User"}`
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    {!isAdminLogin && (
                        <div className="text-center text-sm text-gray-600">
                            Don't have an account?{" "}
                            <Link
                                href="/register"
                                className="text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                Create account
                            </Link>
                        </div>
                    )}

                    {/* Admin Info */}
                    {isAdminLogin && (
                        <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-3 rounded-lg text-xs">
                            <p className="font-semibold mb-1">Demo Admin Credentials:</p>
                            <p>Email: {process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@campusbazar.com"}</p>
                            <p>Password: {process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "Admin@123"}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
