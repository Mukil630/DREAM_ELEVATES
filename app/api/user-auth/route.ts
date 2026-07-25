import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

const USERS_FILE = path.join(process.cwd(), "users.json");

export type UserRecord = {
  id: string;
  name: string;
  phone: string;
  email: string;
  created_at?: string;
};

function readLocalUsers(): UserRecord[] {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, "[]", "utf8");
      return [];
    }
    const data = fs.readFileSync(USERS_FILE, "utf8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalUsers(users: UserRecord[]) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing users.json:", err);
  }
}

// POST /api/user-auth (Register or Sync Login User in DB)
export async function POST(req: Request) {
  try {
    const user: UserRecord = await req.json();
    if (!user || (!user.phone && !user.email)) {
      return NextResponse.json({ error: "Missing phone or email" }, { status: 400 });
    }

    const record: UserRecord = {
      id: user.id || `usr_${Date.now()}`,
      name: user.name || "Valued Customer",
      phone: user.phone || "",
      email: user.email || `${user.phone}@dreamelevate.local`,
      created_at: user.created_at || new Date().toISOString(),
    };

    // 1. If Supabase Cloud DB is connected, store in Supabase
    if (isSupabaseConfigured) {
      try {
        await supabase.from("users").upsert([
          {
            id: record.id,
            name: record.name,
            phone: record.phone,
            email: record.email,
          },
        ]);
      } catch (err) {
        console.warn("Supabase user upsert error (using local):", err);
      }
    }

    // 2. Also save to local users.json database
    const localUsers = readLocalUsers();
    const existingIdx = localUsers.findIndex(
      (u) => (u.phone && u.phone === record.phone) || (u.email && u.email === record.email)
    );

    if (existingIdx !== -1) {
      localUsers[existingIdx] = { ...localUsers[existingIdx], ...record };
    } else {
      localUsers.unshift(record);
    }
    writeLocalUsers(localUsers);

    return NextResponse.json({ success: true, user: record });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to store user data";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
