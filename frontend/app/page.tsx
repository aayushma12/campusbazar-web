"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Users, BookOpen, Shield, Sparkles } from "lucide-react";

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
      color: "from-emerald-400 to-green-600",
    },
    {
      icon: BookOpen,
      title: "Tutoring",
      description: "Find tutors or offer your expertise to help others",
      color: "from-green-400 to-teal-600",
    },
    {
      icon: Users,
      title: "Community",
      description: "Connect with students and build lasting relationships",
      color: "from-teal-400 to-emerald-600",
    },
    {
      icon: Shield,
      title: "Secure",
      description: "Safe and verified transactions within your campus",
      color: "from-emerald-500 to-green-700",
    },
  ];

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] overflow-x-hidden">
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#10b981 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Animated Blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-10">
            {/* New Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-100 text-green-700 text-sm font-bold shadow-sm animate-bounce">
              <Sparkles className="w-4 h-4" />
              <span>The #1 Campus Marketplace</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tight leading-none">
              Shop Smarter, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                Campus Wide.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Experience the ultimate student-powered marketplace. Secure, fast, and exclusive to your university community.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Link
                href="/register"
                className="group px-10 py-5 bg-green-600 text-white rounded-2xl font-bold text-lg hover:bg-green-700 transition-all shadow-xl shadow-green-200 hover:shadow-green-300 flex items-center gap-3"
              >
                Join the Community
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="px-10 py-5 bg-white text-gray-700 border-2 border-gray-100 rounded-2xl font-bold text-lg hover:border-green-200 hover:text-green-600 transition-all shadow-sm"
              >
                Member Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity rounded-bl-full`}></div>

              <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-500`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed font-medium">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Glass Card */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-[3rem] p-12 relative overflow-hidden shadow-3xl">
          {/* Decorative Circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            <div className="text-center text-white">
              <h4 className="text-5xl font-black mb-2">2.5k+</h4>
              <p className="text-green-100 font-bold uppercase tracking-widest text-xs">Verified Students</p>
            </div>
            <div className="text-center text-white border-y md:border-y-0 md:border-x border-white/20 py-8 md:py-0">
              <h4 className="text-5xl font-black mb-2">12k+</h4>
              <p className="text-green-100 font-bold uppercase tracking-widest text-xs">Total Listings</p>
            </div>
            <div className="text-center text-white">
              <h4 className="text-5xl font-black mb-2">98%</h4>
              <p className="text-green-100 font-bold uppercase tracking-widest text-xs">Positive Feedback</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-gray-400 font-medium">
        <p>© 2024 CampusBazar • Secure. Simple. Student-driven.</p>
      </footer>
    </div>
  );
}