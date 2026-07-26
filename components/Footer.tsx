"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  function subscribe(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setTimeout(() => {
      setStatus("done");
      setEmail("");
    }, 500);
  }

  return (
    <motion.footer
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      variants={staggerContainer(0.1)}
      className="bg-[#2D1B11] text-[#FBF3EA]/90 mt-16"
    >
      <div className="max-w-6xl mx-auto px-6 py-16 grid sm:grid-cols-2 md:grid-cols-4 gap-10">
        <motion.div variants={fadeUp} className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <img
              src="/images/logo.png"
              alt="Dream Elevate Official Logo"
              className="h-10 sm:h-12 w-auto object-contain"
            />
            <p className="font-display italic text-2xl sm:text-3xl text-[#FBF3EA] font-bold">
              Dream Elevate
            </p>
          </div>
          <p className="text-[#FBF3EA]/70 text-sm leading-relaxed max-w-sm">
            Where every bite tells a story of warmth, craft, and togetherness. Handcrafted cakes and gourmet bakery delights for your special moments.
          </p>
          
          {/* Admin & Social Contact Info */}
          <div className="pt-2 space-y-2 text-xs text-[#FBF3EA]/80 font-medium">
            <p>
              📸 Instagram:{" "}
              <a
                href="https://www.instagram.com/dreamelevate_hubzz/"
                target="_blank"
                rel="noreferrer"
                className="text-[#C9A15A] hover:underline font-bold"
              >
                @dreamelevate_hubzz
              </a>
            </p>
            <p>
              📞 Admin Phone:{" "}
              <a href="tel:8883338935" className="text-[#C9A15A] hover:underline font-bold">
                8883338935
              </a>
            </p>
            <p>
              ✉️ Admin Email:{" "}
              <a href="mailto:dreamelevate4@gmail.com" className="text-[#C9A15A] hover:underline font-bold">
                dreamelevate4@gmail.com
              </a>
            </p>
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <p className="text-xs uppercase tracking-wider font-semibold text-[#C9A15A] mb-4">
            Navigation
          </p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-[#C9A15A] transition-colors">Home</Link></li>
            <li><Link href="/about-us" className="hover:text-[#C9A15A] transition-colors">About Us</Link></li>
            <li><Link href="/menu" className="hover:text-[#C9A15A] transition-colors">Menu</Link></li>
            <li><Link href="/#book-a-table" className="hover:text-[#C9A15A] transition-colors">Request a Custom Cake</Link></li>
            <li><Link href="/login" className="hover:text-[#C9A15A] transition-colors">Log In / Register</Link></li>
          </ul>
        </motion.div>

        <motion.div variants={fadeUp}>
          <p className="text-xs uppercase tracking-wider font-semibold text-[#C9A15A] mb-4">
            Get Updates
          </p>
          <form onSubmit={subscribe} className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="min-w-0 flex-1 rounded-full bg-[#FBF3EA]/10 border border-[#FBF3EA]/20 px-4 py-2 text-sm outline-none focus:border-[#C9A15A] transition-colors placeholder:text-[#FBF3EA]/40"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-full bg-gradient-to-r from-[#e38c36] to-[#C9A15A] text-[#24130A] px-4 py-2 text-sm font-bold shadow-md hover:scale-105 transition-transform disabled:opacity-60"
            >
              {status === "loading" ? "…" : "Join"}
            </button>
          </form>
          {status === "done" && (
            <p className="mt-2 text-xs text-[#C9A15A]">Subscribed — thank you!</p>
          )}
        </motion.div>
      </div>

      <div className="border-t border-[#FBF3EA]/10">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FBF3EA]/50 gap-2">
          <p>© {new Date().getFullYear()} DREAM ELEVATE. All rights reserved.</p>
          <p>Instagram: @dreamelevate_hubzz | Contact: 8883338935</p>
        </div>
      </div>
    </motion.footer>
  );
}
