"use client";

import Link from "next/link";
import { IconShieldCheck, IconTruck, IconTools } from "@tabler/icons-react";

export function TopMenu() {
  return (
    <div className="bg-wbk-black text-wbk-white text-[11px] border-b border-wbk-black/80 font-poppins select-none relative z-50">
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
              Free UK Mainland Delivery
            </span>
            <span className="sm:hidden text-wbk-white/90">
              Free UK Delivery
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            <IconShieldCheck
              size={14}
              className="text-wbk-gold shrink-0"
              strokeWidth={1.5}
            />
            <span className="text-wbk-white/90">
              30-Year Mechanism Warranty
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5">
            <IconTools
              size={14}
              className="text-wbk-gold shrink-0"
              strokeWidth={1.5}
            />
            <span className="text-wbk-white/90">
              Precision Engineered Mechanisms
            </span>
          </div>
        </div>

        {/* Right: Quick secondary links */}
        <div className="flex items-center gap-4 text-xs font-normal">
          <Link
            href="/support/faq"
            className="text-[#A5988E] hover:text-wbk-white transition-colors duration-150"
          >
            FAQ
          </Link>
          <span className="text-white/20">|</span>
          <Link
            href="/support/installation-guides"
            className="text-[#A5988E] hover:text-wbk-white transition-colors duration-150"
          >
            Installation
          </Link>
          <span className="text-white/20">|</span>
          <Link
            href="/about"
            className="text-[#A5988E] hover:text-wbk-white transition-colors duration-150"
          >
            About
          </Link>
          <span className="text-white/20">|</span>
          <Link
            href="/contact"
            className="text-[#A5988E] hover:text-wbk-white transition-colors duration-150"
          >
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}
