"use client";

import { useContext, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconArrowRight,
  IconCheck,
  IconBed,
} from "@tabler/icons-react";
import { MenuContext } from "@/context/MenuContext";
import { useLocale } from "@/context/LocaleContext";
import { useProductCatalog } from "@/context/ProductCatalogContext";
import { SUBMENU_DATA } from "@/data/navigation";
import { getProductPrice } from "@/lib/i18n";
import { getLocalizedProductName } from "@/lib/products";

// Extended gallery preview angles for Morphy & Clearance flagship beds
const BED_EXTRA_GALLERY = {
  "/products/beds/classic-morphy-bed": [
    {
      label: "Vertical Closed",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-CV-MORPHY_5.webp",
    },
    {
      label: "With Mattress",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-CV-MORPHY_1-m.webp",
    },
    {
      label: "Vertical Open",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-CV-MORPHY_1.webp",
    },
    {
      label: "Horizontal Format",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-CH-MORPHY_5.webp",
    },
  ],
  "/products/beds/studio-morphy-bed": [
    {
      label: "Vertical Closed",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-SV-MORPHY_5.webp",
    },
    {
      label: "With Mattress",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-SV-MORPHY_1-m.webp",
    },
    {
      label: "Vertical Open",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-SV-MORPHY_1.webp",
    },
    {
      label: "Horizontal Format",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-SH-MORPHY_5.webp",
    },
  ],
  "/products/beds/integrated-morphy-bed": [
    {
      label: "Vertical Closed",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-IV-MORPHY_5.webp",
    },
    {
      label: "With Mattress",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-IV-MORPHY_1-m.webp",
    },
    {
      label: "Cabinet Integrated",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-IV-MORPHY_2.webp",
    },
    {
      label: "Horizontal Format",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-IH-MORPHY_5.webp",
    },
  ],
  "/products/beds/classic-traditional-bed": [
    {
      label: "Vertical Closed",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-CV-TRADITIONAL_1.webp",
    },
    {
      label: "Vertical Open",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-CV-TRADITIONAL_2.webp",
    },
    {
      label: "Horizontal Format",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/160x200-CH-TRADITIONAL_1.webp",
    },
  ],
  "/products/beds/studio-traditional-bed": [
    {
      label: "Vertical Closed",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/150x200-SV-TRADITIONAL_1.webp",
    },
    {
      label: "Vertical Open",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/150x200-SV-TRADITIONAL_2.webp",
    },
    {
      label: "Horizontal Format",
      src: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds/1K/150x200-SH-TRADITIONAL_1.webp",
    },
  ],
};

// Multilingual feature highlights per product href
const LOCALIZED_FEATURES = {
  "/products/beds/classic-morphy-bed": {
    en: [
      "Patented German gas piston counterbalance mechanism",
      "Choice of Vertical or Horizontal orientation",
      "Independent posture-slatted sprung mattress base",
      "Engineered for everyday durability & lifetime reliability",
    ],
    de: [
      "Patentierte deutsche Gasdruckfeder-Hebemechanik",
      "Vertikale oder horizontale Ausrichtung wählbar",
      "Integrierter Federholz-Lattenrost für optimalen Komfort",
      "Entwickelt für tägliche Haltbarkeit und lebenslange Zuverlässigkeit",
    ],
    fr: [
      "Mécanisme breveté à vérins à gaz allemands de précision",
      "Disponible en orientation verticale ou horizontale",
      "Sommier à lattes intégré pour un confort quotidien",
      "Conçu pour un usage quotidien avec garantie à vie sur le mécanisme",
    ],
    es: [
      "Mecanismo patentado con pistones de gas alemanes",
      "Elección de orientación vertical u horizontal",
      "Somier de láminas integrado para descanso ergonómico",
      "Diseñado para durabilidad diaria y máxima fiabilidad",
    ],
    it: [
      "Meccanismo brevettato con pistoni a gas tedeschi di precisione",
      "Scelta tra orientamento verticale o orizzontale",
      "Rete a doghe integrata per il massimo comfort quotidiano",
      "Progettato per durare una vita con garanzia a vita sul meccanismo",
    ],
    por: [
      "Mecanismo patenteado com pistões a gás alemães de precisão",
      "Escolha de orientação vertical ou horizontal",
      "Estrado de ripas integrado para conforto ergonómico",
      "Concebido para durabilidade diária e garantia vitalícia",
    ],
  },
  "/products/beds/studio-morphy-bed": {
    en: [
      "Synchronised swing-down workspace desk mechanism",
      "Items stay upright on desk when folding bed down",
      "Vertical & Horizontal desk bed configurations",
      "German piston counterbalancing with lifetime warranty",
    ],
    de: [
      "Synchronisierter Schreibtisch-Klappmechanismus",
      "Gegenstände bleiben beim Ausklappen sicher auf dem Tisch stehen",
      "Vertikale & horizontale Schreibtischbett-Ausführungen",
      "Deutsche Gasdruckfedern mit lebenslanger Mechanismus-Garantie",
    ],
    fr: [
      "Mécanisme de bureau rabattable synchronisé",
      "Les objets restent en place sur le bureau lors de l'ouverture",
      "Configurations lit bureau vertical et horizontal",
      "Vérins à gaz allemands avec garantie à vie sur le mécanisme",
    ],
    es: [
      "Mecanismo de escritorio basculante sincronizado",
      "Los objetos permanecen sobre el escritorio al abrir la cama",
      "Configuraciones de cama con escritorio vertical y horizontal",
      "Pistones de gas alemanes con garantía de mecanismo de por vida",
    ],
    it: [
      "Meccanismo di scrivania ribaltabile sincronizzato",
      "Gli oggetti rimangono sul piano durante l'apertura del letto",
      "Configurazioni verticali e orizzontali con scrivania",
      "Pistoni a gas tedeschi con garanzia a vita sul meccanismo",
    ],
    por: [
      "Mecanismo sincronizado de secretária rebatível",
      "Os objetos mantêm-se na secretária ao baixar a cama",
      "Configurações verticais e horizontais com secretária",
      "Pistões a gás alemães com garantia vitalícia no mecanismo",
    ],
  },
  "/products/beds/integrated-morphy-bed": {
    en: [
      "Seamless flush integrated front panel finish",
      "Ultra-low profile design matching modern cabinetry",
      "Vertical & Horizontal integrated configurations",
      "Silent German gas struts with smooth single-hand pull",
    ],
    de: [
      "Nahtlose, flächenbündige Frontblenden-Optik",
      "Ultraflaches Design, passend zu modernen Schrankwänden",
      "Vertikale & horizontale integrierte Ausführungen",
      "Geräuscharme deutsche Gasdruckfedern für sanftes Öffnen mit einer Hand",
    ],
    fr: [
      "Façade intégrée affleurante et épurée",
      "Design ultra-plat s'intégrant parfaitement aux armoires modernes",
      "Configurations intégrées verticales et horizontales",
      "Vérins allemands silencieux avec descente assistée d'une seule main",
    ],
    es: [
      "Acabado de panel frontal integrado y enrasado",
      "Diseño ultrafino a juego con armarios modernos",
      "Configuraciones integradas verticales y horizontales",
      "Pistones silenciosos con suave apertura asistida con una sola mano",
    ],
    it: [
      "Finitura frontale a filo integrata e lineare",
      "Design ultrasottile coordinato con armadiature moderne",
      "Configurazioni integrate verticali e orizzontali",
      "Pistoni silenziosi con apertura assistita ad una sola mano",
    ],
    por: [
      "Acabamento frontal integrado e embutido",
      "Design ultrafino compatível com roupeiros modernos",
      "Configurações integradas verticais e horizontais",
      "Pistões silenciosos com descida suave com uma só mão",
    ],
  },
  "/products/beds/classic-traditional-bed": {
    en: [
      "Heavy-duty traditional foldaway steel mechanism",
      "Choice of Vertical or Horizontal orientation",
      "Clearance pricing – brand new, while stocks last",
      "Integrated sprung wooden slatted foundation",
    ],
    de: [
      "Robuster traditioneller Schrankbett-Stahlmechanismus",
      "Vertikale oder horizontale Ausrichtung wählbar",
      "Abverkaufspreise – fabrikneu, solange der Vorrat reicht",
      "Integrierter Federholz-Lattenrost inklusive",
    ],
    fr: [
      "Mécanisme escamotable en acier haute résistance",
      "Disponible en orientation verticale ou horizontale",
      "Prix de déstockage – produits neufs jusqu'à épuisement des stocks",
      "Sommier à lattes en bois intégré",
    ],
    es: [
      "Mecanismo tradicional de acero de alta resistencia",
      "Elección de orientación vertical u horizontal",
      "Precios de liquidación – artículos nuevos hasta fin de existencias",
      "Somier de láminas de madera integrado",
    ],
    it: [
      "Robusto meccanismo a scomparsa in acciaio tradizionale",
      "Scelta tra orientamento verticale o orizzontale",
      "Prezzi di liquidazione – nuovi di fabbrica fino a esaurimento",
      "Rete a doghe in legno integrata inclusa",
    ],
    por: [
      "Mecanismo tradicional em aço de alta resistência",
      "Escolha de orientação vertical ou horizontal",
      "Preços de liquidação – novos até ao fim do stock",
      "Estrado de ripas de madeira integrado",
    ],
  },
  "/products/beds/studio-traditional-bed": {
    en: [
      "Integrated desk transforms without clearing workspace",
      "Robust dual gas-lift counterbalance mechanism",
      "Clearance pricing – limited stock, won't be restocked",
      "Engineered for space-saving home offices & studios",
    ],
    de: [
      "Integrierter Schreibtisch verwandelt sich ohne Abräumen",
      "Robuste Doppel-Gasdruckfederung",
      "Abverkaufspreise – limitierter Bestand, wird nicht nachproduziert",
      "Ideal für platzsparende Home-Offices und Studios",
    ],
    fr: [
      "Bureau intégré se transformant sans vider le plan de travail",
      "Mécanisme robuste à double vérins de levage",
      "Prix spécial déstockage – stock limité non renouvelé",
      "Conçu pour les studios et le télétravail",
    ],
    es: [
      "Escritorio integrado que se transforma sin retirar objetos",
      "Robusto mecanismo con doble elevación por gas",
      "Precios de liquidación – stock limitado no renovable",
      "Diseñado para estudios y oficinas en casa compactas",
    ],
    it: [
      "Scrivania integrata che si trasforma senza togliere gli oggetti",
      "Robusto meccanismo con doppio pistone a gas",
      "Prezzi di liquidazione – stock limitato non riassortibile",
      "Perfetto per monolocali e postazioni smart-working",
    ],
    por: [
      "Secretária integrada que se transforma sem retirar objetos",
      "Mecanismo robusto com duplo pistão a gás",
      "Preços de liquidação – stock limitado não renovável",
      "Concebido para estúdios e espaços de trabalho compactos",
    ],
  },
  "/products/cabinets/vertical-wall-bed-cabinet": {
    en: [
      "Precision-engineered cabinet encasing Classic vertical beds",
      "170° wide-opening doors for unobstructed access",
      "Durable melamine-faced furniture board construction",
      "Available in 4 finishes: Pine, Beech, Oak & White",
    ],
    de: [
      "Präzise gefertigtes Schrankgehäuse für Classic Vertikalbetten",
      "170°-Weitwinkel-Türen für ungehinderten Zugang",
      "Langlebige melaminharzbeschichtete Möbelbauplatten",
      "Erhältlich in 4 Dekoren: Kiefer, Buche, Eiche & Weiß",
    ],
    fr: [
      "Armoire sur mesure conçue pour lits verticaux Classic",
      "Portes à ouverture 170° pour un accès pratique",
      "Panneaux de meubles mélaminés haute résistance",
      "Disponible en 4 finitions : Pin, Hêtre, Chêne & Blanc",
    ],
  },
  "/products/cabinets/horizontal-wall-bed-cabinet": {
    en: [
      "Low-height enclosure tailored for horizontal wall beds",
      "90° wide-opening doors with dust-free storage seal",
      "Matches Double and King horizontal bed frames",
      "Available in Pine, Beech, Oak & White finishes",
    ],
    de: [
      "Kompakter Schrankkorpus optimiert für Horizontalbetten",
      "90°-Türen für staubgeschützte Aufbewahrung",
      "Passend für horizontale Double- und King-Schrankbetten",
      "Erhältlich in Kiefer, Buche, Eiche & Weiß",
    ],
    fr: [
      "Coffrage bas spécialement adapté aux lits horizontaux",
      "Portes ouvrantes à 90° protégeant de la poussière",
      "Compatible avec les cadres horizontaux Double et King",
      "Finitions disponibles : Pin, Hêtre, Chêne & Blanc",
    ],
  },
  "/products/cabinets/overhead-storage-extension-cabinet": {
    en: [
      "Top extension adding valuable overhead storage space",
      "Bridges height difference to align flush with side units",
      "Specifically designed for Double & King horizontal cabinets",
      "Matching melamine finish in Pine, Beech, Oak & White",
    ],
    de: [
      "Überbauschrank für wertvollen zusätzlichen Stauraum",
      "Gleicht Höhenunterschiede zu Seitenschränken nahtlos aus",
      "Speziell für horizontale Double- und King-Schränke",
      "Passende Dekore in Kiefer, Buche, Eiche & Weiß",
    ],
    fr: [
      "Meuble pont supérieur pour un rangement optimal",
      "Aligne la hauteur avec les armoires latérales",
      "Spécifique pour armoires horizontales Double & King",
      "Finitions mélaminées coordonnées : Pin, Hêtre, Chêne & Blanc",
    ],
  },
  "/products/cabinets/side-storage-wardrobe-cabinet": {
    en: [
      "Modular 50cm width wardrobe and shelf storage unit",
      "Choice of 90° hanging wardrobe door or open shelving",
      "Matches height of vertical cabinets & horizontal extensions",
      "Available in Pine, Beech, Oak & White finishes",
    ],
    de: [
      "Modulare 50-cm-Seitenschrank- und Regaleinheit",
      "Wahlweise mit 90°-Kleiderschranktür oder offenen Regalen",
      "Höhengleich mit Vertikalschränken und Überbau-Erweiterungen",
      "Erhältlich in Kiefer, Buche, Eiche & Weiß",
    ],
    fr: [
      "Module de rangement et penderie de 50 cm de large",
      "Choix entre porte battante 90° ou étagères ouvertes",
      "Aligné en hauteur avec les armoires et extensions",
      "Finitions disponibles : Pin, Hêtre, Chêne & Blanc",
    ],
  },
  "/products/mattresses/comfort-mattress": {
    en: [
      "Pocket sprung core with individual contouring support",
      "Engineered specifically for vertical and horizontal foldaway storage",
      "Breathable quilted damask cover with hypoallergenic filling",
      "Medium-firm comfort level suitable for daily sleeping",
    ],
    de: [
      "Taschenfederkern für punktgenaue ergonomische Unterstützung",
      "Speziell für das vertikale und horizontale Einklappen entwickelt",
      "Atmungsaktiver Bezug mit hypoallergener Füllung",
      "Mittelfester Härtegrad für gesunden täglichen Schlaf",
    ],
    fr: [
      "Cœur à ressorts ensachés épousant la morphologie",
      "Spécialement conçu pour le stockage vertical sans affaissement",
      "Housse damassée respirante avec garnissage hypoallergénique",
      "Confort mi-ferme adapté au couchage quotidien",
    ],
  },
  "/products/mattresses/luxury-mattress": {
    en: [
      "Orthopaedic high-density memory foam & pocket spring hybrid",
      "Advanced pressure relief for back and spine alignment",
      "Edge-to-edge support prevents roll-off and sagging",
      "Specifically tested not to slump when stored upright",
    ],
    de: [
      "Orthopädischer Memory-Schaum & Taschenfederkern-Hybrid",
      "Gezielte Druckentlastung für Wirbelsäule und Gelenke",
      "Rundum-Kantenverstärkung gegen Einsinken",
      "Dauerhaft formstabil auch bei stehender Lagerung",
    ],
    fr: [
      "Mousse à mémoire orthopédique et ressorts ensachés hybrides",
      "Soulagement de pression et alignement de la colonne",
      "Soutien renforcé bord à bord",
      "Testé pour maintenir sa forme en position verticale",
    ],
  },
  "/products/mattresses/supreme-mattress": {
    en: [
      "Premium multi-layer hybrid with cooling gel memory foam",
      "Maximum ergonomic support with targeted body zones",
      "Luxury breathable knitted fabric with anti-dust mite barrier",
      "Optimal weight distribution engineered for foldaway wall beds",
    ],
    de: [
      "Hochwertiger Mehrschicht-Hybrid mit kühlendem Gel-Schaum",
      "Maximale Ergonomie mit zielgerichteten Körperzonen",
      "Atmungsaktiver Strickbezug mit Milbenschutz",
      "Optimale Gewichtsverteilung für Schrankbett-Systeme",
    ],
    fr: [
      "Hybride multicouche haut de gamme avec mousse gel rafraîchissante",
      "Soutien ergonomique maximal avec zones ciblées",
      "Tissu tricoté respirant avec barrière anti-acariens",
      "Répartition optimale du poids pour lits escamotables",
    ],
  },
  "/products/tables?type=Dining+Table": {
    en: [
      "Transforming mechanism from console/shelf to dining table",
      "Accommodates up to 8-10 people with effortless expansion",
      "Heat, stain, and water-resistant premium surface finishes",
      "Heavy-duty powder-coated steel legs and frame",
    ],
    de: [
      "Verwandlungsmechanismus vom Regal/Konsole zum Esstisch",
      "Platz für bis zu 8–10 Personen durch einfaches Ausziehen",
      "Hitze-, flecken- und wasserresistente Oberflächen",
      "Robuste pulverbeschichtete Stahlbeine und stabiler Rahmen",
    ],
    fr: [
      "Mécanisme transformable d'étagère/console en table à manger",
      "Accueille jusqu'à 8 à 10 convives facilement",
      "Surfaces haut de gamme résistantes aux rayures et à la chaleur",
      "Pieds et structure en acier thermo-laqué robuste",
    ],
  },
  "/products/tables?type=Coffee+Table": {
    en: [
      "Hydraulic lift-top mechanism adjusts from coffee to dining height",
      "Hidden internal storage beneath the liftable tabletop",
      "Smooth pneumatic mechanism with soft-close damping",
      "Space-saving dual living & dining functionality",
    ],
    de: [
      "Hydraulischer Hubtisch: von Couchtisch- auf Esstischhöhe",
      "Versteckter Stauraum unter der anhebbaren Tischplatte",
      "Sanfte pneumatische Dämpfung für leises Schließen",
      "Platzsparende 2-in-1-Wohn- und Esslösung",
    ],
    fr: [
      "Mécanisme hydraulique réglable de table basse à hauteur de table de repas",
      "Espace de rangement dissimulé sous le plateau relevable",
      "Système pneumatique fluide avec fermeture amortie",
      "Gain de place idéal pour salon et repas",
    ],
  },
  "/products/tables?type=Desk": {
    en: [
      "Extending console table expanding from slim hallway desk to 10 seats",
      "Includes moveable table leaves for modular dining length",
      "Reinforced central telescopic steel support track",
      "Compact space-saving design for modern apartments",
    ],
    de: [
      "Ausziehbarer Konsolentisch: von der schmalen Wandkonsole zum 10-Personen-Tisch",
      "Inklusive modularer Einlegeplatten für variable Längen",
      "Verstärkte zentrale Teleskop-Führungsschiene aus Stahl",
      "Kompakte Raumlösung für moderne Wohnungen",
    ],
    fr: [
      "Console extensible passant d'un bureau fin à une table 10 places",
      "Rallonges modulaires incluses pour ajuster la longueur",
      "Coulisses télescopiques centrales en acier renforcé",
      "Conception compacte pour appartements modernes",
    ],
  },
  "/products/tables?type=Cube+stool": {
    en: [
      "5 individual padded seats nested in 1 compact cube",
      "Heavy-duty steel frame with smooth-rolling casters",
      "Waterproof stain-resistant faux leather upholstery",
      "Space-saving compact footprint when assembled together",
    ],
    de: [
      "5 gepolsterte Sitzhocker kompakt in 1 Würfel verschachtelt",
      "Stabiler Stahlrahmen mit leichtgängigen Rollen",
      "Wasser- und fleckenabweisender Bezug",
      "Minimale Stellfläche im zusammengestellten Zustand",
    ],
    fr: [
      "5 poufs rembourrés individuels emboîtés en 1 cube compact",
      "Structure en acier robuste avec roulettes fluides",
      "Revêtement résistant à l'eau et aux taches",
      "Encombrement minimal une fois rangé",
    ],
  },
};

function getProductFeatures(item, locale = "en") {
  if (!item) return [];
  const normLocale = (locale || "en").toLowerCase();
  const langKey = normLocale === "por" || normLocale === "pt" ? "por" : normLocale;

  const getEntry = (href) => {
    if (!href) return null;
    const entry = LOCALIZED_FEATURES[href];
    if (!entry) return null;
    return entry[langKey] || entry.en || null;
  };

  const direct = getEntry(item.href);
  if (direct) return direct;

  const cleanHref = (item.href || "").split("?")[0];
  const cleaned = getEntry(cleanHref);
  if (cleaned) return cleaned;

  if (item.href?.includes("cabinets")) {
    if (langKey === "de") return ["Individuelles Schrankgehäuse für WallBedKing Betten", "Robuste Modulbauweise mit Staubschutz", "Verschiedene langlebige Holzdekore"];
    if (langKey === "fr") return ["Coffrage sur mesure conçu pour lits WallBedKing", "Construction modulaire robuste anti-poussière", "Plusieurs finitions bois durables"];
    return ["Custom enclosure engineered for WallBedKing beds", "Solid modular construction with dust protection", "Multiple durable woodgrain finishes"];
  }

  if (item.href?.includes("mattresses")) {
    if (langKey === "de") return ["Speziell für das vertikale Einklappen entwickelt", "Ausgewogener Komfort aus Taschenfedern & Schaum", "Atmungsaktiver hypoallergener Luxusbezug"];
    if (langKey === "fr") return ["Conçu spécialement pour le rangement vertical", "Équilibre ressorts ensachés et mousse mémoire", "Housse respirante hypoallergénique"];
    return ["Engineered specifically for upright vertical storage", "Orthopaedic pocket spring & memory foam balance", "Breathable hypoallergenic luxury cover"];
  }

  if (item.href?.includes("tables")) {
    if (langKey === "de") return ["Multifunktionale Verwandlungsmechanik", "Kompakte platzsparende Klapptechnik", "Hochwertige Platten & stabile Metallbeschläge"];
    if (langKey === "fr") return ["Mécanismes transformables multifonctions", "Conception escamotable gain de place", "Matériaux robustes et ferrures métalliques"];
    return ["Multi-functional transforming mechanisms", "Compact space-saving fold-away engineering", "Heavy-duty solid board & metal hardware"];
  }

  return [
    "Premium quality space-saving furniture",
    "Engineered for everyday durability & ease of use",
  ];
}

function getSubmenuItemPricing(item, locale, allFlagships, t, formatPrice) {
  if (!item || !item.href) return item?.price || "";
  const cleanHref = item.href.split("?")[0].replace(/\/+$/, "");
  const slug = cleanHref.split("/").pop();
  const dynamicFlagship = (allFlagships || []).find(
    (f) =>
      f.slug === slug ||
      (Array.isArray(f.aliases) && f.aliases.includes(slug)) ||
      f.link === item.href ||
      f.link?.split("?")[0].replace(/\/+$/, "") === cleanHref
  );
  if (dynamicFlagship) {
    const pricing = getProductPrice(dynamicFlagship, locale);
    if (pricing && pricing.display) {
      return `${t("common.from", "from")} ${pricing.display}`;
    }
  }
  if (item.price && typeof item.price === "string" && item.price.includes("£")) {
    const num = Number(item.price.replace(/[^0-9]/g, ""));
    if (!isNaN(num) && num > 0) {
      return `${t("common.from", "from")} ${formatPrice(num)}`;
    }
  }
  return item.price || "";
}

function getSubmenuItemTitle(item, locale, allFlagships, t) {
  if (!item) return "";
  if (item.titleKey) {
    const translated = t(item.titleKey);
    if (translated && translated !== item.titleKey) return translated;
  }
  const cleanHref = item.href?.split("?")[0].replace(/\/+$/, "");
  const slug = cleanHref?.split("/").pop();
  const dynamicFlagship = (allFlagships || []).find(
    (f) =>
      f.slug === slug ||
      (Array.isArray(f.aliases) && f.aliases.includes(slug)) ||
      f.link === item.href ||
      f.link?.split("?")[0].replace(/\/+$/, "") === cleanHref
  );
  if (dynamicFlagship) {
    const localized = getLocalizedProductName(dynamicFlagship, locale);
    if (localized && localized !== "Wall Bed") return localized;
  }
  return item.title || "";
}

function getSubmenuItemTagline(item, t) {
  if (!item) return "";
  if (item.taglineKey) {
    const translated = t(item.taglineKey);
    if (translated && translated !== item.taglineKey) return translated;
  }
  return item.tagline || "";
}

export function SubmenuSplitTest() {
  const { subMenu, setSubMenu, cancelCloseSubmenu } = useContext(MenuContext);
  const { locale, localizedHref, t, formatPrice } = useLocale();
  const { allFlagships } = useProductCatalog();

  const [activeSectionId, setActiveSectionId] = useState("morphy");
  const [hoveredIndex, setHoveredIndex] = useState(0);
  const [selectedAngleIndex, setSelectedAngleIndex] = useState(0);

  const activeData = useMemo(() => {
    if (!subMenu) return null;
    return SUBMENU_DATA[subMenu] || null;
  }, [subMenu]);

  const hasSections = Boolean(activeData?.sections && activeData.sections.length > 0);

  // Active items list: either section-filtered (e.g. for "beds") or category items
  const currentItems = useMemo(() => {
    if (!activeData) return [];
    if (hasSections) {
      const sec = activeData.sections.find((s) => s.id === activeSectionId) || activeData.sections[0];
      return sec?.items || [];
    }
    return activeData.items || [];
  }, [activeData, hasSections, activeSectionId]);

  const currentParent = useMemo(() => {
    if (!activeData) return null;
    if (hasSections) {
      const sec = activeData.sections.find((s) => s.id === activeSectionId) || activeData.sections[0];
      return sec?.parent || activeData.parent;
    }
    return activeData.parent;
  }, [activeData, hasSections, activeSectionId]);

  // Reset hovered item when category changes
  useEffect(() => {
    setHoveredIndex(0);
    setSelectedAngleIndex(0);
  }, [subMenu, activeSectionId]);

  // Active item for the right-side showcase
  const activeItem = currentItems[hoveredIndex] || currentItems[0] || null;

  // Active gallery thumbnails for the right-side preview
  const activeGallery = useMemo(() => {
    if (!activeItem) return [];
    if (BED_EXTRA_GALLERY[activeItem.href]) {
      return BED_EXTRA_GALLERY[activeItem.href];
    }
    const list = [];
    if (activeItem.image) {
      list.push({ label: "Primary View", src: activeItem.image });
    }
    if (activeItem.hoverImage && activeItem.hoverImage !== activeItem.image) {
      list.push({ label: "Open / Alternative", src: activeItem.hoverImage });
    }
    return list;
  }, [activeItem]);

  // Reset angle index when hovered item changes
  useEffect(() => {
    setSelectedAngleIndex(0);
  }, [hoveredIndex]);

  const currentPreviewSrc =
    activeGallery[selectedAngleIndex]?.src ||
    activeItem?.image ||
    currentParent?.image;

  const features = useMemo(() => {
    return getProductFeatures(activeItem, locale);
  }, [activeItem, locale]);

  const vatLabel = useMemo(() => {
    if (locale === "de") return "inkl. MwSt. & Rahmen";
    if (locale === "fr") return "TVA & cadre inclus";
    if (locale === "es") return "IVA y estructura incluidos";
    if (locale === "por") return "IVA e estrutura incluídos";
    if (locale === "it") return "IVA e struttura inclusi";
    if (locale === "us") return "Frame & mechanism included";
    return "incl. VAT & Frame";
  }, [locale]);

  const exploreText = useMemo(() => {
    if (locale === "de") return "Entdecken";
    if (locale === "fr") return "Explorer";
    if (locale === "es" || locale === "por") return "Explorar";
    if (locale === "it") return "Esplora";
    return "Explore";
  }, [locale]);

  const getSectionTitle = (sec) => {
    if (sec.id === "morphy") return t("nav.morphyBeds", "MORPHY™ Beds");
    if (sec.id === "traditional") return t("nav.traditionalBeds", "Clearance");
    return sec.titleKey ? t(sec.titleKey, sec.title) : sec.title;
  };

  const activeItemTitle = useMemo(() => {
    return getSubmenuItemTitle(activeItem, locale, allFlagships, t);
  }, [activeItem, locale, allFlagships, t]);

  const activeItemPricing = useMemo(() => {
    return getSubmenuItemPricing(activeItem, locale, allFlagships, t, formatPrice);
  }, [activeItem, locale, allFlagships, t, formatPrice]);

  return (
    <AnimatePresence>
      {subMenu && activeData && (
        <motion.div
          key="submenu-split-test"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onMouseEnter={cancelCloseSubmenu}
          onMouseLeave={() => setSubMenu(null)}
          className="absolute left-0 right-0 top-full z-50 bg-wbk-white border-b border-wbk-lightgrey shadow-xl overflow-hidden before:absolute before:-top-4 before:left-0 before:right-0 before:h-4 before:content-['']"
        >
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="w-full flex items-stretch gap-6 min-h-[390px] max-h-[440px]">
              {/* ── LEFT COLUMN: Product List & All Category Link ── */}
              <div className="w-[330px] xl:w-[360px] shrink-0 border-r border-wbk-lightgrey/70 pr-5 flex flex-col justify-between">
                <div>
                  {/* Category Section Switcher for 'beds' */}
                  {hasSections ? (
                    <div className="flex items-center gap-1.5 p-1 bg-[#F4F1EA] rounded-none mb-3">
                      {activeData.sections.map((sec) => {
                        const isSecActive = activeSectionId === sec.id;
                        return (
                          <button
                            key={sec.id}
                            type="button"
                            onClick={() => {
                              setActiveSectionId(sec.id);
                              setHoveredIndex(0);
                            }}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-xs uppercase tracking-wider transition-all cursor-pointer ${
                              isSecActive
                                ? "bg-wbk-white text-wbk-black shadow-xs font-semibold"
                                : "text-wbk-grey hover:text-wbk-black font-medium"
                            }`}
                          >
                            <span>{getSectionTitle(sec)}</span>
                            {sec.badge && sec.badge !== "New Gen" && sec.badge !== "New Generation" && (
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${
                                  isSecActive
                                    ? "bg-wbk-green/30 text-wbk-black"
                                    : "bg-wbk-grey/20 text-wbk-grey"
                                }`}
                              >
                                {sec.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-wbk-black">
                        {currentParent?.titleKey ? t(currentParent.titleKey, currentParent.title) : (currentParent?.title || "Explore Models")}
                      </span>
                    </div>
                  )}

                  {/* Vertical Items List */}
                  <div className="flex flex-col gap-1.5">
                    {currentItems.map((item, idx) => {
                      const isHovered = hoveredIndex === idx;
                      const itemTitle = getSubmenuItemTitle(item, locale, allFlagships, t);
                      const itemPrice = getSubmenuItemPricing(item, locale, allFlagships, t, formatPrice);
                      const itemTagline = getSubmenuItemTagline(item, t);

                      return (
                        <Link
                          key={`${item.href}-${idx}`}
                          href={localizedHref(item.href)}
                          onClick={() => setSubMenu(null)}
                          onMouseEnter={() => setHoveredIndex(idx)}
                          className={`group relative flex items-center gap-3.5 p-2.5 rounded-none transition-all duration-150 cursor-pointer ${
                            isHovered
                              ? "bg-wbk-green/10 translate-x-1"
                              : "hover:bg-wbk-green/5"
                          }`}
                        >
                          {/* Small Product Thumbnail */}
                          <div className="relative w-14 h-14 shrink-0 rounded-none overflow-hidden bg-white">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={itemTitle}
                                fill
                                sizes="56px"
                                className="object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-wbk-lightgrey/20">
                                <IconBed size={20} className="text-wbk-grey" />
                              </div>
                            )}
                          </div>

                          {/* Item Text & Price */}
                          <div className="flex-1 min-w-0">
                            <h4
                              className={`text-xs leading-tight line-clamp-1 transition-colors ${
                                isHovered
                                  ? "text-wbk-black font-semibold"
                                  : "text-wbk-black font-normal"
                              }`}
                            >
                              {itemTitle}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] font-medium text-wbk-black">
                                {itemPrice || exploreText}
                              </span>
                              {itemTagline && (
                                <>
                                  <span className="text-wbk-grey/40 text-[10px]">
                                    •
                                  </span>
                                  <span className="text-[10px] text-wbk-grey truncate">
                                    {itemTagline}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Hover Arrow Indicator */}
                          <div
                            className={`shrink-0 transition-all duration-150 ${
                              isHovered
                                ? "opacity-100 translate-x-0 text-wbk-green"
                                : "opacity-0 -translate-x-1 text-wbk-grey/40"
                            }`}
                          >
                            <IconArrowRight size={14} />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Parent Category Link */}
                {currentParent?.href && (
                  <div className="pt-3 border-t border-wbk-lightgrey/60 mt-2">
                    <Link
                      href={localizedHref(currentParent.href)}
                      onClick={() => setSubMenu(null)}
                      className="group flex items-center justify-between p-2 rounded-none hover:bg-wbk-green/10 text-wbk-black transition-colors"
                    >
                      <div>
                        <span className="text-[10px] text-wbk-grey block font-normal">
                          {t("nav.categoryOverview", "Category Overview")}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider">
                          {currentParent.titleKey ? t(currentParent.titleKey, currentParent.title) : currentParent.title}
                        </span>
                      </div>
                      <IconArrowRight
                        size={15}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </Link>
                  </div>
                )}
              </div>

              {/* ── RIGHT COLUMN: Interactive Showcase & Angle Thumbnails ── */}
              <div className="flex-1 min-w-0 flex items-stretch gap-6 pl-1">
                {activeItem ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeItem.href}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="w-full flex items-stretch gap-6"
                    >
                      {/* Left side of Showcase: Large Image + Angle Thumbs */}
                      <div className="w-[340px] xl:w-[380px] shrink-0 flex flex-col justify-between">
                        {/* Large Image Card */}
                        <Link
                          href={localizedHref(activeItem.href)}
                          onClick={() => setSubMenu(null)}
                          className="group relative flex-1 min-h-[280px] max-h-[300px] w-full rounded-none overflow-hidden bg-gradient-to-b from-[#FBF9F6] to-[#F5F2EC] flex items-center justify-center p-3 cursor-pointer shadow-xs"
                        >
                          {currentPreviewSrc && (
                            <Image
                              src={currentPreviewSrc}
                              alt={activeItemTitle}
                              fill
                              sizes="400px"
                              priority
                              className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                            />
                          )}
                        </Link>

                        {/* Angle thumbnails strip */}
                        {activeGallery.length > 1 && (
                          <div className="flex items-center gap-2 mt-3 px-0.5">
                            {activeGallery.map((ang, aIdx) => {
                              const isSelectedAngle = selectedAngleIndex === aIdx;
                              return (
                                <button
                                  key={`angle-${aIdx}`}
                                  type="button"
                                  onClick={() => setSelectedAngleIndex(aIdx)}
                                  onMouseEnter={() => setSelectedAngleIndex(aIdx)}
                                  className={`relative w-16 h-14 rounded-none overflow-hidden bg-white transition-all cursor-pointer ${
                                    isSelectedAngle
                                      ? "ring-2 ring-wbk-green scale-105"
                                      : "hover:opacity-80"
                                  }`}
                                  title={ang.label}
                                >
                                  <Image
                                    src={ang.src}
                                    alt={ang.label}
                                    fill
                                    sizes="64px"
                                    className="object-contain p-1"
                                  />
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Right side of Showcase: Details, Specs, CTA */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <div>
                          {/* Product Title (Not bold, no label above) */}
                          <h3 className="text-xl xl:text-2xl font-normal text-wbk-black leading-tight">
                            {activeItemTitle}
                          </h3>

                          {/* Price Tag with Highlight */}
                          <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-2xl xl:text-3xl font-semibold text-wbk-black">
                              {activeItemPricing}
                            </span>
                            <span className="text-xs text-wbk-grey font-normal">
                              {vatLabel}
                            </span>
                          </div>

                          {/* Key Feature Highlights */}
                          <div className="mt-4 flex flex-col gap-2">
                            {features.map((feat, fIdx) => (
                              <div
                                key={fIdx}
                                className="flex items-center gap-2 text-xs text-wbk-black/85"
                              >
                                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-none bg-wbk-green/20 text-wbk-black">
                                  <IconCheck size={11} strokeWidth={2.5} />
                                </span>
                                <span className="font-normal">{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Bottom CTA Button */}
                        <div className="pt-4 border-t border-wbk-lightgrey/60 flex items-center">
                          <Link
                            href={localizedHref(activeItem.href)}
                            onClick={() => setSubMenu(null)}
                            className="inline-flex items-center justify-center px-7 py-2.5 rounded-full bg-wbk-black text-wbk-white text-xs font-semibold uppercase tracking-wider hover:bg-wbk-green hover:text-wbk-black transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                          >
                            {exploreText}
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <div className="w-full flex items-center justify-center text-wbk-grey text-sm">
                    {t("nav.hoverPrompt", "Hover over a model on the left to see details.")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
