"use client";

import { useState } from "react";
import { useForgotPasswordMutation } from "@/auth/queries";
import Link from "next/link";
import toast from "react-hot-toast";
import { Mail, ArrowLeft, Send } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isSent, setIsSent] = useState(false);
    const forgotMutation = useForgotPasswordMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const loadToast = toast.loading("Sending reset link...");

        try {
            await forgotMutation.mutateAsync(email);
            toast.success("Reset link sent to your email!", { id: loadToast });
            setIsSent(true);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Something went wrong", { id: loadToast });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f9f4] p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-2xl border border-green-100 p-8 space-y-6">
                    
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-[#22c55e] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-100">
                            <Send className="text-white w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
                        <p className="text-sm text-gray-500">No worries, we'll send you reset instructions.</p>
                    </div>

                    {!isSent ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 transition-all outline-none text-sm"
                                        placeholder="you@campus.edu"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={forgotMutation.isPending}
                                className="w-full bg-[#22c55e] text-white py-3 rounded-xl font-bold hover:bg-[#16a34a] transition-all disabled:opacity-50 shadow-lg shadow-green-50"
                            >
                                {forgotMutation.isPending ? "Sending..." : "Send Reset Link"}
                            </button>
                        </form>
                    ) : (
                        <div className="bg-green-50 border border-green-100 p-4 rounded-xl text-center">
                            <p className="text-sm text-green-800 font-medium">
                                Check your inbox! We've sent an email to <span className="font-bold">{email}</span>.
                            </p>
                        </div>
                    )}

                    <div className="text-center">
                        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-green-600 hover:text-green-700 transition-all">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}