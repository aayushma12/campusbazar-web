"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Lock,
  Mail,
  ChevronLeft,
  ShieldCheck,
  GraduationCap,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { useLoginMutation } from "@/auth/queries";
import { useAuthStore } from "@/store/authStore";

// ─── Schema ───────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

function getConfiguredAdminIds(): string[] {
  const raw =
    process.env.NEXT_PUBLIC_ADMIN_USER_IDS ||
    process.env.NEXT_PUBLIC_ADMIN_USER_ID ||
    "";

  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

// ─── Component ────────────────────────────────────
function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginForm) => {
    const toastId = toast.loading("Verifying your credentials…");
    try {
      const response = await loginMutation.mutateAsync(data);
      const payload = response?.data ?? response;
      const accessToken = payload?.accessToken;
      const refreshToken = payload?.refreshToken;
      const user = payload?.user;

      if (accessToken && user) {
        const configuredAdminIds = getConfiguredAdminIds();
        const isConfiguredAdmin = configuredAdminIds.includes(String(user.id || user._id || ""));
        const isAdmin = user.role === "admin" || isConfiguredAdmin;

        // Enforce explicit role mode selection on login screen
        if (isAdmin && !isAdminLogin) {
          throw new Error("Admin accounts must use the Admin login tab.");
        }

        if (!isAdmin && isAdminLogin) {
          throw new Error("Student accounts must use the Student login tab.");
        }

        setAuth(user, accessToken, refreshToken ?? "");

        const next = searchParams.get("next");
        const safeNext = next && next.startsWith("/") ? next : null;
        const destination = safeNext ?? (isAdmin ? "/dashboard/admin" : "/dashboard");

        toast.success(
          isAdmin
            ? "Welcome back, Admin! 🛡️"
            : `Welcome back, ${user.name}! 👋`,
          { id: toastId }
        );

        router.replace(destination);
        router.refresh();
      } else {
        throw new Error("Invalid login response from server");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? err?.message ?? "Login failed. Please try again.",
        { id: toastId }
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-green-600 transition-colors mb-8 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to marketplace
        </Link>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-green-900/5 border border-gray-100 p-10 space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-20 h-20 bg-linear-to-br from-green-600 to-emerald-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-200 rotate-3 hover:rotate-0 transition-transform duration-500">
              <span className="text-white font-black text-3xl">CB</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-gray-500 font-medium">
              Secure access to your campus bazar
            </p>
          </div>

          {/* Role switcher */}
          <div className="flex p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
            <button
              type="button"
              onClick={() => setIsAdminLogin(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${!isAdminLogin
                  ? "bg-white text-green-700 shadow-sm border border-gray-100"
                  : "text-gray-400 hover:text-gray-600"
                }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student
            </button>
            <button
              type="button"
              onClick={() => setIsAdminLogin(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${isAdminLogin
                  ? "bg-white text-emerald-700 shadow-sm border border-gray-100"
                  : "text-gray-400 hover:text-gray-600"
                }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="text-sm font-bold text-gray-700 ml-1"
              >
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors pointer-events-none">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all outline-none text-gray-900 font-medium text-sm"
                  placeholder="name@campus.edu"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 font-medium ml-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label
                  htmlFor="login-password"
                  className="text-sm font-bold text-gray-700"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-extrabold text-green-600 hover:text-emerald-700"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors pointer-events-none">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password")}
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all outline-none text-gray-900 font-medium text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 font-medium ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loginMutation.isPending}
              className="w-full bg-linear-to-r from-green-600 to-emerald-700 text-white py-4 px-4 rounded-2xl font-bold hover:opacity-90 hover:shadow-xl hover:shadow-green-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-200 text-base flex items-center justify-center gap-2"
            >
              {isSubmitting || loginMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {!isAdminLogin && (
            <p className="text-center text-sm font-bold text-gray-400">
              First time here?{" "}
              <Link
                href="/register"
                className="text-green-600 hover:text-emerald-700 font-black"
              >
                Create Student Account
              </Link>
            </p>
          )}
        </div>

        <p className="text-center mt-8 text-gray-400 text-xs font-medium">
          © 2025 CampusBazar • Secure Student-to-Student Trading
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
