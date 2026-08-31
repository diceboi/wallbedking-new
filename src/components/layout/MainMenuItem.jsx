"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconChevronDown } from "@tabler/icons-react";
import { MenuContext } from "@/context/MenuContext";

export function MainMenuItem({ item }) {
  const { subMenu, setSubMenu, cancelCloseSubmenu, scheduleCloseSubmenu } =
    useContext(MenuContext);
  const router = useRouter();
  const isActive = subMenu === item.slug;

  if (!item.hasSubmenu) {
    return (
      <Link
        href={item.href}
        onMouseEnter={() => setSubMenu(null)}
        className="relative flex items-center h-12 px-3.5 text-xs font-medium uppercase tracking-[0.14em] text-wbk-black hover:text-wbk-green transition-colors select-none after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-wbk-gold after:transition-all after:duration-200 hover:after:w-full"
      >
        {item.title}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onMouseEnter={() => {
        cancelCloseSubmenu();
        setSubMenu(item.slug);
      }}
      onMouseLeave={() => scheduleCloseSubmenu(500)}
      onClick={() => router.push(item.href)}
      className={`relative group flex items-center gap-1.5 h-12 px-3.5 text-xs font-medium uppercase tracking-[0.14em] cursor-pointer transition-colors select-none ${
        isActive
          ? "text-wbk-green after:w-full"
          : "text-wbk-black hover:text-wbk-green after:w-0 hover:after:w-full"
      } after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-wbk-gold after:transition-all after:duration-200`}
    >
      <span>{item.title}</span>
      <IconChevronDown
        size={13}
        className={`transition-transform duration-200 ${
          isActive ? "rotate-180 text-wbk-gold" : "text-wbk-brown group-hover:text-wbk-green"
        }`}
      />
    </button>
  );
}
