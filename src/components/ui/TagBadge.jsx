"use client";

import {
  IconFlame,
  IconSparkles,
  IconArrowsMaximize,
  IconCrown,
  IconTruck,
  IconTag,
  IconStar,
  IconAward,
} from "@tabler/icons-react";
import { getTagMeta, getLocalizedTagName, getTagIconName } from "@/lib/tags";

/**
 * Returns the matching Tabler icon component for a tag based on its slug or explicit icon name.
 */
export function TagIcon({ tagIdOrSlug, iconName, size = 12, className = "", stroke = 1.8 }) {
  const resolved = iconName || getTagIconName(tagIdOrSlug);

  switch (resolved) {
    case "flame":
    case "best-seller":
      return <IconFlame size={size} stroke={stroke} className={className} />;
    case "sparkles":
    case "new-arrival":
      return <IconSparkles size={size} stroke={stroke} className={className} />;
    case "maximize":
    case "space-saver":
      return <IconArrowsMaximize size={size} stroke={stroke} className={className} />;
    case "crown":
    case "premium":
      return <IconCrown size={size} stroke={stroke} className={className} />;
    case "truck":
    case "quick-ship":
      return <IconTruck size={size} stroke={stroke} className={className} />;
    case "star":
      return <IconStar size={size} stroke={stroke} className={className} />;
    case "award":
      return <IconAward size={size} stroke={stroke} className={className} />;
    case "tag":
    case "sale":
    default:
      return <IconTag size={size} stroke={stroke} className={className} />;
  }
}

/**
 * Clean, luxury monochromatic tag badge for the WallBedKing storefront.
 * Uses refined icons instead of loud colors to fit the architectural, premium aesthetic.
 */
export function TagBadge({
  tagIdOrSlug,
  locale = "en",
  variant = "micro",
  className = "",
  showIcon = true,
}) {
  const meta = getTagMeta(tagIdOrSlug);
  if (!meta) return null;

  const label = getLocalizedTagName(meta.id, locale);

  if (variant === "corner") {
    return (
      <span
        className={`absolute top-0 right-0 px-2.5 py-1 text-[10px] sm:text-[11px] font-medium uppercase tracking-wider z-10 select-none border-b border-l border-wbk-lightgrey/80 bg-white/95 backdrop-blur-xs text-wbk-black shadow-2xs inline-flex items-center gap-1.5 ${className}`}
      >
        {showIcon && <TagIcon tagIdOrSlug={meta.id} size={11} className="text-wbk-black/80 shrink-0" />}
        <span>{label}</span>
      </span>
    );
  }

  if (variant === "pdp") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F2F0] border border-[#E7E2DD] text-[11px] uppercase tracking-wider font-medium text-wbk-black select-none shadow-2xs ${className}`}
      >
        {showIcon && <TagIcon tagIdOrSlug={meta.id} size={12} className="text-wbk-black/80 shrink-0" />}
        <span>{label}</span>
      </span>
    );
  }

  // Default: "micro" badge for card details
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F4F2F0] border border-[#E7E2DD] text-[10px] sm:text-[11px] font-medium tracking-wide uppercase text-wbk-black select-none ${className}`}
    >
      {showIcon && <TagIcon tagIdOrSlug={meta.id} size={10.5} className="text-wbk-black/75 shrink-0" />}
      <span>{label}</span>
    </span>
  );
}
