import Hero from "@/components/Hero";
import About from "@/components/About";
import MenuGrid from "@/components/MenuGrid";
import OrderForm from "@/components/OrderForm";
import Location from "@/components/Location";
import ScrollText from "@/components/ScrollText";
import CakeSplitText from "@/components/CakeSplitText";
import FssaiBadge from "@/components/FssaiBadge";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ScrollText
        text="HANDCRAFTED CAKES &bull; BAKING TOOLS & INGREDIENTS &bull; RESIN ART & FANCY GIFTS &bull; DREAM ELEVATE"
        subtext="Explore Our Full Collection Beyond Cakes"
        speed={25}
      />
      <MenuGrid />
      <CakeSplitText />
      <OrderForm />
      {/* Our Story section moved to go right before location & footer */}
      <About />
      <FssaiBadge />
      <Location />
    </>
  );
}
