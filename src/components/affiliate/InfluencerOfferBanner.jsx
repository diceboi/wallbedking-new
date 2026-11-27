"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { IconX, IconShoppingBag, IconTrash } from "@tabler/icons-react";
import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleContext";

const WELCOME_I18N = {
  en: {
    badge: "Partner Offer Active",
    headline: (disc, name) => `Thanks to ${name}, you'll get ${disc} OFF everything!`,
    sub: "Your discount is automatically applied in your cart. You can change or remove it anytime in your cart or at checkout.",
    remove: "Remove offer",
    cta: "Start Shopping",
  },
  us: {
    badge: "Partner Offer Active",
    headline: (disc, name) => `Thanks to ${name}, you'll get ${disc} OFF everything!`,
    sub: "Your discount is automatically applied in your cart. You can change or remove it anytime in your cart or at checkout.",
    remove: "Remove offer",
    cta: "Start Shopping",
  },
  de: {
    badge: "Partner-Rabatt aktiv",
    headline: (disc, name) => `Dank ${name} erhältst du ${disc} Rabatt auf alles!`,
    sub: "Dein Rabatt ist automatisch in deinem Warenkorb hinterlegt und kann dort oder an der Kasse jederzeit geändert oder entfernt werden.",
    remove: "Rabatt entfernen",
    cta: "Jetzt shoppen",
  },
  fr: {
    badge: "Offre partenaire active",
    headline: (disc, name) => `Grâce à ${name}, profitez de -${disc} sur tout !`,
    sub: "Votre remise est automatiquement appliquée dans votre panier. Vous pouvez la modifier ou la supprimer à tout moment dans le panier ou lors du paiement.",
    remove: "Retirer l'offre",
    cta: "Commencer mes achats",
  },
  es: {
    badge: "Oferta de colaborador activa",
    headline: (disc, name) => `¡Gracias a ${name}, tienes un ${disc} de descuento en todo!`,
    sub: "Tu descuento se aplica automáticamente en tu carrito. Puedes cambiarlo o eliminarlo en cualquier momento en el carrito o al finalizar la compra.",
    remove: "Quitar oferta",
    cta: "Empezar a comprar",
  },
  it: {
    badge: "Offerta partner attiva",
    headline: (disc, name) => `Grazie a ${name}, hai il ${disc} di sconto su tutto!`,
    sub: "Lo sconto è applicato automaticamente nel carrello. Puoi modificarlo o rimuoverlo in qualsiasi momento nel carrello o al checkout.",
    remove: "Rimuovi offerta",
    cta: "Inizia lo shopping",
  },
  por: {
    badge: "Oferta de parceiro ativa",
    headline: (disc, name) => `Graças a ${name}, tem ${disc} de desconto em tudo!`,
    sub: "O desconto está aplicado automaticamente no seu carrinho. Pode alterá-lo ou removê-lo a qualquer momento no carrinho ou no checkout.",
    remove: "Remover oferta",
    cta: "Começar a comprar",
  },
};

function InfluencerOfferInner() {
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const { locale, market, localizedHref } = useLocale();
  const {
    promoCode,
    appliedCoupon,
    activateAffiliateOffer,
    removePromoCode,
    isMounted,
  } = useCart();

  const [cardVisible, setCardVisible] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [directOffer, setDirectOffer] = useState(null);
  const autoCloseTimerRef = useRef(null);
  const hadPromoRef = useRef(false);

  const isExcludedRoute =
    pathname.startsWith("/admin") ||
    /^\/([a-z]{2,3}\/)?wholesale(\/|$)/i.test(pathname);

  const showCardFor10s = () => {
    setCardVisible(true);
    setTimerKey((k) => k + 1);
    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    autoCloseTimerRef.current = setTimeout(() => {
      setCardVisible(false);
    }, 10000);
  };

  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    };
  }, []);

  // 1. Detect explicit ?ref=CODE or ?coupon=CODE in URL — ALWAYS show the welcome card on arrival!
  useEffect(() => {
    if (!isMounted || isExcludedRoute) return;
    const rawRef = searchParams?.get("ref") || searchParams?.get("coupon") || "";
    const cleanRef = rawRef.trim().toUpperCase();
    if (!cleanRef) return;

    const sessionClickKey = `wbk_aff_clicked_${cleanRef}`;
    let alreadyClickedThisSession = false;
    try {
      alreadyClickedThisSession = sessionStorage.getItem(sessionClickKey) === "1";
    } catch {}

    let cancelled = false;
    async function trackAndApply() {
      try {
        const res = await fetch("/api/affiliate/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: cleanRef,
            locale,
            currency:
              market?.currency ||
              (locale === "us" ? "USD" : locale === "en" ? "GBP" : "EUR"),
            landingPath: pathname,
            skipClickIncrement: alreadyClickedThisSession,
          }),
        });
        const data = await res.json();
        if (!cancelled && data?.success && data?.found && data?.offer) {
          try {
            sessionStorage.setItem(sessionClickKey, "1");
            sessionStorage.setItem(`wbk_aff_welcome_${data.offer.code}`, "1");
          } catch {}
          setDirectOffer(data.offer);
          activateAffiliateOffer(data.offer);
          showCardFor10s();
        } else if (!cancelled) {
          setDirectOffer(null);
          setCardVisible(false);
        }
      } catch (err) {
        console.warn("[InfluencerOfferBanner] track error:", err?.message);
      }
    }

    trackAndApply();
    return () => {
      cancelled = true;
    };
  }, [
    searchParams,
    isMounted,
    isExcludedRoute,
    locale,
    market?.currency,
    pathname,
    activateAffiliateOffer,
  ]);

  // 2. Returning visitor in a fresh session (no ?ref= in URL) with an eligible persisted influencer offer
  useEffect(() => {
    if (!isMounted || isExcludedRoute) return;

    if (promoCode && appliedCoupon?.is_influencer) {
      hadPromoRef.current = true;
      const welcomeKey = `wbk_aff_welcome_${appliedCoupon.code}`;
      try {
        if (sessionStorage.getItem(welcomeKey) !== "1") {
          sessionStorage.setItem(welcomeKey, "1");
          showCardFor10s();
        }
      } catch {}
    } else if (hadPromoRef.current) {
      // Promo was removed or became ineligible in a new country -> hide card immediately
      hadPromoRef.current = false;
      setDirectOffer(null);
      setCardVisible(false);
    }
  }, [isMounted, isExcludedRoute, promoCode, appliedCoupon]);

  const activeOffer = (promoCode && appliedCoupon?.is_influencer ? appliedCoupon : null) || directOffer;

  // Enforce market eligibility on directOffer too
  const offerEligibleForLocale = (() => {
    if (!activeOffer) return false;
    const markets = activeOffer.target_markets;
    if (!Array.isArray(markets) || markets.length === 0) return true;
    return markets.map((m) => String(m).toLowerCase()).includes(String(locale || "en").toLowerCase());
  })();

  if (!isMounted || isExcludedRoute || !activeOffer || !offerEligibleForLocale) {
    return null;
  }

  const locKey = WELCOME_I18N[locale] ? locale : "en";
  const tr = WELCOME_I18N[locKey];
  const displayName =
    activeOffer.influencer_name || activeOffer.influencer_handle || activeOffer.code;
  const discountLabel =
    activeOffer.discountLabel ||
    (activeOffer.discount_type === "fixed"
      ? `${market?.symbol || "£"}${activeOffer.discount_value || 0}`
      : `${activeOffer.discount_value || 0}%`);

  const headlineText = activeOffer.influencer_message
    ? activeOffer.influencer_message
    : tr.headline(discountLabel, displayName);

  const initials = (displayName[0] || "W").toUpperCase();

  return (
    <AnimatePresence>
      {cardVisible && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.22 }}
          className="fixed right-3 sm:right-5 z-50 w-[305px] sm:w-80 bg-white border border-wbk-lightgrey shadow-2xl text-wbk-black font-poppins overflow-hidden"
          style={{ top: "calc(var(--header-height, 68px) + 12px)" }}
        >
          <div className="p-4 sm:p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-wbk-gold shrink-0 bg-[#FAF5EA] flex items-center justify-center">
                {activeOffer.influencer_avatar ? (
                  <img
                    src={activeOffer.influencer_avatar}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-wbk-black">{initials}</span>
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-wbk-green block">
                  {tr.badge}
                </span>
                <div className="text-xs font-bold text-wbk-black">
                  {displayName}
                  {activeOffer.influencer_handle
                    ? ` (${activeOffer.influencer_handle})`
                    : ""}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
                setCardVisible(false);
              }}
              aria-label="Close"
              className="text-wbk-brown hover:text-wbk-black cursor-pointer p-0.5"
            >
              <IconX size={16} />
            </button>
          </div>

          <p className="text-sm text-wbk-black leading-snug font-medium">
            {headlineText}
          </p>
          <p className="text-[11px] text-wbk-brown leading-relaxed">{tr.sub}</p>

          <div className="flex items-center gap-2 pt-1">
            <Link
              href={localizedHref("/products")}
              onClick={() => {
                if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
                setCardVisible(false);
              }}
              className="flex-1 py-2.5 px-4 bg-wbk-black hover:bg-wbk-green hover:text-wbk-black text-white text-[11px] font-semibold uppercase tracking-wider text-center rounded-full inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <IconShoppingBag size={14} />
              <span>{tr.cta}</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
                setDirectOffer(null);
                setCardVisible(false);
                removePromoCode();
              }}
              className="w-9 h-9 border border-wbk-lightgrey hover:border-red-500 text-red-600 rounded-full inline-flex items-center justify-center cursor-pointer shrink-0 transition-colors"
              title={tr.remove}
            >
              <IconTrash size={14} />
            </button>
          </div>
          </div>

          <div className="h-1 w-full bg-wbk-lightgrey/40 overflow-hidden">
            <motion.div
              key={timerKey}
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 10, ease: "linear" }}
              className="h-full w-full bg-wbk-gold origin-left"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function InfluencerOfferBanner() {
  return (
    <Suspense fallback={null}>
      <InfluencerOfferInner />
    </Suspense>
  );
}
