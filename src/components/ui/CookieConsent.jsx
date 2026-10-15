"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IconCookie, IconSettings } from "@tabler/icons-react";
import { updateConsent } from "@/lib/analytics";
import { useLocale } from "@/context/LocaleContext";

const COOKIE_CONSENT_KEY = "wbk_cookie_consent_v1";

const I18N = {
  en: {
    title: "We value your privacy",
    desc: "Wall Bed King uses cookies to ensure our bed configurator, cart, and secure checkout work seamlessly, and to analyse site traffic and personalise ads in compliance with UK & EU GDPR.",
    privacy: "Read Privacy Policy",
    necessaryTitle: "Strictly Necessary",
    necessaryDesc: "Cart, session security, and language settings (Always Active).",
    analyticsTitle: "Analytics & Performance",
    analyticsDesc: "Helps us understand traffic and popular products (e.g. Google Analytics).",
    marketingTitle: "Marketing & Tracking",
    marketingDesc: "Used for personalised advertising and retargeting (e.g. Meta Pixel, Google Ads).",
    preferences: "Preferences",
    rejectNonEssential: "Reject Non-Essential",
    acceptAll: "Accept All Cookies",
    savePreferences: "Save My Preferences",
  },
  de: {
    title: "Ihre Privatsphäre ist uns wichtig",
    desc: "Wall Bed King verwendet Cookies, um die Kernfunktionen der Website, den Warenkorb und den sicheren Checkout zu gewährleisten sowie den Datenverkehr zu analysieren.",
    privacy: "Datenschutzerklärung",
    necessaryTitle: "Unbedingt erforderlich",
    necessaryDesc: "Warenkorb, Sitzungssicherheit und Spracheinstellungen (Immer aktiv).",
    analyticsTitle: "Analyse-Cookies",
    analyticsDesc: "Hilft uns, den Datenverkehr zu analysieren und beliebte Produkte zu sehen.",
    marketingTitle: "Marketing & Tracking",
    marketingDesc: "Wird für personalisierte Werbung verwendet (z. B. Meta Pixel, Google Ads).",
    preferences: "Einstellungen",
    rejectNonEssential: "Nur notwendige",
    acceptAll: "Alle akzeptieren",
    savePreferences: "Einstellungen speichern",
  },
  fr: {
    title: "Nous respectons votre vie privée",
    desc: "Wall Bed King utilise des cookies pour assurer le bon fonctionnement de notre configurateur, panier et paiement sécurisé, ainsi que pour analyser le trafic.",
    privacy: "Politique de confidentialité",
    necessaryTitle: "Strictement nécessaires",
    necessaryDesc: "Panier, sécurité des sessions et paramètres de langue (Toujours actif).",
    analyticsTitle: "Cookies analytiques",
    analyticsDesc: "Nous aident à analyser le trafic et à mesurer les performances du site.",
    marketingTitle: "Marketing & Suivi",
    marketingDesc: "Utilisés pour la publicité personnalisée et le reciblage (Meta Pixel, Google Ads).",
    preferences: "Préférences",
    rejectNonEssential: "Uniquement nécessaires",
    acceptAll: "Tout accepter",
    savePreferences: "Enregistrer mes préférences",
  },
  it: {
    title: "Rispettiamo la tua privacy",
    desc: "Wall Bed King utilizza i cookie per garantire che il carrello e il checkout sicuro funzionino perfettamente, e per analizzare il traffico del sito.",
    privacy: "Informativa sulla privacy",
    necessaryTitle: "Strettamente necessari",
    necessaryDesc: "Carrello, sicurezza della sessione e impostazioni della lingua (Sempre attivo).",
    analyticsTitle: "Cookie analitici",
    analyticsDesc: "Ci aiutano ad analizzare il traffico e visualizzare i prodotti più popolari.",
    marketingTitle: "Marketing e Tracciamento",
    marketingDesc: "Utilizzati per pubblicità personalizzata e campagne di retargeting (Meta Pixel, Google Ads).",
    preferences: "Preferenze",
    rejectNonEssential: "Solo necessari",
    acceptAll: "Accetta tutti",
    savePreferences: "Salva preferenze",
  },
  es: {
    title: "Valoramos su privacidad",
    desc: "Wall Bed King utiliza cookies para garantizar el funcionamiento del carrito y el pago seguro, así como para analizar el tráfico según el RGPD.",
    privacy: "Política de privacidad",
    necessaryTitle: "Estrictamente necesarias",
    necessaryDesc: "Carrito, seguridad de sesión y configuración de idioma (Siempre activo).",
    analyticsTitle: "Cookies de análisis",
    analyticsDesc: "Nos ayuda a analizar el tráfico y medir el rendimiento del sitio.",
    marketingTitle: "Marketing y Seguimiento",
    marketingDesc: "Se utiliza para publicidad personalizada y retargeting (Meta Pixel, Google Ads).",
    preferences: "Preferencias",
    rejectNonEssential: "Solo necesarias",
    acceptAll: "Aceptar todo",
    savePreferences: "Guardar preferencias",
  },
  por: {
    title: "Valorizamos a sua privacidade",
    desc: "Wall Bed King utiliza cookies para garantir que o cesto e o checkout funcionem perfeitamente, e para analisar o tráfego em conformidade com o RGPD.",
    privacy: "Política de privacidade",
    necessaryTitle: "Estritamente necessários",
    necessaryDesc: "Carrinho, segurança da sessão e definições de idioma (Sempre ativo).",
    analyticsTitle: "Cookies de análise",
    analyticsDesc: "Ajuda-nos a analisar o tráfego e ver os produtos mais populares.",
    marketingTitle: "Marketing e Rastreamento",
    marketingDesc: "Usado para publicidade personalizada e campanhas de retargeting (Meta Pixel, Google Ads).",
    preferences: "Definições",
    rejectNonEssential: "Apenas necessárias",
    acceptAll: "Aceitar tudo",
    savePreferences: "Guardar preferências",
  },
};

export function CookieConsent() {
  const { locale } = useLocale();
  const currentText = I18N[locale] || I18N.en;

  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: true,
    marketing: true,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!stored) {
        // Delay showing slightly for smoother UX
        const timer = setTimeout(() => setIsVisible(true), 800);
        return () => clearTimeout(timer);
      } else {
        const parsed = JSON.parse(stored);
        updateConsent({
          analytics: parsed.analytics === true,
          marketing: parsed.marketing === true,
        });
      }
    } catch {
      // LocalStorage access restricted
    }
  }, []);

  const handleAcceptAll = () => {
    const consent = { necessary: true, analytics: true, marketing: true, timestamp: Date.now() };
    saveConsent(consent);
  };

  const handleRejectNonEssential = () => {
    const consent = { necessary: true, analytics: false, marketing: false, timestamp: Date.now() };
    saveConsent(consent);
  };

  const handleSavePreferences = () => {
    const consent = { ...preferences, necessary: true, timestamp: Date.now() };
    saveConsent(consent);
  };

  const saveConsent = (consent) => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
      // Dispatch Consent Mode v2 and Meta Pixel update
      updateConsent({
        analytics: consent.analytics === true,
        marketing: consent.marketing === true,
      });
    } catch (e) {
      console.warn("Could not store cookie consent", e);
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 bg-white/95 backdrop-blur-md border-t border-wbk-lightgrey shadow-2xl transition-all duration-300 font-poppins text-wbk-black animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div className="flex items-start gap-3.5 max-w-3xl">
          <div className="w-9 h-9 rounded-full bg-wbk-gold/15 text-wbk-gold flex items-center justify-center shrink-0 mt-0.5">
            <IconCookie size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-wbk-black">
              {currentText.title}
            </h3>
            <p className="text-xs text-wbk-brown leading-relaxed">
              {currentText.desc}{" "}
              <Link href={`/${locale}/privacy`} className="underline hover:text-wbk-green transition-colors">
                {currentText.privacy}
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0 justify-end">
          <button
            type="button"
            onClick={() => setShowPreferences((p) => !p)}
            className="px-3.5 py-2 text-xs font-medium border border-wbk-lightgrey text-wbk-brown hover:text-wbk-black hover:border-wbk-black transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <IconSettings size={14} />
            <span>{currentText.preferences}</span>
          </button>

          <button
            type="button"
            onClick={handleRejectNonEssential}
            className="px-4 py-2 text-xs font-medium border border-wbk-lightgrey bg-white text-wbk-black hover:border-wbk-black transition-colors cursor-pointer"
          >
            {currentText.rejectNonEssential}
          </button>

          <button
            type="button"
            onClick={handleAcceptAll}
            className="px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-wbk-black text-white hover:bg-wbk-gold hover:text-wbk-black transition-colors shadow-xs cursor-pointer"
          >
            {currentText.acceptAll}
          </button>
        </div>
      </div>

      {/* Preferences Drawer / Modal Details */}
      {showPreferences && (
        <div className="max-w-6xl mx-auto mt-4 pt-4 border-t border-wbk-lightgrey/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <label className="flex items-start gap-2.5 p-3 bg-[#FBF9F8] border border-wbk-lightgrey/60">
            <input type="checkbox" checked disabled className="mt-0.5 accent-wbk-black" />
            <div>
              <span className="font-semibold block text-wbk-black">{currentText.necessaryTitle}</span>
              <span className="text-[11px] text-wbk-brown">{currentText.necessaryDesc}</span>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-3 bg-white border border-wbk-lightgrey/60 cursor-pointer hover:border-wbk-black transition-colors">
            <input
              type="checkbox"
              checked={preferences.analytics}
              onChange={(e) => setPreferences((p) => ({ ...p, analytics: e.target.checked }))}
              className="mt-0.5 accent-wbk-black cursor-pointer"
            />
            <div>
              <span className="font-semibold block text-wbk-black">{currentText.analyticsTitle}</span>
              <span className="text-[11px] text-wbk-brown">{currentText.analyticsDesc}</span>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-3 bg-white border border-wbk-lightgrey/60 cursor-pointer hover:border-wbk-black transition-colors">
            <input
              type="checkbox"
              checked={preferences.marketing}
              onChange={(e) => setPreferences((p) => ({ ...p, marketing: e.target.checked }))}
              className="mt-0.5 accent-wbk-black cursor-pointer"
            />
            <div>
              <span className="font-semibold block text-wbk-black">{currentText.marketingTitle}</span>
              <span className="text-[11px] text-wbk-brown">{currentText.marketingDesc}</span>
            </div>
          </label>

          <div className="flex items-center justify-end sm:col-span-3 pt-2">
            <button
              type="button"
              onClick={handleSavePreferences}
              className="px-5 py-2 text-xs font-semibold bg-wbk-black text-white hover:bg-wbk-gold hover:text-wbk-black transition-colors cursor-pointer"
            >
              {currentText.savePreferences}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
