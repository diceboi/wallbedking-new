"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconChevronDown } from "@tabler/icons-react";
import { MenuContext } from "@/context/MenuContext";
import { useLocale } from "@/context/LocaleContext";

import { SUBMENU_DATA } from "@/data/navigation";

export function MainMenuItem({ item }) {
  const { subMenu, setSubMenu, cancelCloseSubmenu } =
    useContext(MenuContext);
  const { localizedHref, t } = useLocale();
  const router = useRouter();

  const submenuKey = item.slug || item.category_id || item.id;
  const hasSubmenuConfig = Boolean(item.hasSubmenu ?? item.has_submenu);
  const hasSubmenu = hasSubmenuConfig && Boolean(SUBMENU_DATA[submenuKey]);

  const isActive = subMenu === submenuKey;
  const title = t(`nav.${item.id}`, item.title);

  if (!hasSubmenu) {
    return (
      <Link
        href={localizedHref(item.href)}
        onMouseEnter={() => setSubMenu(null)}
        className="relative flex items-center gap-1.5 h-12 px-3.5 text-xs font-medium uppercase tracking-[0.14em] text-wbk-black hover:text-wbk-green transition-colors select-none after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-wbk-gold after:transition-all after:duration-200 hover:after:w-full"
      >
        <span>{title}</span>
        {item.badge && (
          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-wbk-gold/20 text-wbk-black tracking-wider uppercase">
            {item.badge}
          </span>
        )}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onMouseEnter={() => {
        cancelCloseSubmenu();
        setSubMenu(submenuKey);
      }}
      onClick={() => router.push(localizedHref(item.href))}
      className={`relative group flex items-center gap-1.5 h-12 px-3.5 text-xs font-medium uppercase tracking-[0.14em] cursor-pointer transition-colors select-none ${
        isActive
          ? "text-wbk-green after:w-full"
          : "text-wbk-black hover:text-wbk-green after:w-0 hover:after:w-full"
      } after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-wbk-gold after:transition-all after:duration-200`}
    >
      <span>{title}</span>
      {item.badge && (
        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-wbk-gold/20 text-wbk-black tracking-wider uppercase">
          {item.badge}
        </span>
      )}
      <IconChevronDown
        size={13}
        className={`transition-transform duration-200 ${
          isActive ? "rotate-180 text-wbk-gold" : "text-wbk-brown group-hover:text-wbk-green"
        }`}
      />
    </button>
  );
}
