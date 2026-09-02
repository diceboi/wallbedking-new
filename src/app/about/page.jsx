"use client";

import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import {
  IconShieldCheck,
  IconCpu,
  IconBuildingFactory2,
  IconScale,
  IconSparkles,
  IconRuler2,
  IconTruck,
  IconLockCheck,
  IconTool,
  IconHeartHandshake,
  IconArrowRight,
  IconStarFilled,
} from "@tabler/icons-react";

const PILLARS = [
  {
    number: "01",
    title: "Lifetime Mechanism Warranty",
    description:
      "While most furniture brands offer 1 to 5 years, we stand behind our European cold-rolled steel mechanisms and piston mountings with an unprecedented Lifetime Warranty.",
    icon: IconShieldCheck,
  },
  {
    number: "02",
    title: "German-Engineered Gas Struts",
    description:
      "Engineered with calibrated automotive gas pistons, our counterbalanced beds require zero strain to operate. Lower or raise your bed effortlessly in under 5 seconds with a single hand.",
    icon: IconCpu,
  },
  {
    number: "03",
    title: "Direct European Manufacturer",
    description:
      "We are not middlemen or dropshippers. We design, weld, and inspect every bed frame mechanism in our European facility, passing factory-direct savings straight to you.",
    icon: IconBuildingFactory2,
  },
  {
    number: "04",
    title: "Everyday Orthopedic Comfort",
    description:
      "Unlike temporary sofa beds, our beds feature genuine sprung birch slats and accept luxury standard mattresses up to 30cm thick. Built for 365 nights of restorative sleep a year.",
    icon: IconSparkles,
  },
  {
    number: "05",
    title: "24 Size & Orientation Choices",
    description:
      "From compact Single (76x190cm) to expansive Super King (180x200cm), in both Vertical and Horizontal orientations. Whatever your room dimensions, we have the exact fit.",
    icon: IconRuler2,
  },
  {
    number: "06",
    title: "Uncompromising Value For Money",
    description:
      "By eliminating dealership markups and wholesale commissions, we deliver industrial-grade wall beds from £419 that outperform systems costing over £2,500 elsewhere.",
    icon: IconScale,
  },
  {
    number: "07",
    title: "Fast, Reliable Mainland UK Delivery",
    description:
      "With high stock availability in our Harlow warehouse, choose from Free Economy, Standard, or Express delivery directly to your door, or same-week Click & Collect.",
    icon: IconTruck,
  },
  {
    number: "08",
    title: "Straightforward DIY Assembly",
    description:
      "Clear step-by-step manuals, hardware labeling, and video tutorials ensure a quick, stress-free installation. Two people can securely mount the bed in 1 to 2 hours.",
    icon: IconTool,
  },
  {
    number: "09",
    title: "30-Day Money-Back Guarantee",
    description:
      "Try your Wall Bed King in your own home with complete peace of mind. If you are not completely satisfied within 30 days, we issue a full refund of your purchase price.",
    icon: IconHeartHandshake,
  },
  {
    number: "10",
    title: "Secure, Flexible Payment Options",
    description:
      "Shop with 256-bit SSL encrypted checkout via PayPal, Visa, Mastercard, or spread the cost interest-free with PayPal Credit. Telephone orders are also welcome.",
    icon: IconLockCheck,
  },
];

const STATS = [
  { value: "50,000+", label: "Homes Transformed Across UK & Europe" },
  { value: "30+ Years", label: "Engineered Mechanism Lifespan" },
  { value: "4.9 / 5", label: "Customer Satisfaction Rating" },
  { value: "100%", label: "Recyclable Heavy Gauge Steel" },
];

export default function AboutPage() {
  return (
    <div className="bg-wbk-white min-h-screen pt-12 pb-24 font-poppins">
      {/* Hero Section */}
      <section className="border-b border-wbk-lightgrey/60 bg-[#FBF9F8] py-16 sm:py-24">
        <Container size="xl">
          <div className="max-w-3xl">
            <nav className="flex items-center gap-1.5 text-[11px] text-wbk-brown/80 mb-4">
              <Link href="/" className="hover:text-wbk-black transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-wbk-black font-medium">About Us</span>
            </nav>

            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-wbk-gold mb-3">
              European Engineering & Space-Saving Innovation
            </span>
            <h1 className="font-new-york text-4xl sm:text-5xl md:text-6xl text-wbk-black tracking-tight leading-tight">
              Reclaiming space. Redefining how we live.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-wbk-brown leading-relaxed font-light">
              Founded on the belief that a premium bed should never dominate your living space,
              Wall Bed King has become the UK and Europe&apos;s leading Murphy bed specialist.
              We design modular fold-away systems that give you the comfort of a luxury master bedroom
              by night, and a completely open room by day.
            </p>
          </div>
        </Container>
      </section>

      {/* Brand Stats Grid */}
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

      {/* Story & Philosophy Section */}
      <section className="py-20 sm:py-28 border-b border-wbk-lightgrey/60">
        <Container size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-wbk-green">
                Our Story & Purpose
              </span>
              <h2 className="font-new-york text-3xl sm:text-4xl text-wbk-black leading-tight">
                Designed for everyday living, not just guest rooms.
              </h2>
              <p className="text-sm sm:text-base text-wbk-brown leading-relaxed">
                Modern living spaces—whether in London apartments, regional family homes, or contemporary
                studios—are more multifunctional than ever. Yet conventional beds permanently consume
                over 80% of floor space in bedrooms, guest rooms, and home offices.
              </p>
              <p className="text-sm sm:text-base text-wbk-brown leading-relaxed">
                Wall Bed King was founded to disrupt this dilemma. By manufacturing our own cold-rolled
                steel mechanisms and pairing them with counterbalanced gas struts and sprung birch wood
                slats, we eliminated the clunky, heavy springs and flimsy frames of yesterday. The result
                is an effortless, feather-light foldaway bed engineered for decades of daily use.
              </p>
              <div className="pt-2">
                <Link
                  href="/products/beds"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-wbk-black text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-wbk-green transition-colors"
                >
                  <span>Explore Bed Collection</span>
                  <IconArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-wbk-lightgrey/60 bg-[#F4F2F0]">
                <Image
                  src="/product-images/morphy-integrated/160x200.jpg"
                  alt="Modern Wall Bed King Murphy Bed in contemporary bedroom"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-wbk-lightgrey shadow-lg">
                  <div className="flex items-center gap-1 text-wbk-gold mb-1">
                    {[...Array(5)].map((_, i) => (
                      <IconStarFilled key={i} size={14} />
                    ))}
                  </div>
                  <p className="text-xs font-medium text-wbk-black">
                    &ldquo;Saved our spare room. It&apos;s a fully functional office during weekdays, and a luxury guest room at weekends.&rdquo;
                  </p>
                  <p className="mt-1 text-[10px] text-wbk-brown uppercase tracking-wider">
                    Verified Customer — London, UK
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 10 Reasons / Why Choose Us Grid */}
      <section className="py-20 sm:py-28 bg-[#FBF9F8]">
        <Container size="xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-wbk-gold">
              Why Buy From WallBedKing
            </span>
            <h2 className="mt-2 font-new-york text-3xl sm:text-4xl md:text-5xl text-wbk-black">
              10 reasons why we lead the market
            </h2>
            <p className="mt-3 text-sm text-wbk-brown">
              Precision engineering, factory-direct savings, and customer service you can rely on.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.number}
                  className="bg-white p-7 rounded-3xl border border-wbk-lightgrey/80 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-[#F4F2F0] text-wbk-black flex items-center justify-center group-hover:bg-wbk-black group-hover:text-wbk-gold transition-colors">
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

      {/* Visit Showroom Banner */}
      <section className="py-16 sm:py-20 border-t border-wbk-lightgrey/60 bg-white">
        <Container size="xl">
          <div className="bg-wbk-black rounded-3xl p-8 sm:p-14 text-white flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-wbk-gold">
                Showroom & Warehouse
              </span>
              <h2 className="font-new-york text-3xl sm:text-4xl text-white mt-2">
                Experience our beds in person
              </h2>
              <p className="mt-3 text-sm text-wbk-lightgrey/80 leading-relaxed font-light">
                Visit our showroom in Harlow, Essex (CM20 2HU) just north of London. Test the effortless
                gas piston mechanism, inspect the cabinet finishes, and speak directly with our engineering specialists.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <Link
                href="/contact"
                className="px-6 py-3.5 bg-wbk-gold text-wbk-black text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-white transition-colors text-center"
              >
                Book Showroom Visit
              </Link>
              <a
                href="tel:08000288940"
                className="px-6 py-3.5 border border-white/30 hover:border-white text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-colors text-center"
              >
                Call 0800 028 8940
              </a>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
