"use client";

import { IconPhone } from "@tabler/icons-react";
import { useLocale } from "@/context/LocaleContext";

export function ContactInfo() {
  const { t, market } = useLocale();

  const phone = market?.phone || t("header.phone", "01928 583 469");
  const phoneRaw = market?.phoneRaw || t("header.phoneRaw", "+441928583469");

  return (
    <a
      href={`tel:${phoneRaw}`}
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
          {phone}{" "}
          <span className="text-[10px] text-wbk-brown font-normal">
            {t("header.openingHoursParen", "(Mon-Fri 9-20, Sat 9-12)")}
          </span>
        </span>
      </div>
    </a>
  );
}
