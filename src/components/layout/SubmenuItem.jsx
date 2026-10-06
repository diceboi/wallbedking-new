"use client";

import Link from "next/link";
import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { useLocale } from "@/context/LocaleContext";

export function SubmenuItem({
  title,
  titleKey,
  image,
  hoverImage,
  href,
  isParent = false,
  tagline,
  taglineKey,
  price,
  compact = false,
  onClick,
}) {
  const { localizedHref, t, formatPrice } = useLocale();
  const targetLink = localizedHref(href);

  const displayTitle = titleKey ? t(titleKey, title) : title;
  const displayTagline = taglineKey ? t(taglineKey, tagline) : tagline;

  const isMorphyImage = typeof image === "string" && image.includes("MORPHY");
  const isIntegratedImage =
    typeof image === "string" &&
    (image.includes("-IV-") || image.includes("-IH-"));
  const scaleClass = isIntegratedImage
    ? "scale-[1.2]"
    : isMorphyImage
      ? "scale-[1.3]"
      : "scale-[1.05]";

  if (isParent) {
    if (compact) {
      return (
        <Link
          href={targetLink}
          onClick={onClick}
          className="group flex flex-col h-full justify-between bg-[#F4F2F0] border border-wbk-lightgrey hover:border-wbk-gold transition-all duration-200"
        >
          <div>
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-white border-b border-wbk-lightgrey/40 mb-1.5 flex items-center justify-center p-0.5">
              <Image
                src={image}
                alt={displayTitle}
                fill
                sizes="210px"
                className={`object-contain transition-all duration-300 ${scaleClass} ${
                  hoverImage
                    ? "group-hover:opacity-0"
                    : "group-hover:scale-[1.42]"
                }`}
              />
              {hoverImage && (
                <Image
                  src={hoverImage}
                  alt={`${displayTitle} - with mattress`}
                  fill
                  sizes="210px"
                  className={`object-contain opacity-0 group-hover:opacity-100 transition-all duration-300 ${scaleClass} group-hover:scale-[1.42]`}
                />
              )}
            </div>
            <div className="space-y-0.5 px-2.5">
              <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-wbk-gold block">
                {t("nav.categoryOverview", "Category Overview")}
              </span>
              <h4 className="text-[12.5px] font-medium text-wbk-black group-hover:text-wbk-green transition-colors leading-snug line-clamp-2">
                {displayTitle}
              </h4>
            </div>
          </div>

          <div className="px-2.5 py-1.5 flex items-center justify-between text-[11px] font-medium text-wbk-black group-hover:text-wbk-green mt-2 border-t border-wbk-lightgrey/60 transition-colors">
            <span>{t("nav.exploreAll", "Explore all")}</span>
            <IconArrowRight
              size={13}
              className="group-hover:translate-x-1 transition-transform"
            />
          </div>
        </Link>
      );
    }

    return (
      <Link
        href={targetLink}
        onClick={onClick}
        className="group flex flex-col h-full justify-between bg-[#F4F2F0] border border-wbk-lightgrey hover:border-wbk-gold transition-all duration-200"
      >
        <div>
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-white border border-wbk-lightgrey/40 mb-3 flex items-center justify-center p-1">
            <Image
              src={image}
              alt={displayTitle}
              fill
              sizes="240px"
              className={`object-contain transition-all duration-300 ${scaleClass} ${
                hoverImage
                  ? "group-hover:opacity-0"
                  : "group-hover:scale-[1.42]"
              }`}
            />
            {hoverImage && (
              <Image
                src={hoverImage}
                alt={`${displayTitle} - with mattress`}
                fill
                sizes="240px"
                className={`object-contain opacity-0 group-hover:opacity-100 transition-all duration-300 ${scaleClass} group-hover:scale-[1.42]`}
              />
            )}
          </div>
          <div className="space-y-1.5 px-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-wbk-gold block">
              {t("nav.categoryOverview", "Category Overview")}
            </span>
            <h4 className="text-sm font-medium text-wbk-black group-hover:text-wbk-green transition-colors leading-snug">
              {displayTitle}
            </h4>
            {displayTagline && (
              <p className="text-[11px] text-wbk-brown line-clamp-2 leading-relaxed">
                {displayTagline}
              </p>
            )}
          </div>
        </div>

        <div className="px-4 py-2 flex items-center gap-1.5 text-xs font-medium text-wbk-black group-hover:text-wbk-green mt-4 border-t border-wbk-lightgrey/60 transition-colors">
          <span>{t("nav.exploreAll", "Explore all models")}</span>
          <IconArrowRight
            size={14}
            className="group-hover:translate-x-1 transition-transform"
          />
        </div>
      </Link>
    );
  }

  const formattedPrice =
    price && price.includes("£")
      ? `${t("common.from", "from")} ${formatPrice(Number(price.replace(/[^0-9]/g, "")))}`
      : price;

  return (
    <Link
      href={targetLink}
      onClick={onClick}
      className={`group flex flex-col h-full bg-wbk-white border border-wbk-lightgrey/60 hover:border-wbk-black hover:shadow-sm transition-all duration-200 ${
        compact ? "p-0" : ""
      }`}
    >
      {/* Product Image */}
      <div
        className={`relative ${
          compact ? "aspect-[16/10] mb-1.5" : "aspect-[4/3] mb-2.5"
        } w-full overflow-hidden bg-[#FBF9F8] border-b border-wbk-lightgrey/30 flex items-center justify-center p-0.5`}
      >
        <Image
          src={image}
          alt={displayTitle}
          fill
          sizes={compact ? "210px" : "240px"}
          className={`object-contain transition-all duration-300 ${scaleClass} ${
            hoverImage ? "group-hover:opacity-0" : "group-hover:scale-[1.42]"
          }`}
        />
        {hoverImage && (
          <Image
            src={hoverImage}
            alt={`${displayTitle} with mattress`}
            fill
            sizes={compact ? "210px" : "240px"}
            className={`object-contain opacity-0 group-hover:opacity-100 transition-all duration-300 ${scaleClass} group-hover:scale-[1.42]`}
          />
        )}
      </div>

      {/* Product Details */}
      <div
        className={`${
          compact ? "px-2.5 pb-2.5" : "px-3.5 pb-3.5"
        } flex flex-col flex-1 justify-between gap-1.5`}
      >
        <div>
          {/* Title */}
          <h4
            className={`${
              compact ? "text-[12.5px]" : "text-sm"
            } font-medium text-wbk-black group-hover:text-wbk-green transition-colors leading-snug line-clamp-2`}
          >
            {displayTitle}
          </h4>
        </div>

        {/* Starting Price */}
        {price && (
          <div
            className={`${
              compact ? "text-[11px]" : "text-xs"
            } font-poppins text-wbk-black font-semibold pt-1 border-t border-wbk-lightgrey/40`}
          >
            {formattedPrice}
          </div>
        )}
      </div>
    </Link>
  );
}
