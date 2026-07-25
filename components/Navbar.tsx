"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentUser, logoutUser, User } from "@/lib/auth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about-us", label: "About Us" },
  { href: "/menu", label: "Menu Catalog" },
  { href: "/admin", label: "Admin Portal" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onAuthChange = (e: CustomEvent) => setUser(e.detail);

    onScroll();
    window.addEventListener("scroll", onScroll);
    window.addEventListener("dreamelevate_user_changed", onAuthChange as EventListener);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("dreamelevate_user_changed", onAuthChange as EventListener);
    };
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 inset-x-0 z-50 px-4 py-3 sm:px-6 transition-all duration-300"
    >
      {/* Top Navbar Container — White Glassmorphic Bar */}
      <nav
        className={`max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-full transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl border border-[#3B2417]/15 shadow-2xl"
            : "bg-white/90 backdrop-blur-md border border-white/60 shadow-xl"
        }`}
      >
        {/* Left: Hamburger Menu Button + Official Brand Logo Image */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            aria-label="Toggle navigation menu"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center justify-center p-2 rounded-full bg-[#3B2417]/10 hover:bg-[#3B2417]/20 text-[#3B2417] transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {open ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
          <span className="hidden sm:inline text-xs font-bold text-[#3B2417] uppercase tracking-wider mr-1">
            Menu
          </span>

          {/* Official Logo Image placed right near the Menu button */}
          <Link href="/" className="flex items-center group">
            <img
              src="/images/logo.png"
              alt="Dream Elevates Logo"
              className="h-8 sm:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
        </div>

        {/* Center: Website Name Text */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <Link
            href="/"
            className="font-display italic text-lg sm:text-2xl font-extrabold tracking-tight text-[#3B2417] hover:text-[#e38c36] transition-colors"
          >
            Dream Elevates
          </Link>
        </div>

        {/* Right: CTA Button & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-[#3B2417] font-semibold bg-[#3B2417]/5 px-3 py-1 rounded-full border border-[#3B2417]/15">
                👤 {user.name}
              </span>
              <button
                onClick={() => logoutUser()}
                className="text-xs text-[#e38c36] hover:underline font-bold"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold">
              <Link
                href="/login"
                className="text-[#3B2417] hover:text-[#e38c36] transition-colors px-2 py-1"
              >
                Log In
              </Link>
            </div>
          )}

          <Link
            href="/#book-a-table"
            className="inline-flex items-center rounded-full bg-gradient-to-r from-[#e38c36] to-[#C9A15A] text-[#24130A] px-4 sm:px-6 py-2 text-xs sm:text-sm font-extrabold shadow-md hover:scale-105 hover:shadow-amber-500/20 transition-all"
          >
            Order Cake
          </Link>
        </div>
      </nav>

      {/* Drawer / Dropdown Menu when Hamburger is Clicked */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="max-w-md mx-auto mt-2 rounded-3xl bg-white/95 backdrop-blur-xl border border-[#3B2417]/15 shadow-2xl p-6 text-[#3B2417]"
          >
            <ul className="flex flex-col gap-3 font-semibold text-sm">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#3B2417]/5 transition-colors"
                  >
                    <span>{l.label}</span>
                    <span className="text-[#e38c36] font-bold">&rarr;</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-4 border-t border-[#3B2417]/10 flex flex-col gap-2">
              {user ? (
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-[#3B2417] font-bold">Logged in as {user.name}</span>
                  <button
                    onClick={() => {
                      logoutUser();
                      setOpen(false);
                    }}
                    className="text-red-500 hover:underline font-semibold"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs px-1">
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="text-[#3B2417] hover:text-[#e38c36] font-bold"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="text-[#e38c36] font-bold hover:underline"
                  >
                    Create Account &rarr;
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
