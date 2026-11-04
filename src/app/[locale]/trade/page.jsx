"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { useLocale } from "@/context/LocaleContext";
import { ProtectedContact } from "@/components/ui/ProtectedContact";
import {
  FormSecurityFields,
  useFormSecurity,
} from "@/components/ui/FormSecurityFields";
import {
  IconShieldCheck,
  IconCpu,
  IconBuildingFactory2,
  IconScale,
  IconTruck,
  IconFileCertificate,
  IconArrowRight,
  IconCheck,
  IconMail,
  IconPhoneCall,
  IconClock,
  IconFileText,
} from "@tabler/icons-react";

import {
  TRADE_PILLARS_EN,
  TRADE_PILLARS_FR,
  TRADE_PILLARS_ES,
  SECTORS_EN,
  SECTORS_FR,
  SECTORS_ES,
} from "@/data/trade-content";

export default function TradePage() {
  const { t, localizedHref, locale } = useLocale();
  const isFr = locale === "fr";
  const isEs = locale === "es";

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    sector: "Hospitality & Hotels",
    units: "1-5 units",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
  const [errorDetail, setErrorDetail] = useState("");
  const security = useFormSecurity();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorDetail("");

    if (!security.isTurnstileReady) {
      setSubmitStatus("error");
      setErrorDetail(
        t("security.completeCaptcha", "Please complete the security check below.")
      );
      return;
    }

    setSubmitting(true);
    setSubmitStatus(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: `Trade Inquiry: ${formData.company || formData.name} (${formData.sector}, ${formData.units})`,
          message: `Company: ${formData.company}\nSector: ${formData.sector}\nEstimated Units: ${formData.units}\nPhone: ${formData.phone}\n\nProject Requirements:\n${formData.message}`,
          ...security.getSecurityPayload(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && !data?.error) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          company: "",
          email: "",
          phone: "",
          sector: "Hospitality & Hotels",
          units: "1-5 units",
          message: "",
        });
        security.resetSecurity();
      } else {
        security.resetTurnstileOnly();
        setErrorDetail(data?.error || "");
        setSubmitStatus("error");
      }
    } catch (err) {
      console.error("Trade form submission error:", err);
      security.resetTurnstileOnly();
      setSubmitStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  const TRADE_PILLARS = locale === "fr" ? TRADE_PILLARS_FR : locale === "es" ? TRADE_PILLARS_ES : TRADE_PILLARS_EN;
  const SECTORS = locale === "fr" ? SECTORS_FR : locale === "es" ? SECTORS_ES : SECTORS_EN;

  const STATS = locale === "fr"
    ? [
        { value: "50 000+", label: "Unités résidentielles et professionnelles installées" },
        { value: "30 000+", label: "Cycles de pistons testés (Vérins allemands)" },
        { value: "À vie", label: "Garantie du mécanisme et du châssis" },
        { value: "100%", label: "Fabrication directe en usine européenne" },
      ]
    : locale === "es"
    ? [
        { value: "50.000+", label: "Unidades residenciales y profesionales instaladas" },
        { value: "30.000+", label: "Ciclos de pistones probados (Pistones alemanes)" },
        { value: "De por vida", label: "Garantía del mecanismo y del chasis" },
        { value: "100%", label: "Fabricación directa en fábrica europea" },
      ]
    : [
        { value: "50,000+", label: "Commercial & Residential Units Installed" },
        { value: "30,000+", label: "Piston Cycles Tested (German Struts)" },
        { value: "Lifetime", label: "Mechanism Frame & Hinge Warranty" },
        { value: "100%", label: "Direct European Factory Manufacturing" },
      ];

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
              <span className="text-wbk-black font-medium">{t("nav.trade", "Trade Customers")}</span>
            </nav>

            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-wbk-gold mb-3">
              {t("tradePage.heroBadge", "European Engineering & Commercial Partnerships")}
            </span>
            <h1 className="font-new-york text-4xl sm:text-5xl md:text-6xl text-wbk-black tracking-tight leading-tight">
              {t("tradePage.heroTitle", "The Smart Space Partner for Trade Professionals")}
            </h1>
            <p className="mt-5 text-base sm:text-lg text-wbk-brown leading-relaxed font-light">
              {t(
                "tradePage.heroSubtitle",
                "Unlock hidden value in every square metre. Precision-engineered Murphy beds for hotels, developers, cabinet makers, healthcare facilities, and commercial residential projects."
              )}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#inquiry-form"
                className="px-7 py-3.5 bg-wbk-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-wbk-gold hover:text-wbk-black transition-all cursor-pointer"
              >
                {t("tradePage.requestQuote", "Request a Trade Quote")}
              </a>
              <a
                href="#sectors"
                className="px-7 py-3.5 border border-wbk-black/20 text-wbk-black text-xs font-semibold uppercase tracking-wider hover:bg-[#F4F2F0] transition-colors cursor-pointer"
              >
                {t("tradePage.exploreSectors", "Explore Trade Sectors")}
              </a>
              <Link
                href={localizedHref("/case-studies")}
                className="px-7 py-3.5 border border-wbk-gold text-wbk-black text-xs font-semibold uppercase tracking-wider hover:bg-wbk-gold/10 transition-colors flex items-center gap-2"
              >
                <IconFileText size={15} className="text-wbk-gold" />
                <span>{t("tradePage.viewCaseStudies", "View Case Studies")}</span>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Key Commercial Stats Grid ── */}
      <section className="border-b border-wbk-lightgrey/60 bg-white py-12">
        <Container size="xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="border-l-2 border-wbk-gold pl-5">
                <p className="font-new-york text-3xl sm:text-4xl text-wbk-black tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-wbk-brown leading-snug">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Trade Pillars / Value Propositions ── */}
      <section className="py-20 sm:py-28 border-b border-wbk-lightgrey/60 bg-[#FBF9F8]">
        <Container size="xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-wbk-gold">
              {t("tradePage.pillarsBadge", "Why Trade Partners Choose Us")}
            </span>
            <h2 className="mt-2 font-new-york text-3xl sm:text-4xl md:text-5xl text-wbk-black">
              {t("tradePage.pillarsTitle", "Engineered for Commercial Reliability")}
            </h2>
            <p className="mt-3 text-sm text-wbk-brown">
              {isFr
                ? "Tarifs directs usine, vérins à gaz allemands certifiés et assistance technique avec fichiers CAD complets."
                : "Factory direct pricing, certified German gas pistons, and comprehensive technical CAD support."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {TRADE_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.number}
                  className="bg-white p-7 border border-wbk-lightgrey/80 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-[#F4F2F0] text-wbk-black flex items-center justify-center group-hover:bg-wbk-black group-hover:text-wbk-gold transition-colors">
                        <Icon size={22} strokeWidth={1.5} />
                      </div>
                      <span className="font-mono text-xs font-bold text-wbk-brown/50">
                        {pillar.number}
                      </span>
                    </div>
                    <h3 className="font-poppins font-semibold text-base sm:text-lg text-wbk-black mb-2.5">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-wbk-brown leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ── Specialized Commercial Sectors ── */}
      <section id="sectors" className="py-20 sm:py-28 border-b border-wbk-lightgrey/60 bg-white">
        <Container size="xl">
          <div className="max-w-2xl mb-16">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-wbk-green">
              {t("tradePage.sectorsBadge", "Commercial Applications")}
            </span>
            <h2 className="mt-2 font-new-york text-3xl sm:text-4xl md:text-5xl text-wbk-black">
              {t("tradePage.sectorsTitle", "Sectors We Specialize In")}
            </h2>
            <p className="mt-3 text-sm text-wbk-brown">
              {isFr
                ? "Découvrez comment nos lits escamotables de précision répondent aux besoins des professionnels de nombreux secteurs."
                : "Explore how our precision wall bed mechanisms empower commercial clients across diverse industries."}
            </p>
          </div>

          <div className="space-y-16">
            {SECTORS.map((sector, index) => {
              const isEven = index % 2 === 1;
              return (
                <div
                  key={sector.id}
                  id={sector.id}
                  className="border border-wbk-lightgrey/70 bg-[#FAF8F6] p-6 sm:p-10 transition-all hover:border-wbk-gold/60"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    {/* Image Column */}
                    <div className={`lg:col-span-5 ${isEven ? "lg:order-2" : "lg:order-1"}`}>
                      <div className="relative aspect-4/3 w-full overflow-hidden bg-white border border-wbk-lightgrey/60">
                        <Image
                          src={sector.image}
                          alt={sector.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 40vw"
                          className="object-cover"
                        />
                      </div>
                    </div>

                    {/* Content Column */}
                    <div className={`lg:col-span-7 space-y-4 ${isEven ? "lg:order-1" : "lg:order-2"}`}>
                      <div className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-wbk-black text-white">
                        {isFr ? `Secteur n°${String(index + 1).padStart(2, "0")}` : isEs ? `Sector n.° ${String(index + 1).padStart(2, "0")}` : `Sector #${String(index + 1).padStart(2, "0")}`}
                      </div>
                      <h3 className="font-new-york text-2xl sm:text-3xl text-wbk-black">
                        {sector.title}
                      </h3>
                      <p className="text-xs sm:text-sm font-medium text-wbk-gold uppercase tracking-wider">
                        {sector.tagline}
                      </p>
                      <p className="text-xs sm:text-sm text-wbk-brown leading-relaxed">
                        {sector.description}
                      </p>

                      <div className="pt-2">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-wbk-black mb-2.5">
                          {isFr ? "Principaux avantages :" : isEs ? "Ventajas principales:" : "Key Advantages:"}
                        </h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-wbk-brown">
                          {sector.bullets.map((b, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <IconCheck size={14} className="text-wbk-green shrink-0 mt-0.5" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-4 flex items-center gap-4">
                        <a
                          href="#inquiry-form"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              sector: sector.title,
                            }))
                          }
                          className="text-xs font-semibold text-wbk-black hover:text-wbk-green inline-flex items-center gap-1 transition-colors"
                        >
                          <span>{isFr ? `Demander un devis pour : ${sector.title}` : isEs ? `Solicitar presupuesto para: ${sector.title}` : `Inquire for ${sector.title}`}</span>
                          <IconArrowRight size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ── Case Studies Spotlight Banner ── */}
      <section className="py-16 sm:py-20 bg-wbk-black text-white">
        <Container size="xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-wbk-gold">
                {isFr ? "Résultats clients éprouvés" : isEs ? "Resultados contrastados de clientes" : "Proven Client Results"}
              </span>
              <h2 className="font-new-york text-3xl sm:text-4xl text-white mt-2">
                {isFr ? "Projets réels. Rentabilité commerciale prouvée." : isEs ? "Proyectos reales. Rentabilidad comercial probada." : "Real Projects. Proven Commercial ROI."}
              </h2>
              <p className="mt-3 text-sm text-wbk-lightgrey/80 leading-relaxed font-light">
                {isFr
                  ? "Découvrez comment Metropolitan Housing Association, B&H Properties (52 appartements à Londres), Riverside Shepherd Huts (77+ hébergements glamping) et les casernes de secours optimisent leurs espaces avec Wall Bed King."
                  : "See how Metropolitan Housing Association, B&H Properties (52 units in Central London), Riverside Shepherd Huts (77+ glamping units), Stoneham Construction, and emergency services fire stations successfully optimize space with Wall Bed King."}
              </p>
              <div className="mt-6 flex flex-wrap gap-4 items-center text-xs text-wbk-lightgrey">
                <span className="border-r border-white/20 pr-4">{isFr ? "52 appartements à Londres" : isEs ? "52 apartamentos en Londres" : "52 London Apartments"}</span>
                <span className="border-r border-white/20 pr-4">{isFr ? "77+ hébergements glamping" : isEs ? "Más de 77 cabañas glamping" : "77+ Glamping Huts"}</span>
                <span className="border-r border-white/20 pr-4">{isFr ? "Casernes de secours" : isEs ? "Estaciones de emergencias" : "Emergency Rest Stations"}</span>
                <span>{isFr ? "Habitats adaptés" : isEs ? "Viviendas tuteladas" : "Supported Living"}</span>
              </div>
            </div>

            <div className="shrink-0">
              <Link
                href={localizedHref("/case-studies")}
                className="px-8 py-4 bg-wbk-gold text-wbk-black text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors text-center inline-block"
              >
                {isFr ? "Consulter toutes les études de cas" : isEs ? "Leer todos los casos de estudio" : "Read All Case Studies"}
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ── B2B Trade Inquiry Form Section ── */}
      <section id="inquiry-form" className="py-20 sm:py-28 bg-[#FBF9F8]">
        <Container size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left: Contact Info & Support */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-wbk-gold">
                  {t("tradePage.formBadge", "Direct B2B Inquiry")}
                </span>
                <h2 className="mt-2 font-new-york text-3xl sm:text-4xl text-wbk-black">
                  {t("tradePage.formTitle", "Start Your Trade Partnership")}
                </h2>
                <p className="mt-3 text-sm text-wbk-brown leading-relaxed">
                  {t(
                    "tradePage.formSubtitle",
                    "Contact our commercial team to discuss project requirements, volume pricing, or request technical CAD packages."
                  )}
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-wbk-lightgrey/80">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded bg-white border border-wbk-lightgrey/80 flex items-center justify-center shrink-0 text-wbk-gold">
                    <IconPhoneCall size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-wbk-black">
                      {isFr ? "Ligne directe professionnels" : isEs ? "Línea comercial directa" : "Direct Commercial Line"}
                    </p>
                    <div className="mt-1">
                      <ProtectedContact type="phone" />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded bg-white border border-wbk-lightgrey/80 flex items-center justify-center shrink-0 text-wbk-gold">
                    <IconMail size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-wbk-black">
                      {isFr ? "E-mail service pro" : isEs ? "Correo del departamento comercial" : "Trade Email Desk"}
                    </p>
                    <div className="mt-1">
                      <ProtectedContact type="email" />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded bg-white border border-wbk-lightgrey/80 flex items-center justify-center shrink-0 text-wbk-gold">
                    <IconClock size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-wbk-black">
                      {isFr ? "Heures d'ouverture" : isEs ? "Horario de atención" : "Operating Hours"}
                    </p>
                    <p className="text-xs text-wbk-brown">
                      {isFr ? "Lundi – Vendredi : 9h00 – 20h00" : isEs ? "Lunes – Viernes: 9:00 – 20:00" : "Monday – Friday: 9:00 – 20:00"}
                    </p>
                    <p className="text-xs text-wbk-brown">
                      {isFr ? "Samedi : 9h00 – 12h00" : isEs ? "Sábado: 9:00 – 12:00" : "Saturday: 9:00 – 12:00"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-white border border-wbk-lightgrey/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-wbk-black mb-1.5">
                  {isFr ? "Besoin de fichiers CAD ou d'un appel d'offres ?" : isEs ? "¿Necesita archivos CAD o licitaciones?" : "Need CAD Files or Tenders?"}
                </h4>
                <p className="text-xs text-wbk-brown leading-relaxed">
                  {isFr
                    ? "Nous fournissons des fichiers 2D DWG, 3D STEP et des guides d'intégration PDF pour les architectes et menuisiers."
                    : "We supply 2D DWG, 3D STEP, and PDF integration manuals for architectural tenders and millwork packages."}
                </p>
              </div>
            </div>

            {/* Right: Interactive Form */}
            <div className="lg:col-span-7">
              <div className="bg-white p-8 sm:p-10 border border-wbk-lightgrey/80 shadow-xs">
                {submitStatus === "success" ? (
                  <div className="p-6 bg-green-50 border border-green-200 text-green-900 rounded-none text-center space-y-3">
                    <div className="w-12 h-12 bg-green-100 text-green-700 mx-auto flex items-center justify-center rounded-full">
                      <IconCheck size={24} />
                    </div>
                    <h3 className="font-new-york text-xl text-green-900">
                      {isFr ? "Demande reçue avec succès" : isEs ? "Solicitud recibida correctamente" : "Inquiry Received Successfully"}
                    </h3>
                    <p className="text-xs sm:text-sm text-green-800 leading-relaxed">
                      {t(
                        "tradePage.formSuccess",
                        "Thank you! Our commercial team will review your project and get back to you within 24 hours."
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitStatus(null);
                        security.resetSecurity();
                      }}
                      className="mt-4 px-6 py-2 bg-wbk-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-wbk-gold hover:text-wbk-black transition-colors"
                    >
                      {isFr ? "Envoyer une autre demande" : isEs ? "Enviar otra solicitud" : "Submit Another Inquiry"}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5 relative">
                    {submitStatus === "error" && (
                      <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs leading-relaxed">
                        {errorDetail ? (
                          <span>{errorDetail}</span>
                        ) : (
                          <span>
                            {t(
                              "tradePage.formError",
                              "Failed to send inquiry. Please try again or email us directly:"
                            )}{" "}
                            <ProtectedContact type="email" variant="inline" />
                          </span>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                          {t("tradePage.formName", "Full Name")} *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 text-xs border border-wbk-lightgrey focus:border-wbk-black focus:outline-none"
                          placeholder={isFr ? "ex. Jean Dupont" : isEs ? "ej. Juan Pérez" : "e.g. Jane Doe"}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                          {t("tradePage.formCompany", "Company / Organization")} *
                        </label>
                        <input
                          type="text"
                          name="company"
                          required
                          value={formData.company}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 text-xs border border-wbk-lightgrey focus:border-wbk-black focus:outline-none"
                          placeholder={isFr ? "ex. SARL Architecture & Design" : isEs ? "ej. Arquitectura y Promociones S.L." : "e.g. Acme Developments Ltd"}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                          {t("tradePage.formEmail", "Work Email")} *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 text-xs border border-wbk-lightgrey focus:border-wbk-black focus:outline-none"
                          placeholder="name@company.com"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                          {t("tradePage.formPhone", "Phone Number")}
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 text-xs border border-wbk-lightgrey focus:border-wbk-black focus:outline-none"
                          placeholder="+33 6 12 34 56 78"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                          {t("tradePage.formSector", "Project Sector / Type")}
                        </label>
                        <select
                          name="sector"
                          value={formData.sector}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 text-xs border border-wbk-lightgrey focus:border-wbk-black focus:outline-none bg-white"
                        >
                          <option value="Hospitality & Hotels">{isFr ? "Hôtellerie & Résidences de tourisme" : isEs ? "Hostelería y Residencias" : "Hospitality & Hotels"}</option>
                          <option value="Property Development & Micro-Apartments">{isFr ? "Promotion immobilière & Micro-appartements" : isEs ? "Promoción inmobiliaria y Microapartamentos" : "Property Development & Micro-Apartments"}</option>
                          <option value="Cabinet Makers & Custom Joiners">{isFr ? "Menuisiers & Agenceurs sur mesure" : isEs ? "Ebanistas y Carpinteros a medida" : "Cabinet Makers & Custom Joiners"}</option>
                          <option value="Independent Furniture Retailers">{isFr ? "Revendeurs de mobilier & Boutiques" : isEs ? "Distribuidores y Tiendas de muebles" : "Independent Furniture Retailers"}</option>
                          <option value="Care Homes & Assisted Living">{isFr ? "Résidences seniors & Soins" : isEs ? "Residencias de mayores y Asistidas" : "Care Homes & Assisted Living"}</option>
                          <option value="Fire Stations & Emergency Services">{isFr ? "Casernes de pompiers & Urgences" : isEs ? "Parques de bomberos y Emergencias" : "Fire Stations & Emergency Services"}</option>
                          <option value="Hospitals & Healthcare Facilities">{isFr ? "Hôpitaux & Cliniques" : isEs ? "Hospitales y Centros sanitarios" : "Hospitals & Healthcare Facilities"}</option>
                          <option value="Shepherd's Huts & Glamping Pods">{isFr ? "Glamping, Roulottes & Hébergements insolites" : isEs ? "Glamping, Cabañas y Alojamientos singulares" : "Shepherd's Huts & Glamping Pods"}</option>
                          <option value="Tiny Homes & Modular Buildings">{isFr ? "Tiny Houses & Bâtiments modulaires" : isEs ? "Mini-casas y Construcción modular" : "Tiny Homes & Modular Buildings"}</option>
                          <option value="Renovation & Conversion Specialists">{isFr ? "Rénovation & Agencement d'intérieur" : isEs ? "Especialistas en reformas y reconversiones" : "Renovation & Conversion Specialists"}</option>
                          <option value="Architectural / Interior Design">{isFr ? "Architecture & Décoration" : isEs ? "Arquitectura y Diseño de interiores" : "Architectural / Interior Design"}</option>
                          <option value="Other">{isFr ? "Autre projet professionnel" : isEs ? "Otras aplicaciones profesionales" : "Other Commercial Application"}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                          {t("tradePage.formUnits", "Estimated Units")}
                        </label>
                        <select
                          name="units"
                          value={formData.units}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 text-xs border border-wbk-lightgrey focus:border-wbk-black focus:outline-none bg-white"
                        >
                          <option value="1-5 units">{isFr ? "1 à 5 unités" : isEs ? "1 – 5 unidades" : "1 – 5 units"}</option>
                          <option value="6-15 units">{isFr ? "6 à 15 unités" : isEs ? "6 – 15 unidades" : "6 – 15 units"}</option>
                          <option value="16-50 units">{isFr ? "16 à 50 unités" : isEs ? "16 – 50 unidades" : "16 – 50 units"}</option>
                          <option value="50+ units">{isFr ? "50+ unités (Grand projet / Appel d'offres)" : isEs ? "50+ unidades (Gran proyecto / Licitación)" : "50+ units (Large Tender / Scheme)"}</option>
                          <option value="Ongoing / Retail Account">{isFr ? "Partenariat continu / Compte revendeur" : isEs ? "Colaboración continua / Cuenta distribuidor" : "Ongoing / Retail Partnership"}</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                        {t("tradePage.formMessage", "Project Details & Requirements")} *
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 text-xs border border-wbk-lightgrey focus:border-wbk-black focus:outline-none resize-y"
                        placeholder={
                          isFr
                            ? "Décrivez votre projet, dimensions ou orientations souhaitées, calendrier de livraison, besoin de fichiers CAD..."
                            : "Please describe your project, preferred bed sizes or orientations, delivery timeline, or CAD file requests..."
                        }
                      />
                    </div>

                    <FormSecurityFields
                      security={security}
                      action="trade_inquiry"
                    />

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 bg-wbk-black text-white text-xs font-bold uppercase tracking-wider hover:bg-wbk-gold hover:text-wbk-black transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {submitting
                        ? t("tradePage.formSubmitting", "Submitting...")
                        : t("tradePage.formSubmit", "Send Trade Inquiry")}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
