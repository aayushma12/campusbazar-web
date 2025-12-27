"use client";
//importing necessary 
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { RegisterData, registerSchema } from "../schema";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterData) => {
    try {
      console.log("Registering user...", data);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push("/login"); 
    } catch (error) {
      console.error("Signup failed", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
      {/* Name Field */}
      <div className="space-y-1">
        <label className="text-sm font-bold text-[#3B3486]">Full Name</label>
        <input
          {...register("name")}
          placeholder="Enter your name"
          className={`w-full px-4 py-2.5 rounded-md border ${
            errors.name ? "border-red-500" : "border-gray-200"
          } focus:outline-none focus:border-green-500 text-sm`}
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      {/* Email Field */}
      <div className="space-y-1">
        <label className="text-sm font-bold text-[#3B3486]">Email Address</label>
        <input
          {...register("email")}
          type="email"
          placeholder="Enter your email"
          className={`w-full px-4 py-2.5 rounded-md border ${
            errors.email ? "border-red-500" : "border-gray-200"
          } focus:outline-none focus:border-green-500 text-sm`}
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
            placeholder="Please Enter Your Password"
            className={`w-full px-4 py-2.5 rounded-md border ${
              errors.password ? "border-red-500" : "border-gray-200"
            } focus:outline-none focus:border-green-500 text-sm`}
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

      {/* Confirm Password Field */}
      <div className="space-y-1">
        <label className="text-sm font-bold text-[#3B3486]">Confirm Password</label>
        <input
          {...register("confirmPassword")}
          type="password"
          placeholder="Confirm your password"
          className={`w-full px-4 py-2.5 rounded-md border ${
            errors.confirmPassword ? "border-red-500" : "border-gray-200"
          } focus:outline-none focus:border-green-500 text-sm`}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Remember Me Only - Aligned to Right */}
      <div className="flex justify-end pt-1">
        <label className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-green-600" />
          <span>Remember Me</span>
        </label>
      </div>

      {/* Sign Up Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#28a745] hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-md transition-colors mt-4 shadow-sm"
      >
        {isSubmitting ? "Creating Account..." : "Sign Up"}
      </button>
    </form>
  );
}