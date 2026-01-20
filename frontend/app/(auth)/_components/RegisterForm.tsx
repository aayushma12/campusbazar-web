"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRegisterMutation } from "@/auth/queries";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  const { mutateAsync, isPending } = useRegisterMutation();
  const { setAuth } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const res = await mutateAsync({ name, email, password });

    if (res?.accessToken && res?.user) {
      setAuth(res.user, res.accessToken);
      router.push("/login");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          name="name"
          placeholder="Enter your full name"
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          name="email"
          type="email"
          placeholder="Enter your email"
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Please enter your password"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm pr-10
                       focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        disabled={isPending}
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60
                   text-white py-2.5 rounded-md text-sm font-medium transition"
      >
        {isPending ? "Creating..." : "Sign Up"}
      </button>
    </form>
  );
}
