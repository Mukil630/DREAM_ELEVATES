"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function CakeSplitText() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Cake slice split movement as user scrolls up/down
  const topHalfX = useTransform(scrollYProgress, [0.2, 0.7], [0, -150]);
  const topHalfY = useTransform(scrollYProgress, [0.2, 0.7], [0, -80]);
  const bottomHalfX = useTransform(scrollYProgress, [0.2, 0.7], [0, 150]);
  const bottomHalfY = useTransform(scrollYProgress, [0.2, 0.7], [0, 80]);
  const textOpacity = useTransform(scrollYProgress, [0.2, 0.65], [1, 0]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden py-20 px-6 text-center my-10 bg-gradient-to-b from-[#24130A] via-[#3B2417] to-[#24130A] text-[#FBF3EA] border-y border-[#C9A15A]/30"
    >
      <motion.div style={{ opacity: textOpacity }} className="max-w-4xl mx-auto space-y-4">
        {/* Top Half: Moves Up & Left like a cake slice 🍰 */}
        <motion.h2
          style={{ x: topHalfX, y: topHalfY }}
          className="font-display italic text-3xl sm:text-5xl font-bold tracking-tight text-[#C9A15A] drop-shadow-md"
        >
          Decadent Flavors &amp; Premium Ingredients
        </motion.h2>

        {/* Bottom Half: Moves Down & Right like a cake slice 🍰 */}
        <motion.p
          style={{ x: bottomHalfX, y: bottomHalfY }}
          className="text-lg sm:text-2xl text-[#FBF3EA]/90 font-medium max-w-2xl mx-auto drop-shadow"
        >
          Made with love, warm craft, and pure Belgian chocolate
        </motion.p>
      </motion.div>
    </div>
  );
}
