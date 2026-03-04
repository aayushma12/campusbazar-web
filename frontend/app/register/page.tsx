"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import toast from "react-hot-toast";
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ChevronLeft,
    GraduationCap,
    Loader2,
    Building2,
} from "lucide-react";
import { useRegisterMutation } from "@/auth/queries";

// ─── Zod schema ───────────────────────────────────
const registerSchema = z
    .object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Please enter a valid email"),
        university: z.string().min(1, "Please select your university"),
        campus: z.string().min(1, "Campus is required"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type RegisterForm = z.infer<typeof registerSchema>;

// ─── Universities list (Nepal) ────────────────────
const UNIVERSITIES = [
    "Tribhuvan University",
    "Kathmandu University",
    "Pokhara University",
    "Purbanchal University",
    "Mid-Western University",
    "Far-Western University",
    "Lumbini Buddhist University",
    "Agriculture and Forestry University",
    "Nepal Sanskrit University",
    "Other",
];

// ─── Component ────────────────────────────────────
export default function RegisterPage() {
    const router = useRouter();
    const registerMutation = useRegisterMutation();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterForm) => {
        const toastId = toast.loading("Creating your account…");
        try {
            await registerMutation.mutateAsync({
                name: data.name,
                email: data.email,
                password: data.password,
                university: data.university,
                campus: data.campus,
            });
            toast.success("Account created! Please sign in.", { id: toastId });
            router.push("/login");
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message ?? "Registration failed. Please try again.",
                { id: toastId }
            );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 relative overflow-hidden">
            {/* Blobs */}
            <div className="absolute -top-16 -left-16 w-72 h-72 bg-green-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-emerald-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

            <div className="w-full max-w-lg relative z-10">
                {/* Back link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-green-600 transition-colors mb-8 group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to marketplace
                </Link>

                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-green-900/5 border border-gray-100 p-10 space-y-7">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-linear-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200 rotate-3">
                            <GraduationCap className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            Join CampusBazar
                        </h1>
                        <p className="text-gray-500 font-medium text-sm">
                            Start buying and selling within your campus community
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                        {/* Full Name */}
                        <Field label="Full Name" error={errors.name?.message}>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-600 transition-colors pointer-events-none" />
                                <input
                                    id="reg-name"
                                    type="text"
                                    autoComplete="name"
                                    {...register("name")}
                                    placeholder="John Doe"
                                    className={inputCls(!!errors.name, true)}
                                />
                            </div>
                        </Field>

                        {/* Email */}
                        <Field label="Email Address" error={errors.email?.message}>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-600 transition-colors pointer-events-none" />
                                <input
                                    id="reg-email"
                                    type="email"
                                    autoComplete="email"
                                    {...register("email")}
                                    placeholder="you@campus.edu"
                                    className={inputCls(!!errors.email, true)}
                                />
                            </div>
                        </Field>

                        {/* University + Campus */}
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="University" error={errors.university?.message}>
                                <div className="relative group">
                                    <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-600 transition-colors pointer-events-none" />
                                    <select
                                        {...register("university")}
                                        className={selectCls}
                                    >
                                        <option value="">Select…</option>
                                        {UNIVERSITIES.map((u) => (
                                            <option key={u} value={u}>
                                                {u}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </Field>

                            <Field label="Campus / Location" error={errors.campus?.message}>
                                <div className="relative group">
                                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-600 transition-colors pointer-events-none" />
                                    <input
                                        type="text"
                                        {...register("campus")}
                                        placeholder="Kirtipur"
                                        className={inputCls(false, true)}
                                    />
                                </div>
                            </Field>
                        </div>

                        {/* Password */}
                        <Field label="Password" error={errors.password?.message}>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-600 transition-colors pointer-events-none" />
                                <input
                                    id="reg-password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    {...register("password")}
                                    placeholder="••••••••"
                                    className={inputCls(!!errors.password, true)}
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </Field>

                        {/* Confirm Password */}
                        <Field label="Confirm Password" error={errors.confirmPassword?.message}>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-600 transition-colors pointer-events-none" />
                                <input
                                    id="reg-confirm"
                                    type={showConfirm ? "text" : "password"}
                                    autoComplete="new-password"
                                    {...register("confirmPassword")}
                                    placeholder="••••••••"
                                    className={inputCls(!!errors.confirmPassword, true)}
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowConfirm((v) => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </Field>

                        {/* Password strength hint */}
                        <p className="text-xs text-gray-400 -mt-1 ml-1">
                            Minimum 6 characters — use a mix of letters, numbers & symbols
                        </p>

                        <button
                            type="submit"
                            disabled={isSubmitting || registerMutation.isPending}
                            className="w-full bg-linear-to-r from-green-600 to-emerald-700 text-white py-4 rounded-2xl font-bold hover:opacity-90 hover:shadow-xl hover:shadow-green-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-200 text-sm flex items-center justify-center gap-2 mt-2"
                        >
                            {isSubmitting || registerMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating account…
                                </>
                            ) : (
                                "Create Free Account"
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm font-bold text-gray-400 pt-1">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-green-600 hover:text-emerald-700 font-black"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>

                <p className="text-center mt-6 text-gray-400 text-xs font-medium">
                    © 2025 CampusBazar • Secure Student-to-Student Trading
                </p>
            </div>
        </div>
    );
}

// ─── Helpers ──────────────────────────────────────
function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>
            {children}
            {error && (
                <p className="text-xs text-red-500 font-medium ml-1">{error}</p>
            )}
        </div>
    );
}

function inputCls(hasError: boolean, hasLeftIcon = false) {
    return `w-full ${hasLeftIcon ? "pl-10" : "pl-4"} pr-12 py-3.5 bg-gray-50 border ${hasError ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" : "border-gray-200 focus:border-green-500 focus:ring-green-500/10"
        } rounded-2xl focus:ring-4 focus:bg-white transition-all outline-none text-gray-900 font-medium text-sm`;
}

const selectCls = `w-full pl-10 pr-3 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all outline-none text-gray-900 font-medium text-sm appearance-none`;
