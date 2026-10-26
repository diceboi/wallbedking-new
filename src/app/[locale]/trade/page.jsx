"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { useLocale } from "@/context/LocaleContext";
import {
  IconShieldCheck,
  IconCpu,
  IconBuildingFactory2,
  IconScale,
  IconTruck,
  IconFileCertificate,
  IconBuildingSkyscraper,
  IconBed,
  IconTools,
  IconArrowRight,
  IconCheck,
  IconMail,
  IconPhoneCall,
  IconClock,
  IconSparkles,
  IconFileText,
} from "@tabler/icons-react";

const TRADE_PILLARS = [
  {
    number: "01",
    title: "Direct European Manufacturer",
    titleKey: "tradePillar1Title",
    description:
      "We design, weld, and inspect our cold-rolled steel frames in our European facility. No middleman markups, ensuring unbeatable factory-direct commercial margins.",
    icon: IconBuildingFactory2,
  },
  {
    number: "02",
    title: "German-Engineered Gas Struts",
    titleKey: "tradePillar2Title",
    description:
      "Calibrated automotive gas pistons endurance-tested to 30,000+ continuous cycles. Smooth, silent single-hand operation built for heavy daily commercial duty.",
    icon: IconCpu,
  },
  {
    number: "03",
    title: "Lifetime Mechanism Warranty",
    titleKey: "tradePillar3Title",
    description:
      "Complete confidence for commercial tenders. Every metal chassis, pivot hinge, and piston mounting is backed by an industry-leading Lifetime Warranty.",
    icon: IconShieldCheck,
  },
  {
    number: "04",
    title: "Volume Pricing & Commercial Accounts",
    titleKey: "tradePillar4Title",
    description:
      "Generous trade discounts for multi-unit developments, hotel refurbishments, and recurring retail partners. Custom tiered pricing structured to your project scale.",
    icon: IconScale,
  },
  {
    number: "05",
    title: "Warehouse Stock & Fast Dispatch",
    titleKey: "tradePillar5Title",
    description:
      "High inventory availability across our UK distribution warehouse (Harlow, Essex) and European hub (Passau, Germany) for reliable project milestones.",
    icon: IconTruck,
  },
  {
    number: "06",
    title: "CAD Packages & Technical Support",
    titleKey: "tradePillar6Title",
    description:
      "Comprehensive dimensional drawings, 3D CAD files, and direct engineering consultation for architects, interior designers, and bespoke cabinet makers.",
    icon: IconFileCertificate,
  },
];

const SECTORS = [
  {
    id: "hotels",
    title: "Hotels, Hostels & Serviced Apartments",
    tagline: "Turn every room into your most versatile and profitable asset.",
    image: "/images/trade/customers/hotels.jpg",
    description:
      "In hospitality, flexibility drives revenue. Convert suites from boardroom meetings or day living into luxury bedrooms in seconds. Commercial-grade mechanisms engineered for rigorous daily guest turnover.",
    bullets: [
      "Boutique hotels seeking multi-functional suite layouts",
      "Hostels maximizing beds-per-square-metre revenue",
      "Apart-hotels balancing premium living and sleeping areas",
      "Silent, effortless gas-piston operation that will never disturb guests",
    ],
  },
  {
    id: "cabinet-makers",
    title: "Cabinet Makers & Bespoke Joiners",
    tagline: "Your craftsmanship. Our engineering. Seamless integration.",
    image: "/images/trade/customers/cabinet-makers.jpg",
    description:
      "Our versatile mechanism-only supply integrates cleanly into custom fitted cabinetry, bespoke wardrobes, and architectural joinery of any aesthetic—from traditional hardwoods to modern acoustic panelling.",
    bullets: [
      "Detailed CAD integration files and technical drawings",
      "Direct technical consultation at the planning stage",
      "Mechanism-only hardware supply for bespoke cabinetry",
      "Priority manufacturing and dedicated B2B trade account",
    ],
  },
  {
    id: "property-developers",
    title: "Property Developers & Micro-Apartments",
    tagline: "Add functional square footage without increasing footprint.",
    image: "/images/trade/customers/new-builds.jpg",
    description:
      "Market compact urban studios as full living spaces rather than compromised bedrooms. Wall beds command higher rental yields and appeal to design-conscious tenants who demand spacious living.",
    bullets: [
      "Higher perceived unit value and faster lettings/sales",
      "Differentiate developments from conventional small apartments",
      "Volume commercial pricing for multi-unit schemes",
      "Available in vertical and horizontal orientations across 24 sizes",
    ],
  },
  {
    id: "furniture-retailers",
    title: "Independent Furniture Retailers",
    tagline: "Expand your product range. Increase margins. Delight clients.",
    image: "/images/trade/customers/furniture-retailers.jpg",
    description:
      "Murphy beds are one of the fastest-growing categories in modern home furniture. Partner with Wall Bed King for showroom display units, staff training, marketing collateral, and direct drop-shipping.",
    bullets: [
      "Generous commercial margins and display discounts",
      "Comprehensive sales training and point-of-sale materials",
      "Drop-ship directly to your end client or stock replenishment",
      "Direct factory backing with zero middleman supply delays",
    ],
  },
  {
    id: "care-homes",
    title: "Care Homes & Assisted Living",
    tagline: "Dignity, safety, and independence—by design.",
    image: "/images/trade/customers/care-homes.jpg",
    description:
      "Lightweight, counterbalanced operation empowers residents of varying physical abilities to manage their space with dignity. Adaptable daytime rooms simplify daily routines and clinical care visits.",
    bullets: [
      "Finger-light operation counterbalanced by gas pistons",
      "Hygienic, anti-microbial easy-clean steel surfaces",
      "Flexible layouts for physiotherapy and daytime activities",
      "Lifetime mechanism warranty and priority customer support",
    ],
  },
  {
    id: "emergency-services",
    title: "Fire Stations & Emergency Services",
    tagline: "Rest when you can. Respond when you must.",
    image: "/images/trade/customers/fire-stations.jpg",
    description:
      "Emergency personnel require dependable, restorative rest on shift. Our heavy-duty wall beds create comfortable private rest quarters that fold away in 3 seconds to clear rooms for briefings, drills, or communal duties.",
    bullets: [
      "Trusted by Lincolnshire Fire & Rescue, Met Police, and emergency services",
      "Instant 3-second deployment for shift rotations",
      "Heavy industrial gauge steel frames built for 24/7 duty",
      "Frees valuable floor space for training and equipment storage",
    ],
  },
  {
    id: "hospitals",
    title: "Hospitals & Healthcare Quarters",
    tagline: "Keep families close without compromising clinical care.",
    image: "/images/trade/customers/hospitals.jpg",
    description:
      "Comfortable overnight rest for family members, carers, and on-call medical staff in patient rooms or hospital accommodations. Folds neatly against the wall to maintain sterile, unobstructed medical corridors.",
    bullets: [
      "Infection-control friendly, non-porous powder-coated steel",
      "Zero footprint during doctors' rounds and daytime care",
      "Accepts standard orthopedic and pocket sprung mattresses up to 30cm",
      "Rapid delivery for acute NHS and private clinic requirements",
    ],
  },
  {
    id: "tiny-homes",
    title: "Tiny Homes & Modular Pod Builders",
    tagline: "Maximum living comfort in a minimal structural footprint.",
    image: "/images/trade/customers/tiny-home-builders.jpg",
    description:
      "Every centimeter matters in mobile and prefabricated architecture. Our robust frames endure the structural vibrations of transit while delivering full-size luxury sleeping comfort for owners and glamping guests.",
    bullets: [
      "Ideal for garden studios, glamping pods, and prefab units",
      "Compact installation depth with integrated birch sprung slats",
      "Smooth counterbalanced opening requiring zero floor tracks",
      "Full range of sizes from compact Single to Super King",
    ],
  },
  {
    id: "shepherds-huts",
    title: "Shepherd's Huts & Glamping Retreats",
    tagline: "Heritage artisan charm meets modern German engineering.",
    image: "/images/trade/customers/shepherds-hut-builders.jpg",
    description:
      "Featured by premier hut builders including Riverside Shepherd Huts. Wall beds double daytime living and dining space in boutique glamping retreats, creating an unforgettable guest experience.",
    bullets: [
      "Over 77+ huts supplied for Riverside Shepherd Huts and boutique makers",
      "Hides neatly inside traditional timber cabinetry and cladded walls",
      "Fast turnaround to keep custom hut builds on schedule",
      "Guests love the clever space-saving novelty and supreme comfort",
    ],
  },
  {
    id: "renovations",
    title: "Renovation & Conversion Specialists",
    tagline: "Transform awkward spaces into high-value multifunctional rooms.",
    image: "/images/trade/customers/renovation-conversion-specialists.jpg",
    description:
      "Loft conversions, basement suites, and garage transformations often deal with constrained dimensions. Wall beds unlock genuine multi-room functionality, turning small extensions into home offices by day and guest suites by night.",
    bullets: [
      "Vertical and horizontal models suited to sloped loft ceilings",
      "Straightforward 1–2 hour installation by two trade fitters",
      "Fits any standard depth wardrobe or bespoke framing",
      "Higher client satisfaction and project appraisal value",
    ],
  },
];

export default function TradePage() {
  const { t, localizedHref, market } = useLocale();

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        }),
      });

      if (res.ok) {
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
      } else {
        setSubmitStatus("error");
      }
    } catch (err) {
      console.error("Trade form submission error:", err);
      setSubmitStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  const STATS = [
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
              Factory direct pricing, certified German gas pistons, and comprehensive technical CAD support.
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
              Explore how our precision wall bed mechanisms empower commercial clients across diverse industries.
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
                        Sector #{String(index + 1).padStart(2, "0")}
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
                          Key Advantages:
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
                          <span>Inquire for {sector.title}</span>
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
                Proven Client Results
              </span>
              <h2 className="font-new-york text-3xl sm:text-4xl text-white mt-2">
                Real Projects. Proven Commercial ROI.
              </h2>
              <p className="mt-3 text-sm text-wbk-lightgrey/80 leading-relaxed font-light">
                See how Metropolitan Housing Association, B&H Properties (52 units in Central London), Riverside Shepherd Huts (77+ glamping units), Stoneham Construction, and emergency services fire stations successfully optimize space with Wall Bed King.
              </p>
              <div className="mt-6 flex flex-wrap gap-4 items-center text-xs text-wbk-lightgrey">
                <span className="border-r border-white/20 pr-4">52 London Apartments</span>
                <span className="border-r border-white/20 pr-4">77+ Glamping Huts</span>
                <span className="border-r border-white/20 pr-4">Emergency Rest Stations</span>
                <span>Supported Living</span>
              </div>
            </div>

            <div className="shrink-0">
              <Link
                href={localizedHref("/case-studies")}
                className="px-8 py-4 bg-wbk-gold text-wbk-black text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors text-center inline-block"
              >
                Read All Case Studies
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
                    <p className="text-xs font-bold uppercase tracking-wider text-wbk-black">Direct Commercial Line</p>
                    <a
                      href={`tel:${market.phoneRaw || "+441928583469"}`}
                      className="text-sm font-semibold text-wbk-black hover:text-wbk-green transition-colors"
                    >
                      {market.phone || "01928 583 469"}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded bg-white border border-wbk-lightgrey/80 flex items-center justify-center shrink-0 text-wbk-gold">
                    <IconMail size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-wbk-black">Trade Email Desk</p>
                    <a
                      href="mailto:support@wallbedking.com"
                      className="text-sm font-semibold text-wbk-black hover:text-wbk-green transition-colors"
                    >
                      support@wallbedking.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded bg-white border border-wbk-lightgrey/80 flex items-center justify-center shrink-0 text-wbk-gold">
                    <IconClock size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-wbk-black">Operating Hours</p>
                    <p className="text-xs text-wbk-brown">Monday – Friday: 9:00 – 20:00</p>
                    <p className="text-xs text-wbk-brown">Saturday: 9:00 – 12:00</p>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-white border border-wbk-lightgrey/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-wbk-black mb-1.5">
                  Need CAD Files or Tenders?
                </h4>
                <p className="text-xs text-wbk-brown leading-relaxed">
                  We supply 2D DWG, 3D STEP, and PDF integration manuals for architectural tenders and millwork packages.
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
                    <h3 className="font-new-york text-xl text-green-900">Inquiry Received Successfully</h3>
                    <p className="text-xs sm:text-sm text-green-800 leading-relaxed">
                      {t(
                        "tradePage.formSuccess",
                        "Thank you! Our commercial team will review your project and get back to you within 24 hours."
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitStatus(null)}
                      className="mt-4 px-6 py-2 bg-wbk-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-wbk-gold hover:text-wbk-black transition-colors"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {submitStatus === "error" && (
                      <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs">
                        {t(
                          "tradePage.formError",
                          "Failed to send inquiry. Please try again or email us directly at support@wallbedking.com"
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
                          placeholder="e.g. Jane Doe"
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
                          placeholder="e.g. Acme Developments Ltd"
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
                          placeholder="+44 7123 456789"
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
                          <option value="Hospitality & Hotels">Hospitality & Hotels</option>
                          <option value="Property Development & Micro-Apartments">Property Development & Micro-Apartments</option>
                          <option value="Cabinet Makers & Custom Joiners">Cabinet Makers & Custom Joiners</option>
                          <option value="Independent Furniture Retailers">Independent Furniture Retailers</option>
                          <option value="Care Homes & Assisted Living">Care Homes & Assisted Living</option>
                          <option value="Fire Stations & Emergency Services">Fire Stations & Emergency Services</option>
                          <option value="Hospitals & Healthcare Facilities">Hospitals & Healthcare Facilities</option>
                          <option value="Shepherd's Huts & Glamping Pods">Shepherd's Huts & Glamping Pods</option>
                          <option value="Tiny Homes & Modular Buildings">Tiny Homes & Modular Buildings</option>
                          <option value="Renovation & Conversion Specialists">Renovation & Conversion Specialists</option>
                          <option value="Architectural / Interior Design">Architectural / Interior Design</option>
                          <option value="Other">Other Commercial Application</option>
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
                          <option value="1-5 units">1 – 5 units</option>
                          <option value="6-15 units">6 – 15 units</option>
                          <option value="16-50 units">16 – 50 units</option>
                          <option value="50+ units">50+ units (Large Tender / Scheme)</option>
                          <option value="Ongoing / Retail Account">Ongoing / Retail Partnership</option>
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
                        placeholder="Please describe your project, preferred bed sizes or orientations, delivery timeline, or CAD file requests..."
                      />
                    </div>

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
