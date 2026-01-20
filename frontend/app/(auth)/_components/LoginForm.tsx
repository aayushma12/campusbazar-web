"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLoginMutation } from "@/auth/queries";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const { mutateAsync, isPending } = useLoginMutation();
  const { setAuth } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const res = await mutateAsync({ email, password });

    if (res?.accessToken && res?.user) {
      setAuth(res.user, res.accessToken);
      router.push("/dashboard");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Email Address
        </label>
        <input
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm
                     transition
                     focus:outline-none focus:ring-2 focus:ring-green-500
                     hover:border-gray-400"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Password
        </label>

        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            required
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm pr-10
                       transition
                       focus:outline-none focus:ring-2 focus:ring-green-500
                       hover:border-gray-400"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3
                       text-gray-400 hover:text-gray-600 transition"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Forgot Password Link */}
      <div className="text-right">
        <Link
          href="/forgot-password"
          className="text-sm text-green-600 hover:underline"
        >
          Forgot Password?
        </Link>
      </div>

      {/* Submit */}
      <button
        disabled={isPending}
        type="submit"
        className="w-full flex items-center justify-center
                   bg-green-600 hover:bg-green-700
                   disabled:opacity-60 disabled:cursor-not-allowed
                   text-white py-2.5 rounded-md
                   text-sm font-semibold
                   transition"
      >
        {isPending ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
