"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLoginMutation, useAdminLoginMutation } from "@/auth/queries";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import toast from "react-hot-toast";
import { Lock, Mail, ChevronLeft, ShieldCheck, GraduationCap } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const [isAdminLogin, setIsAdminLogin] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const userLoginMutation = useLoginMutation();
    const adminLoginMutation = useAdminLoginMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const loginToast = toast.loading("Verifying credentials...");

        try {
            if (isAdminLogin) {
                const response = await adminLoginMutation.mutateAsync({ email, password });
                if (response.accessToken) {
                    setAuth(response.user, response.accessToken, response.refreshToken);
                    toast.success("Welcome back, Admin!", { id: loginToast });
                    router.push("/dashboard/admin");
                }
            } else {
                const response = await userLoginMutation.mutateAsync({ email, password });
                if (response.accessToken) {
                    setAuth(response.user, response.accessToken, response.refreshToken);
                    toast.success(`Welcome back, ${response.user.name}!`, { id: loginToast });
                    router.push("/dashboard");
                }
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Login failed", { id: loginToast });
        }
    };

    const isLoading = userLoginMutation.isPending || adminLoginMutation.isPending;

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 relative overflow-hidden">
            {/* Background Decorative Blobs */}
            <div className="absolute top-0 -left-20 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 -right-20 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Back to Home */}
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-green-600 transition-colors mb-8 group">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to marketplace
                </Link>

                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-green-900/5 border border-gray-100 p-10 space-y-8">
                    
                    {/* Header */}
                    <div className="text-center space-y-3">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-200 rotate-3">
                            <span className="text-white font-black text-3xl">CB</span>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Welcome Back</h1>
                        <p className="text-gray-500 font-medium italic">Secure access to your campus bazar</p>
                    </div>

                    {/* Role Switcher */}
                    <div className="flex p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                        <button
                            type="button"
                            onClick={() => setIsAdminLogin(false)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${!isAdminLogin ? "bg-white text-green-700 shadow-sm border border-gray-100" : "text-gray-400 hover:text-gray-600"}`}
                        >
                            <GraduationCap className="w-4 h-4" />
                            Student
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsAdminLogin(true)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${isAdminLogin ? "bg-white text-emerald-700 shadow-sm border border-gray-100" : "text-gray-400 hover:text-gray-600"}`}
                        >
                            <ShieldCheck className="w-4 h-4" />
                            Admin
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all outline-none text-gray-900 font-medium"
                                    placeholder="name@campus.edu"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label htmlFor="password" className="text-sm font-bold text-gray-700">Password</label>
                                <Link href="/forgot-password" title="Recover your password" className="text-xs font-extrabold text-green-600 hover:text-emerald-700">
                                    Forgot?
                                </Link>
                            </div>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all outline-none text-gray-900 font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-4 px-4 rounded-2xl font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-green-200 text-lg"
                        >
                            {isLoading ? "Authenticating..." : `Sign In`}
                        </button>
                    </form>

                    {!isAdminLogin && (
                        <div className="text-center pt-2">
                            <p className="text-sm font-bold text-gray-400">
                                First time here?{" "}
                                <Link href="/register" className="text-green-600 hover:text-emerald-700 font-black">
                                    Create Student Account
                                </Link>
                            </p>
                        </div>
                    )}
                </div>

                <p className="text-center mt-8 text-gray-400 text-xs font-medium">
                    &copy; 2024 CampusBazar • Secure Student-to-Student Trading
                </p>
            </div>
        </div>
    );
}