import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen pt-32 pb-16 flex flex-col items-center justify-center text-center px-4 bg-[#FBF3EA] text-[#3B2417]">
      <span className="text-6xl mb-4">🎂</span>
      <h2 className="font-display italic text-3xl sm:text-4xl font-bold text-[#3B2417] mb-2">
        404 — Page Not Found
      </h2>
      <p className="text-sm text-[#5A3826] max-w-md mb-6 leading-relaxed">
        Oops! The page or item you are looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link
        href="/menu"
        className="rounded-full bg-[#3B2417] text-[#FBF3EA] px-8 py-3 text-xs font-bold shadow-lg hover:bg-[#B5476B] hover:scale-105 transition-all"
      >
        Explore Product Collection &rarr;
      </Link>
    </div>
  );
}
