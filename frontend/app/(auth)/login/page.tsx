import Link from "next/link";
import Image from "next/image";
import LoginForm from "../_components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white p-6">
      <div className="w-full max-w-[450px] flex flex-col items-center">
        
        {/* LOGO of campus bazar*/}
        <div className="relative h-20 w-44 mb-6">
          <Image 
            src="/logo.png"  //logo
            alt="Campus Bazar" 
            fill 
            className="object-contain" 
            priority 
          />
        </div>

        {/* Header Text */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Login to your account</h1>
          <p className="text-sm text-gray-400 mt-2 font-medium">Welcome back! Please enter your details.</p>
        </div>

        {/* LOGIN FORM COMPONENT */}
        <LoginForm />

        {/* Footer Link */}
        <div className="mt-10 text-sm text-gray-500">
          Don't have an account?{" "}
          <Link href="/register" className="font-bold text-[#3B3486] hover:underline ml-2">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}