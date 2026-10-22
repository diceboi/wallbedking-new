"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import {
  IconTools,
  IconVideo,
  IconAlertTriangle,
  IconCheck,
  IconDownload,
  IconChevronRight,
  IconArrowRight,
  IconPhoneCall,
} from "@tabler/icons-react";
import { useLocale } from "@/context/LocaleContext";

export default function InstallationGuidesPage() {
  const { t, localizedHref } = useLocale();

  const REQUIRED_TOOLS = [
    { name: t("support.toolDrill", "Power Drill & Drill Bits"), spec: t("support.toolDrillSpec", "10mm masonry or wood bit") },
    { name: t("support.toolSpanners", "Spanners / Sockets"), spec: t("support.toolSpannersSpec", "10mm & 13mm wrenches") },
    { name: t("support.toolLevel", "Spirit Level"), spec: t("support.toolLevelSpec", "Minimum 60cm for frame squareness") },
    { name: t("support.toolMeasure", "Tape Measure & Pencil"), spec: t("support.toolMeasureSpec", "For precise anchor height markings") },
    { name: t("support.toolScrewdriver", "Cross-head Screwdriver"), spec: t("support.toolScrewdriverSpec", "PZ2 / Phillips #2") },
    { name: t("support.toolGlasses", "Safety Glasses & Gloves"), spec: t("support.toolGlassesSpec", "Recommended for drilling") },
  ];

  const GUIDE_SECTIONS = [
    {
      id: "prep",
      title: t("support.step1Title", "1. Pre-Installation & Workspace Preparation"),
      tips: [
        t("support.step1Tip1", "Clear a working space of at least 3m x 2.5m on a clean, soft floor (carpet or cardboard) to avoid scratching the powder-coated steel frame."),
        t("support.step1Tip2", "Unpack the cartons and identify the parts using the included hardware blister pack: main outer frame, inner bed frame, sprung birch slats, plastic slat caps, gas piston cylinders, and mounting brackets."),
        t("support.step1Tip3", "Verify the wall and floor structure: ensure there are no hidden electrical cables or plumbing pipes in the drilling zone."),
      ],
    },
    {
      id: "brackets",
      title: t("support.step2Title", "2. Mounting Brackets & Wall / Floor Anchoring"),
      tips: [
        t("support.step2Tip1", "The Wall Bed King mechanism offers unique flexibility: you can anchor the brackets to a solid wall, to the floor, or both."),
        t("support.step2Tip2", "Solid Masonry Walls (Brick / Concrete): Use the heavy-duty wall anchors provided. Drill 10mm holes at the marked heights, insert rawl plugs, and securely bolt the L-brackets."),
        t("support.step2Tip3", "Stud Walls (Plasterboard / Drywall): Never fix into hollow plasterboard alone! Locate the vertical timber or metal studs using a stud finder and secure the brackets directly into the structural studs."),
        t("support.step2Tip4", "Floor Fixing: If wall fixing is not possible, the mounting brackets can be secured directly into a concrete slab or solid timber floorboards."),
      ],
    },
    {
      id: "frame",
      title: t("support.step3Title", "3. Outer Frame & Pivot Mechanism Assembly"),
      tips: [
        t("support.step3Tip1", "Assemble the rectangular outer frame using the M8 corner bolts and tighten securely with a 13mm socket."),
        t("support.step3Tip2", "Attach the heavy-duty pivot brackets to the left and right uprights."),
        t("support.step3Tip3", "Position the outer frame against your wall and level it carefully using your spirit level before fully tightening the anchor bolts."),
      ],
    },
    {
      id: "bedframe",
      title: t("support.step4Title", "4. Inner Bed Frame & Gas Piston Installation"),
      tips: [
        t("support.step4Tip1", "Assemble the inner bed frame that will support the mattress."),
        t("support.step4Tip2", "Carefully align the inner frame with the outer frame pivot brackets and insert the heavy-gauge pivot pins with locking nylon nuts."),
        t("support.step4Tip3", "Attach the German gas piston cylinders: Ensure the piston rod points downwards when the bed is closed. Hook the gas struts onto the ball joints and snap the safety retaining clips into place."),
        t("support.step4Tip4", "Caution: Do not attempt to compress the gas pistons by hand! They are calibrated to balance the combined weight of the frame and mattress."),
      ],
    },
    {
      id: "slats",
      title: t("support.step5Title", "5. Sprung Birch Slats & Mattress Securing"),
      tips: [
        t("support.step5Tip1", "Slide the plastic slat caps onto both ends of the curved birch wood slats."),
        t("support.step5Tip2", "Press the caps firmly into the pre-drilled holes along the bed frame until they snap securely into position."),
        t("support.step5Tip3", "Place your mattress onto the frame. Lower the bed completely to test the counterbalanced tension."),
        t("support.step5Tip4", "Fasten the heavy-duty mattress retention straps across the mattress to keep bedding securely in place when folded up."),
      ],
    },
  ];

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
              <span className="text-wbk-brown/80">{t("nav.support", "Support")}</span>
              <span>/</span>
              <span className="text-wbk-black font-medium">{t("support.guidesTitle", "Installation Guides")}</span>
            </nav>

            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-wbk-gold mb-3">
              {t("support.stepByStepBadge", "Step-by-Step Technical Instructions")}
            </span>
            <h1 className="font-new-york text-4xl sm:text-5xl md:text-6xl text-wbk-black tracking-tight leading-tight">
              {t("support.guidesTitle", "Wall Bed Assembly & Installation Guide")}
            </h1>
            <p className="mt-4 text-sm sm:text-base text-wbk-brown leading-relaxed font-light">
              {t("support.guidesSubtitle", "Wall Bed King systems are precision-engineered for straightforward DIY assembly. Follow our comprehensive guide below or watch our step-by-step video walkthroughs.")}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={localizedHref("/support/installation-videos")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-wbk-black hover:bg-wbk-green text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-colors"
              >
                <IconVideo size={16} />
                <span>{t("support.watchVideosBtn", "Watch Video Walkthroughs")}</span>
              </Link>
              <Link
                href={localizedHref("/support/faq")}
                className="inline-flex items-center gap-2 px-6 py-3 border border-wbk-lightgrey bg-white hover:border-wbk-black text-wbk-black text-xs font-semibold uppercase tracking-wider rounded-full transition-colors"
              >
                <IconPhoneCall size={16} />
                <span>{t("topbar.faq", "Technical Assistance FAQ")}</span>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Tools & Safety Section */}
      <Container size="xl" className="pt-16 sm:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Tools Card */}
          <div className="lg:col-span-6 bg-white p-8 rounded-none border border-wbk-lightgrey shadow-xs">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-none bg-[#F4F2F0] text-wbk-black flex items-center justify-center">
                <IconTools size={20} className="text-wbk-gold" />
              </div>
              <div>
                <h3 className="font-poppins font-semibold text-lg text-wbk-black">
                  {t("support.toolsRequired", "Tools Required For Assembly")}
                </h3>
                <p className="text-xs text-wbk-brown">
                  {t("support.toolsDesc", "Standard household DIY equipment")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REQUIRED_TOOLS.map((tItem) => (
                <div key={tItem.name} className="p-3 rounded-none bg-[#FBF9F8] border border-wbk-lightgrey/60">
                  <p className="text-xs font-semibold text-wbk-black">{tItem.name}</p>
                  <p className="text-[11px] text-wbk-brown">{tItem.spec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Notice Card */}
          <div className="lg:col-span-6 bg-[#FBF9F8] p-8 rounded-none border border-wbk-gold/40 shadow-xs">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-none bg-wbk-black text-white flex items-center justify-center">
                <IconAlertTriangle size={20} className="text-wbk-gold" />
              </div>
              <div>
                <h3 className="font-poppins font-semibold text-lg text-wbk-black">
                  {t("support.safetyTitle", "Critical Safety & Fixing Notice")}
                </h3>
                <p className="text-xs text-wbk-brown">
                  {t("support.safetySubtitle", "Read carefully prior to installation")}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-wbk-brown leading-relaxed">
              <p>
                • <strong>{t("support.safetyAnchoringLabel", "Secure Anchoring:")}</strong> {t("support.safetyAnchoring", "The bed frame must be solidly anchored to a masonry wall, timber wall studs, or directly into a solid subfloor. Never rely solely on plasterboard fixings.")}
              </p>
              <p>
                • <strong>{t("support.safetyPistonsLabel", "Gas Piston Handling:")}</strong> {t("support.safetyPistons", "Never attempt to compress the gas struts before they are mounted to the frame. The pistons operate under high internal pressure and require the mechanical leverage of the assembled bed.")}
              </p>
              <p>
                • <strong>{t("support.safetyTeamLabel", "Two-Person Team:")}</strong> {t("support.safetyTeam", "While the assembly is straightforward, we strongly recommend two adults for lifting and hanging the inner frame onto the pivot brackets.")}
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* Step-by-Step Sections */}
      <Container size="xl" className="pt-20">
        <div className="max-w-3xl mb-12">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-wbk-gold">
            {t("support.assemblySequence", "Assembly Sequence")}
          </span>
          <h2 className="mt-1 font-new-york text-3xl sm:text-4xl text-wbk-black">
            {t("support.stepsTitle", "5 Simple Steps to Complete Your Setup")}
          </h2>
        </div>

        <div className="space-y-6">
          {GUIDE_SECTIONS.map((section) => (
            <div
              key={section.id}
              className="p-8 rounded-none border border-wbk-lightgrey bg-white shadow-xs"
            >
              <h3 className="font-poppins font-semibold text-lg sm:text-xl text-wbk-black mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-wbk-brown leading-relaxed">
                    <IconCheck size={16} className="text-wbk-green shrink-0 mt-1" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      {/* Video Callout Banner */}
      <Container size="xl" className="pt-20">
        <div className="bg-wbk-black rounded-none p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-wbk-gold">
              {t("support.visualWalkthroughs", "Visual Walkthroughs")}
            </span>
            <h3 className="font-new-york text-2xl sm:text-3xl text-white mt-1">
              {t("support.preferVideo", "Prefer to watch the assembly video?")}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-wbk-lightgrey/80 leading-relaxed font-light">
              {t("support.watchOfficialVideo", "Watch our official step-by-step video tutorials demonstrating Classic, Studio, and Cabinet installations.")}
            </p>
          </div>
          <Link
            href={localizedHref("/support/installation-videos")}
            className="px-6 py-3.5 bg-wbk-gold hover:bg-white text-wbk-black text-xs font-semibold uppercase tracking-wider rounded-full transition-colors shrink-0"
          >
            {t("support.watchVideoGuides", "Watch Video Guides")}
          </Link>
        </div>
      </Container>
    </div>
  );
}
