"use client";

import { useState, useCallback, Fragment } from "react";
import {
  IconEye,
  IconCopy,
  IconCheck,
  IconLoader2,
  IconMail,
  IconPhoneCall,
} from "@tabler/icons-react";
import { useLocale } from "@/context/LocaleContext";

// In-memory cache per browser tab session (never present in SSR HTML or bundle)
const sessionRevealedCache = new Map();

/**
 * 1-Click ("Click-to-Reveal") protection for email addresses and phone numbers.
 * Prevents scraper bots from harvesting raw contact strings or mailto:/tel: links
 * from SSR HTML or JavaScript bundles while giving real customers 1-click access + copy.
 */
export function ProtectedContact({
  type = "email", // "email" | "phone"
  variant = "default", // "default" | "inline" | "compact"
  showIcon = false,
  includeBothFormats = false,
  className = "",
}) {
  const { locale, t } = useLocale();
  const cacheKey = `${type}:${locale || "en"}`;

  const [revealed, setRevealed] = useState(
    () => sessionRevealedCache.get(cacheKey) || null
  );
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  const isEmail = type === "email";
  const isUk = String(locale || "en").toLowerCase() === "en";

  const maskedPreview = isEmail
    ? "support@••••••••.com"
    : isUk
    ? "01928 ••• •••"
    : "+44 1928 ••• •••";

  const actionLabel = isEmail
    ? t("security.showEmail", "Show email")
    : t("security.showPhone", "Show number");

  const handleReveal = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const cached = sessionRevealedCache.get(cacheKey);
      if (cached) {
        setRevealed(cached);
        return;
      }

      setLoading(true);
      setError(false);
      try {
        const res = await fetch("/api/contact/reveal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            locale: locale || "en",
            humanClick: true,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data?.success || !data?.value) {
          throw new Error(data?.error || "Reveal failed");
        }

        sessionRevealedCache.set(cacheKey, data);
        setRevealed(data);
      } catch (err) {
        console.error("[ProtectedContact] Could not reveal contact:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [cacheKey, locale, type]
  );

  const handleCopy = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!revealed?.value) return;
      try {
        await navigator.clipboard.writeText(revealed.value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard API fallback ignored
      }
    },
    [revealed]
  );

  const IconComp = isEmail ? IconMail : IconPhoneCall;

  // ── Revealed State (Clickable mailto:/tel: + 1-click Copy) ──
  if (revealed?.value) {
    if (variant === "inline") {
      return (
        <span
          className={`inline-flex flex-wrap items-center gap-1.5 align-baseline ${className}`}
        >
          <a
            href={revealed.href}
            className="font-semibold text-wbk-black underline decoration-wbk-gold/70 underline-offset-2 hover:text-wbk-green transition-colors"
          >
            {revealed.value}
          </a>
          {includeBothFormats && !isEmail && (
            <span className="text-wbk-brown text-[0.92em]">
              ({isUk ? `Int: ${revealed.international}` : `UK: ${revealed.ukLocal}`})
            </span>
          )}
          <button
            type="button"
            onClick={handleCopy}
            title={t("security.copy", "Copy")}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-[#F4F2F0] hover:bg-wbk-black text-wbk-black hover:text-white border border-wbk-lightgrey/80 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <IconCheck size={11} className="text-emerald-600" />
                <span>{t("security.copied", "Copied")}</span>
              </>
            ) : (
              <>
                <IconCopy size={11} />
                <span>{t("security.copy", "Copy")}</span>
              </>
            )}
          </button>
        </span>
      );
    }

    return (
      <span className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
        <a
          href={revealed.href}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-wbk-black hover:text-wbk-green transition-colors"
        >
          {showIcon && <IconComp size={14} className="text-wbk-gold shrink-0" />}
          <span>{revealed.value}</span>
        </a>
        {includeBothFormats && !isEmail && (
          <span className="text-xs text-wbk-brown">
            ({isUk ? revealed.international : `UK: ${revealed.ukLocal}`})
          </span>
        )}
        <button
          type="button"
          onClick={handleCopy}
          title={t("security.copy", "Copy")}
          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-[#F4F2F0] hover:bg-wbk-black text-wbk-black hover:text-white border border-wbk-lightgrey transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <IconCheck size={12} className="text-emerald-600" />
              <span>{t("security.copied", "Copied")}</span>
            </>
          ) : (
            <>
              <IconCopy size={12} />
              <span>{t("security.copy", "Copy")}</span>
            </>
          )}
        </button>
      </span>
    );
  }

  // ── Unrevealed State (Masked + 1-Click Reveal Button) ──
  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={handleReveal}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 mx-0.5 text-xs font-medium bg-[#F4F2F0] hover:bg-wbk-black text-wbk-black hover:text-white border border-wbk-lightgrey transition-colors cursor-pointer align-baseline ${className}`}
      >
        <span className="font-mono text-[11px] tracking-tight opacity-80">
          {maskedPreview}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-wbk-gold">
          {loading ? (
            <IconLoader2 size={11} className="animate-spin" />
          ) : (
            <IconEye size={12} />
          )}
          <span>{error ? t("security.retry", "Retry") : actionLabel}</span>
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleReveal}
      disabled={loading}
      className={`group inline-flex flex-wrap items-center gap-2 text-left cursor-pointer disabled:opacity-60 ${className}`}
    >
      {showIcon && <IconComp size={14} className="text-wbk-gold shrink-0" />}
      <span className="text-xs sm:text-sm font-semibold text-wbk-black/80 group-hover:text-wbk-black tracking-tight">
        {maskedPreview}
      </span>
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider bg-[#F4F2F0] group-hover:bg-wbk-black text-wbk-black group-hover:text-white border border-wbk-lightgrey transition-colors">
        {loading ? (
          <IconLoader2 size={12} className="animate-spin text-wbk-gold" />
        ) : (
          <IconEye size={13} className="text-wbk-gold" />
        )}
        <span>{error ? t("security.retry", "Retry") : actionLabel}</span>
      </span>
    </button>
  );
}

/**
 * Replaces {{PROTECTED_PHONE}} and {{PROTECTED_EMAIL}} / {{EMAIL}} placeholders
 * inside localized prose strings with inline 1-click <ProtectedContact /> badges.
 */
export function renderProtectedTokens(text) {
  if (!text || typeof text !== "string") return text;

  const TOKEN_REGEX = /(\{\{PROTECTED_PHONE\}\}|\{\{PROTECTED_EMAIL\}\}|\{\{EMAIL\}\})/g;
  if (!TOKEN_REGEX.test(text)) return text;

  const parts = text.split(TOKEN_REGEX);
  return parts.map((part, idx) => {
    if (part === "{{PROTECTED_PHONE}}") {
      return (
        <ProtectedContact
          key={`phone-${idx}`}
          type="phone"
          variant="inline"
          includeBothFormats
        />
      );
    }
    if (part === "{{PROTECTED_EMAIL}}" || part === "{{EMAIL}}") {
      return (
        <ProtectedContact
          key={`email-${idx}`}
          type="email"
          variant="inline"
        />
      );
    }
    return <Fragment key={`txt-${idx}`}>{part}</Fragment>;
  });
}
