"use client";


import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation"; // if using App Router
 // 1. Import useRouter
import { LoginData, loginSchema } from "../schema";
import { useState } from "react";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter(); // 2. Initialize router

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginData) => {
    try {
      // 3. Simulate your login API logic
      console.log("Login Attempt:", data);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // 4. Navigate to dashboard on success
      router.push("/dashboard"); 
      
    } catch (error) {
      console.error("Login failed:", error);
      // You could add a toast or error message state here
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
      {/* Email Field */}
      <div className="space-y-1">
        <label className="text-sm font-bold text-[#3B3486]">Email Address</label>
        <input
          {...register("email")}
          type="email"
          placeholder="Enter your email"
          className={`w-full px-4 py-2.5 rounded-md border ${
            errors.email ? "border-red-500" : "border-gray-200"
          } focus:outline-none focus:border-green-500 text-sm placeholder:text-gray-300`}
        />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      {/* Password Field */}
      <div className="space-y-1">
        <label className="text-sm font-bold text-[#3B3486]">Password</label>
        <div className="relative">
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className={`w-full px-4 py-2.5 rounded-md border ${
              errors.password ? "border-red-500" : "border-gray-200"
            } focus:outline-none focus:border-green-500 text-sm placeholder:text-gray-300`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>

      {/* Forgot Password & Remember Me row */}
      <div className="flex items-center justify-between pt-1">
        <button type="button" className="text-sm font-medium text-green-600 hover:underline">
          Forgot Password?
        </button>
        <label className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-0" />
          <span>Remember Me</span>
        </label>
      </div>

      {/* Login Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#28a745] hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-md transition-colors mt-4 shadow-sm"
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}