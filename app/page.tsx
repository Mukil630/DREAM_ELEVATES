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
        text="HANDCRAFTED GOURMET CAKES &bull; ARTISANAL BAKERY DELIGHTS &bull; DREAM ELEVATES"
        subtext="Scroll To Explore Our Signature Creations"
        speed={25}
      />
      <About />
      <CakeSplitText />
      <MenuGrid />
      <OrderForm />
      <FssaiBadge />
      <Location />
    </>
  );
}
