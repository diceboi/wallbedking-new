import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { LOCALES } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function RootIndexPage() {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("NEXT_LOCALE")?.value?.toLowerCase();

  // If user previously explicitly selected a market, respect that choice
  if (savedLocale) {
    if (savedLocale === "en") {
      redirect("https://wallbedking.co.uk");
    }
    if (LOCALES.includes(savedLocale)) {
      redirect(`/${savedLocale}`);
    }
  }

  // Otherwise, inspect browser Accept-Language header
  const headerList = await headers();
  const acceptLang = (headerList.get("accept-language") || "").toLowerCase();

  // Parse language tokens in user preference order
  const langTokens = acceptLang
    .split(",")
    .map((part) => part.split(";")[0].trim().toLowerCase())
    .filter(Boolean);

  for (const token of langTokens) {
    if (token.startsWith("de")) {
      redirect("/de");
    }
    if (token.startsWith("fr")) {
      redirect("/fr");
    }
    if (token.startsWith("es")) {
      redirect("/es");
    }
    if (token.startsWith("it")) {
      redirect("/it");
    }
    if (token.startsWith("pt")) {
      redirect("/por");
    }
    if (token === "en-us" || token.startsWith("en-us")) {
      redirect("/us");
    }
    if (token === "en-gb" || token === "en-ie") {
      redirect("https://wallbedking.co.uk");
    }
  }

  // Fallback: Default to Germany storefront (/de) as requested
  redirect("/de");
}
