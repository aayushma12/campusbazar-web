import Link from "next/link";
import Image from "next/image";
import RegisterForm from "../_components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white p-6">
      <div className="w-full max-w-[480px] flex flex-col items-center">
        
        {/* LOGO of campusbazar*/}
        <div className="relative h-20 w-40 mb-8">
          <Image 
            src="/logo.png" 
            alt="Campus Bazar Logo" 
            fill 
            className="object-contain" 
            priority 
          />
        </div>

        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Create an account</h1>
          <p className="text-sm text-gray-400 mt-2">Connect with your friends today!</p>
        </div>

        {/* REGISTER FORM */}
        <RegisterForm />

        {/* Bottom Login Link */}
        <div className="mt-12 text-sm text-gray-500 flex gap-4 items-center">
          <span>Already have an account ?</span>
          <Link href="/login" className="font-bold text-[#3B3486] hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}