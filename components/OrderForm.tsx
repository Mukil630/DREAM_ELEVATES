"use client";

import { FormEvent, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { getCurrentUser, User } from "@/lib/auth";
import AuthModal from "@/components/AuthModal";
import UpiPaymentModal, { CustomerInfo, OrderItemDetails } from "@/components/UpiPaymentModal";

type Status = "idle" | "submitting" | "success" | "error";

const cakeFlavors = [
  "Chocolate Truffle",
  "Red Velvet",
  "Vanilla Bean",
  "Black Forest",
  "Mango Mousse",
  "Salted Caramel",
  "Butterscotch",
  "Pistachio Rose",
  "Custom Flavor / Special Request",
];

export default function OrderForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // UPI Modal State for Custom Cake
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [paymentItem, setPaymentItem] = useState<OrderItemDetails | null>(null);
  const [customerDetails, setCustomerDetails] = useState<CustomerInfo | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
    const onAuthChange = (e: CustomEvent) => setUser(e.detail);
    window.addEventListener("dreamelevate_user_changed", onAuthChange as EventListener);
    return () => window.removeEventListener("dreamelevate_user_changed", onAuthChange as EventListener);
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const currentUser = getCurrentUser();
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    const form = e.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") || currentUser.name || "");
    const phone = String(data.get("phone") || currentUser.phone || "");
    const date = String(data.get("delivery_date") || "");
    const weight = String(data.get("cake_weight") || "1.0 kg");
    const flavor = String(data.get("cake_flavor") || "Custom Flavor");
    const message = String(data.get("message") || "");

    // Calculate weight price estimate
    let weightPrice = 799;
    if (weight.includes("1.5")) weightPrice = 1199;
    else if (weight.includes("2.0")) weightPrice = 1499;
    else if (weight.includes("3.0")) weightPrice = 2199;
    else if (weight.includes("5.0")) weightPrice = 3499;

    setPaymentItem({
      name: `Custom Handcrafted Cake (${flavor})`,
      price: `₹${weightPrice}`,
      category: "Custom Cake",
      description: `Custom ${weight} cake. Flavor: ${flavor}. Message: ${message || "None"}.`,
    });

    setCustomerDetails({
      name,
      phone,
      deliveryDate: date,
      weight,
      flavor,
      message,
    });

    setShowUpiModal(true);
    setStatus("success");
  }

  return (
    <section id="book-a-table" className="max-w-3xl mx-auto px-6 py-20">
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setUser(getCurrentUser());
        }}
        title="Please Log In or Sign Up to Place Your Custom Cake Order"
      />

      <UpiPaymentModal
        isOpen={showUpiModal}
        onClose={() => setShowUpiModal(false)}
        item={paymentItem}
        customer={customerDetails}
      />

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={staggerContainer(0.1)}
        className="text-center mb-10"
      >
        <motion.p
          variants={fadeUp}
          className="text-[#B5476B] text-sm font-semibold tracking-wider uppercase mb-2"
        >
          Request a Custom Cake
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="font-display italic text-3xl sm:text-4xl text-[#3B2417] font-bold"
        >
          Order Your Dream Cake
        </motion.h2>
        <motion.p variants={fadeUp} className="mt-3 text-[#5A3826] text-sm sm:text-base max-w-xl mx-auto">
          Share your ideas with us, and we&apos;ll create a handcrafted cake that&apos;s as unique as your occasion.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-10 shadow-xl border border-[#3B2417]/10"
      >
        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center py-8"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-[#B5476B]/15 flex items-center justify-center mb-4">
                <span className="text-[#B5476B] text-3xl font-bold">✓</span>
              </div>
              <h3 className="font-display text-2xl text-[#3B2417] font-bold">
                Order Sent to Admin WhatsApp!
              </h3>
              <p className="text-[#5A3826] mt-2 text-sm max-w-md mx-auto">
                Your order details have been formatted and sent directly to our admin team via WhatsApp (9080030538). We will confirm your order shortly!
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-6 inline-flex items-center rounded-full bg-[#3B2417] text-[#FBF3EA] px-6 py-2.5 text-sm font-semibold hover:bg-[#B5476B] transition-colors"
              >
                Place Another Order
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid sm:grid-cols-2 gap-5"
            >
              <Field label="Name" name="name" required defaultValue={user?.name || ""} />
              <Field label="Phone Number" name="phone" type="tel" required defaultValue={user?.phone || ""} />
              <Field label="Email Address" name="email" type="email" required defaultValue={user?.email || ""} />
              <Field label="Delivery / Pickup Date" name="delivery_date" type="date" required />
              <Field label="Cake Weight" name="cake_weight" placeholder="e.g. 1 kg, 2.5 kg" required />

              <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#5A3826] uppercase">
                Cake Flavor <span className="text-[#B5476B]">*</span>
                <select
                  name="cake_flavor"
                  required
                  className="rounded-xl border border-[#3B2417]/20 bg-[#FBF3EA]/60 px-4 py-2.5 text-sm outline-none focus:border-[#B5476B] transition-colors"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select…
                  </option>
                  {cakeFlavors.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </label>

              <label className="sm:col-span-2 flex flex-col gap-1.5 text-xs font-semibold text-[#5A3826] uppercase">
                Message (optional)
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Tell us about your occasion, design ideas, or custom text..."
                  className="rounded-xl border border-[#3B2417]/20 bg-[#FBF3EA]/60 px-4 py-2.5 text-sm outline-none focus:border-[#B5476B] transition-colors resize-none"
                />
              </label>

              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={status === "submitting"}
                className="sm:col-span-2 mt-2 rounded-full bg-gradient-to-r from-[#e38c36] to-[#C9A15A] text-[#24130A] py-3.5 text-sm font-bold shadow-md hover:scale-[1.01] transition-transform disabled:opacity-60"
              >
                {status === "submitting" ? "Sending Order to WhatsApp…" : "Place Your Order"}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  defaultValue = "",
  placeholder = "",
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#5A3826] uppercase">
      <span>
        {label} {required && <span className="text-[#B5476B]">*</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="rounded-xl border border-[#3B2417]/20 bg-[#FBF3EA]/60 px-4 py-2.5 text-sm outline-none focus:border-[#B5476B] transition-colors"
      />
    </label>
  );
}
