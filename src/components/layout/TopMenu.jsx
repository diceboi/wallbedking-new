"use client";

import Link from "next/link";
import { IconShieldCheck, IconTruck, IconTools } from "@tabler/icons-react";
import { useLocale } from "@/context/LocaleContext";

export function TopMenu() {
  const { t, localizedHref } = useLocale();

  return (
    <div className="hidden md:block bg-wbk-black text-wbk-white text-[11px] border-b border-wbk-black/80 font-poppins select-none relative z-50">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
        {/* Left: Highlights / Assurances */}
        <div className="flex items-center gap-6 text-[#A5988E]">
          <div className="flex items-center gap-1.5">
            <IconTruck
              size={14}
              className="text-wbk-gold shrink-0"
              strokeWidth={1.5}
            />
            <span className="hidden sm:inline text-wbk-white/90">
              {t("topbar.freeDelivery", "Free UK Mainland Delivery")}
            </span>
            <span className="sm:hidden text-wbk-white/90">
              {t("topbar.freeDeliveryShort", "Free UK Delivery")}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            <IconShieldCheck
              size={14}
              className="text-wbk-gold shrink-0"
              strokeWidth={1.5}
            />
            <span className="text-wbk-white/90">
              {t("topbar.warranty", "Lifetime Mechanism Warranty")}
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5">
            <IconTools
              size={14}
              className="text-wbk-gold shrink-0"
              strokeWidth={1.5}
            />
            <span className="text-wbk-white/90">
              {t("topbar.precision", "Precision Engineered Mechanisms")}
            </span>
          </div>
        </div>

        {/* Right: Quick secondary links */}
        <div className="flex items-center gap-4 text-xs font-normal">
          <Link
            href={localizedHref("/support/faq")}
            className="text-[#A5988E] hover:text-wbk-white transition-colors duration-150"
          >
            {t("topbar.faq", "FAQ")}
          </Link>
          <span className="text-white/20">|</span>
          <Link
            href={localizedHref("/support/installation-guides")}
            className="text-[#A5988E] hover:text-wbk-white transition-colors duration-150"
          >
            {t("topbar.installation", "Installation")}
          </Link>
          <span className="text-white/20">|</span>
          <Link
            href={localizedHref("/reviews")}
            className="text-[#A5988E] hover:text-wbk-white transition-colors duration-150"
          >
            {t("topbar.reviews", "Reviews")}
          </Link>
          <span className="text-white/20">|</span>
          <Link
            href={localizedHref("/about")}
            className="text-[#A5988E] hover:text-wbk-white transition-colors duration-150"
          >
            {t("topbar.about", "About")}
          </Link>
          <span className="text-white/20">|</span>
          <Link
            href={localizedHref("/contact")}
            className="text-[#A5988E] hover:text-wbk-white transition-colors duration-150"
          >
            {t("topbar.contact", "Contact")}
          </Link>
        </div>
      </div>
    </div>
  );
}
