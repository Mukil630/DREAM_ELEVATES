"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

export default function Location() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={viewportOnce}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-3xl overflow-hidden min-h-[350px] shadow-xl border border-[#3B2417]/10"
      >
        <iframe
          title="Dream Elevate Erode location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125322.46332145321!2d77.67104052345214!3d11.34103641234902!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba96f46762f4671%3A0xd67007938470c1e!2sErode%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1782996350213!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0, minHeight: 350 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={staggerContainer(0.12)}
        className="flex flex-col justify-center bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-[#3B2417]/10 shadow-lg"
      >
        <motion.p
          variants={fadeUp}
          className="text-[#B5476B] text-xs font-semibold tracking-widest uppercase mb-2"
        >
          Find Our Store &amp; Bakery
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="font-display italic text-3xl sm:text-4xl text-[#3B2417] font-bold"
        >
          Erode, Tamil Nadu
        </motion.h2>
        
        <motion.div variants={fadeUp} className="mt-5 space-y-3 text-xs sm:text-sm text-[#5A3826] leading-relaxed">
          <p className="font-semibold text-[#3B2417]">
            📍 <span className="font-bold">Official Business Address:</span><br />
            NO 26/4/9 GANAPATHI NAGAR, CHENNAPANAICKENPALAYAM, SRISAIBABA TEMPLE NANJAI UTUUKULI, Modakurichy Block, Erode, Tamil Nadu - 638104
          </p>
          <p>📞 <span className="font-bold">Phone:</span> 8883338935</p>
          <p>✉️ <span className="font-bold">Email:</span> dreamelevate4@gmail.com</p>
          <p className="pt-2 border-t border-[#3B2417]/10 text-xs font-bold text-[#B5476B]">
            🛡️ FSSAI Reg No: <span className="text-[#3B2417]">22425062000595</span> (Retailer)
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
