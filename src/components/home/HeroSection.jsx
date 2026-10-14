"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/context/LocaleContext";

export function HeroSection() {
  const { t, localizedHref } = useLocale();

  return (
    <section className="relative w-full min-h-[75vh] sm:min-h-[85vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Hero Image */}
      <Image
        src="/hero2.webp"
        alt="WallBedKing Modern Modular Murphy Bed"
        fill
        priority
        quality={90}
        sizes="100vw"
        className="object-cover object-center select-none"
      />

      {/* Dark overlay gradient to ensure high-contrast readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/35 to-black/30" />

      {/* Centered Hero Text & Call to Actions */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center w-full max-w-3xl px-4 sm:px-6 py-20">
        <h1 className="font-new-york text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08] text-white drop-shadow-md">
          {t("home.heroTitle", "Modular Murphy Beds")}
        </h1>
        <p className="mt-4 text-sm sm:text-base md:text-lg text-white/95 max-w-xl leading-relaxed drop-shadow-sm font-poppins font-normal">
          {t(
            "home.heroSubtitle",
            "Space-saving, handcrafted wall beds engineered for seamless everyday living.",
          )}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
          <Button
            as="link"
            href={localizedHref("/products/beds")}
            variant="black"
            size="lg"
            className="text-xs font-semibold uppercase tracking-wider py-3.5 px-7 shadow-lg"
          >
            {t("home.shopCollection", "Shop Collection")}
          </Button>
        </div>
      </div>
    </section>
  );
}
