"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IconX, IconArrowRight, IconEyeCheck } from "@tabler/icons-react";
import { usePromotions } from "@/context/PromotionsContext";
import { useLocale } from "@/context/LocaleContext";
import { getLocalizedCampaignField } from "@/lib/promotions";

export function TopAnnouncementBar() {
  const { topBarCampaign } = usePromotions();
  const { locale, localizedHref } = useLocale();
  const [dismissedId, setDismissedId] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("wbk_dismissed_top_bar");
        if (stored) {
          setDismissedId(stored);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  if (!mounted || !topBarCampaign || !topBarCampaign.top_bar?.enabled) {
    return null;
  }

  // Check if current campaign top bar was dismissed in this session
  if (dismissedId === topBarCampaign.id && topBarCampaign.top_bar?.dismissible !== false) {
    return null;
  }

  const { top_bar, isPreview } = topBarCampaign;
  const barText = getLocalizedCampaignField(top_bar, "text", locale);
  const barLinkText = getLocalizedCampaignField(top_bar, "link_text", locale);

  if (!barText) return null;

  const bgColor = top_bar.bg_color || "#2D5A27";
  const textColor = top_bar.text_color || "#FFFFFF";
  const targetLink = top_bar.link ? localizedHref(top_bar.link) : null;

  const handleDismiss = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setDismissedId(topBarCampaign.id);
    try {
      sessionStorage.setItem("wbk_dismissed_top_bar", topBarCampaign.id);
    } catch {
      // ignore
    }
  };

  const content = (
    <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-medium tracking-wide">
      {/* Admin Preview Badge */}
      {isPreview && (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-amber-950 shadow-sm mr-1 flex-shrink-0"
          title="This promotion is in Admin Preview mode: visible only to you, not to storefront customers!"
        >
          <IconEyeCheck className="w-3 h-3" />
          Admin Preview
        </span>
      )}

      <span>{barText}</span>

      {targetLink && barLinkText && (
        <span className="inline-flex items-center gap-0.5 underline font-semibold ml-1 group-hover:opacity-90">
          {barLinkText}
          <IconArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      )}
    </div>
  );

  return (
    <div
      style={{ backgroundColor: bgColor, color: textColor }}
      className="relative z-40 w-full px-4 py-2 text-center transition-all duration-300 shadow-sm"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 text-center">
          {targetLink ? (
            <Link href={targetLink} className="group inline-block">
              {content}
            </Link>
          ) : (
            content
          )}
        </div>

        {/* Dismiss Button */}
        {top_bar.dismissible !== false && (
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="p-1 -mr-1 rounded hover:bg-black/15 transition-colors flex-shrink-0 opacity-80 hover:opacity-100"
            title="Dismiss"
          >
            <IconX className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

