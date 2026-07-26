"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

function CounterNumber({
  target,
  prefix = "",
  suffix = "+",
}: {
  target: number;
  prefix?: string;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 1800; // 1.8s count animation
      const steps = 45;
      const stepTime = duration / steps;
      const increment = target / steps;

      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, stepTime);

      return () => clearInterval(timer);
    } else {
      setCount(0);
    }
  }, [isInView, target]);

  const displayVal =
    count >= 1000 ? `${(count / 1000).toFixed(0)}K` : count.toString();

  return (
    <span ref={ref} className="font-display italic text-3xl sm:text-4xl text-[#3B2417] font-bold">
      {prefix}
      {displayVal}
      {suffix}
    </span>
  );
}

const statsData = [
  { target: 1000, label: "Happy Guests", suffix: "+" },
  { target: 50, label: "Signature Bakes", suffix: "+" },
  { target: 120, label: "Events Hosted", suffix: "+" },
];

export default function About() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-14 items-center">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={staggerContainer(0.15)}
      >
        <motion.p
          variants={fadeUp}
          className="text-[#B5476B] text-sm font-semibold tracking-wider uppercase mb-2"
        >
          Our Story
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="font-display italic text-3xl sm:text-4xl text-[#3B2417] font-bold text-balance"
        >
          Every Celebration Begins with Dream Elevate
        </motion.h2>
        <motion.p variants={fadeUp} className="mt-5 text-[#5A3826] leading-relaxed text-sm sm:text-base">
          At Dream Elevate, every cake is more than just a dessert — it&apos;s a handcrafted masterpiece made with love, creativity, and the finest ingredients. From personalized celebration cakes to premium baking tools and decorations, we&apos;re passionate about helping every customer create unforgettable memories.
        </motion.p>

        {/* Animated Incrementing Counters Section */}
        <motion.div
          variants={staggerContainer(0.1)}
          className="mt-10 grid grid-cols-3 gap-4 border-t border-b border-[#3B2417]/15 py-6"
        >
          {statsData.map((s) => (
            <motion.div key={s.label} variants={fadeUp} className="text-center sm:text-left">
              <CounterNumber target={s.target} suffix={s.suffix} />
              <p className="text-xs sm:text-sm text-[#5A3826] font-medium mt-1">
                {s.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="mt-8">
          <Link
            href="/about-us"
            className="inline-flex rounded-full bg-[#3B2417] text-[#FBF3EA] px-8 py-3 text-sm font-bold shadow-md transition-transform duration-300 hover:scale-105 hover:bg-[#B5476B]"
          >
            Read Our Full Story
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={viewportOnce}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl border-2 border-[#C9A15A]/30">
          <Image
            src="https://framerusercontent.com/images/dxBE8DWCnCrRULSwtSPHdvq8ZX8.jpg"
            alt="Modern bakery interior"
            fill
            className="object-cover"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20, x: -10 }}
          whileInView={{ opacity: 1, y: 0, x: 0 }}
          viewport={viewportOnce}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="hidden sm:block absolute -bottom-8 -left-8 w-44 aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border-4 border-[#FBF3EA]"
        >
          <Image
            src="https://framerusercontent.com/images/htlJFV0JiB5vBF0n6GJQWv815E.webp"
            alt="Founder portrait"
            fill
            className="object-cover"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
