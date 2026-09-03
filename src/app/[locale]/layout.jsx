import { LOCALES } from "@/lib/i18n";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  return <>{children}</>;
}
