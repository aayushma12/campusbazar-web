import Link from "next/link";
import { 
  ShoppingBag, 
  ArrowRight, 
  Store, 
  BookOpen, 
  Users
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-green-100 selection:text-green-900">
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-green-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="bg-green-600 p-2 rounded-xl shadow-lg shadow-green-200 group-hover:scale-110 transition-transform duration-300">
              <ShoppingBag size={20} className="text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-800">
              Campus<span className="text-green-600">Bazar</span>
            </span>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <Link 
              href="/login" 
              className="hidden sm:block text-sm font-bold text-slate-600 hover:text-green-600 transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="bg-green-600 text-white px-7 py-3 rounded-full text-sm font-bold shadow-xl shadow-green-100 hover:bg-green-700 transition-all active:scale-95"
            >
              Join the Community
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative pt-32 lg:pt-48 pb-12 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_50%_120%,#f0fdf4,white)]" />
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="space-y-10 text-center lg:text-left">
            <h1 className="text-6xl md:text-8xl font-black leading-[0.95] tracking-tighter">
              <span className="text-slate-800">Trade Smart.</span> <br />
              <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">Learn Better.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
              The all-in-one student marketplace and tutoring hub. Our platform facilitates marketplace activities and tutoring requests through a structured, user-friendly interface.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link 
                href="/register" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-br from-green-600 to-emerald-600 text-white px-12 py-6 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-green-200 hover:-translate-y-1 transition-all group"
              >
                Start Exploring
                <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 bg-green-200 rounded-[3rem] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
            <div className="relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(5,150,105,0.15)] border-[12px] border-white transition-transform duration-500 group-hover:rotate-1">
              <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop" alt="Campus Life" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
          </div>
        </div>
      </main>

      <section className="py-12 max-w-7xl mx-auto px-6 relative">
        <div className="grid md:grid-cols-3 gap-8">
            {[
                { title: "Marketplace", icon: <Store />, desc: "Trade textbooks, electronics, and essentials securely with your peers.", color: "text-green-600", bg: "bg-green-50" },
                { title: "Tutoring Hub", icon: <Users />, desc: "Post academic requests or offer help to earn and support the community.", color: "text-emerald-600", bg: "bg-emerald-50" },
                { title: "Resources", icon: <BookOpen />, desc: "Share study materials and lecture notes in a organized central space.", color: "text-green-700", bg: "bg-green-50" }
            ].map((feature, i) => (
                <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-green-50 hover:border-green-200 hover:shadow-xl hover:shadow-green-500/5 transition-all group cursor-default">
                    <div className={`${feature.color} ${feature.bg} mb-8 inline-block p-5 rounded-2xl group-hover:scale-110 transition-transform`}>
                        {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-slate-800">{feature.title}</h3>
                    <p className="text-slate-500 text-base leading-relaxed">{feature.desc}</p>
                </div>
            ))}
        </div>
      </section>

      <footer className="py-12 border-t border-green-50 bg-green-50/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6">
            <ShoppingBag size={28} className="text-green-600" />
            <span className="text-2xl font-black tracking-tighter text-slate-800 text-center">CampusBazar</span>
          </div>
          <p className="text-green-700/40 text-xs font-black uppercase tracking-[0.4em] text-center">Facilitating Student Interaction & Support</p>
        </div>
      </footer>
    </div>
  );
}