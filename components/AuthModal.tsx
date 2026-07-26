"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { setCurrentUser, User } from "@/lib/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
}

export default function AuthModal({ isOpen, onClose, onSuccess, title }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (mode === "signup") {
      if (!name || !phone || !password) {
        setError("Name, Phone number, and Password are required.");
        return;
      }
      const newUser: User = {
        id: `usr_${Date.now()}`,
        name,
        phone,
        email: email || `${phone}@dreamelevate.local`,
      };
      setCurrentUser(newUser);
      if (onSuccess) onSuccess();
      onClose();
    } else {
      if (!phone || !password) {
        setError("Please enter your Phone/Email and Password.");
        return;
      }
      const loggedUser: User = {
        id: `usr_${Date.now()}`,
        name: name || phone.split("@")[0] || "Customer",
        phone,
        email: email || phone,
      };
      setCurrentUser(loggedUser);
      if (onSuccess) onSuccess();
      onClose();
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cocoa/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-md bg-[#FBF3EA] rounded-2xl shadow-2xl border border-[#C9A15A]/30 p-6 sm:p-8 overflow-hidden text-[#3B2417]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#5A3826] hover:text-[#B5476B] text-xl font-bold p-1 transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>

          {/* Modal Header */}
          <div className="text-center mb-6">
            <h3 className="font-display italic text-2xl sm:text-3xl text-[#3B2417]">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h3>
            <p className="text-xs sm:text-sm text-[#5A3826] mt-1">
              {title || (mode === "login" ? "Log in to place your custom cake orders" : "Join Dream Elevate Club for custom orders & rewards")}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-[#3B2417]/15 mb-6">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 pb-2.5 text-sm font-semibold transition-colors relative ${
                mode === "login" ? "text-[#B5476B]" : "text-[#5A3826]/70 hover:text-[#3B2417]"
              }`}
            >
              Log In
              {mode === "login" && (
                <motion.div layoutId="authTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B5476B]" />
              )}
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(""); }}
              className={`flex-1 pb-2.5 text-sm font-semibold transition-colors relative ${
                mode === "signup" ? "text-[#B5476B]" : "text-[#5A3826]/70 hover:text-[#3B2417]"
              }`}
            >
              Sign Up
              {mode === "signup" && (
                <motion.div layoutId="authTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B5476B]" />
              )}
            </button>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-[#5A3826] uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[#3B2417]/20 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-[#B5476B] transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#5A3826] uppercase mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="e.g. 8883338935"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-[#3B2417]/20 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-[#B5476B] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A3826] uppercase mb-1">Email Address</label>
              <input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#3B2417]/20 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-[#B5476B] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A3826] uppercase mb-1">Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#3B2417]/20 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-[#B5476B] transition-colors"
              />
            </div>

            {error && <p className="text-xs text-red-600 font-medium mt-1">{error}</p>}

            <button
              type="submit"
              className="w-full mt-4 rounded-full bg-gradient-to-r from-[#e38c36] to-[#C9A15A] text-[#24130A] py-3 text-sm font-bold shadow-md hover:scale-[1.02] transition-transform"
            >
              {mode === "login" ? "Log In & Continue" : "Create Account & Continue"}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
