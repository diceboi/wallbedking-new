/**
 * Multi-layer form & bot protection utility:
 * 1. Per-IP sliding-window rate limiting
 * 2. Cloudflare Turnstile server-side verification (`TURNSTILE_SECRET_KEY`)
 * 3. Autofill-safe honeypot field detection (`_hp` / `_wbk_hp_trap`)
 * 4. Minimum human fill-time check (active in fallback mode when Turnstile is not yet configured)
 *
 * Graceful fallback: If `TURNSTILE_SECRET_KEY` is not yet configured in environment
 * variables, rate limiting + honeypot + fill-time checks still actively protect all endpoints,
 * and Turnstile automatically enforces strictly as soon as the secret key is added.
 */

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Sliding-window rate limit store (persists per Node server instance)
const rateLimitStore = new Map();
let lastCleanupAt = Date.now();
let hasLoggedMissingSecret = false;

function cleanupRateLimitStore(now) {
  if (now - lastCleanupAt < 5 * 60 * 1000) return;
  lastCleanupAt = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (!entry || entry.expiresAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Extracts client IP address from Cloudflare / Vercel / reverse-proxy headers.
 */
export function getClientIp(request) {
  if (!request?.headers) return "unknown";

  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

/**
 * Sliding-window IP rate limiter.
 */
export function checkRateLimit(key, maxRequests = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  cleanupRateLimitStore(now);

  const existing = rateLimitStore.get(key);
  const validTimestamps = existing
    ? existing.timestamps.filter((ts) => now - ts < windowMs)
    : [];

  if (validTimestamps.length >= maxRequests) {
    const oldest = validTimestamps[0];
    const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  validTimestamps.push(now);
  rateLimitStore.set(key, {
    timestamps: validTimestamps,
    expiresAt: now + windowMs,
  });

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - validTimestamps.length),
    retryAfterSec: 0,
  };
}

/**
 * Verifies a Cloudflare Turnstile token server-side.
 */
export async function verifyTurnstileToken(token, ip = "") {
  const secretKey = process.env.TURNSTILE_SECRET_KEY?.trim();

  if (!secretKey) {
    if (!hasLoggedMissingSecret) {
      hasLoggedMissingSecret = true;
      console.info(
        "[Turnstile] TURNSTILE_SECRET_KEY is not set yet — using honeypot, fill-time, and IP rate-limit protection until configured."
      );
    }
    return { success: true, skipped: true };
  }

  if (!token || typeof token !== "string" || !token.trim()) {
    return {
      success: false,
      error: "Please complete the security check before submitting.",
    };
  }

  try {
    const payload = {
      secret: secretKey,
      response: token.trim(),
    };
    if (ip && ip !== "unknown") {
      payload.remoteip = ip;
    }

    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const outcome = await res.json();

    if (outcome?.success === true) {
      return {
        success: true,
        skipped: false,
        hostname: outcome.hostname,
        action: outcome.action,
      };
    }

    console.warn(
      "[Turnstile] Verification rejected:",
      outcome?.["error-codes"] || outcome
    );
    return {
      success: false,
      error: "Security verification expired or failed. Please try again.",
      codes: outcome?.["error-codes"] || [],
    };
  } catch (err) {
    console.error("[Turnstile] Siteverify network error:", err);
    return {
      success: false,
      error: "Could not verify security challenge. Please try again.",
    };
  }
}

/**
 * Runs full defense-in-depth checks for public API form submissions.
 */
export async function verifyFormProtection({
  request,
  body = {},
  formType = "general",
  maxRequests = 5,
  windowMs = 10 * 60 * 1000,
  minFillMs = 600,
}) {
  const ip = getClientIp(request);

  // 1. Honeypot check (uses autofill-safe `_hp` / `_wbk_hp_trap` keys only)
  const honeypotValue =
    (typeof body?._hp === "string" && body._hp.trim()) ||
    (typeof body?._wbk_hp_trap === "string" && body._wbk_hp_trap.trim()) ||
    "";

  if (honeypotValue) {
    console.warn(`[FormProtection] Honeypot triggered on "${formType}" from IP ${ip}`);
    return { ok: true, silentDrop: true, ip };
  }

  // 2. Per-IP sliding-window rate limit
  const rateLimit = checkRateLimit(`form:${formType}:${ip}`, maxRequests, windowMs);
  if (!rateLimit.allowed) {
    console.warn(`[FormProtection] Rate limit exceeded on "${formType}" from IP ${ip}`);
    return {
      ok: false,
      silentDrop: false,
      status: 429,
      error: "Too many submissions. Please wait a few minutes and try again.",
      ip,
    };
  }

  // 3. Cloudflare Turnstile server-side token check
  const turnstileResult = await verifyTurnstileToken(body?.turnstileToken, ip);
  if (!turnstileResult.success) {
    return {
      ok: false,
      silentDrop: false,
      status: 400,
      error: turnstileResult.error || "Security verification failed.",
      ip,
    };
  }

  // 4. Minimum human fill-time check (only enforced in fallback mode when Turnstile is skipped,
  // so Turnstile-verified humans using fast 1-click browser autofill are never dropped)
  if (
    turnstileResult.skipped &&
    minFillMs > 0 &&
    body?._fillDurationMs !== undefined &&
    body?._fillDurationMs !== null
  ) {
    const durationMs = Number(body._fillDurationMs);
    if (Number.isFinite(durationMs) && durationMs >= 0 && durationMs < minFillMs) {
      console.warn(
        `[FormProtection] Instant submission (${durationMs}ms) dropped on "${formType}" from IP ${ip}`
      );
      return { ok: true, silentDrop: true, ip };
    }
  }

  return { ok: true, silentDrop: false, ip };
}
