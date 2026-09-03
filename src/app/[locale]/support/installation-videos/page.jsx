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

const VIDEOS = [
  {
    id: "classic-vertical",
    title: "Classic Vertical Wall Bed Installation",
    duration: "8:42",
    model: "Classic Range",
    youtubeId: "dQw4w9WgXcQ", // fallback standard embed placeholder or WBK video
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description:
      "A complete end-to-end tutorial demonstrating frame unpacking, bracket wall-anchoring, gas piston attachment, and slat fitting for the Classic Vertical model.",
    timestamps: [
      { time: "0:30", label: "Unboxing & Hardware Checklist" },
      { time: "2:15", label: "Mounting Bracket Alignment & Wall Fixing" },
      { time: "4:10", label: "Inner Bed Frame Assembly & Pivot Pins" },
      { time: "6:20", label: "Gas Piston Connection & Safety Retaining Clips" },
      { time: "7:45", label: "Sprung Birch Slat Installation & Mattress Testing" },
    ],
  },
  {
    id: "studio-vertical",
    title: "Studio Wall Bed & Front Panel Fitting",
    duration: "10:15",
    model: "Studio Range",
    youtubeId: "dQw4w9WgXcQ",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description:
      "Learn how to assemble the Studio Wall Bed frame and attach the sleek front aesthetic panel that conceals the mechanism when raised.",
    timestamps: [
      { time: "0:45", label: "Frame Assembly Overview" },
      { time: "3:10", label: "Wall & Floor Mounting Techniques" },
      { time: "5:30", label: "Front Panel Alignment & Bracket Fitting" },
      { time: "8:20", label: "Piston Counterbalance Adjustment" },
    ],
  },
  {
    id: "cabinets",
    title: "Cabinet Enclosure & Storage Extensions Assembly",
    duration: "12:30",
    model: "Cabinet & Extensions",
    youtubeId: "dQw4w9WgXcQ",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description:
      "Step-by-step assembly of the outer wooden cabinet, top extension bookcases, and matching side storage units.",
    timestamps: [
      { time: "1:00", label: "Cabinet Carcass Pre-Assembly" },
      { time: "4:20", label: "Securing Cabinet to Wall Studs" },
      { time: "7:15", label: "Fitting the Bed Mechanism into the Cabinet" },
      { time: "10:00", label: "Door Hinges, Handles & Alignment" },
    ],
  },
];

export default function InstallationVideosPage() {
  const [activeVideo, setActiveVideo] = useState(VIDEOS[0]);

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
              <Link href="/support/installation-guides" className="text-wbk-brown/80 hover:text-wbk-black transition-colors">
                Support
              </Link>
              <span>/</span>
              <span className="text-wbk-black font-medium">Installation Videos</span>
            </nav>

            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-wbk-gold mb-3">
              Official Video Walkthroughs
            </span>
            <h1 className="font-new-york text-4xl sm:text-5xl md:text-6xl text-wbk-black tracking-tight leading-tight">
              Watch step-by-step video tutorials
            </h1>
            <p className="mt-4 text-sm sm:text-base text-wbk-brown leading-relaxed font-light">
              Follow along with our professional assembly engineers as they guide you through unboxing,
              wall fixing, gas piston mounting, and finishing adjustments.
            </p>

            <div className="mt-6 flex gap-4">
              <Link
                href="/support/installation-guides"
                className="inline-flex items-center gap-2 text-xs font-semibold text-wbk-black hover:text-wbk-green underline transition-colors"
              >
                ← View Step-by-Step Written Guides
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
            </div>

            {/* Video Timestamps Section */}
            <div className="bg-[#FBF9F8] p-6 rounded-none border border-wbk-lightgrey/80">
              <h4 className="font-poppins font-semibold text-xs uppercase tracking-wider text-wbk-black mb-3">
                Key Video Chapters
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

          {/* Video Playlist Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <p className="font-poppins font-semibold text-xs uppercase tracking-wider text-wbk-brown px-1">
              Select Assembly Video
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
                Official YouTube Channel
              </h4>
              <p className="text-xs text-wbk-brown leading-relaxed">
                Subscribe to the Wall Bed King YouTube channel for new design releases, tips, and customer room transformations.
              </p>
              <a
                href="https://www.youtube.com/user/WallBedKing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-wbk-black hover:bg-red-600 text-white text-xs font-medium rounded-full transition-colors"
              >
                <span>Visit YouTube Channel</span>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
