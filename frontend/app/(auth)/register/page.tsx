import Image from "next/image";
import Link from "next/link";
import RegisterForm from "../_components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative h-14 w-44">
              <Image
                src="/logo.png"
                alt="Campus Bazar"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold text-center text-gray-900">
            Create an account
          </h1>
          <p className="text-sm text-center text-gray-500 mt-1 mb-6">
            Connect with your friends today!
          </p>

          {/* Register Form */}
          <RegisterForm />

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className=" text-green-600 font-medium hover:underline"
            >
              Login
            </Link>
          </p>
        </div>

        <p className="text-xs text-center text-gray-400 mt-6">
          © {new Date().getFullYear()} Campus Bazar • Made with ❤️ in Nepal
        </p>
      </div>
    </div>
  );
}
