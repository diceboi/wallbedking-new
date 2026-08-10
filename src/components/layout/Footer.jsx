import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";

const FOOTER_LINKS = {
  Products: [
    { label: "Murphy Beds",  href: "/products/beds" },
    { label: "Sofas",        href: "/products/sofas" },
    { label: "Mattresses",   href: "/products/mattresses" },
    { label: "Cabinets",     href: "/products/cabinets" },
    { label: "Sale",         href: "/products/sale" },
  ],
  Support: [
    { label: "Installation Guides", href: "/support/installation-guides" },
    { label: "FAQ",                 href: "/support/faq" },
    { label: "Delivery",            href: "/support/delivery" },
  ],
  Company: [
    { label: "About",           href: "/about" },
    { label: "Contact",         href: "/contact" },
    { label: "Trade Customers", href: "/more/trade-customers" },
    { label: "Case Studies",    href: "/more/case-studies" },
    { label: "Reviews",         href: "/more/reviews" },
  ],
};

export function Footer() {
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
            <p className="mt-4 text-sm leading-relaxed text-wbk-lightgrey/70 max-w-xs">
              Premium modular murphy beds and space-saving furniture for modern living.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-wbk-gold">
                {title}
              </p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-wbk-lightgrey/80 transition-colors duration-150 hover:text-wbk-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-wbk-lightgrey/10 pt-8 sm:flex-row">
          <p className="text-xs text-wbk-lightgrey/40">
            © {new Date().getFullYear()} WallBedKing. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-wbk-lightgrey/40 hover:text-wbk-white transition-colors duration-150">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-wbk-lightgrey/40 hover:text-wbk-white transition-colors duration-150">
              Terms of Service
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
