# Dream Elevate — Fullstack Rebuild

A fullstack recreation of the Framer site (Kafe Milano / Dream Elevate template),
built with **Next.js 14 (App Router)**, **Tailwind CSS**, **Framer Motion**
(the same animation engine Framer itself uses), and **Supabase** as the cloud
database.

## What's real now (vs. the Framer version)

- The **"Place Your Order"** form actually inserts a row into a Supabase
  `orders` table instead of doing nothing.
- The **newsletter box** in the footer inserts into a `newsletter_subscribers`
  table.
- The **menu grid** is data-driven — it reads from a `menu_items` table in
  Supabase (falls back to hardcoded data if Supabase isn't configured yet, so
  the site still looks right before you set up the DB).
- All the original animations are recreated: hero crossfade slider, scroll
  reveal on every section, staggered card grids, hover scale on cards/buttons,
  sticky navbar with blur-on-scroll, animated mobile menu, animated form
  success state.

## 1. Install dependencies

```bash
npm install
```

## 2. Create your Supabase project

1. Go to https://supabase.com → New Project.
2. Once it's created, open **SQL Editor → New query**, paste the contents of
   `supabase/schema.sql`, and run it. This creates the `orders`,
   `newsletter_subscribers`, and `menu_items` tables, sets Row Level Security
   policies (public can insert orders/subscribers, but not read them back —
   only you can via the Supabase dashboard), and seeds the menu items.
3. Go to **Project Settings → API** and copy your **Project URL** and
   **anon public key**.

## 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

## 4. Run it

```bash
npm run dev
```

Visit http://localhost:3000

## 5. Viewing submitted orders / subscribers

Supabase Dashboard → **Table Editor** → `orders` / `newsletter_subscribers`.
(If you later want a proper in-app admin dashboard with auth, that's a clean
next step — just ask.)

## 6. Deploying

Push this to GitHub and import it into **Vercel** (made by the Next.js team,
zero-config for this stack). Add the same two env vars in
Vercel → Project → Settings → Environment Variables.

## Project structure

```
app/
  layout.tsx        Root layout, fonts, Navbar/Footer wrapper
  page.tsx           Home page
  about-us/page.tsx
  menu/page.tsx
  contact/page.tsx
  globals.css
components/
  Navbar.tsx          Sticky nav, blur on scroll, animated mobile menu
  Hero.tsx            Autoplaying crossfade image carousel
  About.tsx           Scroll-reveal story + stats
  MenuGrid.tsx         Cake grid, reads from Supabase
  OrderForm.tsx        Real form → Supabase `orders` table
  Location.tsx         Map + address
  Footer.tsx            Newsletter signup → Supabase `newsletter_subscribers`
lib/
  supabaseClient.ts   Supabase browser client
  motion.ts            Shared Framer Motion variants
supabase/
  schema.sql            Run this once in the Supabase SQL editor
```

## Notes

- Images are currently pulled from the original template's CDN
  (`framerusercontent.com`) so the site looks identical out of the box. Swap
  these for your own photos in `components/*.tsx` and `supabase/schema.sql`
  whenever you're ready — no code restructuring needed.
- All content (copy, prices, cake names) matches the original site; edit
  freely, it's now just plain React/JSX.
