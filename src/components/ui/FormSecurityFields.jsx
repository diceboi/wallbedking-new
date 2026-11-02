"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { useLocale } from "@/context/LocaleContext";

export const TURNSTILE_SITE_KEY = (
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""
).trim();

function mapLocaleToTurnstileLang(locale) {
  const norm = String(locale || "en").toLowerCase();
  if (norm === "us" || norm === "en") return "en";
  if (norm === "por" || norm === "pt") return "pt";
  if (["de", "fr", "es", "it"].includes(norm)) return norm;
  return "auto";
}

/**
 * Hook managing Cloudflare Turnstile token, autofill-safe honeypot trap, and fill-time tracking.
 */
export function useFormSecurity() {
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileError, setTurnstileError] = useState("");
  const turnstileRef = useRef(null);
  const startedAtRef = useRef(Date.now());

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  const resetSecurity = useCallback(() => {
    setTurnstileToken("");
    setTurnstileError("");
    setHoneypot("");
    startedAtRef.current = Date.now();
    try {
      turnstileRef.current?.reset?.();
    } catch {
      // Ignore if widget is not mounted
    }
  }, []);

  const resetTurnstileOnly = useCallback(() => {
    setTurnstileToken("");
    setTurnstileError("");
    try {
      turnstileRef.current?.reset?.();
    } catch {
      // Ignore if widget is not mounted
    }
  }, []);

  const getSecurityPayload = useCallback(() => {
    return {
      turnstileToken: turnstileToken || undefined,
      _hp: honeypot || "",
      _fillDurationMs: Math.max(0, Date.now() - startedAtRef.current),
    };
  }, [turnstileToken, honeypot]);

  const isTurnstileReady = !TURNSTILE_SITE_KEY || Boolean(turnstileToken);

  return {
    honeypot,
    setHoneypot,
    turnstileToken,
    setTurnstileToken,
    turnstileError,
    setTurnstileError,
    turnstileRef,
    resetSecurity,
    resetTurnstileOnly,
    getSecurityPayload,
    isTurnstileReady,
    isTurnstileEnabled: Boolean(TURNSTILE_SITE_KEY),
  };
}

/**
 * Standalone Cloudflare Turnstile widget (used directly in Supabase Auth forms
 * and wrapped by <FormSecurityFields /> in custom API forms).
 * Automatically renders nothing when NEXT_PUBLIC_TURNSTILE_SITE_KEY is not configured yet.
 */
export function TurnstileWidget({
  turnstileRef,
  onTokenChange,
  onWidgetError,
  action,
  theme = "light",
  size = "flexible",
  className = "",
}) {
  const { locale } = useLocale();
  const [localErrorCode, setLocalErrorCode] = useState("");

  const handleSuccess = useCallback(
    (token) => {
      setLocalErrorCode("");
      onWidgetError?.("");
      onTokenChange?.(token || "");
    },
    [onTokenChange, onWidgetError]
  );

  const handleExpire = useCallback(() => {
    onTokenChange?.("");
    try {
      turnstileRef?.current?.reset?.();
    } catch {
      // Ignore reset errors
    }
  }, [onTokenChange, turnstileRef]);

  const handleError = useCallback(
    (errorCode) => {
      const codeStr = errorCode ? String(errorCode) : "unknown";
      console.warn(
        `[Turnstile] Widget error (${codeStr}). If testing locally, ensure "localhost" is allowed under Cloudflare Turnstile -> Hostname Management.`
      );
      setLocalErrorCode(codeStr);
      onWidgetError?.(codeStr);
      onTokenChange?.("");
    },
    [onTokenChange, onWidgetError]
  );

  if (!TURNSTILE_SITE_KEY) {
    return null;
  }

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <Turnstile
        ref={turnstileRef}
        siteKey={TURNSTILE_SITE_KEY}
        onSuccess={handleSuccess}
        onExpire={handleExpire}
        onError={handleError}
        options={{
          theme,
          size,
          action,
          language: mapLocaleToTurnstileLang(locale),
        }}
      />
      {localErrorCode === "110200" && (
        <p className="mt-1.5 text-[11px] text-amber-700">
          Security widget domain mismatch (add <code>localhost</code> to Cloudflare Turnstile Hostname Management for local testing).
        </p>
      )}
    </div>
  );
}

/**
 * Combined autofill-safe Honeypot trap + Cloudflare Turnstile widget for custom forms.
 * Uses non-profile field identifiers so Chrome/Safari/Edge address autofill and
 * password managers (1Password, LastPass, Bitwarden) never populate the trap.
 */
export function FormSecurityFields({
  security,
  action = "form_submit",
  theme = "light",
  size = "flexible",
  className = "",
}) {
  if (!security) return null;

  return (
    <>
      {/* Off-screen honeypot trap — avoids any address/contact/company keywords so browser autofill never fills it */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        <input
          id={`_wbk_hp_trap_${action}`}
          type="text"
          name="_wbk_hp_trap"
          aria-label="Leave this field blank"
          tabIndex={-1}
          autoComplete="new-password"
          data-1p-ignore="true"
          data-lpignore="true"
          data-bwignore="true"
          data-form-type="other"
          value={security.honeypot}
          onChange={(e) => security.setHoneypot(e.target.value)}
        />
      </div>

      <TurnstileWidget
        turnstileRef={security.turnstileRef}
        onTokenChange={security.setTurnstileToken}
        onWidgetError={security.setTurnstileError}
        action={action}
        theme={theme}
        size={size}
        className={className}
      />
    </>
  );
}
