"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import {
  IconVideo,
  IconClock,
  IconDownload,
  IconCheck,
  IconBrandYoutube,
  IconPhoneCall,
} from "@tabler/icons-react";
import { useLocale } from "@/context/LocaleContext";

const VIDEOS = [
  {
    id: "classic-morphy",
    title: "Classic MORPHY Wall Bed Assembly (3D Animated)",
    duration: "6:48",
    model: "Classic MORPHY",
    youtubeId: "1MQ7Ksb2t-Y",
    embedUrl: "https://www.youtube.com/embed/1MQ7Ksb2t-Y",
    description:
      "Official 3D animated step-by-step walkthrough covering unboxing, wall-fixing bracket anchoring, frame assembly, piston calibration, and sprung birch slat placement for the Classic MORPHY wall bed.",
    timestamps: [
      { time: "0:00", label: "Unboxing & Hardware Overview" },
      { time: "1:15", label: "Wall Bracket Fixation & Stud Alignment" },
      { time: "2:45", label: "Main Bed Frame Joint Assembly" },
      { time: "4:10", label: "Gas Piston Installation & Tension Lock" },
      { time: "5:30", label: "Sprung Wooden Slat Placement & Testing" },
    ],
  },
  {
    id: "studio-morphy",
    title: "Studio MORPHY Desk Wall Bed Assembly (3D Animated)",
    duration: "8:25",
    model: "Studio MORPHY",
    youtubeId: "tz9-MVtDb7I",
    embedUrl: "https://www.youtube.com/embed/tz9-MVtDb7I",
    description:
      "Complete animated assembly guide for the Studio MORPHY desk wall bed. Learn how the synchronized folding desk mechanism operates effortlessly without disturbing items on your workspace.",
    timestamps: [
      { time: "0:00", label: "Unboxing & Synchronized Desk Components" },
      { time: "1:30", label: "Wall Mounting Anchor Positions" },
      { time: "3:20", label: "Assembling Bed Frame & Desk Linkage Arms" },
      { time: "5:40", label: "Gas Piston Attachment & Safety Retainers" },
      { time: "7:15", label: "Desktop Leveling & Smooth Operation Check" },
    ],
  },
  {
    id: "integrated-morphy",
    title: "Integrated MORPHY Sofa & Cabinet Wall Bed (3D Animated)",
    duration: "9:50",
    model: "Integrated MORPHY",
    youtubeId: "yyyw2hTSFII",
    embedUrl: "https://www.youtube.com/embed/yyyw2hTSFII",
    description:
      "Full animated installation guide for the luxury Integrated MORPHY wall bed with front modular sofa seating and surrounding cabinetry system.",
    timestamps: [
      { time: "0:00", label: "Component Inventory & Cabinet Carcass" },
      { time: "2:00", label: "Cabinet Wall Stud Anchoring" },
      { time: "4:15", label: "Bed Mechanism Assembly & Frame Insertion" },
      { time: "6:30", label: "Heavy-Duty Gas Piston Calibration" },
      { time: "8:00", label: "Front Sofa Modular Base & Cushion Fitment" },
    ],
  },
  {
    id: "classic-traditional",
    title: "Traditional Classic Wall Bed (Hand Assembly)",
    duration: "12:15",
    model: "Classic Traditional",
    youtubeId: "P-Bu-WuWakM",
    embedUrl: "https://www.youtube.com/embed/P-Bu-WuWakM",
    description:
      "Real-world workshop walkthrough demonstrating manual step-by-step assembly and wall mounting for the classic WallBedKing bed mechanism.",
    timestamps: [
      { time: "0:30", label: "Frame Parts & Screws Sorting" },
      { time: "2:15", label: "Assembling Corner Joints & Pivot Pins" },
      { time: "5:10", label: "Wall Fixation & Leveling" },
      { time: "8:00", label: "Attaching Gas Pistons Safely" },
      { time: "10:30", label: "Wooden Slats & Mattress Retention Bar" },
    ],
  },
  {
    id: "studio-traditional",
    title: "Traditional Studio Wall Bed (Flat-Packed Assembly)",
    duration: "11:20",
    model: "Studio Traditional",
    youtubeId: "mD0vF1k075c",
    embedUrl: "https://www.youtube.com/embed/mD0vF1k075c",
    description:
      "Step-by-step manual assembly for the traditional Studio flat-packed model with aesthetic front finishing panels.",
    timestamps: [
      { time: "0:45", label: "Frame & Panel Assembly" },
      { time: "3:15", label: "Wall & Floor Anchoring Techniques" },
      { time: "6:00", label: "Front Aesthetic Panel Alignment" },
      { time: "9:00", label: "Gas Spring Counterbalance Adjustment" },
    ],
  },
  {
    id: "cabinets",
    title: "Cabinet Enclosure & Storage Extensions Assembly",
    duration: "12:30",
    model: "Cabinet & Extensions",
    youtubeId: "o2dD3Qn7bKk",
    embedUrl: "https://www.youtube.com/embed/o2dD3Qn7bKk",
    description:
      "Comprehensive guide for constructing outer wooden cabinets, top bookcases, and matching side storage units.",
    timestamps: [
      { time: "1:00", label: "Cabinet Carcass Pre-Assembly" },
      { time: "4:20", label: "Securing Cabinet to Wall Studs" },
      { time: "7:15", label: "Fitting the Bed Mechanism into the Cabinet" },
      { time: "10:00", label: "Door Hinges, Handles & Alignment" },
    ],
  },
];

export default function InstallationVideosPage() {
  const { t, localizedHref } = useLocale();
  const [activeVideo, setActiveVideo] = useState(VIDEOS[0]);

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
              <Link href={localizedHref("/support/installation-guides")} className="text-wbk-brown/80 hover:text-wbk-black transition-colors">
                {t("nav.support", "Support")}
              </Link>
              <span>/</span>
              <span className="text-wbk-black font-medium">{t("support.videosTitle", "Installation Videos")}</span>
            </nav>

            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-wbk-gold mb-3">
              {t("support.videoBadge", "Official Video Walkthroughs")}
            </span>
            <h1 className="font-new-york text-4xl sm:text-5xl md:text-6xl text-wbk-black tracking-tight leading-tight">
              {t("support.videosHeading", "Watch step-by-step video tutorials")}
            </h1>
            <p className="mt-4 text-sm sm:text-base text-wbk-brown leading-relaxed font-light">
              {t("support.videosSubtitle", "Follow along with our professional assembly engineers as they guide you through unboxing, wall fixing, gas piston mounting, and finishing adjustments.")}
            </p>

            <div className="mt-6 flex gap-4">
              <Link
                href={localizedHref("/support/installation-guides")}
                className="inline-flex items-center gap-2 text-xs font-semibold text-wbk-black hover:text-wbk-green underline transition-colors"
              >
                {t("support.viewWrittenGuides", "← View Step-by-Step Written Guides")}
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Video Player & Playlist */}
      <Container size="xl" className="pt-16 sm:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Video Viewport */}
          <div className="lg:col-span-8 space-y-6">
            <div className="relative aspect-video w-full rounded-none overflow-hidden bg-black shadow-xl border border-wbk-lightgrey/80">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId}`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#F4F2F0] text-wbk-black">
                  {activeVideo.model}
                </span>
                <span className="text-xs text-wbk-brown flex items-center gap-1">
                  <IconClock size={13} /> {activeVideo.duration}
                </span>
              </div>
              <h2 className="font-new-york text-2xl sm:text-3xl text-wbk-black">
                {activeVideo.title}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-wbk-brown leading-relaxed">
                {activeVideo.description}
              </p>

              {/* Timestamp Chapters */}
              <div className="mt-6 border-t border-wbk-lightgrey/60 pt-4">
                <h4 className="font-poppins font-semibold text-xs uppercase tracking-wider text-wbk-brown mb-3">
                  Key Steps & Timestamps
                </h4>
                <div className="space-y-2">
                  {activeVideo.timestamps.map((chapter) => (
                    <div
                      key={chapter.time}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-wbk-lightgrey/40 last:border-b-0"
                    >
                      <span className="text-wbk-black font-medium">{chapter.label}</span>
                      <span className="font-mono text-[11px] text-wbk-gold font-bold">
                        {chapter.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Video Playlist Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <p className="font-poppins font-semibold text-xs uppercase tracking-wider text-wbk-brown px-1">
              {t("support.selectAssemblyVideo", "Select Assembly Video")}
            </p>
            <div className="space-y-3">
              {VIDEOS.map((vid) => {
                const isSelected = activeVideo.id === vid.id;

                return (
                  <button
                    key={vid.id}
                    type="button"
                    onClick={() => setActiveVideo(vid)}
                    className={`w-full text-left p-5 rounded-none border transition-all cursor-pointer ${
                      isSelected
                        ? "border-wbk-black bg-white shadow-md"
                        : "border-wbk-lightgrey bg-[#FBF9F8] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-wbk-gold">
                        {vid.model}
                      </span>
                      <span className="text-[11px] text-wbk-brown flex items-center gap-1">
                        <IconClock size={12} /> {vid.duration}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-wbk-black leading-snug">
                      {vid.title}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Official YouTube Channel CTA */}
            <div className="mt-8 p-6 rounded-none bg-white border border-wbk-lightgrey shadow-xs text-center space-y-3">
              <IconBrandYoutube size={32} className="mx-auto text-red-600" />
              <h4 className="font-poppins font-semibold text-sm text-wbk-black">
                {t("support.officialYoutube", "Official YouTube Channel")}
              </h4>
              <p className="text-xs text-wbk-brown leading-relaxed">
                {t("support.officialYoutubeDesc", "Subscribe to the Wall Bed King YouTube channel for new design releases, tips, and customer room transformations.")}
              </p>
              <a
                href="https://www.youtube.com/user/WallBedKing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-wbk-black hover:bg-red-600 text-white text-xs font-medium rounded-full transition-colors"
              >
                <span>{t("support.visitYoutube", "Visit YouTube Channel")}</span>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
