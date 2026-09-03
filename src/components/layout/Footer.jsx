"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { useLocale } from "@/context/LocaleContext";

const FOOTER_LINKS = {
  Products: [
    { label: "Murphy Beds",  href: "/products/beds", id: "beds" },
    { label: "Sofas",        href: "/products/sofas", id: "sofas" },
    { label: "Mattresses",   href: "/products/mattresses", id: "mattresses" },
    { label: "Cabinets",     href: "/products/cabinets", id: "cabinets" },
    { label: "Configurator", href: "/configurator", id: "configurator" },
  ],
  Support: [
    { label: "Installation Guides", href: "/support/installation-guides", id: "guides" },
    { label: "Video Walkthroughs",  href: "/support/installation-videos", id: "videos" },
    { label: "FAQ",                 href: "/support/faq", id: "faq" },
    { label: "Delivery & Shipping", href: "/support/delivery", id: "delivery" },
  ],
  Company: [
    { label: "About Us",            href: "/about", id: "about" },
    { label: "Contact & Showroom",  href: "/contact", id: "contact" },
    { label: "Customer Reviews",    href: "/reviews", id: "reviews" },
    { label: "Terms of Service",    href: "/terms", id: "terms" },
    { label: "Privacy Policy",      href: "/privacy", id: "privacy" },
  ],
};

export function Footer() {
  const pathname = usePathname();
  const { localizedHref, t } = useLocale();
  if (pathname === "/configurator" || pathname?.endsWith("/configurator")) return null;

  return (
    <footer className="mt-auto border-t border-wbk-lightgrey/10 bg-wbk-black relative z-30">
      <Container className="py-16">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-1">
            <Image
              src="/logos/WBK-Logo-Gold-White.svg"
              alt="WallBedKing"
              width={130}
              height={30}
              className="h-7 w-auto"
            />
            <p className="mt-4 text-sm leading-relaxed text-wbk-lightgrey/70 max-w-xs font-poppins">
              {t("footer.tagline", "Premium modular murphy beds and space-saving furniture for modern living.")}
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-wbk-gold font-poppins">
                {title}
              </p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={localizedHref(link.href)}
                      className="text-sm text-wbk-lightgrey/80 transition-colors duration-150 hover:text-wbk-white font-poppins"
                    >
                      {link.id && link.id in { beds: 1, sofas: 1, mattresses: 1, cabinets: 1, configurator: 1, about: 1, contact: 1, reviews: 1 }
                        ? t(`nav.${link.id}`, link.label)
                        : link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-wbk-lightgrey/10 pt-8 sm:flex-row font-poppins">
          <p className="text-xs text-wbk-lightgrey/40">
            © {new Date().getFullYear()} WallBedKing. {t("footer.allRightsReserved", "All rights reserved.")}
          </p>
          <div className="flex gap-6">
            <Link
              href={localizedHref("/privacy")}
              className="text-xs text-wbk-lightgrey/40 hover:text-wbk-white transition-colors duration-150"
            >
              {t("footer.privacy", "Privacy Policy")}
            </Link>
            <Link
              href={localizedHref("/terms")}
              className="text-xs text-wbk-lightgrey/40 hover:text-wbk-white transition-colors duration-150"
            >
              {t("footer.terms", "Terms of Service")}
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
