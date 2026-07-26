import type { Metadata } from "next";
import About from "@/components/About";
import Location from "@/components/Location";

export const metadata: Metadata = {
  title: "About Us — Dream Elevate",
};

export default function AboutPage() {
  return (
    <div className="pt-32">
      <About />
      <Location />
    </div>
  );
}
