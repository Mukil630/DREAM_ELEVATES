import type { Metadata } from "next";
import MenuGrid from "@/components/MenuGrid";

export const metadata: Metadata = {
  title: "Menu — Dream Elevate",
};

export default function MenuPage() {
  return (
    <div className="pt-32">
      <MenuGrid />
    </div>
  );
}
