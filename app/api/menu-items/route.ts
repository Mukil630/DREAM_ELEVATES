import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { formatImageUrl } from "@/lib/imageUtils";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

const MENU_FILE = path.join(process.cwd(), "products.json");

export type MenuItem = {
  id: string;
  name: string;
  price?: number;
  price_label: string;
  rating: number;
  review_count: number;
  image?: string;
  image_url: string;
  category?: string;
  description?: string;
};

const defaultMenuItems: MenuItem[] = [
  {
    id: "prod-1",
    name: "Lavender Bloom Cake",
    price_label: "₹799",
    rating: 4.8,
    review_count: 120,
    category: "Custom Cakes",
    description: "Infused with organic lavender syrup and vanilla bean buttercream frosting.",
    image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop",
  },
  {
    id: "prod-2",
    name: "Dark Velvet Dream",
    price_label: "₹1299",
    rating: 4.9,
    review_count: 160,
    category: "Custom Cakes",
    description: "Rich dark chocolate cake layered with fudge and cocoa nibs.",
    image_url: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=800&auto=format&fit=crop",
  },
  {
    id: "prod-3",
    name: "Midnight Truffle Cake",
    price_label: "₹699",
    rating: 4.7,
    review_count: 48,
    category: "Custom Cakes",
    description: "Decadent Dutch chocolate sponge topped with handcrafted Belgian truffle ganache.",
    image_url: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=800&auto=format&fit=crop",
  },
];

function readLocalMenu(): MenuItem[] {
  try {
    if (!fs.existsSync(MENU_FILE)) {
      fs.writeFileSync(MENU_FILE, JSON.stringify(defaultMenuItems, null, 2), "utf8");
      return defaultMenuItems;
    }
    const data = fs.readFileSync(MENU_FILE, "utf8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultMenuItems;
  } catch {
    return defaultMenuItems;
  }
}

function writeLocalMenu(items: MenuItem[]) {
  try {
    fs.writeFileSync(MENU_FILE, JSON.stringify(items, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing local menu items:", err);
  }
}

function cleanStr(str: any): string {
  if (typeof str !== "string") return "";
  return str.replace(/[\r\n\t]+/g, " ").trim();
}

// GET /api/menu-items
export async function GET() {
  let items: MenuItem[] = [];

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        items = data.map((item) => {
          const img = formatImageUrl(item.image_url || item.image || "");
          const cleanPriceLabel = cleanStr(item.price_label) || "₹799";
          const numPrice = typeof item.price === "number" ? item.price : (parseFloat(cleanPriceLabel.replace(/[^0-9.]/g, "")) || 799);
          return {
            id: String(item.id),
            name: cleanStr(item.name) || "Gourmet Product",
            price: numPrice,
            price_label: cleanPriceLabel,
            rating: Number(item.rating) || 4.8,
            review_count: Number(item.review_count) || 12,
            image: img,
            image_url: img,
            category: cleanStr(item.category) || "Custom Cakes",
            description: cleanStr(item.description) || "",
          };
        });
        writeLocalMenu(items);
        return NextResponse.json(items, {
          headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" },
        });
      }
    } catch (e) {
      console.warn("Supabase fetch fallback to local:", e);
    }
  }

  // Fallback to local DB
  const rawItems = readLocalMenu();
  items = rawItems.map((item, idx) => {
    const img = formatImageUrl(item.image_url || item.image || "");
    const cleanPriceLabel = cleanStr(item.price_label) || "₹799";
    const numPrice = typeof item.price === "number" ? item.price : (parseFloat(cleanPriceLabel.replace(/[^0-9.]/g, "")) || 799);
    return {
      id: item.id || `prod_${idx}`,
      name: cleanStr(item.name) || "Gourmet Product",
      price: numPrice,
      price_label: cleanPriceLabel,
      rating: Number(item.rating) || 4.8,
      review_count: Number(item.review_count) || 12,
      image: img,
      image_url: img,
      category: cleanStr(item.category) || "Custom Cakes",
      description: cleanStr(item.description) || "",
    };
  });
  return NextResponse.json(items, {
    headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" },
  });
}

// POST /api/menu-items (Add, Edit, Delete)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = body.action;

    const formattedImage = formatImageUrl(body.image_url || body.image || "");
    const cleanName = cleanStr(body.name);
    const cleanPrice = cleanStr(body.price_label || (body.price ? `₹${body.price}` : ""));
    const cleanCategory = cleanStr(body.category) || "Custom Cakes";
    const cleanDesc = cleanStr(body.description);

    // Validate valid UUID or non-empty ID for Supabase Postgres
    const rawIdStr = body.id ? String(body.id).trim() : "";
    const hasValidId = Boolean(rawIdStr && rawIdStr !== "" && rawIdStr !== "null" && rawIdStr !== "undefined");

    if (isSupabaseConfigured) {
      try {
        if (action === "delete" && hasValidId) {
          const { error: delErr } = await supabase.from("menu_items").delete().eq("id", rawIdStr);
          if (delErr) console.error("Supabase delete error:", delErr);
        } else if (hasValidId) {
          const { error: updErr } = await supabase.from("menu_items").update({
            name: cleanName,
            price_label: cleanPrice,
            rating: Number(body.rating) || 4.8,
            review_count: Number(body.review_count) || 10,
            image_url: formattedImage,
            category: cleanCategory,
            description: cleanDesc,
          }).eq("id", rawIdStr);
          if (updErr) console.error("Supabase update error:", updErr);
        } else {
          // Add new item into Supabase Postgres DB
          const { error: insErr } = await supabase.from("menu_items").insert({
            name: cleanName || "New Product Item",
            price_label: cleanPrice || "₹499",
            rating: Number(body.rating) || 4.8,
            review_count: Number(body.review_count) || 10,
            image_url: formattedImage || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800",
            category: cleanCategory,
            description: cleanDesc,
          });
          if (insErr) console.error("Supabase insert error:", insErr);
        }
      } catch (err) {
        console.warn("Supabase mutation warning:", err);
      }
    }

    // Backup local sync for fallback
    let items = readLocalMenu();
    if (action === "delete" && hasValidId) {
      items = items.filter((item) => String(item.id).trim() !== rawIdStr);
    } else if (hasValidId) {
      const idx = items.findIndex((item) => String(item.id).trim() === rawIdStr);
      const numPrice = typeof body.price === "number" ? body.price : (parseFloat(cleanPrice.replace(/[^0-9.]/g, "")) || 499);
      const updatedObj: MenuItem & { price?: number; image?: string } = {
        id: rawIdStr,
        name: cleanName || "Gourmet Product",
        price: numPrice,
        price_label: cleanPrice || "₹499",
        rating: Number(body.rating) || 4.8,
        review_count: Number(body.review_count) || 10,
        image: formattedImage,
        image_url: formattedImage,
        category: cleanCategory,
        description: cleanDesc,
      };
      if (idx !== -1) {
        items[idx] = updatedObj;
      } else {
        items.unshift(updatedObj);
      }
    } else {
      const numPrice = typeof body.price === "number" ? body.price : (parseFloat(cleanPrice.replace(/[^0-9.]/g, "")) || 499);
      const newItem: MenuItem & { price?: number; image?: string } = {
        id: `prod_${Date.now()}`,
        name: cleanName || "New Product Item",
        price: numPrice,
        price_label: cleanPrice || "₹499",
        rating: Number(body.rating) || 4.8,
        review_count: Number(body.review_count) || 10,
        image: formattedImage,
        image_url: formattedImage,
        category: cleanCategory,
        description: cleanDesc,
      };
      items.unshift(newItem);
    }

    writeLocalMenu(items);

    // Return fresh state from Supabase Cloud DB
    if (isSupabaseConfigured) {
      const { data } = await supabase
        .from("menu_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (Array.isArray(data) && data.length > 0) {
        const freshItems = data.map((item) => {
          const img = formatImageUrl(item.image_url || item.image || "");
          const cleanPriceLabel = cleanStr(item.price_label) || "₹499";
          const numPrice = typeof item.price === "number" ? item.price : (parseFloat(cleanPriceLabel.replace(/[^0-9.]/g, "")) || 499);
          return {
            id: String(item.id),
            name: cleanStr(item.name),
            price: numPrice,
            price_label: cleanPriceLabel,
            rating: Number(item.rating) || 4.8,
            review_count: Number(item.review_count) || 10,
            image: img,
            image_url: img,
            category: cleanStr(item.category) || "Custom Cakes",
            description: cleanStr(item.description) || "",
          };
        });
        writeLocalMenu(freshItems);
        return NextResponse.json(
          { success: true, items: freshItems },
          { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } }
        );
      }
    }

    return NextResponse.json(
      { success: true, items },
      { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to update menu";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
