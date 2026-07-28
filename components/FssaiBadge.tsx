"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function FssaiBadge() {
  const [showCertModal, setShowCertModal] = useState(false);

  return (
    <section className="bg-[#2A170C] text-[#FBF3EA] py-12 px-6 border-y border-[#C9A15A]/30 relative overflow-hidden my-12">
      {/* Cert Modal */}
      <AnimatePresence>
        {showCertModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1E0F07]/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-3xl w-full bg-[#3B2417] rounded-3xl p-6 border border-[#C9A15A]/40 shadow-2xl text-[#FBF3EA]"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <h3 className="font-display italic text-xl font-bold text-[#FBF3EA]">
                      Official FSSAI License Certificate
                    </h3>
                    <p className="text-xs text-[#C9A15A]">Reg No: 22425062000595</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCertModal(false)}
                  className="rounded-full bg-[#FBF3EA]/10 hover:bg-[#FBF3EA]/20 px-3 py-1 text-sm font-bold"
                >
                  ✕ Close
                </button>
              </div>

              <div className="relative aspect-[3/4] sm:aspect-[4/3] w-full rounded-2xl overflow-hidden border border-[#C9A15A]/20 bg-[#24130A]">
                <Image
                  src="/images/fssai_cert.jpg"
                  alt="FSSAI Registration Certificate - DREAM ELEVATE"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-center text-xs text-[#FBF3EA]/70 mt-3">
                Issuing Authority: Food Safety and Standards Authority of India (Government of Tamil Nadu)
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: FSSAI License Badge & Certificate Preview */}
        <div className="lg:col-span-4 flex flex-col items-center text-center p-6 bg-[#3B2417]/80 backdrop-blur-md rounded-3xl border border-[#C9A15A]/30 shadow-xl">
          <div className="w-20 h-20 relative mb-4 rounded-2xl overflow-hidden bg-white p-2 shadow-md">
            <Image
              src="/images/fssai_cert.jpg"
              alt="FSSAI Badge"
              fill
              className="object-cover"
            />
          </div>
          <span className="bg-[#C9A15A] text-[#24130A] text-[10px] font-extrabold uppercase px-3 py-1 rounded-full mb-2 tracking-wider">
            ✓ 100% Certified &amp; Compliant
          </span>
          <h3 className="font-display italic text-2xl font-bold text-[#FBF3EA]">
            DREAM ELEVATE
          </h3>
          <p className="text-xs text-[#C9A15A] font-bold mt-1 tracking-wider">
            FSSAI Reg No: 22425062000595
          </p>
          <button
            onClick={() => setShowCertModal(true)}
            className="mt-4 rounded-full bg-[#FBF3EA]/10 hover:bg-[#FBF3EA]/20 text-[#FBF3EA] border border-[#FBF3EA]/20 px-5 py-2 text-xs font-bold transition-all hover:scale-105"
          >
            🔍 View Official Certificate
          </button>
        </div>

        {/* Right Side: Legal & Location Details */}
        <div className="lg:col-span-8 space-y-4">
          <div>
            <span className="text-[#C9A15A] text-xs font-bold uppercase tracking-widest">
              Business &amp; Legal Compliance
            </span>
            <h2 className="font-display italic text-2xl sm:text-3xl font-bold text-[#FBF3EA] mt-1">
              Registered Food Business Operator (FBO)
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#3B2417]/50 p-3.5 rounded-2xl border border-[#FBF3EA]/10">
              <span className="text-[#C9A15A] font-bold block mb-1">🏢 Business Name (FBO)</span>
              <p className="font-semibold text-[#FBF3EA]">DREAM ELEVATE</p>
            </div>

            <div className="bg-[#3B2417]/50 p-3.5 rounded-2xl border border-[#FBF3EA]/10">
              <span className="text-[#C9A15A] font-bold block mb-1">🏷️ Kind of Business</span>
              <p className="font-semibold text-[#FBF3EA]">Retailer</p>
            </div>

            <div className="bg-[#3B2417]/50 p-3.5 rounded-2xl border border-[#FBF3EA]/10">
              <span className="text-[#C9A15A] font-bold block mb-1">🏛️ Issuing Authority</span>
              <p className="font-semibold text-[#FBF3EA] leading-relaxed">
                Food Safety and Standards Authority of India (FSSAI) – Govt of Tamil Nadu (Food Safety Wing)
              </p>
            </div>

            <div className="bg-[#3B2417]/50 p-3.5 rounded-2xl border border-[#FBF3EA]/10">
              <span className="text-[#C9A15A] font-bold block mb-1">📅 Certificate Validity</span>
              <p className="font-semibold text-[#FBF3EA]">
                Issued: <span className="text-emerald-400">09-11-2025</span> &middot; Valid Until: <span className="text-emerald-400">08-11-2028</span>
              </p>
            </div>
          </div>

          <div className="bg-[#3B2417]/50 p-4 rounded-2xl border border-[#FBF3EA]/10 text-xs">
            <span className="text-[#C9A15A] font-bold block mb-1">📍 Official Registered Address</span>
            <p className="text-[#FBF3EA]/90 leading-relaxed font-medium">
              NO 26/4/9 GANAPATHI NAGAR, CHENNAPANAICKENPALAYAM, SRISAIBABA TEMPLE NANJAI UTUUKULI, Modakurichy Block, Erode, Tamil Nadu - 638104
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
