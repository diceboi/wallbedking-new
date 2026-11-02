"use client";

import { IconPhone } from "@tabler/icons-react";
import { useLocale } from "@/context/LocaleContext";
import { ProtectedContact } from "@/components/ui/ProtectedContact";

// Temporarily hide phone numbers from navigation as requested
const SHOW_NAV_PHONE = false;

export function ContactInfo() {
  const { t } = useLocale();

  if (!SHOW_NAV_PHONE) {
    return null;
  }

  return (
    <div
      className="hidden xl:flex items-center gap-3 py-1 px-2 text-wbk-black"
      title={t("header.callSpecialists", "Call our product specialists")}
    >
      <div className="w-8 h-8 flex items-center justify-center bg-[#F4F2F0] border border-wbk-lightgrey/60 text-wbk-black">
        <IconPhone size={15} strokeWidth={1.5} />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-wbk-brown">
          {t("header.specialistAdvice", "Specialist Advice")}
        </span>
        <div className="flex items-center gap-1.5">
          <ProtectedContact type="phone" variant="inline" />
          <span className="text-[10px] text-wbk-brown font-normal">
            {t("header.openingHoursParen", "(Mon-Fri 9-20, Sat 9-12)")}
          </span>
        </div>
      </div>
    </div>
  );
}
