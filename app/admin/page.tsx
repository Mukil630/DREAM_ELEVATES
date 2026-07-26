"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MenuItem } from "@/app/api/menu-items/route";

const validPasswords = ["DreamElevate@1603"];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state for adding/editing item
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Partial<MenuItem> | null>(null);

  // Check existing session
  useEffect(() => {
    const session = sessionStorage.getItem("dreamelevate_admin_session");
    if (session === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch menu items
  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/menu-items", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data);
      }
    } catch (err) {
      console.error("Failed to fetch menu items:", err);
    } finally {
      setLoading(false);
    }
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  // Instant Base64 + Server Upload Handler
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    // 1. Immediately convert to DataURL Base64 for 100% reliable rendering
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result && typeof evt.target.result === "string") {
        const base64Url = evt.target.result;
        setEditItem((prev) => ({ ...prev, image_url: base64Url }));
        setUploadingImage(false);
      }
    };
    reader.onerror = () => {
      setUploadingImage(false);
      alert("Failed to read image file.");
    };
    reader.readAsDataURL(file);

    // 2. Also attempt background upload to server uploads folder
    try {
      const formData = new FormData();
      formData.append("image", file);

      fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && (data.imagePath || data.image_url)) {
            const uploadedUrl = data.imagePath || data.image_url;
            setEditItem((prev) => ({ ...prev, image_url: uploadedUrl }));
          }
        })
        .catch(() => {});
    } catch (err) {}
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchItems();
    }
  }, [isAuthenticated]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (validPasswords.includes(password.trim())) {
      sessionStorage.setItem("dreamelevate_admin_session", "true");
      setIsAuthenticated(true);
    } else {
      setError("Invalid Admin Password.");
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("dreamelevate_admin_session");
    setIsAuthenticated(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editItem?.name || !editItem?.price_label) {
      alert("Please fill in Item Name and Price Label.");
      return;
    }

    try {
      const res = await fetch("/api/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editItem),
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
        setShowModal(false);
        setEditItem(null);
        await fetchItems();
      } else {
        alert(data.error || "Failed to save product item");
      }
    } catch (err) {
      console.error("Failed to save menu item:", err);
      alert("Error saving product item.");
    }
  }

  // Instant Delete Handler
  async function handleDelete(id: string) {
    // Optimistic UI Delete: immediately remove from screen
    setItems((prev) => prev.filter((item) => String(item.id).trim() !== String(id).trim()));

    try {
      const res = await fetch("/api/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setItems(data.items);
      }
    } catch (err) {
      console.error("Failed to delete menu item:", err);
      await fetchItems();
    }
  }

  // --- 1. Admin Login View ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center px-4 bg-[#26160D] text-[#FBF3EA] relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#3B2417]/90 backdrop-blur-xl p-8 rounded-3xl border border-[#C9A15A]/30 shadow-2xl"
        >
          <div className="text-center mb-6">
            <Link href="/" className="font-display italic text-3xl font-bold text-[#FBF3EA]">
              Dream Elevate
            </Link>
            <h1 className="text-xl font-bold text-[#C9A15A] mt-3">Admin Portal Login</h1>
            <p className="text-xs text-[#FBF3EA]/70 mt-1">Manage cakes, resin art, fancy items, &amp; prices</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#C9A15A] uppercase mb-1">
                Admin Password *
              </label>
              <input
                type="password"
                required
                placeholder="Enter Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#C9A15A]/30 bg-[#24130A] px-4 py-3 text-sm text-[#FBF3EA] outline-none focus:border-[#C9A15A] transition-colors"
              />
            </div>

            {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

            <button
              type="submit"
              className="w-full mt-2 rounded-full bg-gradient-to-r from-[#e38c36] to-[#C9A15A] text-[#24130A] py-3 text-sm font-extrabold shadow-lg hover:scale-[1.02] transition-transform"
            >
              Access Admin Panel &rarr;
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const standardCategories = ["Signature Cakes", "Custom Cakes", "Baking Tools", "Resin Art Work", "Fancy Items", "Ingredients"];

  // --- 2. Admin Dashboard View ---
  return (
    <div className="min-h-screen pt-28 pb-16 px-4 sm:px-8 bg-[#FBF3EA] text-[#3B2417]">
      <div className="max-w-6xl mx-auto">
        {/* Admin Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#3B2417]/15 mb-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#B5476B]">Admin Control Center</span>
            <h1 className="font-display italic text-3xl sm:text-4xl font-bold text-[#3B2417]">Menu &amp; Products Manager</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditItem({
                  id: "",
                  name: "",
                  price_label: "₹499",
                  rating: 4.8,
                  review_count: 25,
                  image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800",
                  category: "Resin Art Work",
                  description: "",
                });
                setShowModal(true);
              }}
              className="rounded-full bg-gradient-to-r from-[#e38c36] to-[#C9A15A] text-[#24130A] px-6 py-2.5 text-xs font-extrabold shadow-md hover:scale-105 transition-transform"
            >
              + Add New Item
            </button>
            <button
              onClick={handleLogout}
              className="rounded-full border border-[#3B2417]/30 text-[#3B2417] px-4 py-2.5 text-xs font-bold hover:bg-[#3B2417] hover:text-[#FBF3EA] transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Admin UPI Banner */}
        <div className="bg-[#3B2417] text-[#FBF3EA] rounded-2xl p-5 border border-[#C9A15A]/30 mb-8 shadow-lg flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base">💳</span>
              <h2 className="font-display italic text-lg font-bold text-[#C9A15A]">Admin UPI &amp; WhatsApp Order Verification</h2>
            </div>
            <p className="text-xs text-[#FBF3EA]/80 mt-1 max-w-2xl">
              Customer payments go directly to Admin UPI: <strong className="text-[#C9A15A] font-mono">djammu03@okaxis</strong>. When an order is placed, customer automatically sends receipt to Admin WhatsApp (<strong className="text-[#C9A15A]">8883338935</strong>) asking you to verify payment &amp; confirm order.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#24130A] px-4 py-2 rounded-xl border border-[#C9A15A]/40 text-xs font-semibold text-[#C9A15A]">
            <span>🟢 UPI Payment Active</span>
          </div>
        </div>

        {/* Live Menu Items Grid */}
        {loading ? (
          <div className="text-center py-20 text-[#5A3826] font-medium">Loading Products...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-md border border-[#3B2417]/10 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-3 bg-[#3B2417]/5">
                    <Image src={item.image_url || "/images/placeholder.jpg"} alt={item.name} fill className="object-cover" />
                    <span className="absolute top-2 right-2 bg-[#3B2417] text-[#FBF3EA] text-xs font-bold px-2.5 py-1 rounded-full shadow">
                      {item.price_label}
                    </span>
                  </div>
                  <h3 className="font-display italic text-lg font-bold text-[#3B2417]">{item.name}</h3>
                  <p className="text-xs text-[#5A3826] mt-1">
                    ⭐ {item.rating || 4.8} ({item.review_count || 25} reviews) &middot; <span className="font-bold text-[#B5476B]">{item.category || "General"}</span>
                  </p>
                  {item.description && (
                    <p className="text-xs text-[#5A3826]/80 mt-2 line-clamp-2">{item.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#3B2417]/10">
                  <button
                    onClick={() => {
                      setEditItem(item);
                      setShowModal(true);
                    }}
                    className="flex-1 rounded-xl bg-[#3B2417]/10 hover:bg-[#3B2417] text-[#3B2417] hover:text-[#FBF3EA] py-1.5 text-xs font-bold transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 rounded-xl bg-red-100 hover:bg-red-600 text-red-700 hover:text-white py-1.5 text-xs font-bold transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B2417]/70 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-[#FBF3EA] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#C9A15A]/40 text-[#3B2417] my-8"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display italic text-2xl font-bold">
                    {editItem?.id ? "Edit Product Item" : "Add New Product Item"}
                  </h3>
                  <button onClick={() => setShowModal(false)} className="text-xl font-bold p-1">✕</button>
                </div>

                <form onSubmit={handleSave} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold uppercase mb-1">Item Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Handmade Resin Coaster Set"
                      value={editItem?.name || ""}
                      onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                      className="w-full rounded-xl border border-[#3B2417]/20 bg-white px-3 py-2 text-sm outline-none focus:border-[#B5476B]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold uppercase mb-1">Price Label *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ₹450"
                        value={editItem?.price_label || ""}
                        onChange={(e) => setEditItem({ ...editItem, price_label: e.target.value })}
                        className="w-full rounded-xl border border-[#3B2417]/20 bg-white px-3 py-2 text-sm outline-none focus:border-[#B5476B]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold uppercase mb-1">Category *</label>
                      <select
                        value={standardCategories.includes(editItem?.category || "") ? editItem?.category : "custom"}
                        onChange={(e) => {
                          if (e.target.value !== "custom") {
                            setEditItem({ ...editItem, category: e.target.value });
                          }
                        }}
                        className="w-full rounded-xl border border-[#3B2417]/20 bg-white px-3 py-2 text-sm outline-none focus:border-[#B5476B] mb-1 font-semibold"
                      >
                        <option value="Signature Cakes">Signature Cakes</option>
                        <option value="Custom Cakes">Custom Cakes</option>
                        <option value="Baking Tools">Baking Tools</option>
                        <option value="Resin Art Work">Resin Art Work (New)</option>
                        <option value="Fancy Items">Fancy Items (New)</option>
                        <option value="Ingredients">Ingredients</option>
                        <option value="custom">Other / Custom Category...</option>
                      </select>
                      <input
                        type="text"
                        placeholder="e.g. Resin Art Work or Fancy Items"
                        value={editItem?.category || ""}
                        onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                        className="w-full rounded-xl border border-[#3B2417]/20 bg-white px-3 py-2 text-xs outline-none focus:border-[#B5476B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold uppercase mb-1">Product Image *</label>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="text-xs text-[#5A3826] file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#3B2417] file:text-[#FBF3EA] hover:file:bg-[#B5476B]"
                      />
                      {uploadingImage && <span className="text-xs font-bold text-[#B5476B]">Processing...</span>}
                    </div>
                    <input
                      type="text"
                      placeholder="Or enter Image URL (e.g. Unsplash or Google Drive link)"
                      value={editItem?.image_url || ""}
                      onChange={(e) => setEditItem({ ...editItem, image_url: e.target.value })}
                      className="w-full rounded-xl border border-[#3B2417]/20 bg-white px-3 py-2 text-xs outline-none focus:border-[#B5476B]"
                    />

                    {/* Instant Live Thumbnail Preview */}
                    {editItem?.image_url && (
                      <div className="mt-2 flex items-center gap-3 p-2 bg-white rounded-xl border border-[#3B2417]/10">
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          <Image
                            src={editItem.image_url}
                            alt="Live Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="text-[11px] text-[#5A3826] font-semibold truncate max-w-[280px]">
                          ✓ Image Preview Ready
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold uppercase mb-1">Description</label>
                    <textarea
                      rows={3}
                      placeholder="Enter product features, ingredients, or specifications..."
                      value={editItem?.description || ""}
                      onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                      className="w-full rounded-xl border border-[#3B2417]/20 bg-white px-3 py-2 text-xs outline-none focus:border-[#B5476B]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="rounded-full border border-[#3B2417]/20 px-5 py-2 font-bold hover:bg-[#3B2417]/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-full bg-[#3B2417] text-[#FBF3EA] hover:bg-[#B5476B] px-6 py-2 font-bold shadow-md transition-all"
                    >
                      Save Product Item
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
