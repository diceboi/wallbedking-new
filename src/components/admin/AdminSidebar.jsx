"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconDashboard,
  IconPackage,
  IconTag,
  IconFolder,
  IconLanguage,
  IconSettings,
  IconExternalLink,
  IconX,
  IconUsers,
} from "@tabler/icons-react";

export const ADMIN_NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/admin",
    icon: IconDashboard,
  },
  {
    id: "products",
    label: "Products",
    href: "/admin/products",
    icon: IconPackage,
    hasCount: true,
  },
  {
    id: "pricing",
    label: "Pricing & Discounts",
    href: "/admin/pricing",
    icon: IconTag,
  },
  {
    id: "categories",
    label: "Categories",
    href: "/admin/categories",
    icon: IconFolder,
  },
  {
    id: "users",
    label: "Users",
    href: "/admin/users",
    icon: IconUsers,
    hasCount: true,
  },
  {
    id: "translations",
    label: "Translations",
    href: "/admin/translations",
    icon: IconLanguage,
  },
  {
    id: "settings",
    label: "Settings",
    href: "/admin/settings",
    icon: IconSettings,
  },
];

export function AdminSidebar({ isMobileOpen, onCloseMobile }) {
  const pathname = usePathname() || "";
  const [productCount, setProductCount] = useState(234);
  const [userCount, setUserCount] = useState(null);

  // Fetch counts once on mount
  useEffect(() => {
    fetch("/api/admin/products?limit=1")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.count) {
          setProductCount(data.count);
        }
      })
      .catch(() => {});

    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && typeof data.count === "number") {
          setUserCount(data.count);
        }
      })
      .catch(() => {});
  }, []);

  const content = (
    <div className="flex flex-col h-full bg-[#090A0A] text-white font-poppins select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="font-new-york text-xl text-white tracking-tight">
            WallBed<span className="text-wbk-gold">King</span>
          </span>
          <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-white/10 text-wbk-gold font-semibold">
            Admin
          </span>
        </Link>

        {/* Mobile close button */}
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1 text-white/70 hover:text-white"
            aria-label="Close sidebar"
          >
            <IconX size={18} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin" || pathname === "/admin/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-medium uppercase tracking-wider rounded-none transition-colors group ${
                isActive
                  ? "bg-white/15 text-wbk-gold border-l-2 border-wbk-gold font-semibold"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={17}
                  className={`transition-colors ${
                    isActive ? "text-wbk-gold" : "text-white/50 group-hover:text-white"
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.hasCount && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-wbk-gold text-wbk-black leading-none">
                  {item.id === "users" ? (userCount ?? "…") : productCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer link to live storefront */}
      <div className="p-4 border-t border-white/10 bg-black/40">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between p-2.5 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center gap-2">
            <IconExternalLink size={15} className="text-wbk-gold" />
            <span>View Storefront</span>
          </div>
          <span className="text-[10px] text-white/40 group-hover:text-white/70">
            Live
          </span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 border-r border-white/10 z-30 shadow-xl">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-50 shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
