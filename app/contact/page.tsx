import type { Metadata } from "next";
import OrderForm from "@/components/OrderForm";
import Location from "@/components/Location";

export const metadata: Metadata = {
  title: "Contact — Dream Elevates",
};

export default function ContactPage() {
  return (
    <div className="pt-32">
      <OrderForm />
      <Location />
    </div>
  );
}
