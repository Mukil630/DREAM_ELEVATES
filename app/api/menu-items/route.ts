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
    "id": "resin-1",
    "name": "Handcrafted Agate Resin Coasters (Set of 4)",
    "price_label": "₹699",
    "rating": 4.9,
    "review_count": 42,
    "image_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop",
    "category": "Resin Art Work",
    "description": "Luxurious epoxy resin coasters with metallic gold leaf trim and heat resistance up to 90°C."
  },
  {
    "id": "resin-2",
    "name": "Ocean Wave Resin Wall Clock",
    "price_label": "₹1499",
    "rating": 5.0,
    "review_count": 28,
    "image_url": "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop",
    "category": "Resin Art Work",
    "description": "12-inch handcrafted wooden wall clock featuring realistic resin ocean waves and silent sweep movement."
  },
  {
    "id": "resin-3",
    "name": "Gold Foil Resin Serving Tray",
    "price_label": "₹1299",
    "rating": 4.8,
    "review_count": 35,
    "image_url": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop",
    "category": "Resin Art Work",
    "description": "Statement serving tray with gold handles and crystal clear food-safe resin finish."
  },
  {
    "id": "fancy-1",
    "name": "Customized LED Acrylic Name Frame",
    "price_label": "₹899",
    "rating": 4.9,
    "review_count": 56,
    "image_url": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop",
    "category": "Fancy Items",
    "description": "Personalized 3D optical illusion night light with warm LED lighting and custom name etching."
  },
  {
    "id": "fancy-2",
    "name": "Deluxe Celebration Gift Hamper",
    "price_label": "₹1599",
    "rating": 5.0,
    "review_count": 64,
    "image_url": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop",
    "category": "Fancy Items",
    "description": "Curated luxury gift basket with artisan chocolates, custom keepsakes, and ribbon packaging."
  },
  {
    "id": "fancy-3",
    "name": "Hand-poured Scented Soy Candles",
    "price_label": "₹599",
    "rating": 4.8,
    "review_count": 31,
    "image_url": "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&auto=format&fit=crop",
    "category": "Fancy Items",
    "description": "Aromatherapy soy wax candles infused with French vanilla, lavender, and sandalwood essential oils."
  },
  {
    "id": "cake-1",
    "name": "Lavender Bloom Celebration Cake",
    "price_label": "₹799",
    "rating": 4.9,
    "review_count": 120,
    "image_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop",
    "category": "Signature Cakes",
    "description": "Infused with organic lavender syrup, vanilla bean sponge, and silky Swiss buttercream frosting."
  },
  {
    "id": "cake-2",
    "name": "Dark Velvet Fudge Cake",
    "price_label": "₹1299",
    "rating": 5.0,
    "review_count": 160,
    "image_url": "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=800&auto=format&fit=crop",
    "category": "Signature Cakes",
    "description": "Rich 70% dark chocolate sponge layered with dark fudge ganache and cocoa nibs."
  },
  {
    "id": "cake-3",
    "name": "Midnight Belgian Truffle Cake",
    "price_label": "₹699",
    "rating": 4.7,
    "review_count": 48,
    "image_url": "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=800&auto=format&fit=crop",
    "category": "Custom Cakes",
    "description": "Decadent Dutch chocolate sponge topped with handcrafted Belgian truffle ganache."
  },
  {
    "id": "tool-1",
    "name": "Pizza Cutter Wheel",
    "price_label": "₹210",
    "rating": 4.8,
    "review_count": 25,
    "image_url": "/uploads/upload_1784990975065.png",
    "category": "Baking Tools",
    "description": "Heavy-Duty Stainless Steel Pizza Cutter Wheel with Safety Guard & Ergonomic Handle."
  },
  {
    "id": "tool-2",
    "name": "Silicone Spatula Set",
    "price_label": "₹80",
    "rating": 4.8,
    "review_count": 25,
    "image_url": "/uploads/upload_1784990838729.png",
    "category": "Baking Tools",
    "description": "Heat-Resistant Seamless Silicone Spatula Set for Cooking & Baking (BPA-Free)."
  },
  {
    "id": "tool-3",
    "name": "Professional Piping Bags",
    "price_label": "₹70",
    "rating": 4.8,
    "review_count": 25,
    "image_url": "/uploads/upload_1784990712383.png",
    "category": "Baking Tools",
    "description": "Professional Piping & Pastry Bags for Cake Decorating (Disposable & Reusable Options)."
  },
  {
    "id": "ing-1",
    "name": "Pure Madagascar Vanilla Extract",
    "price_label": "₹450",
    "rating": 4.9,
    "review_count": 38,
    "image_url": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop",
    "category": "Ingredients",
    "description": "Organic Madagascar bourbon vanilla extract with real vanilla seeds for gourmet baking."
  }
];

declare global {
  var _menuItemsMemoryCache: MenuItem[] | undefined;
}

function readLocalMenu(): MenuItem[] {
  if (globalThis._menuItemsMemoryCache && globalThis._menuItemsMemoryCache.length > 0) {
    return globalThis._menuItemsMemoryCache;
  }
  try {
    if (!fs.existsSync(MENU_FILE)) {
      try {
        fs.writeFileSync(MENU_FILE, JSON.stringify(defaultMenuItems, null, 2), "utf8");
      } catch {}
      globalThis._menuItemsMemoryCache = defaultMenuItems;
      return defaultMenuItems;
    }
    const data = fs.readFileSync(MENU_FILE, "utf8");
    const parsed = JSON.parse(data);
    const result = Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultMenuItems;
    globalThis._menuItemsMemoryCache = result;
    return result;
  } catch {
    globalThis._menuItemsMemoryCache = defaultMenuItems;
    return defaultMenuItems;
  }
}

function writeLocalMenu(items: MenuItem[]) {
  globalThis._menuItemsMemoryCache = items;
  try {
    fs.writeFileSync(MENU_FILE, JSON.stringify(items, null, 2), "utf8");
  } catch (err) {
    console.warn("Vercel serverless read-only filesystem detected, keeping menu items in memory cache:", err);
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

  // Fallback to local / in-memory DB
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

    // Local / In-memory sync for fallback
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
      const generatedId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newItem: MenuItem & { price?: number; image?: string } = {
        id: generatedId,
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
      items = [newItem, ...items];
    }

    writeLocalMenu(items);

    // Return fresh state from Supabase Cloud DB if available
    if (isSupabaseConfigured) {
      try {
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
      } catch {}
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

