"use client";

import Link from "next/link";
import { IconPhone } from "@tabler/icons-react";
import { useLocale } from "@/context/LocaleContext";

export function ContactInfo() {
  const { t } = useLocale();

  return (
    <Link
      href="tel:01928583469"
      className="hidden xl:flex items-center gap-3 py-1 px-2 text-wbk-black hover:text-wbk-green transition-colors group cursor-pointer"
      title={t("header.callSpecialists", "Call our product specialists")}
    >
      <div className="w-8 h-8 flex items-center justify-center bg-[#F4F2F0] border border-wbk-lightgrey/60 text-wbk-black group-hover:bg-wbk-green group-hover:text-wbk-white transition-colors duration-200">
        <IconPhone size={15} strokeWidth={1.5} />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-wbk-brown group-hover:text-wbk-green transition-colors">
          {t("header.specialistAdvice", "Specialist Advice")}
        </span>
        <span className="text-xs font-medium text-wbk-black tracking-wide">
          {t("header.phone", "01928 583 469")}{" "}
          <span className="text-[10px] text-wbk-brown font-normal">
            {t("header.openingHoursParen", "(Mon-Fri 9-20, Sat 9-12)")}
          </span>
        </span>
      </div>
    </Link>
  );
}
