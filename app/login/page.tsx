"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getCurrentUser, setCurrentUser, User } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (getCurrentUser()) {
      router.push("/");
    }
  }, [router]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!phone || !password) {
      setError("Please enter your Phone number/Email and Password.");
      return;
    }
    const loggedUser: User = {
      id: `usr_${Date.now()}`,
      name: phone.split("@")[0] || "Customer",
      phone,
      email: phone.includes("@") ? phone : `${phone}@dreamelevate.local`,
    };
    setCurrentUser(loggedUser);
    router.push("/");
  }

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-4 sm:px-6 bg-[#26160D] text-[#FBF3EA] relative overflow-hidden">
      {/* Dynamic Background Light Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 left-10 w-96 h-96 bg-[#e38c36]/25 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 right-10 w-96 h-96 bg-[#B5476B]/25 rounded-full blur-[100px] pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-4xl grid lg:grid-cols-12 bg-[#3B2417]/85 backdrop-blur-2xl rounded-3xl shadow-2xl border border-[#C9A15A]/30 overflow-hidden relative z-10"
      >
        {/* Left Side: Clean & Elegant Background Panel (6 cols) */}
        <div className="lg:col-span-6 relative p-8 sm:p-12 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#2A170C] via-[#3B2417] to-[#1E0F07]">
          {/* Full-bleed background image with soft overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <Image
              src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1000&auto=format&fit=crop"
              alt="Dream Elevates Bakery Background"
              fill
              className="object-cover mix-blend-overlay scale-105"
            />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <Link href="/" className="font-display italic text-3xl font-bold tracking-tight text-[#FBF3EA] hover:text-[#C9A15A] transition-colors">
              Dream Elevates
            </Link>
            <motion.span
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="bg-gradient-to-r from-[#e38c36] to-[#C9A15A] text-[#24130A] text-xs font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-lg"
            >
              ⭐ 4.9 Gourmet Rating
            </motion.span>
          </div>

          <div className="relative z-10 my-12">
            <motion.blockquote
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display italic text-2xl sm:text-3xl leading-relaxed text-[#FBF3EA]"
            >
              &ldquo;Where every bite tells a story of warmth, craft, and togetherness.&rdquo;
            </motion.blockquote>
            <p className="mt-4 text-xs text-[#C9A15A] font-semibold uppercase tracking-widest">
              📸 Instagram:{" "}
              <a
                href="https://www.instagram.com/dream_elevate/"
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-[#FBF3EA]"
              >
                @dream_elevate
              </a>
            </p>
          </div>

          <div className="relative z-10 pt-4 border-t border-[#FBF3EA]/15 flex items-center justify-between text-xs text-[#FBF3EA]/80 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Handcrafted Daily</span>
            </div>
            <span>📞 8883338935</span>
          </div>
        </div>

        {/* Right Side: Glassmorphism Form (6 cols) */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center bg-[#FBF3EA] text-[#3B2417] relative">
          <div className="mb-6">
            <h2 className="font-display italic text-3xl font-bold text-[#3B2417]">Sign In</h2>
            <p className="text-xs sm:text-sm text-[#5A3826] mt-1 font-medium">
              Log in to customize your cakes &amp; track your orders
            </p>
          </div>

          <div className="flex border-b border-[#3B2417]/15 mb-6">
            <button className="flex-1 pb-2.5 text-sm font-bold text-[#B5476B] border-b-2 border-[#B5476B]">
              Log In
            </button>
            <Link
              href="/signup"
              className="flex-1 pb-2.5 text-sm font-semibold text-center text-[#5A3826]/60 hover:text-[#3B2417] transition-colors"
            >
              Create Account
            </Link>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#5A3826] uppercase tracking-wider mb-1.5">
                Phone Number or Email *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 8883338935 or name@domain.com"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-[#3B2417]/20 bg-white/80 px-4 py-3 text-sm outline-none focus:border-[#B5476B] focus:ring-2 focus:ring-[#B5476B]/20 transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5A3826] uppercase tracking-wider mb-1.5">
                Password *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#3B2417]/20 bg-white/80 px-4 py-3 text-sm outline-none focus:border-[#B5476B] focus:ring-2 focus:ring-[#B5476B]/20 transition-all shadow-inner"
              />
            </div>

            {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full mt-4 rounded-full bg-gradient-to-r from-[#e38c36] via-[#C9A15A] to-[#e38c36] bg-[length:200%_auto] text-[#24130A] py-3.5 text-sm font-extrabold shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
            >
              Log In &amp; Continue &rarr;
            </motion.button>
          </form>

          <div className="mt-6 text-center text-xs text-[#5A3826]">
            New to Dream Elevates?{" "}
            <Link href="/signup" className="font-bold text-[#B5476B] hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
