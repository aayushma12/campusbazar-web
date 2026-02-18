"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Changed useParams to useSearchParams
import { useLoginMutation, useResetPasswordMutation } from "@/auth/queries";
import Link from "next/link";
import toast from "react-hot-toast";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Grab the token from the query string (?token=...)
    const token = searchParams.get("token");
     
    const resetMutation = useResetPasswordMutation();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Optional: Redirect if token is missing entirely
    useEffect(() => {
        if (!token) {
            toast.error("Invalid or missing reset token");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            return toast.error("Reset token is missing. Please request a new link.");
        }

        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }

        if (password.length < 6) {
            return toast.error("Password must be at least 6 characters");
        }

        const resetToast = toast.loading("Updating password...");

        try {
            await resetMutation.mutateAsync({
                token, // This will now be the actual string, not undefined
                password,
            });

            toast.success("Password updated successfully!", { id: resetToast });
            
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err: any) {
            console.error("Reset password error:", err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to reset password";
            toast.error(errorMessage, { id: resetToast });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f9f4] p-4 font-sans">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-2xl border border-green-100 p-8 space-y-6">
                    
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-[#22c55e] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
                            <Lock className="text-white w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Set New Password
                        </h1>
                        <p className="text-sm text-gray-500 font-medium">
                            Enter a strong password to secure your account
                        </p>
                    </div>

                    {!token ? (
                        <div className="text-center p-4 bg-red-50 rounded-xl text-red-600 text-sm">
                            Invalid reset link. Please check your email or request a new one.
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* New Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none text-gray-900 text-sm"
                                        placeholder="••••••••"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)} 
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                                    Confirm New Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none text-gray-900 text-sm"
                                    placeholder="••••••••"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={resetMutation.isPending}
                                className="w-full bg-[#22c55e] text-white py-3.5 px-4 rounded-xl font-bold hover:bg-[#16a34a] focus:outline-none focus:ring-4 focus:ring-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-100 mt-2"
                            >
                                {resetMutation.isPending ? "Updating..." : "Reset Password"}
                            </button>
                        </form>
                    )}

                    {/* Back to Login */}
                    <div className="text-center">
                        <Link 
                            href="/login" 
                            className="inline-flex items-center gap-2 text-sm font-bold text-green-600 hover:text-green-700 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}