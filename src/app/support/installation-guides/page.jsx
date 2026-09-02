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

const REQUIRED_TOOLS = [
  { name: "Power Drill & Drill Bits", spec: "10mm masonry or wood bit" },
  { name: "Spanners / Sockets", spec: "10mm & 13mm wrenches" },
  { name: "Spirit Level", spec: "Minimum 60cm for frame squareness" },
  { name: "Tape Measure & Pencil", spec: "For precise anchor height markings" },
  { name: "Cross-head Screwdriver", spec: "PZ2 / Phillips #2" },
  { name: "Safety Glasses & Gloves", spec: "Recommended for drilling" },
];

const GUIDE_SECTIONS = [
  {
    id: "prep",
    title: "1. Pre-Installation & Workspace Preparation",
    tips: [
      "Clear a working space of at least 3m x 2.5m on a clean, soft floor (carpet or cardboard) to avoid scratching the powder-coated steel frame.",
      "Unpack the cartons and identify the parts using the included hardware blister pack: main outer frame, inner bed frame, sprung birch slats, plastic slat caps, gas piston cylinders, and mounting brackets.",
      "Verify the wall and floor structure: ensure there are no hidden electrical cables or plumbing pipes in the drilling zone.",
    ],
  },
  {
    id: "brackets",
    title: "2. Mounting Brackets & Wall / Floor Anchoring",
    tips: [
      "The Wall Bed King mechanism offers unique flexibility: you can anchor the brackets to a solid wall, to the floor, or both.",
      "Solid Masonry Walls (Brick / Concrete): Use the heavy-duty wall anchors provided. Drill 10mm holes at the marked heights, insert rawl plugs, and securely bolt the L-brackets.",
      "Stud Walls (Plasterboard / Drywall): Never fix into hollow plasterboard alone! Locate the vertical timber or metal studs using a stud finder and secure the brackets directly into the structural studs.",
      "Floor Fixing: If wall fixing is not possible, the mounting brackets can be secured directly into a concrete slab or solid timber floorboards.",
    ],
  },
  {
    id: "frame",
    title: "3. Outer Frame & Pivot Mechanism Assembly",
    tips: [
      "Assemble the rectangular outer frame using the M8 corner bolts and tighten securely with a 13mm socket.",
      "Attach the heavy-duty pivot brackets to the left and right uprights.",
      "Position the outer frame against your wall and level it carefully using your spirit level before fully tightening the anchor bolts.",
    ],
  },
  {
    id: "bedframe",
    title: "4. Inner Bed Frame & Gas Piston Installation",
    tips: [
      "Assemble the inner bed frame that will support the mattress.",
      "Carefully align the inner frame with the outer frame pivot brackets and insert the heavy-gauge pivot pins with locking nylon nuts.",
      "Attach the German gas piston cylinders: Ensure the piston rod points downwards when the bed is closed. Hook the gas struts onto the ball joints and snap the safety retaining clips into place.",
      "Caution: Do not attempt to compress the gas pistons by hand! They are calibrated to balance the combined weight of the frame and mattress.",
    ],
  },
  {
    id: "slats",
    title: "5. Sprung Birch Slats & Mattress Securing",
    tips: [
      "Slide the plastic slat caps onto both ends of the curved birch wood slats.",
      "Press the caps firmly into the pre-drilled holes along the bed frame until they snap securely into position.",
      "Place your mattress onto the frame. Lower the bed completely to test the counterbalanced tension.",
      "Fasten the heavy-duty mattress retention straps across the mattress to keep bedding securely in place when folded up.",
    ],
  },
];

export default function InstallationGuidesPage() {
  return (
    <div className="bg-wbk-white min-h-screen pt-12 pb-24 font-poppins">
      {/* Header */}
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
              <span className="text-wbk-black font-medium">Installation Guides</span>
            </nav>

            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-wbk-gold mb-3">
              Step-by-Step Technical Instructions
            </span>
            <h1 className="font-new-york text-4xl sm:text-5xl md:text-6xl text-wbk-black tracking-tight leading-tight">
              Wall Bed Assembly & Installation Guide
            </h1>
            <p className="mt-4 text-sm sm:text-base text-wbk-brown leading-relaxed font-light">
              Wall Bed King systems are precision-engineered for straightforward DIY assembly.
              Follow our comprehensive guide below or watch our step-by-step video walkthroughs.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/support/installation-videos"
                className="inline-flex items-center gap-2 px-6 py-3 bg-wbk-black hover:bg-wbk-green text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-colors"
              >
                <IconVideo size={16} />
                <span>Watch Video Walkthroughs</span>
              </Link>
              <a
                href="tel:08000288940"
                className="inline-flex items-center gap-2 px-6 py-3 border border-wbk-lightgrey bg-white hover:border-wbk-black text-wbk-black text-xs font-semibold uppercase tracking-wider rounded-full transition-colors"
              >
                <IconPhoneCall size={16} />
                <span>Technical Assistance Hotline</span>
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* Tools & Safety Section */}
      <Container size="xl" className="pt-16 sm:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Tools Card */}
          <div className="lg:col-span-6 bg-white p-8 rounded-3xl border border-wbk-lightgrey shadow-xs">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#F4F2F0] text-wbk-black flex items-center justify-center">
                <IconTools size={20} className="text-wbk-gold" />
              </div>
              <div>
                <h3 className="font-poppins font-semibold text-lg text-wbk-black">
                  Tools Required For Assembly
                </h3>
                <p className="text-xs text-wbk-brown">Standard household DIY equipment</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REQUIRED_TOOLS.map((t) => (
                <div key={t.name} className="p-3 rounded-xl bg-[#FBF9F8] border border-wbk-lightgrey/60">
                  <p className="text-xs font-semibold text-wbk-black">{t.name}</p>
                  <p className="text-[11px] text-wbk-brown">{t.spec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Notice Card */}
          <div className="lg:col-span-6 bg-[#FBF9F8] p-8 rounded-3xl border border-wbk-gold/40 shadow-xs">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-wbk-black text-white flex items-center justify-center">
                <IconAlertTriangle size={20} className="text-wbk-gold" />
              </div>
              <div>
                <h3 className="font-poppins font-semibold text-lg text-wbk-black">
                  Critical Safety & Fixing Notice
                </h3>
                <p className="text-xs text-wbk-brown">Read carefully prior to installation</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-wbk-brown leading-relaxed">
              <p>
                • <strong>Secure Anchoring:</strong> The bed frame must be solidly anchored to a masonry wall, timber wall studs, or directly into a solid subfloor. Never rely solely on plasterboard fixings.
              </p>
              <p>
                • <strong>Gas Piston Handling:</strong> Never attempt to compress the gas struts before they are mounted to the frame. The pistons operate under high internal pressure and require the mechanical leverage of the assembled bed.
              </p>
              <p>
                • <strong>Two-Person Team:</strong> While the assembly is straightforward, we strongly recommend two adults for lifting and hanging the inner frame onto the pivot brackets.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* Step-by-Step Sections */}
      <Container size="xl" className="pt-20">
        <div className="max-w-3xl mb-12">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-wbk-gold">
            Assembly Sequence
          </span>
          <h2 className="mt-1 font-new-york text-3xl sm:text-4xl text-wbk-black">
            5 Simple Steps to Complete Your Setup
          </h2>
        </div>

        <div className="space-y-6">
          {GUIDE_SECTIONS.map((section) => (
            <div
              key={section.id}
              className="p-8 rounded-3xl border border-wbk-lightgrey bg-white shadow-xs"
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
        <div className="bg-wbk-black rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-wbk-gold">
              Visual Walkthroughs
            </span>
            <h3 className="font-new-york text-2xl sm:text-3xl text-white mt-1">
              Prefer to watch the assembly video?
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-wbk-lightgrey/80 leading-relaxed font-light">
              Watch our official step-by-step video tutorials demonstrating Classic, Studio, and Cabinet installations.
            </p>
          </div>
          <Link
            href="/support/installation-videos"
            className="px-6 py-3.5 bg-wbk-gold hover:bg-white text-wbk-black text-xs font-semibold uppercase tracking-wider rounded-full transition-colors shrink-0"
          >
            Watch Video Guides
          </Link>
        </div>
      </Container>
    </div>
  );
}
