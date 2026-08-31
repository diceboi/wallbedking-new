"use client";

import Link from "next/link";
import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";

export function SubmenuItem({ title, image, href, badge, isParent = false, tagline, onClick }) {
  if (isParent) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className="group flex flex-col h-full justify-between p-4 bg-[#F4F2F0] border border-wbk-lightgrey hover:border-wbk-gold transition-all duration-200"
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

        <div className="flex items-center gap-1.5 text-xs font-medium text-wbk-black group-hover:text-wbk-green mt-4 pt-3 border-t border-wbk-lightgrey/60 transition-colors">
          <span>Explore all models</span>
          <IconArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className="group flex flex-col h-full justify-between p-3.5 bg-wbk-white border border-wbk-lightgrey/60 hover:border-wbk-black hover:shadow-sm transition-all duration-200"
    >
      <div>
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FBF9F8] border border-wbk-lightgrey/30 mb-3">
          <Image
            src={image}
            alt={title}
            fill
            sizes="240px"
            className="object-contain p-2.5 transition-transform duration-500 group-hover:scale-105"
          />
          {badge && (
            <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[9px] font-semibold tracking-widest uppercase bg-wbk-black text-wbk-white">
              {badge}
            </span>
          )}
        </div>
        <h4 className="text-xs font-medium text-wbk-black group-hover:text-wbk-green transition-colors leading-snug">
          {title}
        </h4>
      </div>

      <div className="flex items-center gap-1 text-[11px] text-wbk-brown group-hover:text-wbk-green mt-3 transition-colors">
        <span>View details</span>
        <IconArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}
