import posthog from "posthog-js";

if (typeof window !== "undefined") {
  const token =
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ||
    process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host =
    process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";

  if (token) {
    posthog.init(token, {
      api_host: host,
      defaults: "2026-08-30",
      person_profiles: "identified_only",
      capture_pageview: "always",
      capture_pageleave: true,
    });
  }
}
