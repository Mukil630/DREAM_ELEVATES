import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const url = "https://zyqmreaaazssjpkzfopq.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5cW1yZWFhYXpzc2pwa3pmb3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NzE3NTUsImV4cCI6MjEwMDU0Nzc1NX0.IIdCVO4Y1D0eUBURSGnXl5DMgZ-tlMSnaXotPXhLI-o";
const supabase = createClient(url, key);

const fullCatalog = [
  {
    name: "Lavender Bloom Cake",
    price_label: "₹799",
    rating: 4.8,
    review_count: 120,
    category: "Custom Cakes",
    description: "Infused with organic lavender syrup and vanilla bean buttercream frosting.",
    image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop"
  },
  {
    name: "Dark Velvet Dream Cake",
    price_label: "₹1299",
    rating: 4.9,
    review_count: 160,
    category: "Custom Cakes",
    description: "Rich dark chocolate cake layered with fudge and cocoa nibs.",
    image_url: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=800&auto=format&fit=crop"
  },
  {
    name: "Midnight Truffle Cake",
    price_label: "₹699",
    rating: 4.7,
    review_count: 48,
    category: "Custom Cakes",
    description: "Decadent Dutch chocolate sponge topped with handcrafted Belgian truffle ganache.",
    image_url: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=800&auto=format&fit=crop"
  },
  {
    name: "Midnight Berry Chocolate Cake",
    price_label: "₹1199",
    rating: 4.9,
    review_count: 90,
    category: "Custom Cakes",
    description: "Super moist 3-layer chocolate fudge cake topped with fresh berries.",
    image_url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&auto=format&fit=crop"
  },
  {
    name: "Professional Aluminium Cake Turntable",
    price_label: "₹1499",
    rating: 4.9,
    review_count: 85,
    category: "Baking Tools",
    description: "Heavy-duty 12-inch smooth revolving aluminum stand for precision cake decorating.",
    image_url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop"
  },
  {
    name: "24-Piece Stainless Piping Nozzles Set",
    price_label: "₹649",
    rating: 4.7,
    review_count: 92,
    category: "Baking Tools",
    description: "Food-grade stainless steel piping tips for flowers, borders, and lettering.",
    image_url: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800&auto=format&fit=crop"
  },
  {
    name: "Silicon Geometric Cake Molds",
    price_label: "₹450",
    rating: 4.6,
    review_count: 54,
    category: "Baking Tools",
    description: "Non-stick heat-resistant silicone mold for 3D diamond mousse cakes & bakes.",
    image_url: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&auto=format&fit=crop"
  },
  {
    name: "Pure Belgian Dark Chocolate Couverture (1kg)",
    price_label: "₹999",
    rating: 4.9,
    review_count: 140,
    category: "Ingredients",
    description: "54.5% cocoa real chocolate buttons ideal for ganache, pralines, and baking.",
    image_url: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&auto=format&fit=crop"
  },
  {
    name: "French Vanilla Bean Paste (100g)",
    price_label: "₹750",
    rating: 4.8,
    review_count: 68,
    category: "Ingredients",
    description: "Concentrated extract loaded with real Madagascar vanilla bean specks.",
    image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop"
  },
  {
    name: "baking powder",
    price_label: "₹999",
    rating: 4.8,
    review_count: 25,
    category: "Ingredients",
    description: "Premium double-acting baking powder for light, fluffy bakes.",
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZ5pwwoCTK-LmDtohxB1qE7JNu_7ITGJgE6dg4b3l2JQ&s=10"
  }
];

async function syncCatalog() {
  const { data: existing } = await supabase.from("menu_items").select("*");
  const existingNames = new Set((existing || []).map((i) => i.name.toLowerCase().trim()));

  for (const item of fullCatalog) {
    if (!existingNames.has(item.name.toLowerCase().trim())) {
      console.log("Inserting missing item into Supabase:", item.name);
      await supabase.from("menu_items").insert(item);
    }
  }

  // Re-fetch all items from Supabase
  const { data: allItems } = await supabase
    .from("menu_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (allItems) {
    fs.writeFileSync("products.json", JSON.stringify(allItems, null, 2), "utf8");
    console.log(`FULL CATALOG SYNC COMPLETE! Total items in DB: ${allItems.length}`);
  }
}

syncCatalog();
