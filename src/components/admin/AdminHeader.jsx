"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconMenu2,
  IconExternalLink,
  IconSparkles,
} from "@tabler/icons-react";
import { ADMIN_NAV_ITEMS } from "./AdminSidebar";

export function AdminHeader({ title, onOpenMobile }) {
  const pathname = usePathname() || "";

  // Dynamically resolve section title if not explicitly provided
  const matchedNav = ADMIN_NAV_ITEMS.find((item) =>
    item.href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(item.href)
  );

  const displayTitle = title || matchedNav?.label || "Admin Console";

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-wbk-lightgrey/60 px-4 sm:px-6 flex items-center justify-between shadow-xs font-poppins">
      {/* Left: Mobile Toggle + Page Title */}
      <div className="flex items-center gap-3">
        {onOpenMobile && (
          <button
            type="button"
            onClick={onOpenMobile}
            className="lg:hidden p-2 text-wbk-black hover:bg-[#F4F2F0] rounded-none transition-colors cursor-pointer"
            aria-label="Open menu"
          >
            <IconMenu2 size={20} />
          </button>
        )}

        <div className="flex items-baseline gap-3">
          <span className="font-new-york text-xl sm:text-2xl text-wbk-black tracking-tight font-medium">
            {displayTitle}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Supabase Live
          </span>
        </div>
      </div>

      {/* Right: Quick actions & links */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          href="/admin/translations"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-wbk-brown hover:text-wbk-black hover:bg-[#F4F2F0] transition-colors rounded-full"
        >
          <IconSparkles size={15} className="text-wbk-gold" />
          <span>AI Translations</span>
        </Link>

        <Link
          href="/en"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#9A9A8C] hover:bg-wbk-black text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-colors shadow-xs cursor-pointer"
        >
          <span>Storefront</span>
          <IconExternalLink size={14} />
        </Link>
      </div>
    </header>
  );
}
