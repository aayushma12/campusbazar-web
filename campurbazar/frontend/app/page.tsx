"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Users, BookOpen, Shield } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin()) {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isAdmin, router]);

  const features = [
    {
      icon: ShoppingBag,
      title: "Marketplace",
      description: "Buy and sell items within your campus community",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: BookOpen,
      title: "Tutoring",
      description: "Find tutors or offer your expertise to help others",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Users,
      title: "Community",
      description: "Connect with students and build lasting relationships",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Shield,
      title: "Secure",
      description: "Safe and verified transactions within your campus",
      color: "from-orange-500 to-orange-600",
    },
  ];

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 mb-16">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                CB
              </span>
            </div>
          </div>

          {/* Hero Text */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white">
              Welcome to{" "}
              <span className="bg-white/20 px-4 py-2 rounded-2xl">
                CampusBazar
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Your campus marketplace for buying, selling, and connecting with
              fellow students
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="group px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all shadow-2xl hover:shadow-3xl flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white/10 backdrop-blur-lg text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all border-2 border-white/30"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                0+
              </p>
              <p className="text-gray-600 mt-2">Active Users</p>
            </div>
            <div>
              <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                0+
              </p>
              <p className="text-gray-600 mt-2">Listings</p>
            </div>
            <div>
              <p className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                0+
              </p>
              <p className="text-gray-600 mt-2">Successful Trades</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-white/80">
          <p className="text-sm">
            © 2024 CampusBazar. Built with ❤️ for students, by students.
          </p>
        </div>
      </div>
    </div>
  );
}