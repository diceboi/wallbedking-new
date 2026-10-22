"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { useLocale } from "@/context/LocaleContext";

export default function PrivacyPolicyPage() {
  const { t, localizedHref } = useLocale();

  return (
    <div className="bg-wbk-white min-h-screen pt-12 pb-24 font-poppins">
      {/* Header */}
      <section className="border-b border-wbk-lightgrey/60 bg-[#FBF9F8] py-16 sm:py-20">
        <Container size="xl">
          <div className="max-w-3xl">
            <nav className="flex items-center gap-1.5 text-[11px] text-wbk-brown/80 mb-4">
              <Link href={localizedHref("/")} className="hover:text-wbk-black transition-colors">
                {t("nav.home", "Home")}
              </Link>
              <span>/</span>
              <span className="text-wbk-black font-medium">{t("privacy.breadcrumb", "Privacy Policy")}</span>
            </nav>

            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-wbk-gold mb-3">
              {t("privacy.badge", "Data Protection & GDPR")}
            </span>
            <h1 className="font-new-york text-4xl sm:text-5xl md:text-6xl text-wbk-black tracking-tight leading-tight">
              {t("privacy.title", "Privacy & Cookie Policy")}
            </h1>
            <p className="mt-4 text-xs sm:text-sm text-wbk-brown">
              {t("privacy.lastUpdated", "Last updated: January 2026 • Wall Bed King (IZN Ltd)")}
            </p>
          </div>
        </Container>
      </section>

      {/* Content */}
      <Container size="xl" className="pt-14 sm:pt-18">
        <div className="max-w-3xl space-y-10 text-xs sm:text-sm text-wbk-brown leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-new-york text-xl sm:text-2xl text-wbk-black">
              {t("privacy.sec1Title", "1. Our Commitment to Your Privacy")}
            </h2>
            <p>
              {t(
                "privacy.sec1P1",
                "Wall Bed King (operated by IZN Ltd) is committed to protecting the privacy and confidentiality of our customers. This Privacy Policy explains what personal data we collect when you visit our website, place an order, or speak with our support team, and how that information is handled in accordance with the UK Data Protection Act 2018 and the General Data Protection Regulation (GDPR)."
              )}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-new-york text-xl sm:text-2xl text-wbk-black">
              {t("privacy.sec2Title", "2. Information We Collect")}
            </h2>
            <p>{t("privacy.sec2Intro", "We may collect and process the following information:")}</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>{t("privacy.sec2Contact", "Contact Details: Your name, billing address, delivery address, email address, and phone number.")}</li>
              <li>{t("privacy.sec2Order", "Order Information: Products purchased, dimensions, options, transaction reference, and delivery instructions.")}</li>
              <li>{t("privacy.sec2Tech", "Technical Data: IP address, browser type, device information, and pages visited (via cookies).")}</li>
              <li>{t("privacy.sec2Comm", "Customer Communications: Records of correspondence if you contact our sales or technical support teams.")}</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-new-york text-xl sm:text-2xl text-wbk-black">
              {t("privacy.sec3Title", "3. How We Use Your Information")}
            </h2>
            <p>{t("privacy.sec3Intro", "Your personal information is used solely for legitimate business purposes:")}</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>{t("privacy.sec3P1", "To process and fulfill your order, including scheduling delivery and communicating shipping updates.")}</li>
              <li>{t("privacy.sec3P2", "To handle payments securely via authorized payment gateways (e.g. PayPal, Worldpay).")}</li>
              <li>{t("privacy.sec3P3", "To provide customer support, warranty verification, and technical assembly guidance.")}</li>
              <li>{t("privacy.sec3P4", "To improve our website functionality and user experience.")}</li>
            </ul>
            <p>{t("privacy.sec3Outro", "We never sell, rent, or trade your personal information to third-party advertisers.")}</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-new-york text-xl sm:text-2xl text-wbk-black">
              {t("privacy.sec4Title", "4. Payment Security & Data Retention")}
            </h2>
            <p>
              {t(
                "privacy.sec4P1",
                "All online card payments are processed using 256-bit Secure Socket Layer (SSL) encryption through Level 1 PCI-DSS compliant payment providers. We do not store or process payment card numbers on our servers."
              )}
            </p>
            <p>
              {t(
                "privacy.sec4P2",
                "We retain customer order records only for as long as necessary to satisfy accounting, legal, and warranty obligations under our Lifetime Mechanism Warranty."
              )}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-new-york text-xl sm:text-2xl text-wbk-black">
              {t("privacy.sec5Title", "5. Your Legal Rights")}
            </h2>
            <p>
              {t(
                "privacy.sec5P1",
                "Under UK and EU data protection regulations, you have the right to request access to the personal data we hold about you, request corrections, or request erasure of your data where no overriding legal or warranty obligation applies."
              )}
            </p>
            <p>
              {t("privacy.sec5P2", "To exercise any of these rights, please email our Data Privacy Officer at support@wallbedking.com.")}
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
