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

function ProductCardImage({ src, alt }: { src: string; alt: string }) {
  const fallback = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop";
  const [imgSrc, setImgSrc] = useState(src || fallback);

  useEffect(() => {
    setImgSrc(src || fallback);
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      loading="lazy"
      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      onError={() => {
        if (imgSrc !== fallback) {
          setImgSrc(fallback);
        }
      }}
    />
  );
}

export default function MenuGrid() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [showAuthModal, setShowAuthModal] = useState(false);

  // UPI Modal State
  const [selectedItemForPayment, setSelectedItemForPayment] = useState<MenuItem | null>(null);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());

    const loadMenu = () => {
      try {
        const cached = localStorage.getItem("dreamelevate_menu_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setItems(parsed);
            setLoading(false);
          }
        }
      } catch {}

      fetch("/api/menu-items", { cache: "no-store" })
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setItems(data);
            try {
              localStorage.setItem("dreamelevate_menu_cache", JSON.stringify(data));
            } catch {}
          }
        })
        .catch(() => {})
        .finally(() => {
          setLoading(false);
        });
    };

    loadMenu();

    const handleMenuUpdate = () => loadMenu();
    window.addEventListener("dreamelevate_menu_updated", handleMenuUpdate);
    return () => {
      window.removeEventListener("dreamelevate_menu_updated", handleMenuUpdate);
    };
  }, []);



  // Dynamically extract all unique categories from items array
  const dynamicCategories = Array.from(
    new Set(items.map((item) => item.category?.trim()).filter((c): c is string => Boolean(c)))
  );
  
  // Base categories including Resin Art Work & Fancy Items
  const baseCategories = ["All Products", "Signature Cakes", "Baking Tools", "Resin Art Work", "Fancy Items"];
  const categories = Array.from(new Set([...baseCategories, ...dynamicCategories]));

  const filteredItems = selectedCategory === "All Products"
    ? items
    : items.filter((item) => {
        if (!item.category) return false;
        const itemCat = item.category.toLowerCase().trim();
        const selCat = selectedCategory.toLowerCase().trim();
        return itemCat.includes(selCat) || selCat.includes(itemCat) || itemCat.replace(/s$/, "") === selCat.replace(/s$/, "");
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

      {/* Section Header */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={staggerContainer(0.15)}
        className="text-center max-w-3xl mx-auto mb-12"
      >
        <motion.p
          variants={fadeUp}
          className="text-[#B5476B] text-sm font-bold tracking-wider uppercase mb-2"
        >
          Our Offerings Beyond Cakes
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="font-display italic text-3xl sm:text-4xl text-[#3B2417] font-bold text-balance"
        >
          Signature Bakes, Baking Tools, Resin Art & Fancy Gifts
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mt-3 text-[#5A3826] text-sm sm:text-base leading-relaxed"
        >
          We&apos;re not only passionate about baking cakes! Explore our curated collection of professional baking tools, handcrafted resin art pieces, and customized fancy gift items.
        </motion.p>

        {/* Category Pills */}
        <motion.div
          variants={fadeUp}
          className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-5 py-2 text-xs sm:text-sm font-bold transition-all duration-300 shadow-sm ${
                  isActive
                    ? "bg-[#3B2417] text-[#FBF3EA] shadow-md scale-105"
                    : "bg-[#FBF3EA] border border-[#3B2417]/20 text-[#5A3826] hover:bg-[#3B2417]/10"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Menu Cards Grid / Skeleton Loader */}
      {loading && items.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="bg-[#FBF3EA] rounded-3xl overflow-hidden shadow-md border border-[#C9A15A]/20 p-6 flex flex-col justify-between animate-pulse"
            >
              <div>
                <div className="aspect-[4/3] w-full bg-[#3B2417]/10 rounded-2xl mb-4"></div>
                <div className="h-5 bg-[#3B2417]/10 rounded-full w-3/4 mb-3"></div>
                <div className="h-4 bg-[#3B2417]/10 rounded-full w-1/2 mb-6"></div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-[#3B2417]/10">
                <div className="h-4 bg-[#3B2417]/10 rounded-full w-1/4"></div>
                <div className="h-8 bg-[#3B2417]/20 rounded-full w-24"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 text-[#5A3826] font-medium text-sm">
          No items found in this category. Check back soon for new bakes & creations!
        </div>
      ) : (
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={staggerContainer(0.08)}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              variants={fadeUp}
              className="group bg-[#FBF3EA] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border border-[#C9A15A]/20 transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between"
            >
              <div>
                {/* Image Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#3B2417]/5">
                  <ProductCardImage src={item.image_url} alt={item.name} />
                  {item.category && (
                    <span className="absolute top-3 left-3 bg-[#3B2417]/90 text-[#C9A15A] backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider">
                      {item.category}
                    </span>
                  )}
                </div>

                {/* Content Details */}
                <div className="p-6">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-display italic text-lg sm:text-xl font-bold text-[#3B2417] line-clamp-1">
                      {item.name}
                    </h3>
                    <span className="font-bold text-base text-[#B5476B] shrink-0">
                      {item.price_label}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-xs text-[#5A3826] line-clamp-2 leading-relaxed mb-4">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 pb-6 pt-0 flex items-center justify-between gap-3 border-t border-[#3B2417]/10 mt-auto">
                <div className="flex items-center gap-1 text-xs text-[#C9A15A] font-bold">
                  <span>★</span>
                  <span>{item.rating || 4.8}</span>
                  <span className="text-[#5A3826]/60 font-normal">({item.review_count || 25})</span>
                </div>

                <button
                  onClick={() => handleBuy(item)}
                  className="rounded-full bg-[#3B2417] text-[#FBF3EA] hover:bg-[#B5476B] px-5 py-2 text-xs font-bold transition-all shadow-md hover:scale-105"
                >
                  Buy Now
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Footer Link to Full Menu */}
      <div className="mt-12 text-center">
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 rounded-full border-2 border-[#3B2417] px-8 py-3 text-sm font-bold text-[#3B2417] hover:bg-[#3B2417] hover:text-[#FBF3EA] transition-all duration-300 shadow-sm"
        >
          <span>View All Products & Tools</span>
          <span>&rarr;</span>
        </Link>
      </div>
    </section>
  );
}
