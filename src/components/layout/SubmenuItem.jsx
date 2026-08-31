"use client";

import Link from "next/link";
import Image from "next/image";
import {
  IconArrowRight,
  IconArrowsVertical,
  IconArrowsHorizontal,
  IconFrame,
  IconBrush,
  Icon3dCubeSphere,
} from "@tabler/icons-react";

export function SubmenuItem({
  title,
  image,
  href,
  isParent = false,
  tagline,
  orientation,
  type,
  sizeRange,
  price,
  onClick,
}) {
  if (isParent) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className="group flex flex-col h-full justify-between bg-[#F4F2F0] border border-wbk-lightgrey hover:border-wbk-gold transition-all duration-200"
      >
        <div>
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-white border border-wbk-lightgrey/40 mb-3">
            <Image
              src={image}
              alt={title}
              fill
              sizes="240px"
              className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="space-y-2 px-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-wbk-gold block mb-1">
              Category Overview
            </span>
            <h4 className="text-sm font-medium text-wbk-black group-hover:text-wbk-green transition-colors">
              {title}
            </h4>
            {tagline && (
              <p className="text-[11px] text-wbk-brown mt-1 line-clamp-2 leading-relaxed">
                {tagline}
              </p>
            )}
          </div>

          <div className="px-4 py-2 flex items-center gap-1.5 text-xs font-medium text-wbk-black group-hover:text-wbk-green mt-4 border-t border-wbk-lightgrey/60 transition-colors">
            <span>Explore all models</span>
            <IconArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className="group flex flex-col h-full bg-wbk-white border border-wbk-lightgrey/60 hover:border-wbk-black hover:shadow-sm transition-all duration-200"
    >
      {/* Product Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FBF9F8] border-b border-wbk-lightgrey/30 mb-2.5">
        <Image
          src={image}
          alt={title}
          fill
          sizes="240px"
          className="object-contain p-2.5 transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Product Details */}
      <div className="px-3.5 pb-3.5 flex flex-col flex-1 justify-between gap-2">
        <div className="space-y-1.5">
          {/* Title */}
          <h4 className="text-sm font-medium text-wbk-black group-hover:text-wbk-green transition-colors leading-snug">
            {title}
          </h4>

          {/* Orientation & Style tag pills with icons */}
          {(orientation || type) && (
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              {orientation && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#F4F2F0] border border-wbk-lightgrey/60 text-[10px] font-medium text-wbk-black">
                  {orientation.toLowerCase() === "vertical" ? (
                    <IconArrowsVertical size={11} className="text-wbk-green" />
                  ) : (
                    <IconArrowsHorizontal size={11} className="text-wbk-green" />
                  )}
                  <span>{orientation}</span>
                </span>
              )}

              {type && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#F4F2F0] border border-wbk-lightgrey/60 text-[10px] font-medium text-wbk-black">
                  {type.toLowerCase() === "classic" ? (
                    <IconFrame size={11} className="text-wbk-brown" />
                  ) : type.toLowerCase() === "studio" ? (
                    <IconBrush size={11} className="text-wbk-gold" />
                  ) : (
                    <Icon3dCubeSphere size={11} className="text-wbk-green" />
                  )}
                  <span>{type}</span>
                </span>
              )}
            </div>
          )}

          {/* Size range */}
          {sizeRange && (
            <div className="text-[10.5px] text-wbk-brown font-poppins leading-tight pt-0.5">
              <span className="text-wbk-black font-medium">Sizes:</span> {sizeRange}
            </div>
          )}
        </div>

        {/* Starting Price */}
        {price && (
          <div className="text-xs font-poppins text-wbk-black font-semibold pt-1 border-t border-wbk-lightgrey/40">
            {price}
          </div>
        )}
      </div>
    </Link>
  );
}
