"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { getCurrentUser, User } from "@/lib/auth";
import AuthModal from "@/components/AuthModal";
import UpiPaymentModal from "@/components/UpiPaymentModal";

type MenuItem = {
  id: string;
  name: string;
  price_label: string;
  rating: number;
  review_count: number;
  image_url: string;
  category?: string;
  description?: string;
};

export default function MenuGrid() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [showAuthModal, setShowAuthModal] = useState(false);

  // UPI Modal State
  const [selectedItemForPayment, setSelectedItemForPayment] = useState<MenuItem | null>(null);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    fetch("/api/menu-items", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data);
        }
      })
      .catch(() => {});
  }, []);

  // Dynamically extract all unique categories from items array
  const dynamicCategories = Array.from(
    new Set(items.map((item) => item.category?.trim()).filter((c): c is string => Boolean(c)))
  );
  
  // Combine base categories with dynamic ones
  const baseCategories = ["All Products", "Custom Cakes", "Baking Tools", "Ingredients"];
  const categories = Array.from(new Set([...baseCategories, ...dynamicCategories]));

  const filteredItems = selectedCategory === "All Products"
    ? items
    : items.filter((item) => {
        if (!item.category) return false;
        const itemCat = item.category.toLowerCase().trim();
        const selCat = selectedCategory.toLowerCase().trim();
        return itemCat === selCat || itemCat.replace(/s$/, "") === selCat.replace(/s$/, "");
      });

  function handleBuy(item: MenuItem) {
    const user = getCurrentUser();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setCurrentUser(user);
    setSelectedItemForPayment(item);
    setShowUpiModal(true);
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setCurrentUser(getCurrentUser());
        }}
        title="Please Log In or Sign Up to Purchase Items"
      />

      <UpiPaymentModal
        isOpen={showUpiModal}
        onClose={() => {
          setShowUpiModal(false);
          setSelectedItemForPayment(null);
        }}
        item={selectedItemForPayment ? {
          name: selectedItemForPayment.name,
          price: selectedItemForPayment.price_label,
          category: selectedItemForPayment.category,
          image_url: selectedItemForPayment.image_url,
          description: selectedItemForPayment.description,
        } : null}
        customer={currentUser ? {
          name: currentUser.name,
          phone: currentUser.phone,
        } : null}
      />

      <motion.div
        initial={false}
        animate="show"
        variants={staggerContainer(0.1)}
        className="text-center max-w-3xl mx-auto mb-10"
      >
        <motion.p
          variants={fadeUp}
          className="text-[#B5476B] text-xs sm:text-sm font-semibold tracking-wider uppercase mb-2"
        >
          Cakes &bull; Baking Tools &bull; Premium Ingredients
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="font-display italic text-3xl sm:text-4xl text-[#3B2417] font-bold text-balance"
        >
          Our Gourmet Bakes &amp; Baking Supplies
        </motion.h2>
        <motion.p variants={fadeUp} className="mt-3 text-[#5A3826] leading-relaxed text-sm sm:text-base">
          From custom handcrafted cakes to professional baking tools and raw ingredients — everything you need for your baking journey.
        </motion.p>
      </motion.div>

      {/* Dynamic Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 capitalize ${
              selectedCategory === cat
                ? "bg-[#3B2417] text-[#FBF3EA] shadow-md scale-105"
                : "bg-white/70 text-[#3B2417] border border-[#3B2417]/15 hover:bg-[#3B2417]/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <motion.div
        initial={false}
        animate="show"
        variants={staggerContainer(0.08)}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
      >
        {filteredItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="group bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-[#3B2417]/10 flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-[#F4DCE4]/50 mb-4">
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 bg-[#24130A]/80 text-[#C9A15A] text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                  {item.category || "General"}
                </span>
                <div className="absolute top-3 right-3 rounded-full bg-[#3B2417] text-[#FBF3EA] px-3 py-1 text-xs font-bold shadow-md">
                  {item.price_label}
                </div>
              </div>

              <h3 className="font-display italic text-lg text-[#3B2417] font-bold">
                {item.name}
              </h3>
              <p className="text-xs text-[#5A3826]/80 mt-1">
                ⭐ {(Number(item.rating) || 4.5).toFixed(1)} Stars ({item.review_count || 12} reviews)
              </p>
              {item.description && (
                <p className="text-xs text-[#5A3826] mt-2 line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>

            <button
              onClick={() => handleBuy(item)}
              className="mt-4 w-full rounded-full bg-gradient-to-r from-[#e38c36] to-[#C9A15A] text-[#24130A] py-2.5 text-xs font-bold shadow transition-all duration-300 hover:scale-105 hover:shadow-amber-500/20"
            >
              Order / Buy Now &rarr;
            </button>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={viewportOnce}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-center mt-12"
      >
        <Link
          href="/menu"
          className="inline-flex rounded-full border-2 border-[#3B2417] px-8 py-3 text-sm font-bold text-[#3B2417] transition-all duration-300 hover:scale-105 hover:bg-[#3B2417] hover:text-[#FBF3EA]"
        >
          View Full Store Catalog
        </Link>
      </motion.div>
    </section>
  );
}
