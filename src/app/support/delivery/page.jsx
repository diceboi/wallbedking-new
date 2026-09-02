"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import {
  IconTruck,
  IconClock,
  IconBox,
  IconWorld,
  IconBuildingWarehouse,
  IconCheck,
  IconAlertCircle,
  IconPhoneCall,
  IconShieldCheck,
} from "@tabler/icons-react";

const DELIVERY_TIERS = [
  {
    name: "Economy Delivery",
    price: "FREE",
    timeline: "2 – 4 Weeks",
    badge: "Most Popular",
    description: "Our complimentary delivery service across mainland UK on all bed orders.",
    features: [
      "Zero shipping charges at checkout",
      "Full tracking notification before dispatch",
      "Delivered directly to your door",
      "All mainland UK postcodes included",
    ],
  },
  {
    name: "Standard Delivery",
    price: "£49",
    timeline: "1 – 2 Weeks",
    badge: "Faster Transit",
    description: "Accelerate transit and receive your wall bed within 7 to 14 calendar days.",
    features: [
      "Priority warehouse staging",
      "Dedicated courier dispatch slot",
      "SMS & email delivery time window",
      "Ideal for scheduled room renovations",
    ],
  },
  {
    name: "Express Delivery",
    price: "£79",
    timeline: "2 – 5 Working Days",
    badge: "Speediest Option",
    description: "Super-speedy priority service for in-stock wall bed frames and mechanisms.",
    features: [
      "Same-day or next-day warehouse pick",
      "Express 2–5 business day delivery",
      "Real-time courier tracking link",
      "Available across mainland UK",
    ],
  },
  {
    name: "Click & Collect",
    price: "FREE",
    timeline: "Ready in 24–48 Hours",
    badge: "Collect in Person",
    description: "Collect directly from our central warehouse in Harlow, Essex (North of London).",
    features: [
      "Zero delivery fee",
      "Flexible collection by appointment",
      "Inspection upon pickup",
      "Ample parking for vans, SUVs, or estate cars",
    ],
  },
];

const PRE_DELIVERY_STEPS = [
  {
    step: "01",
    title: "Order Staged & Quality Checked",
    desc: "Every steel mechanism, spring-loaded piston assembly, and beech slat bundle is inspected before packing in heavy-duty cartons.",
  },
  {
    step: "02",
    title: "Courier Dispatch & Tracking",
    desc: "Once your order leaves our Harlow facility, you receive automated tracking credentials via SMS and email.",
  },
  {
    step: "03",
    title: "Delivery Slot Notification",
    desc: "The logistics carrier contacts you prior to the delivery date to schedule an agreed time slot.",
  },
  {
    step: "04",
    title: "Doorstep Delivery & Inspection",
    desc: "Flat-packed cartons are delivered to your threshold, engineered to easily fit through narrow doors, hallways, and elevators.",
  },
];

export default function DeliveryPage() {
  return (
    <div className="bg-wbk-white min-h-screen pt-12 pb-24 font-poppins">
      {/* Header Section */}
      <section className="border-b border-wbk-lightgrey/60 bg-[#FBF9F8] py-16 sm:py-20">
        <Container size="xl">
          <div className="max-w-3xl">
            <nav className="flex items-center gap-1.5 text-[11px] text-wbk-brown/80 mb-4">
              <Link href="/" className="hover:text-wbk-black transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-wbk-brown/80">Support</span>
              <span>/</span>
              <span className="text-wbk-black font-medium">Delivery & Logistics</span>
            </nav>

            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-wbk-gold mb-3">
              Fast, Reliable Mainland UK Delivery
            </span>
            <h1 className="font-new-york text-4xl sm:text-5xl md:text-6xl text-wbk-black tracking-tight leading-tight">
              Delivery options tailored to your schedule
            </h1>
            <p className="mt-4 text-sm sm:text-base text-wbk-brown leading-relaxed font-light">
              From free economy delivery to rapid 2–5 day express dispatch, we ensure your
              space-saving wall bed arrives safely, securely, and on time.
            </p>
          </div>
        </Container>
      </section>

      {/* Delivery Tiers Grid */}
      <Container size="xl" className="pt-16 sm:pt-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-new-york text-3xl sm:text-4xl text-wbk-black">
            Choose Your Delivery Speed
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-wbk-brown">
            Select your preferred shipping option during checkout or collect from our Harlow warehouse.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DELIVERY_TIERS.map((tier) => (
            <div
              key={tier.name}
              className="bg-white rounded-3xl border border-wbk-lightgrey p-7 flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
            >
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#F4F2F0] text-wbk-black mb-4">
                  {tier.badge}
                </span>
                <h3 className="font-poppins font-semibold text-lg text-wbk-black">
                  {tier.name}
                </h3>
                <div className="mt-4 mb-4">
                  <span className="font-new-york text-3xl font-normal text-wbk-black">
                    {tier.price}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-wbk-gold font-medium mt-1">
                    <IconClock size={14} />
                    <span>{tier.timeline}</span>
                  </div>
                </div>
                <p className="text-xs text-wbk-brown leading-relaxed mb-6">
                  {tier.description}
                </p>
                <div className="space-y-2.5 pt-4 border-t border-wbk-lightgrey/60">
                  {tier.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2 text-xs text-wbk-black">
                      <IconCheck size={15} className="text-wbk-green shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>

      {/* European & International Delivery */}
      <Container size="xl" className="pt-20">
        <div className="bg-[#FBF9F8] rounded-3xl border border-wbk-lightgrey p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2 text-wbk-gold text-xs font-semibold uppercase tracking-wider">
                <IconWorld size={18} />
                <span>Deliveries Outside The UK</span>
              </div>
              <h3 className="font-new-york text-2xl sm:text-3xl text-wbk-black">
                Shipping Across Europe & Worldwide
              </h3>
              <p className="text-xs sm:text-sm text-wbk-brown leading-relaxed">
                We frequently deliver to customers across the European Union (Germany, France, Spain,
                Italy, Netherlands, and Scandinavia) as well as the USA. Because overseas freight costs
                depend on destination country and total package volume, please contact our logistics team
                before placing your order so we can confirm an accurate, discounted international shipping rate.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
              <Link
                href="/contact"
                className="px-6 py-3.5 bg-wbk-black hover:bg-wbk-green text-white text-xs font-semibold uppercase tracking-wider rounded-full text-center transition-colors"
              >
                Request Overseas Quote
              </Link>
              <a
                href="mailto:support@wallbedking.com"
                className="px-6 py-3.5 border border-wbk-lightgrey bg-white hover:border-wbk-black text-wbk-black text-xs font-semibold uppercase tracking-wider rounded-full text-center transition-colors"
              >
                Email Logistics Team
              </a>
            </div>
          </div>
        </div>
      </Container>

      {/* Pre-Delivery & Packaging Journey */}
      <Container size="xl" className="pt-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-wbk-gold">
            The Logistics Process
          </span>
          <h2 className="mt-1 font-new-york text-3xl sm:text-4xl text-wbk-black">
            What to expect from dispatch to delivery
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRE_DELIVERY_STEPS.map((s) => (
            <div key={s.step} className="p-6 rounded-3xl border border-wbk-lightgrey/80 bg-white">
              <span className="font-mono text-xs font-bold text-wbk-gold">
                {s.step}
              </span>
              <h4 className="font-poppins font-semibold text-sm text-wbk-black mt-3 mb-2">
                {s.title}
              </h4>
              <p className="text-xs text-wbk-brown leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </Container>

      {/* Click & Collect Showroom Card */}
      <Container size="xl" className="pt-20">
        <div className="border border-wbk-lightgrey rounded-3xl p-8 sm:p-12 bg-white flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xs">
          <div className="flex items-start gap-5 max-w-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[#F4F2F0] text-wbk-black flex items-center justify-center shrink-0">
              <IconBuildingWarehouse size={24} className="text-wbk-gold" />
            </div>
            <div>
              <h3 className="font-new-york text-2xl text-wbk-black">
                Collecting In Person from Harlow?
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-wbk-brown leading-relaxed">
                Our central warehouse is conveniently situated in Harlow, Essex (CM20 2HU) just off the M11, north of London.
                Please ensure you arrange an appointment at least 24 hours in advance so our warehouse team can have your
                order staged and ready for pickup.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex gap-4">
            <Link
              href="/contact"
              className="px-6 py-3 bg-wbk-black hover:bg-wbk-green text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-colors"
            >
              Book Collection Appointment
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
