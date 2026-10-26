"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { useLocale } from "@/context/LocaleContext";
import {
  IconQuote,
  IconBuildingCommunity,
  IconBuildingSkyscraper,
  IconFlame,
  IconHome,
  IconArrowRight,
  IconCheck,
  IconBriefcase,
  IconStarFilled,
  IconSparkles,
} from "@tabler/icons-react";

const CASE_STUDIES = [
  {
    id: "metropolitan-housing",
    category: "housing",
    categoryLabel: "Supported Living & Care",
    client: "Metropolitan Housing Association",
    contactPerson: "Delphine Chandler",
    contactRole: "Care and Support Manager",
    headline: "Delivering Instant Overnight Flexibility in Supported Living Lounges",
    image: "/images/trade/trade-metropolitan.jpg",
    stats: [
      { value: "140", label: "Units Managed in Scheme" },
      { value: "£600 vs £3,000", label: "Competitive Price Advantage" },
      { value: "5 / 5", label: "Client Satisfaction Score" },
    ],
    challenge:
      "Managing supported living complexes for individuals with learning disabilities requires finding temporary beds at very short notice. Permanent beds in communal lounges were unworkable; a sturdy bed was needed that could be folded out overnight and tidied away in seconds each morning.",
    solution:
      "Metropolitan Housing Association selected Wall Bed King's double wall bed system. Because they are publicly funded, price and durability were paramount. Research revealed competitor systems ranging up to £3,000 for comparable specifications.",
    outcome:
      "The Wall Bed King mechanism was delivered promptly with VAT included for seamless public administration. Months on, staff and service users report flawless daily performance, superior orthopedic comfort, and effortless operation.",
    quote:
      "Save yourself time searching the internet. I'd recommend this company to anyone thinking of purchasing a folding bed. In fact, ask my friends and colleagues and you'll find I already have.",
  },
  {
    id: "bh-properties",
    category: "development",
    categoryLabel: "Prime Urban Development",
    client: "B&H Properties",
    contactPerson: "Joel Snitzer",
    contactRole: "Property Developer",
    headline: "52 Wall Beds Installed Across Modern City of London Apartments",
    image: "/images/trade/trade-bh-properties.jpg",
    stats: [
      { value: "52", label: "Wall Beds Installed" },
      { value: "100%", label: "Tenant Comfort Rating" },
      { value: "Lifetime", label: "Mechanism Guarantee Confidence" },
    ],
    challenge:
      "Developing high-standard luxury rental apartments in Central London where maximizing perceived living space is the key to commanding premium rental yields. Standard freestanding beds would dominate bedrooms and prevent daytime office or recreation usage.",
    solution:
      "B&H Properties procured 52 double wall bed systems directly from Wall Bed King. The industrial build quality, sleek profile, and Lifetime Warranty gave the development team total confidence for a volume investment.",
    outcome:
      "The beds were installed efficiently and operate seamlessly. Tenants enjoy full-size master bedrooms by night, and spacious home offices or children's play areas by day—with zero sleep quality compromises.",
    quote:
      "They were easy to install and worked beautifully once we saw them in situ. In fact, they're quite brilliant. We've never had any complaints about sleepless nights. Overall you can say I'm a very happy man with my purchases from WallBedKing.",
  },
  {
    id: "riverside-shepherd-huts",
    category: "hospitality",
    categoryLabel: "Bespoke Glamping & Hospitality",
    client: "Riverside Shepherd Huts",
    contactPerson: "Jane Richmond",
    contactRole: "Co-Founder & Director",
    headline: "Doubling Usable Living Space in 77+ Handcrafted Shepherd Huts",
    image: "/images/trade/trade-riverside-shepherd-huts.jpg",
    stats: [
      { value: "77+", label: "Luxury Huts Delivered" },
      { value: "2x", label: "Usable Daytime Living Space" },
      { value: "24-48h", label: "Fast Dispatch Turnaround" },
    ],
    challenge:
      "Artisan shepherd huts and glamping retreats offer limited internal square footage. Guests expect full luxury sleeping comfort, yet permanent beds cluttered the interior and restricted daytime dining and relaxing.",
    solution:
      "Riverside Shepherd Huts integrated Wall Bed King mechanisms concealed within custom timber cabinetry. Counterbalanced gas pistons allow guests to lift the bed with one hand, revealing a spacious lounge and dining area.",
    outcome:
      "With over 77 huts sold across the UK and South of France, the wall beds have become a signature selling point. Fast warehouse delivery ensures Riverside Shepherd Huts maintains punctual manufacturing schedules.",
    quote:
      "The wall beds are incredibly popular and it's not difficult to see why. They're just such a brilliant space-saving device, yet so functional. Orders are coming in all the time and that's exactly why we need a supplier like Wall Bed King we can rely on.",
  },
  {
    id: "stoneham-construction",
    category: "development",
    categoryLabel: "Social Housing & Conversions",
    client: "Stoneham Construction Ltd",
    contactPerson: "David Harris",
    contactRole: "Managing Director",
    headline: "Creating 2-Bedroom Living Capability Within 1-Room Layouts",
    image: "/images/trade/trade-stoneham-construction.gif",
    stats: [
      { value: "10", label: "Double Beds Integrated" },
      { value: "2-in-1", label: "Bedroom Multi-Functionality" },
      { value: "Acoustic", label: "Partition Wall Integration" },
    ],
    challenge:
      "On the Isle of Wight where land is at an absolute premium, Stoneham Construction was converting large single-room spaces into social housing rentals for local families. Accommodating two distinct sleeping areas within one open volume without blowing the budget was a complex architectural challenge.",
    solution:
      "Developer David Harris fitted 10 double wall beds behind custom neutral wardrobes against newly installed acoustic partition walls, giving each room independent sleeping and living versatility.",
    outcome:
      "The installation proved simple, aesthetic, and exceptionally durable. Tenants gained spacious, commodious living accommodation, and Stoneham Construction established a repeat commercial partnership with Wall Bed King.",
    quote:
      "Investing in quality wall beds was the obvious answer to this tricky dilemma. We fitted them into wardrobes painted the same neutral colour as the room, so they are completely unobtrusive and actually add to the aesthetics of the room.",
  },
  {
    id: "lincolnshire-fire",
    category: "public-services",
    categoryLabel: "Emergency Services",
    client: "Lincolnshire Fire and Rescue Unit",
    contactPerson: "Station Logistics",
    contactRole: "Facility Management",
    headline: "Instant Shift Rest Quarters That Vanish When the Alarm Sounds",
    image: "/images/trade/trade-linconshire-fire-rescue.gif",
    stats: [
      { value: "3s", label: "Instant Bed Stowage" },
      { value: "24/7", label: "Operational Readiness" },
      { value: "100%", label: "Industrial Heavy Gauge Steel" },
    ],
    challenge:
      "Emergency service personnel require dependable, quiet rest between demanding callouts. However, station footprints are heavily restricted, and training, physical drills, and briefing sessions require wide open communal space.",
    solution:
      "Lincolnshire Fire & Rescue installed Wall Bed King commercial mechanisms in station on-call quarters. High-grade German gas struts ensure the beds can be stowed away effortlessly in 3 seconds flat.",
    outcome:
      "Station dormitories instantly convert into multipurpose training and briefing halls during daylight hours, maximizing facility efficiency while ensuring firefighters enjoy genuine orthopedic rest during long night shifts.",
    quote:
      "When the alarm sounds, the last thing anyone should worry about is their bed. Wall Bed King beds are rugged, silent, and effortlessly stowed in seconds.",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Projects" },
  { id: "development", label: "Property Development" },
  { id: "hospitality", label: "Hospitality & Glamping" },
  { id: "housing", label: "Supported Living & Care" },
  { id: "public-services", label: "Public & Emergency Services" },
];

export default function CaseStudiesPage() {
  const { t, localizedHref } = useLocale();
  const [activeCategory, setActiveCategory] = useState("all");

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
                        Client: <strong className="text-wbk-black">{study.client}</strong>
                      </p>
                    </div>

                    <div className="space-y-4 text-xs sm:text-sm text-wbk-brown leading-relaxed">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-wbk-black mb-1.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-wbk-gold rounded-full" />
                          The Challenge
                        </h4>
                        <p>{study.challenge}</p>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-wbk-black mb-1.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-wbk-green rounded-full" />
                          The Wall Bed King Solution
                        </h4>
                        <p>{study.solution}</p>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-wbk-black mb-1.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-wbk-black rounded-full" />
                          The Commercial Outcome
                        </h4>
                        <p>{study.outcome}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-wbk-lightgrey/70 flex items-center gap-4">
                      <Link
                        href={localizedHref("/trade#inquiry-form")}
                        className="px-6 py-3 bg-wbk-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-wbk-gold hover:text-wbk-black transition-colors inline-flex items-center gap-2"
                      >
                        <span>Start Similar Project</span>
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
              Collaborate With Wall Bed King
            </span>
            <h2 className="font-new-york text-3xl sm:text-4xl md:text-5xl text-white">
              Ready to transform your next development or hospitality scheme?
            </h2>
            <p className="text-sm sm:text-base text-wbk-lightgrey/80 font-light leading-relaxed">
              Our engineering and commercial team is available to review your architectural drawings, recommend optimal Murphy bed orientations, and structure competitive volume pricing.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link
                href={localizedHref("/trade#inquiry-form")}
                className="px-8 py-4 bg-wbk-gold text-wbk-black text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors"
              >
                Inquire For Your Project
              </Link>
              <Link
                href={localizedHref("/trade")}
                className="px-8 py-4 border border-white/30 text-white text-xs font-bold uppercase tracking-wider hover:border-white transition-colors"
              >
                Explore Trade Services
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
