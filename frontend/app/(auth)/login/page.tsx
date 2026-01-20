import Image from "next/image";
import Link from "next/link";
import LoginForm from "../_components/LoginForm";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100/70 flex items-center justify-center p-5 sm:p-6 lg:p-8">
      {/* Subtle background pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.015] mix-blend-multiply">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      <div className="relative w-full max-w-md sm:max-w-lg">
        <div className="bg-white/80 backdrop-blur-xl shadow-xl shadow-black/5 border border-gray-200/70 rounded-2xl p-8 sm:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative h-14 w-48 sm:h-16 sm:w-56 transition-transform hover:scale-105 duration-300">
              <Image
                src="/logo.png"
                alt="Campus Bazar"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h1>
            <p className="text-base text-gray-500">
              Sign in to continue to Campus Bazar
            </p>
          </div>

          {/* Login Form */}
          <LoginForm />

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-gray-100 text-center text-sm">
            <p className="text-gray-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-green-600 hover:text-green-700 transition-colors"
              >
                Create account →
              </Link>
            </p>
          </div>
        </div>

        {/* Micro footer */}
        <div className="mt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Campus Bazar • Made with ❤️ in Nepal
        </div>
      </div>
    </div>
  );
}
