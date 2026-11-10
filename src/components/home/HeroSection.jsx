"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { IconEyeCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/context/LocaleContext";
import { usePromotions } from "@/context/PromotionsContext";
import { getLocalizedCampaignField } from "@/lib/promotions";

export function HeroSection() {
  const { t, locale, localizedHref } = useLocale();
  const { heroCampaigns, loading: promotionsLoading } = usePromotions();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [fontReady, setFontReady] = useState(false);
  const [safetyPassed, setSafetyPassed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const videoRef = useRef(null);

  const hasMultiple = heroCampaigns.length > 1;

  // Mount tracking and font loading check
  useEffect(() => {
    setMounted(true);
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => setFontReady(true));
    } else {
      setFontReady(true);
    }
  }, []);

  // Safety timer so the user is never stuck in loading state (max 1.8 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSafetyPassed(true);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Auto-rotate between active campaigns every 7 seconds
  useEffect(() => {
    if (!hasMultiple || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroCampaigns.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [hasMultiple, isPaused, heroCampaigns.length]);

  // Reset video ready state when switching hero index
  useEffect(() => {
    setVideoReady(false);
  }, [currentIndex]);

  // Helper to check if a URL points to a video file
  const isVideoMedia = (url) => {
    if (!url || typeof url !== "string") return false;
    return /\.(mp4|webm|ogg|mov)($|\?)/i.test(url);
  };

  const activeHero = heroCampaigns[currentIndex] || null;
  const hasPromo = Boolean(activeHero && activeHero.hero_banner?.enabled);

  // If campaign explicitly sets media_type: "image", it is NEVER a video!
  // If media_type is "video", or not specified but video URL is set: it is a video.
  const isVideo =
    hasPromo &&
    activeHero.hero_banner?.media_type !== "image" &&
    (activeHero.hero_banner?.media_type === "video" ||
      isVideoMedia(activeHero.hero_banner?.video) ||
      isVideoMedia(activeHero.hero_banner?.image));

  const mediaSource = isVideo
    ? activeHero.hero_banner?.video || (isVideoMedia(activeHero.hero_banner?.image) ? activeHero.hero_banner?.image : "")
    : "";

  // Custom fallback / poster image for promotional campaigns (from admin fallback field or image field)
  const promoImage =
    hasPromo && activeHero.hero_banner?.image && !isVideoMedia(activeHero.hero_banner.image)
      ? activeHero.hero_banner.image
      : null;

  // Background image:
  // If promo is image-based: promoImage || "/hero2.webp"
  // If promo is video-based: promoImage (only as poster/fallback behind video)
  // If NO promo: "/hero2.webp"
  const backgroundImage = hasPromo
    ? (isVideo ? promoImage : (promoImage || "/hero2.webp"))
    : "/hero2.webp";

  // Autoplay attempt guard
  useEffect(() => {
    if (isVideo && videoRef.current) {
      videoRef.current.play().catch(() => {
        // If autoplay is constrained by browser policy, gracefully mark video ready
        setVideoReady(true);
      });
    }
  }, [isVideo, mediaSource, currentIndex]);

  // Unified Hero Readiness calculation:
  // if video hero: video buffered (or safety passed),
  // and fonts rendered (or safety passed).
  const isHeroReady =
    (!hasPromo || !isVideo || videoReady || safetyPassed) &&
    (fontReady || safetyPassed);

  // Early SSR & initial loading guard:
  // If not mounted or promotions are still being verified, render ONLY the dark loading placeholder
  // with the white circular spinner. Next.js SSR will emit this exact container with ZERO
  // image preloads for /hero2.webp and ZERO default hero texts.
  if (!mounted || (promotionsLoading && !safetyPassed)) {
    return (
      <section className="relative w-full min-h-[75vh] sm:min-h-[85vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#181614]">
        <div className="relative z-10 flex items-center justify-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-[3px] border-white/20 border-t-white animate-spin" />
        </div>
      </section>
    );
  }

  // Promotional details (if active)
  const isPreview = Boolean(activeHero?.isPreview);
  const primaryLink = hasPromo
    ? localizedHref(activeHero.hero_banner?.cta_link || "/products")
    : localizedHref("/products");
  const secondaryLink =
    hasPromo && activeHero.hero_banner?.secondary_cta_link
      ? localizedHref(activeHero.hero_banner.secondary_cta_link)
      : null;

  const badge = hasPromo ? getLocalizedCampaignField(activeHero.hero_banner, "badge", locale) : "";
  const headline = hasPromo
    ? getLocalizedCampaignField(activeHero.hero_banner, "headline", locale)
    : t("home.heroTitle", "Modular Murphy Beds");
  const subtitle = hasPromo
    ? getLocalizedCampaignField(activeHero.hero_banner, "subtitle", locale)
    : t("home.heroSubtitle", "Space-saving, handcrafted wall beds engineered for seamless everyday living.");
  const ctaText = hasPromo
    ? getLocalizedCampaignField(activeHero.hero_banner, "cta_text", locale)
    : t("home.shopCollection", "Shop Collection");
  const secondaryCtaText = hasPromo
    ? getLocalizedCampaignField(activeHero.hero_banner, "secondary_cta_text", locale)
    : "";

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full min-h-[75vh] sm:min-h-[85vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#181614]"
    >
      {/* ── Background Media ── */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Background image (promo fallback image, or default /hero2.webp if no promo) */}
        {backgroundImage && (
          <Image
            src={backgroundImage}
            alt={headline || "WallBedKing"}
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover object-center select-none"
          />
        )}

        {/* Video stream background (if promotional video is configured) */}
        {isVideo && mediaSource && (
          <video
            ref={videoRef}
            key={mediaSource}
            src={mediaSource}
            poster={promoImage || undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onCanPlayThrough={() => setVideoReady(true)}
            onPlaying={() => setVideoReady(true)}
            onLoadedData={() => setVideoReady(true)}
            onError={() => setVideoReady(true)}
            className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
          />
        )}
      </div>

      {/* Dark overlay gradient to ensure high-contrast readability across all media */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/45 to-black/35 pointer-events-none" />

      {/* ── Centered Hero Content ── */}
      {/* Kept 100% invisible until Hero is fully ready, preventing any flash of fallback or basic text */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center text-center w-full max-w-4xl px-4 sm:px-6 py-20 transition-all duration-700 ease-out ${
          isHeroReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        {/* Admin Preview Pill (if in preview status) */}
        {hasPromo && isPreview && (
          <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400 text-amber-950 shadow-md">
            <IconEyeCheck className="w-4 h-4" />
            <span>Admin Preview: Visible only to you, not live to customers!</span>
          </div>
        )}

        {/* Promotion Badge (e.g. Weekend Flash Sale • 15% OFF) */}
        {badge && (
          <div className="mb-4 inline-block px-3.5 py-1 rounded-full bg-[#2D5A27] text-white text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-sm shadow-sm">
            {badge}
          </div>
        )}

        {/* Headline */}
        {headline && (
          <h1 className="font-new-york text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08] text-white drop-shadow-md">
            {headline}
          </h1>
        )}

        {/* Subtitle */}
        {subtitle && (
          <p className="mt-4 text-sm sm:text-base md:text-lg text-white/95 max-w-2xl leading-relaxed drop-shadow-sm font-poppins font-normal">
            {subtitle}
          </p>
        )}

        {/* Call to Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
          {ctaText && (
            <Button
              as="link"
              href={primaryLink}
              variant="primary"
              size="lg"
              className="text-xs font-semibold uppercase tracking-wider py-3.5 px-7 shadow-lg"
            >
              {ctaText}
            </Button>
          )}

          {secondaryLink && secondaryCtaText && (
            <Button
              as="link"
              href={secondaryLink}
              variant="outline"
              size="lg"
              className="text-xs font-semibold uppercase tracking-wider py-3.5 px-7 shadow-lg text-white border-white/60 hover:bg-white/15"
            >
              {secondaryCtaText}
            </Button>
          )}
        </div>
      </div>

      {/* Carousel indicators if multiple active campaigns */}
      {hasMultiple && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {heroCampaigns.map((camp, idx) => (
            <button
              key={camp.id || idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Jump to promotion ${idx + 1}`}
              className={`h-2 transition-all duration-300 rounded-full ${
                idx === currentIndex
                  ? "w-8 bg-white"
                  : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}

      {/* ── Circular Loading Overlay (Körkörös Töltés) ── */}
      {/* Kept on top until media, promotions and fonts are fully ready, then dissolves with silky smooth fade */}
      <div
        className={`absolute inset-0 z-30 flex flex-col items-center justify-center transition-opacity duration-700 ease-out select-none overflow-hidden ${
          isHeroReady ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        aria-hidden={isHeroReady}
      >
        {/* Slightly blurred promotional image (or video first frame) in background if provided */}
        {hasPromo && promoImage && (
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={promoImage}
              alt="Hero Preview"
              fill
              priority
              quality={60}
              sizes="100vw"
              className="object-cover object-center scale-105 filter blur-md select-none"
            />
            {/* Subtle dark backdrop tint overlay for contrast and sleekness */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          </div>
        )}

        {/* Minimalist all-white circular loader */}
        <div className="relative z-10 flex items-center justify-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-[3px] border-white/20 border-t-white animate-spin" />
        </div>
      </div>
    </section>
  );
}
