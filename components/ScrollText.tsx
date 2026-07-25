"use client";

import { motion } from "framer-motion";

interface ScrollTextProps {
  text: string;
  subtext?: string;
  speed?: number; // Speed in seconds for a full loop
  direction?: "left" | "right";
}

export default function ScrollText({
  text,
  subtext,
  speed = 25,
  direction = "left",
}: ScrollTextProps) {
  const content = `${text} \u00A0\u00A0\u2022\u00A0\u00A0 ${text} \u00A0\u00A0\u2022\u00A0\u00A0 `;

  return (
    <div className="relative overflow-hidden py-4 sm:py-5 bg-gradient-to-r from-[#2A170C] via-[#3B2417] to-[#2A170C] border-y border-[#C9A15A]/30 text-[#FBF3EA] my-8 shadow-inner">
      <div className="flex whitespace-nowrap overflow-hidden">
        <motion.div
          animate={{
            x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"],
          }}
          transition={{
            ease: "linear",
            duration: speed,
            repeat: Infinity,
          }}
          className="flex whitespace-nowrap gap-4 items-center text-xs sm:text-base font-semibold tracking-[0.2em] uppercase text-[#FBF3EA]/95"
        >
          <span>{content}</span>
          <span>{content}</span>
          <span>{content}</span>
          <span>{content}</span>
        </motion.div>
      </div>
      {subtext && (
        <p className="text-center text-[10px] sm:text-xs text-[#C9A15A] uppercase tracking-[0.3em] mt-2 font-bold">
          {subtext}
        </p>
      )}
    </div>
  );
}
