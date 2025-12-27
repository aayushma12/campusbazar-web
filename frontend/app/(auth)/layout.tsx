import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col justify-center items-center px-6 relative overflow-hidden">
      {/* 1. Shared Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_50%_120%,#f0fdf4,white)]" />
      
      {/* 2. Shared Back Button */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-green-600 transition-colors font-bold text-sm group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        Back to Home
      </Link>

      {/* 3. This is where the Login or Register content will appear */}
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}