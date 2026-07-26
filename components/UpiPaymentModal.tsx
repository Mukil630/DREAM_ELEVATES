"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export type OrderItemDetails = {
  name: string;
  price: string;
  category?: string;
  image_url?: string;
  description?: string;
};

export type CustomerInfo = {
  name: string;
  phone: string;
  address?: string;
  deliveryDate?: string;
  weight?: string;
  flavor?: string;
  message?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  item: OrderItemDetails | null;
  customer?: CustomerInfo | null;
  adminUpiId?: string;
  adminPhone?: string;
};

export default function UpiPaymentModal({
  isOpen,
  onClose,
  item,
  customer,
  adminUpiId = "djammu03@okaxis",
  adminPhone = "918883338935",
}: Props) {
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen || !item) return null;

  // Extract numeric price for UPI amount calculation
  const numericPrice = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 999;
  const upiPayUrl = `upi://pay?pa=${encodeURIComponent(adminUpiId)}&pn=DreamElevateAdmin&am=${numericPrice}&cu=INR&tn=${encodeURIComponent("Order_" + item.name)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiPayUrl)}`;

  function handleCopyUpi() {
    navigator.clipboard.writeText(adminUpiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function handleConfirmWhatsApp() {
    setIsVerifying(true);
    
    const custName = customer?.name || "Customer";
    const custPhone = customer?.phone || "N/A";
    const custAddress = customer?.address ? `\n📍 *Address:* ${customer.address}` : "";
    const custDate = customer?.deliveryDate ? `\n📅 *Delivery Date:* ${customer.deliveryDate}` : "";
    const flavorMsg = customer?.flavor ? `\n🍰 *Flavor:* ${customer.flavor}` : "";
    const weightMsg = customer?.weight ? `\n⚖️ *Weight:* ${customer.weight}` : "";
    const cakeMessage = customer?.message ? `\n📝 *Message on Cake:* "${customer.message}"` : "";

    const msgText =
      `🎂 *NEW ORDER & UPI PAYMENT CONFIRMATION* 🎂\n` +
      `-------------------------------------------\n` +
      `👤 *Customer Name:* ${custName}\n` +
      `📞 *Phone Number:* ${custPhone}` +
      custAddress +
      custDate +
      `\n\n📦 *Ordered Item:* ${item?.name}\n` +
      `🏷️ *Category:* ${item?.category || "Custom Bake"}` +
      flavorMsg +
      weightMsg +
      cakeMessage +
      `\n💰 *Total Price:* ${item?.price}\n` +
      `-------------------------------------------\n` +
      `💳 *Payment Method:* Admin UPI (QR / Direct App)\n` +
      `📲 *Admin UPI ID Paid:* ${adminUpiId}\n` +
      `✨ *Payment Status:* SUCCESSFUL / COMPLETED\n\n` +
      `Admin, please verify payment in your bank/UPI app and reply to confirm order! Thank you! 🍰`;

    const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(msgText)}`;
    
    setTimeout(() => {
      window.open(whatsappUrl, "_blank");
      setIsVerifying(false);
      onClose();
    }, 600);
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#24130A]/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full max-w-lg bg-[#3B2417] text-[#FBF3EA] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#C9A15A]/40 relative overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-xl text-[#FBF3EA]/70 hover:text-[#C9A15A] transition-colors p-1"
          >
            ✕
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <span className="text-[11px] uppercase font-bold tracking-widest text-[#C9A15A]">
              Fast &amp; Secure UPI Payment
            </span>
            <h2 className="font-display italic text-2xl sm:text-3xl font-bold text-[#FBF3EA] mt-1">
              Pay &amp; Confirm Order
            </h2>
            <p className="text-xs text-[#FBF3EA]/70 mt-1">
              Pay directly to Admin UPI ID and confirm on Admin WhatsApp
            </p>
          </div>

          {/* Item & Price Summary Card */}
          <div className="bg-[#24130A]/80 rounded-2xl p-4 border border-[#C9A15A]/25 mb-6 flex items-center gap-4">
            {item.image_url && (
              <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-[#C9A15A]/30">
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#C9A15A] tracking-wider">
                {item.category || "Gourmet Bake"}
              </span>
              <h3 className="font-display italic text-base font-bold text-[#FBF3EA] truncate">
                {item.name}
              </h3>
              <p className="text-xs text-[#FBF3EA]/70 mt-0.5">
                Total Payable: <strong className="text-[#C9A15A] text-sm">{item.price}</strong>
              </p>
            </div>
          </div>

          {/* UPI Payment Options */}
          <div className="space-y-4">
            {/* Mobile Direct Pay Button (For phones/tablets) */}
            <a
              href={upiPayUrl}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#e38c36] to-[#C9A15A] text-[#24130A] py-3 px-4 text-xs sm:text-sm font-extrabold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>📱</span>
              <span>Open UPI App (GPay / PhonePe / Paytm)</span>
            </a>

            {/* QR Code Section (For scanning with mobile) */}
            <div className="bg-[#24130A]/90 rounded-2xl p-4 border border-[#FBF3EA]/15 text-center flex flex-col items-center">
              <p className="text-xs font-bold text-[#C9A15A] uppercase tracking-wider mb-3">
                Or Scan QR Code with Any UPI App
              </p>
              <div className="bg-white p-3 rounded-2xl shadow-inner border-2 border-[#C9A15A]/50 inline-block mb-3">
                <img
                  src={qrCodeUrl}
                  alt="UPI Payment QR Code"
                  className="w-40 h-40 object-contain"
                />
              </div>
              <div className="flex items-center gap-2 bg-[#3B2417] px-3.5 py-1.5 rounded-full border border-[#C9A15A]/30">
                <span className="text-xs text-[#FBF3EA]/90 font-mono">
                  UPI ID: <strong>{adminUpiId}</strong>
                </span>
                <button
                  onClick={handleCopyUpi}
                  className="text-[11px] font-bold text-[#C9A15A] hover:underline"
                >
                  {copied ? "✓ Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Confirm Payment & Send to WhatsApp Button */}
            <button
              onClick={handleConfirmWhatsApp}
              disabled={isVerifying}
              className="w-full rounded-2xl bg-[#4a9070] hover:bg-[#3d7a5e] text-white py-3.5 px-4 text-xs sm:text-sm font-extrabold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>💬</span>
              <span>
                {isVerifying
                  ? "Opening WhatsApp..."
                  : "I Have Paid — Confirm Order on Admin WhatsApp →"}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
