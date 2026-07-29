"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen pt-32 pb-16 flex flex-col items-center justify-center text-center px-4 bg-[#FBF3EA] text-[#3B2417]">
      <h2 className="font-display italic text-3xl font-bold text-[#B5476B] mb-2">
        Something went wrong!
      </h2>
      <p className="text-sm text-[#5A3826] max-w-md mb-6">
        We encountered an error loading this section. Please try again or return to the menu.
      </p>
      <div className="flex items-center gap-4">
        <button
          onClick={() => reset()}
          className="rounded-full bg-[#3B2417] text-[#FBF3EA] px-6 py-2.5 text-xs font-bold shadow hover:bg-[#B5476B] transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="rounded-full border border-[#3B2417]/30 text-[#3B2417] px-6 py-2.5 text-xs font-bold hover:bg-[#3B2417] hover:text-[#FBF3EA] transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
