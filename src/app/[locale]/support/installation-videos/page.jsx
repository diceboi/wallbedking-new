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
    title_fr: "Montage du Lit Escamotable Classic MORPHY (Animation 3D)",
    title_es: "Montaje de la Cama Plegable Clásica MORPHY (Animación 3D)",
    duration: "6:48",
    model: "Classic MORPHY",
    model_fr: "Classic MORPHY",
    model_es: "Classic MORPHY",
    youtubeId: "1MQ7Ksb2t-Y",
    embedUrl: "https://www.youtube.com/embed/1MQ7Ksb2t-Y",
    description:
      "Official 3D animated step-by-step walkthrough covering unboxing, wall-fixing bracket anchoring, frame assembly, piston calibration, and sprung birch slat placement for the Classic MORPHY wall bed.",
    description_fr:
      "Tutoriel d'animation 3D officiel pas à pas couvrant le déballage, la fixation murale, l'assemblage du cadre, l'installation des vérins et les lattes en bouleau du lit escamotable Classic MORPHY.",
    description_es:
      "Guía oficial animada en 3D paso a paso que cubre el desembalaje, la fijación del soporte a la pared, el ensamblaje del marco, la calibración del pistón y la colocación de las lamas de abeto con resortes para la cama plegable Clásica MORPHY.",
    timestamps: [
      {
        time: "0:00",
        label: "Unboxing & Hardware Overview",
        label_fr: "Déballage et vue d'ensemble des pièces",
        label_es: "Desempaquetado y Visión General del Hardware",
      },
      {
        time: "1:15",
        label: "Wall Bracket Fixation & Stud Alignment",
        label_fr: "Fixation des équerres murales",
        label_es: "Fijación del soporte de pared y alineación de los montantes",
      },
      {
        time: "2:45",
        label: "Main Bed Frame Joint Assembly",
        label_fr: "Assemblage du cadre de lit",
        label_es: "Montaje de la unión del marco de la cama principal",
      },
      {
        time: "4:10",
        label: "Gas Piston Installation & Tension Lock",
        label_fr: "Installation des vérins à gaz et sécurité",
        label_es: "Instalación del pistón de gas y bloqueo de tensión",
      },
      {
        time: "5:30",
        label: "Sprung Wooden Slat Placement & Testing",
        label_fr: "Installation des lattes en bois et test",
        label_es: "Colocación y prueba de las lamas de madera con resorte",
      },
    ],
  },
  {
    id: "studio-morphy",
    title: "Studio MORPHY Desk Wall Bed Assembly (3D Animated)",
    title_fr: "Montage du Lit Bureau Studio MORPHY (Animation 3D)",
    title_es: "Montaje de Cama Plegable de Escritorio Studio MORPHY (Animación 3D)",
    duration: "8:25",
    model: "Studio MORPHY",
    model_fr: "Studio MORPHY",
    model_es: "Studio MORPHY",
    youtubeId: "tz9-MVtDb7I",
    embedUrl: "https://www.youtube.com/embed/tz9-MVtDb7I",
    description:
      "Complete animated assembly guide for the Studio MORPHY desk wall bed. Learn how the synchronized folding desk mechanism operates effortlessly without disturbing items on your workspace.",
    description_fr:
      "Guide complet animé pour le lit bureau Studio MORPHY. Découvrez comment le bureau synchronisé reste horizontal et manipulable sans déplacer vos affaires.",
    description_es:
      "Guía animada completa de montaje para la cama abatible con escritorio Studio MORPHY. Aprenda cómo el mecanismo de escritorio sincronizado se pliega sin mover los objetos de su espacio de trabajo.",
    timestamps: [
      {
        time: "0:00",
        label: "Unboxing & Synchronized Desk Components",
        label_fr: "Déballage et composants du bureau synchronisé",
        label_es: "Desembalaje y componentes del escritorio sincronizado",
      },
      {
        time: "1:30",
        label: "Wall Mounting Anchor Positions",
        label_fr: "Marquage et ancrage mural",
        label_es: "Posiciones de anclaje de montaje en pared",
      },
      {
        time: "3:20",
        label: "Assembling Bed Frame & Desk Linkage Arms",
        label_fr: "Assemblage du cadre et des bras de tringlerie",
        label_es: "Montaje del somier y brazos de unión del escritorio",
      },
      {
        time: "5:40",
        label: "Gas Piston Attachment & Safety Retainers",
        label_fr: "Pose des pistons et clips de sécurité",
        label_es: "Fijación del pistón de gas y retenedores de seguridad",
      },
      {
        time: "7:15",
        label: "Desktop Leveling & Smooth Operation Check",
        label_fr: "Mise à niveau du plateau et contrôle d'ouverture",
        label_es: "Nivelación del escritorio y comprobación de funcionamiento",
      },
    ],
  },
  {
    id: "integrated-morphy",
    title: "Integrated MORPHY Sofa & Cabinet Wall Bed (3D Animated)",
    title_fr: "Lit Canapé & Armoire Intégré MORPHY (Animation 3D)",
    title_es: "MORPHY Integrado Sofá y Cama Plegable con Armario (Animación 3D)",
    duration: "9:50",
    model: "Integrated MORPHY",
    model_fr: "MORPHY Intégré",
    model_es: "MORPHY Integrado",
    youtubeId: "yyyw2hTSFII",
    embedUrl: "https://www.youtube.com/embed/yyyw2hTSFII",
    description:
      "Full animated installation guide for the luxury Integrated MORPHY wall bed with front modular sofa seating and surrounding cabinetry system.",
    description_fr:
      "Guide d'installation complet pour l'ensemble lit escamotable intégré MORPHY avec canapé modulaire frontal et armoires assorties.",
    description_es:
      "Guía completa de instalación animada para la cama abatible de lujo MORPHY Integrada con sofá modular frontal y sistema de armarios a juego.",
    timestamps: [
      {
        time: "0:00",
        label: "Component Inventory & Cabinet Carcass",
        label_fr: "Inventaire et caisson d'armoire",
        label_es: "Inventario de componentes y estructura del armario",
      },
      {
        time: "2:00",
        label: "Cabinet Wall Stud Anchoring",
        label_fr: "Fixation de l'armoire aux montants",
        label_es: "Anclaje del armario a los montantes de la pared",
      },
      {
        time: "4:15",
        label: "Bed Mechanism Assembly & Frame Insertion",
        label_fr: "Montage du mécanisme et insertion dans le meuble",
        label_es: "Montaje del mecanismo de la cama e inserción del marco",
      },
      {
        time: "6:30",
        label: "Heavy-Duty Gas Piston Calibration",
        label_fr: "Calibrage des vérins haute résistance",
        label_es: "Calibración del pistón de gas de alta resistencia",
      },
      {
        time: "8:00",
        label: "Front Sofa Modular Base & Cushion Fitment",
        label_fr: "Installation du canapé frontal et coussins",
        label_es: "Base modular del sofá frontal y ajuste de cojines",
      },
    ],
  },
  {
    id: "classic-traditional",
    title: "Traditional Classic Wall Bed (Hand Assembly)",
    title_fr: "Lit Escamotable Traditionnel Classique (Montage Manuel)",
    title_es: "Cama Plegable Clásica Tradicional (Montaje Manual)",
    duration: "12:15",
    model: "Classic Traditional",
    model_fr: "Classique Traditionnel",
    model_es: "Clásico Tradicional",
    youtubeId: "P-Bu-WuWakM",
    embedUrl: "https://www.youtube.com/embed/P-Bu-WuWakM",
    description:
      "Real-world workshop walkthrough demonstrating manual step-by-step assembly and wall mounting for the classic WallBedKing bed mechanism.",
    description_fr:
      "Démonstration réelle en atelier du montage pas à pas et de la fixation murale du lit traditionnel WallBedKing.",
    description_es:
      "Recorrido real de taller que muestra el montaje manual paso a paso y la fijación a la pared del mecanismo clásico WallBedKing.",
    timestamps: [
      {
        time: "0:30",
        label: "Frame Parts & Screws Sorting",
        label_fr: "Tri des pièces et de la visserie",
        label_es: "Clasificación de piezas del marco y tornillería",
      },
      {
        time: "2:15",
        label: "Assembling Corner Joints & Pivot Pins",
        label_fr: "Assemblage des coins et axes de rotation",
        label_es: "Montaje de uniones de esquina y pasadores de pivote",
      },
      {
        time: "5:10",
        label: "Wall Fixation & Leveling",
        label_fr: "Ancrage mural et mise à niveau",
        label_es: "Fijación a la pared y nivelación",
      },
      {
        time: "8:00",
        label: "Attaching Gas Pistons Safely",
        label_fr: "Installation sécurisée des vérins",
        label_es: "Instalación segura de los pistones de gas",
      },
      {
        time: "10:30",
        label: "Wooden Slats & Mattress Retention Bar",
        label_fr: "Pose des lattes et sangle de maintien",
        label_es: "Lamas de madera y barra de sujeción del colchón",
      },
    ],
  },
  {
    id: "studio-traditional",
    title: "Traditional Studio Wall Bed (Flat-Packed Assembly)",
    title_fr: "Lit Escamotable Studio Traditionnel (Montage en Kit)",
    title_es: "Cama Plegable Tradicional para Estudio (Ensamblaje en Paquete Plano)",
    duration: "11:20",
    model: "Studio Traditional",
    model_fr: "Studio Traditionnel",
    model_es: "Estudio Tradicional",
    youtubeId: "mD0vF1k075c",
    embedUrl: "https://www.youtube.com/embed/mD0vF1k075c",
    description:
      "Step-by-step manual assembly for the traditional Studio flat-packed model with aesthetic front finishing panels.",
    description_fr:
      "Montage pas à pas du modèle Studio traditionnel en kit avec panneaux d'habillage décoratifs frontaux.",
    description_es:
      "Montaje manual paso a paso del modelo tradicional Studio en paquete plano con paneles frontales embellecedores.",
    timestamps: [
      {
        time: "0:45",
        label: "Frame & Panel Assembly",
        label_fr: "Assemblage du cadre et des panneaux",
        label_es: "Montaje de marco y paneles",
      },
      {
        time: "3:15",
        label: "Wall & Floor Anchoring Techniques",
        label_fr: "Techniques de fixation au mur et au sol",
        label_es: "Técnicas de anclaje a pared y suelo",
      },
      {
        time: "6:00",
        label: "Front Aesthetic Panel Alignment",
        label_fr: "Alignement des panneaux de façade",
        label_es: "Alineación del panel frontal decorativo",
      },
      {
        time: "9:00",
        label: "Gas Spring Counterbalance Adjustment",
        label_fr: "Ajustement de l'équilibrage des vérins",
        label_es: "Ajuste del contrabalance de los pistones de gas",
      },
    ],
  },
  {
    id: "cabinets",
    title: "Cabinet Enclosure & Storage Extensions Assembly",
    title_fr: "Montage de l'Armoire de Rangement et des Extensions",
    title_es: "Ensamblaje de Enclosure de Gabinete y Extensiones de Almacenamiento",
    duration: "12:30",
    model: "Cabinet & Extensions",
    model_fr: "Armoires & Rangement",
    model_es: "Gabinete y extensiones",
    youtubeId: "o2dD3Qn7bKk",
    embedUrl: "https://www.youtube.com/embed/o2dD3Qn7bKk",
    description:
      "Comprehensive guide for constructing outer wooden cabinets, top bookcases, and matching side storage units.",
    description_fr:
      "Guide complet pour le montage des armoires bois extérieures, surmeubles et unités de rangement latérales.",
    description_es:
      "Guía completa para el montaje de armarios de madera exteriores, librerías superiores y módulos de almacenamiento lateral a juego.",
    timestamps: [
      {
        time: "1:00",
        label: "Cabinet Carcass Pre-Assembly",
        label_fr: "Pré-assemblage du caisson",
        label_es: "Premontaje de la estructura del armario",
      },
      {
        time: "4:20",
        label: "Securing Cabinet to Wall Studs",
        label_fr: "Fixation solide au mur",
        label_es: "Fijación del armario a los montantes de pared",
      },
      {
        time: "7:15",
        label: "Fitting the Bed Mechanism into the Cabinet",
        label_fr: "Intégration du lit escamotable dans l'armoire",
        label_es: "Integración del mecanismo de la cama en el armario",
      },
      {
        time: "10:00",
        label: "Door Hinges, Handles & Alignment",
        label_fr: "Charnières, poignées et alignement des portes",
        label_es: "Bisagras, tiradores y alineación de puertas",
      },
    ],
  },
];

export default function InstallationVideosPage() {
  const { t, localizedHref, locale } = useLocale();
  const [activeVideo, setActiveVideo] = useState(VIDEOS[0]);

  const activeTitle =
    (locale === "es" && activeVideo.title_es) ||
    (locale === "fr" && activeVideo.title_fr) ||
    activeVideo.title;

  const activeModel =
    (locale === "es" && activeVideo.model_es) ||
    (locale === "fr" && activeVideo.model_fr) ||
    activeVideo.model;

  const activeDesc =
    (locale === "es" && activeVideo.description_es) ||
    (locale === "fr" && activeVideo.description_fr) ||
    activeVideo.description;

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
                title={activeTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#F4F2F0] text-wbk-black">
                  {activeModel}
                </span>
                <span className="text-xs text-wbk-brown flex items-center gap-1">
                  <IconClock size={13} /> {activeVideo.duration}
                </span>
              </div>
              <h2 className="font-new-york text-2xl sm:text-3xl text-wbk-black">
                {activeTitle}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-wbk-brown leading-relaxed">
                {activeDesc}
              </p>

              {/* Timestamp Chapters */}
              <div className="mt-6 border-t border-wbk-lightgrey/60 pt-4">
                <h4 className="font-poppins font-semibold text-xs uppercase tracking-wider text-wbk-brown mb-3">
                  {locale === "es"
                    ? "Pasos Clave y Tiempos"
                    : locale === "fr"
                    ? "Étapes clés & Chapitres"
                    : "Key Steps & Timestamps"}
                </h4>
                <div className="space-y-2">
                  {activeVideo.timestamps.map((chapter) => {
                    const chapterLabel =
                      (locale === "es" && chapter.label_es) ||
                      (locale === "fr" && chapter.label_fr) ||
                      chapter.label;

                    return (
                      <div
                        key={chapter.time}
                        className="flex items-center justify-between text-xs py-1.5 border-b border-wbk-lightgrey/40 last:border-b-0"
                      >
                        <span className="text-wbk-black font-medium">{chapterLabel}</span>
                        <span className="font-mono text-[11px] text-wbk-gold font-bold">
                          {chapter.time}
                        </span>
                      </div>
                    );
                  })}
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
                const vidTitle =
                  (locale === "es" && vid.title_es) ||
                  (locale === "fr" && vid.title_fr) ||
                  vid.title;
                const vidModel =
                  (locale === "es" && vid.model_es) ||
                  (locale === "fr" && vid.model_fr) ||
                  vid.model;

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
                        {vidModel}
                      </span>
                      <span className="text-[11px] text-wbk-brown flex items-center gap-1">
                        <IconClock size={12} /> {vid.duration}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-wbk-black leading-snug">
                      {vidTitle}
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
