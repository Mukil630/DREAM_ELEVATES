"use client";

import { useEffect, useState, MouseEvent as ReactMouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";

const heroSlides = [
  {
    src: "/images/user_hero_1.jpg",
    title: "Signature Gourmet Celebration Cakes",
    subtitle: "Handcrafted cakes baked to perfection for your special occasions",
    tagline: "Cakes • Baking Tools • Premium Ingredients",
    likes: "1,482",
    comments: "128",
    shares: "64",
    caption: "Signature Dutch Chocolate & Lavender Bloom Cake freshly baked for today's celebration! 🎂✨",
  },
  {
    src: "/images/user_hero_2.jpg",
    title: "Artisanal Custom Cake Creations",
    subtitle: "Every celebration deserves a uniquely designed, delicious cake masterpiece",
    tagline: "Custom Handcrafted Cakes • Specialty Bakes",
    likes: "2,109",
    comments: "245",
    shares: "98",
    caption: "Handcrafted 3-tier wedding cake with Belgian chocolate ganache & edible gold leaf. 👑💛",
  },
  {
    src: "/images/user_hero_3.jpg",
    title: "Decadent Flavors & Premium Ingredients",
    subtitle: "Made with love, warm craft, and pure Belgian chocolate",
    tagline: "Raw Ingredients • Professional Decorating Tools",
    likes: "1,890",
    comments: "176",
    shares: "82",
    caption: "Pure Madagascar Vanilla Bean Paste & organic lavender baking supplies in store now! 🌿🍰",
  },
];

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(1482);
  const [saved, setSaved] = useState(false);

  // 3D Card tilt state
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  // Scroll parallax motion values
  const { scrollY } = useScroll();
  const leftColY = useTransform(scrollY, [0, 600], [0, 80]);
  const cardColY = useTransform(scrollY, [0, 600], [0, -60]);
  const heroOpacity = useTransform(scrollY, [0, 450], [1, 0.35]);

  // Auto-rotate hero slides every 4.5 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  function toggleLike() {
    if (liked) {
      setLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      setLiked(true);
      setLikeCount((c) => c + 1);
    }
  }

  // 3D Interactive Card Tilt on Mouse Move
  function handleCardMouseMove(e: ReactMouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotateX(-y / 12);
    setRotateY(x / 12);
  }

  function handleCardMouseLeave() {
    setRotateX(0);
    setRotateY(0);
  }

  return (
    <section className="relative w-full min-h-[94vh] pt-28 pb-16 flex items-center justify-center overflow-hidden bg-[#24130A]">
      {/* Full-width Background Image with Blur & Dark Contrast Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence mode="sync">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={heroSlides[index].src}
              alt="Hero Background"
              fill
              priority
              className="object-cover filter blur-md"
            />
          </motion.div>
        </AnimatePresence>
        {/* Balanced ~35% dark contrast overlay */}
        <div className="absolute inset-0 bg-black/35 bg-gradient-to-r from-[#24130A]/60 via-[#24130A]/35 to-black/25 pointer-events-none" />
      </div>

      {/* Main Two-Column Split Layout Container */}
      <div className="relative z-20 max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        
        {/* LEFT COLUMN: Dynamically Animating Headline & Subtext Carousel */}
        <motion.div
          style={{ y: leftColY, opacity: heroOpacity }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-7 flex flex-col text-left"
        >
          {/* Animated Dynamic Tagline Badge */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`badge-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3B2417]/90 border border-[#C9A15A]/60 backdrop-blur-md self-start mb-6 shadow-xl"
            >
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#C9A15A]">
                ✨ {heroSlides[index].tagline}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Animated Dynamic Headline & Subtext Paragraph */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${index}`}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -25 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Large Bold Headline with Times New Roman Font */}
              <h1
                style={{ fontFamily: '"Times New Roman", Times, Georgia, serif' }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.15] tracking-tight drop-shadow-[0_6px_16px_rgba(0,0,0,0.9)]"
              >
                {heroSlides[index].title}
              </h1>

              {/* Subtext Paragraph */}
              <p className="mt-6 text-[#FBF3EA] text-base sm:text-lg max-w-xl font-semibold leading-relaxed drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] bg-[#24130A]/40 p-4 rounded-2xl border border-white/15 backdrop-blur-md shadow-lg">
                {heroSlides[index].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Two CTA Buttons Side by Side */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {/* Button 1: Solid Filled (Orange / Primary Gradient) */}
            <Link
              href="/menu"
              className="rounded-full bg-gradient-to-r from-[#e38c36] to-[#C9A15A] px-8 py-3.5 text-sm sm:text-base font-extrabold text-[#24130A] shadow-xl hover:scale-105 hover:shadow-amber-500/40 transition-all duration-300 flex items-center gap-2 group"
            >
              <span>Explore Menu</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-base"
              >
                &rarr;
              </motion.span>
            </Link>

            {/* Button 2: Outline / White Button */}
            <Link
              href="/#book-a-table"
              className="rounded-full border-2 border-white/80 bg-white/10 backdrop-blur-md px-8 py-3.5 text-sm sm:text-base font-extrabold text-white hover:bg-white hover:text-[#24130A] transition-all duration-300 shadow-md"
            >
              Order Custom Cake
            </Link>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: 3D Tilting Instagram Post Card */}
        <motion.div
          style={{ y: cardColY }}
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5 flex justify-center lg:justify-end relative"
        >
          {/* 3D Interactive Tilting Instagram Card */}
          <motion.div
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            animate={{ rotateX, rotateY }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{ transformStyle: "preserve-3d" }}
            className="w-full max-w-[220px] sm:max-w-[240px] bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/60 text-[#1a1612] relative cursor-pointer group"
          >
            {/* Card Header: Profile Icon + Brand Name + Verified Badge */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2 px-0.5">
              <div className="flex items-center gap-2">
                {/* Circular Profile Avatar */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#e38c36] via-[#C9A15A] to-[#B5476B] p-0.5 shadow-sm overflow-hidden flex-shrink-0">
                  <img
                    src="/images/logo.png"
                    alt="Logo Avatar"
                    className="w-full h-full rounded-full object-cover bg-[#3B2417]"
                  />
                </div>
                {/* Brand Name & Location */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-[10px] text-[#24130A] truncate max-w-[100px]">
                      dreamelevates
                    </span>
                    {/* Blue/Gold Verified Badge */}
                    <svg
                      className="w-3 h-3 text-[#e38c36] fill-current flex-shrink-0"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <span className="text-[8px] text-gray-500 font-medium">
                    Verified Bakehouse
                  </span>
                </div>
              </div>

              {/* Three Dots Option Menu */}
              <button aria-label="Post options" className="text-gray-400 hover:text-gray-600 font-bold text-xs px-0.5">
                •••
              </button>
            </div>

            {/* Below Header: Auto-swapping / Rotating Image Carousel */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-inner mb-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="w-full h-full relative"
                >
                  <Image
                    src={heroSlides[index].src}
                    alt={heroSlides[index].title}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Slide Indicator Pills inside Image */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === index ? "w-3 bg-white" : "w-1 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Below Image: Engagement Bar (Heart, Comment, Share, Bookmark) */}
            <div className="flex items-center justify-between py-0.5 px-0.5 text-gray-700">
              <div className="flex items-center gap-2.5 text-[10px] font-bold">
                {/* Heart / Like Icon */}
                <button
                  onClick={toggleLike}
                  className="flex items-center gap-1 hover:scale-110 transition-transform"
                >
                  <svg
                    className={`w-3.5 h-3.5 ${liked ? "text-red-500 fill-current" : "text-gray-700 stroke-current fill-none"}`}
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span>{liked ? likeCount : heroSlides[index].likes}</span>
                </button>

                {/* Comment Icon */}
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-gray-700 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                  </svg>
                  <span>{heroSlides[index].comments}</span>
                </div>

                {/* Direct Share Icon */}
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-gray-700 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                  <span>{heroSlides[index].shares}</span>
                </div>
              </div>

              {/* Bookmark / Save Icon on Far Right */}
              <button
                onClick={() => setSaved(!saved)}
                className="hover:scale-110 transition-transform"
              >
                <svg
                  className={`w-3.5 h-3.5 ${saved ? "text-[#e38c36] fill-current" : "text-gray-700 stroke-current fill-none"}`}
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                </svg>
              </button>
            </div>

            {/* Post Caption */}
            <p className="mt-1 text-[10px] text-gray-700 font-medium px-0.5 line-clamp-2 leading-tight">
              <strong className="font-extrabold text-[#24130A]">dreamelevates</strong>{" "}
              {heroSlides[index].caption}
            </p>

          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
