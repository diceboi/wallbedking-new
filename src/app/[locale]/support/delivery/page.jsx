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
} from "@tabler/icons-react";
import { IconShieldCheck } from "@tabler/icons-react";
import { useLocale } from "@/context/LocaleContext";

export default function DeliveryPage() {
  const { t, localizedHref } = useLocale();

  const DELIVERY_TIERS = [
    {
      name: t("support.tierEconomyName", "Economy Delivery"),
      price: t("support.tierEconomyPrice", "FREE"),
      timeline: t("support.tierEconomyTimeline", "2 – 4 Weeks"),
      badge: t("support.tierEconomyBadge", "Most Popular"),
      description: t("support.tierEconomyDesc", "Our complimentary delivery service across mainland UK on all bed orders."),
      features: [
        t("support.tierEconomyF1", "Zero shipping charges at checkout"),
        t("support.tierEconomyF2", "Full tracking notification before dispatch"),
        t("support.tierEconomyF3", "Delivered directly to your door"),
        t("support.tierEconomyF4", "All mainland UK postcodes included"),
      ],
    },
    {
      name: t("support.tierStandardName", "Standard Delivery"),
      price: t("support.tierStandardPrice", "£49"),
      timeline: t("support.tierStandardTimeline", "1 – 2 Weeks"),
      badge: t("support.tierStandardBadge", "Faster Transit"),
      description: t("support.tierStandardDesc", "Accelerate transit and receive your wall bed within 7 to 14 calendar days."),
      features: [
        t("support.tierStandardF1", "Priority warehouse staging"),
        t("support.tierStandardF2", "Dedicated courier dispatch slot"),
        t("support.tierStandardF3", "SMS & email delivery time window"),
        t("support.tierStandardF4", "Ideal for scheduled room renovations"),
      ],
    },
    {
      name: t("support.tierExpressName", "Express Delivery"),
      price: t("support.tierExpressPrice", "£79"),
      timeline: t("support.tierExpressTimeline", "2 – 5 Working Days"),
      badge: t("support.tierExpressBadge", "Speediest Option"),
      description: t("support.tierExpressDesc", "Super-speedy priority service for in-stock wall bed frames and mechanisms."),
      features: [
        t("support.tierExpressF1", "Same-day or next-day warehouse pick"),
        t("support.tierExpressF2", "Express 2–5 business day delivery"),
        t("support.tierExpressF3", "Real-time courier tracking link"),
        t("support.tierExpressF4", "Available across mainland UK"),
      ],
    },
    {
      name: t("support.tierCollectName", "Click & Collect"),
      price: t("support.tierCollectPrice", "FREE"),
      timeline: t("support.tierCollectTimeline", "Ready in 24–48 Hours"),
      badge: t("support.tierCollectBadge", "Collect in Person"),
      description: t("support.tierCollectDesc", "Collect directly from our central warehouse in Harlow, Essex (North of London)."),
      features: [
        t("support.tierCollectF1", "Zero delivery fee"),
        t("support.tierCollectF2", "Flexible collection by appointment"),
        t("support.tierCollectF3", "Inspection upon pickup"),
        t("support.tierCollectF4", "Ample parking for vans, SUVs, or estate cars"),
      ],
    },
  ];

  const PRE_DELIVERY_STEPS = [
    {
      step: "01",
      title: t("support.pStep1Title", "Order Staged & Quality Checked"),
      desc: t("support.pStep1Desc", "Every steel mechanism, spring-loaded piston assembly, and beech slat bundle is inspected before packing in heavy-duty cartons."),
    },
    {
      step: "02",
      title: t("support.pStep2Title", "Courier Dispatch & Tracking"),
      desc: t("support.pStep2Desc", "Once your order leaves our Harlow facility, you receive automated tracking credentials via SMS and email."),
    },
    {
      step: "03",
      title: t("support.pStep3Title", "Delivery Slot Notification"),
      desc: t("support.pStep3Desc", "The logistics carrier contacts you prior to the delivery date to schedule an agreed time slot."),
    },
    {
      step: "04",
      title: t("support.pStep4Title", "Doorstep Delivery & Inspection"),
      desc: t("support.pStep4Desc", "Flat-packed cartons are delivered to your threshold, engineered to easily fit through narrow doors, hallways, and elevators."),
    },
  ];

  return (
    <div className="bg-wbk-white min-h-screen pt-12 pb-24 font-poppins">
      {/* Header Section */}
      <section className="border-b border-wbk-lightgrey/60 bg-[#FBF9F8] py-16 sm:py-20">
        <Container size="xl">
          <div className="max-w-3xl">
            <nav className="flex items-center gap-1.5 text-[11px] text-wbk-brown/80 mb-4">
              <Link href={localizedHref("/")} className="hover:text-wbk-black transition-colors">
                {t("nav.home", "Home")}
              </Link>
              <span>/</span>
              <span className="text-wbk-brown/80">{t("nav.support", "Support")}</span>
              <span>/</span>
              <span className="text-wbk-black font-medium">{t("support.deliveryTitle", "Delivery & Logistics")}</span>
            </nav>

            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-wbk-gold mb-3">
              {t("support.fastReliableDelivery", "Fast, Reliable Delivery")}
            </span>
            <h1 className="font-new-york text-4xl sm:text-5xl md:text-6xl text-wbk-black tracking-tight leading-tight">
              {t("support.deliveryHeading", "Delivery options tailored to your schedule")}
            </h1>
            <p className="mt-4 text-sm sm:text-base text-wbk-brown leading-relaxed font-light">
              {t("support.deliverySubtitle", "From free economy delivery to rapid 2–5 day express dispatch, we ensure your space-saving wall bed arrives safely, securely, and on time.")}
            </p>
          </div>
        </Container>
      </section>

      {/* Delivery Tiers Grid */}
      <Container size="xl" className="pt-16 sm:pt-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-new-york text-3xl sm:text-4xl text-wbk-black">
            {t("support.chooseDeliverySpeed", "Choose Your Delivery Speed")}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-wbk-brown">
            {t("support.chooseDeliverySpeedDesc", "Select your preferred shipping option during checkout or collect from our warehouse.")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DELIVERY_TIERS.map((tier) => (
            <div
              key={tier.name}
              className="bg-white rounded-none border border-wbk-lightgrey p-7 flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
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
        <div className="bg-[#FBF9F8] rounded-none border border-wbk-lightgrey p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2 text-wbk-gold text-xs font-semibold uppercase tracking-wider">
                <IconWorld size={18} />
                <span>{t("support.internationalBadge", "Deliveries Outside The UK")}</span>
              </div>
              <h3 className="font-new-york text-2xl sm:text-3xl text-wbk-black">
                {t("support.internationalTitle", "Shipping Across Europe & Worldwide")}
              </h3>
              <p className="text-xs sm:text-sm text-wbk-brown leading-relaxed">
                {t("support.internationalDesc", "We frequently deliver to customers across the European Union as well as the USA. Because overseas freight depends on destination and volume, contact our logistics team before ordering for a custom rate.")}
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
              <Link
                href="/contact"
                className="px-6 py-3 bg-wbk-black hover:bg-wbk-green text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-colors text-center"
              >
                {t("topbar.contact", "Contact Logistics Team")}
              </Link>
            </div>
          </div>
        </div>
      </Container>

      {/* Pre-Delivery & Packaging Journey */}
      <Container size="xl" className="pt-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-wbk-gold">
            {t("support.logisticsProcess", "The Logistics Process")}
          </span>
          <h2 className="mt-1 font-new-york text-3xl sm:text-4xl text-wbk-black">
            {t("support.whatToExpect", "What to expect from dispatch to delivery")}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRE_DELIVERY_STEPS.map((s) => (
            <div key={s.step} className="p-6 rounded-none border border-wbk-lightgrey/80 bg-white">
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
        <div className="border border-wbk-lightgrey rounded-none p-8 sm:p-12 bg-white flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xs">
          <div className="flex items-center gap-4 max-w-xl">
            <div className="w-12 h-12 rounded-none bg-[#F4F2F0] text-wbk-black flex items-center justify-center shrink-0">
              <IconBuildingWarehouse size={24} className="text-wbk-gold" />
            </div>
            <div>
              <h3 className="font-new-york text-2xl text-wbk-black">
                {t("support.harlowCollectTitle", "Collecting In Person from Harlow?")}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-wbk-brown leading-relaxed">
                {t(
                  "support.harlowCollectDesc",
                  "Our central warehouse is conveniently situated in Harlow, Essex (CM20 2HU) just off the M11, north of London. Please ensure you arrange an appointment at least 24 hours in advance so our warehouse team can have your order staged and ready for pickup."
                )}
              </p>
            </div>
          </div>
          <div className="shrink-0 flex gap-4">
            <Link
              href={localizedHref("/contact")}
              className="px-6 py-3 bg-wbk-black hover:bg-wbk-green text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-colors"
            >
              {t("support.bookAppointmentBtn", "Book Collection Appointment")}
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
