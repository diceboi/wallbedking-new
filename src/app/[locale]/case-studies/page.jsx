"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { useLocale } from "@/context/LocaleContext";
import {
  IconQuote,
  IconArrowRight,
  IconCheck,
} from "@tabler/icons-react";
import {
  CASE_STUDIES_EN,
  CASE_STUDIES_FR,
  CASE_STUDIES_ES,
  CATEGORIES_EN,
  CATEGORIES_FR,
  CATEGORIES_ES,
} from "@/data/case-studies-content";

export default function CaseStudiesPage() {
  const { t, localizedHref, locale } = useLocale();
  const isFr = locale === "fr";
  const isEs = locale === "es";
  const [activeCategory, setActiveCategory] = useState("all");

  const CASE_STUDIES = isFr ? CASE_STUDIES_FR : isEs ? CASE_STUDIES_ES : CASE_STUDIES_EN;
  const CATEGORIES = isFr ? CATEGORIES_FR : isEs ? CATEGORIES_ES : CATEGORIES_EN;

  const filteredStudies =
    activeCategory === "all"
      ? CASE_STUDIES
      : CASE_STUDIES.filter((c) => c.category === activeCategory);

  return (
    <div className="bg-wbk-white min-h-screen pt-12 pb-24 font-poppins">
      {/* ── Hero Section ── */}
      <section className="border-b border-wbk-lightgrey/60 bg-[#FBF9F8] py-16 sm:py-24">
        <Container size="xl">
          <div className="max-w-3xl">
            <nav className="flex items-center gap-1.5 text-[11px] text-wbk-brown/80 mb-4">
              <Link href={localizedHref("/")} className="hover:text-wbk-black transition-colors">
                {t("nav.home", "Home")}
              </Link>
              <span>/</span>
              <Link href={localizedHref("/trade")} className="hover:text-wbk-black transition-colors">
                {t("nav.trade", "Trade Customers")}
              </Link>
              <span>/</span>
              <span className="text-wbk-black font-medium">{t("nav.caseStudies", "Case Studies")}</span>
            </nav>

            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-wbk-gold mb-3">
              {t("caseStudiesPage.heroBadge", "Commercial Projects & Proven Results")}
            </span>
            <h1 className="font-new-york text-4xl sm:text-5xl md:text-6xl text-wbk-black tracking-tight leading-tight">
              {t("caseStudiesPage.heroTitle", "Trade Customer Case Studies")}
            </h1>
            <p className="mt-5 text-base sm:text-lg text-wbk-brown leading-relaxed font-light">
              {t(
                "caseStudiesPage.heroSubtitle",
                "Discover how architects, developers, public services, and boutique hospitality providers transform spaces and maximise ROI with Wall Bed King."
              )}
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? "bg-wbk-black text-white"
                      : "bg-white text-wbk-brown border border-wbk-lightgrey/80 hover:bg-[#F4F2F0] hover:text-wbk-black"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── Case Studies List ── */}
      <section className="py-20 sm:py-28 bg-white">
        <Container size="xl">
          <div className="space-y-20">
            {filteredStudies.map((study, idx) => (
              <div
                key={study.id}
                className="border border-wbk-lightgrey/80 bg-[#FAF8F6] p-6 sm:p-12 shadow-xs hover:border-wbk-gold/60 transition-all"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                  {/* Left Column: Image & Key Client Metrics */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="relative aspect-4/3 w-full overflow-hidden bg-white border border-wbk-lightgrey/60">
                      <Image
                        src={study.image}
                        alt={study.client}
                        fill
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        className="object-contain p-4"
                      />
                    </div>

                    {/* Metric Badges */}
                    <div className="grid grid-cols-3 gap-3">
                      {study.stats.map((s, i) => (
                        <div key={i} className="bg-white p-3 border border-wbk-lightgrey/70 text-center">
                          <p className="font-new-york text-lg sm:text-xl text-wbk-black font-semibold">
                            {s.value}
                          </p>
                          <p className="text-[10px] text-wbk-brown leading-tight mt-0.5">
                            {s.label}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Client Quote Card */}
                    <div className="bg-white p-6 border-l-4 border-wbk-gold border-t border-r border-b border-wbk-lightgrey/70 relative">
                      <IconQuote size={28} className="text-wbk-gold/30 absolute right-4 top-4" />
                      <p className="text-xs sm:text-sm text-wbk-black italic leading-relaxed">
                        "{study.quote}"
                      </p>
                      <div className="mt-3 pt-3 border-t border-wbk-lightgrey/50">
                        <p className="text-xs font-bold text-wbk-black">{study.contactPerson}</p>
                        <p className="text-[11px] text-wbk-brown">{study.contactRole}, {study.client}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Case Story, Challenge, Solution, Outcome */}
                  <div className="lg:col-span-7 space-y-6">
                    <div>
                      <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-wbk-gold/20 text-wbk-black mb-3">
                        {study.categoryLabel}
                      </span>
                      <h2 className="font-new-york text-2xl sm:text-3xl text-wbk-black">
                        {study.headline}
                      </h2>
                      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-wbk-brown">
                        {isFr ? "Client : " : isEs ? "Cliente: " : "Client: "}<strong className="text-wbk-black">{study.client}</strong>
                      </p>
                    </div>

                    <div className="space-y-4 text-xs sm:text-sm text-wbk-brown leading-relaxed">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-wbk-black mb-1.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-wbk-gold rounded-full" />
                          {isFr ? "Le Défi" : isEs ? "El Reto" : "The Challenge"}
                        </h4>
                        <p>{study.challenge}</p>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-wbk-black mb-1.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-wbk-green rounded-full" />
                          {isFr ? "La Solution Wall Bed King" : isEs ? "La Solución Wall Bed King" : "The Wall Bed King Solution"}
                        </h4>
                        <p>{study.solution}</p>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-wbk-black mb-1.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-wbk-black rounded-full" />
                          {isFr ? "Le Résultat Commercial" : isEs ? "El Resultado Comercial" : "The Commercial Outcome"}
                        </h4>
                        <p>{study.outcome}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-wbk-lightgrey/70 flex items-center gap-4">
                      <Link
                        href={localizedHref("/trade#inquiry-form")}
                        className="px-6 py-3 bg-wbk-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-wbk-gold hover:text-wbk-black transition-colors inline-flex items-center gap-2"
                      >
                        <span>{isFr ? "Démarrer un projet similaire" : isEs ? "Iniciar un proyecto similar" : "Start Similar Project"}</span>
                        <IconArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Commercial Callout CTA ── */}
      <section className="py-16 sm:py-24 bg-wbk-black text-white">
        <Container size="xl">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-wbk-gold">
              {isFr ? "Collaborer avec Wall Bed King" : isEs ? "Colaborar con Wall Bed King" : "Collaborate With Wall Bed King"}
            </span>
            <h2 className="font-new-york text-3xl sm:text-4xl md:text-5xl text-white">
              {isFr
                ? "Prêt à optimiser votre prochain projet immobilier ou hôtelier ?"
                : isEs
                ? "¿Preparado para optimizar su próximo proyecto residencial u hotelero?"
                : "Ready to transform your next development or hospitality scheme?"}
            </h2>
            <p className="text-sm sm:text-base text-wbk-lightgrey/80 font-light leading-relaxed">
              {isFr
                ? "Notre équipe technique et commerciale est à votre disposition pour étudier vos plans, recommander les meilleures configurations et vous proposer des tarifs dégressifs."
                : isEs
                ? "Nuestro equipo técnico y comercial está a su disposición para analizar sus planos, recomendar las configuraciones óptimas y ofrecerle tarifas por volumen competitivas."
                : "Our engineering and commercial team is available to review your architectural drawings, recommend optimal Murphy bed orientations, and structure competitive volume pricing."}
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link
                href={localizedHref("/trade#inquiry-form")}
                className="px-8 py-4 bg-wbk-gold text-wbk-black text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors"
              >
                {isFr ? "Demander une étude de projet" : isEs ? "Solicitar estudio de proyecto" : "Inquire For Your Project"}
              </Link>
              <Link
                href={localizedHref("/trade")}
                className="px-8 py-4 border border-white/30 text-white text-xs font-bold uppercase tracking-wider hover:border-white transition-colors"
              >
                {isFr ? "Découvrir l'offre pro" : isEs ? "Descubrir servicios comerciales" : "Explore Trade Services"}
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
