import navMenuData from "./navigation_menu.json";

export const ALL_NAV_ITEMS = (
  Array.isArray(navMenuData) && navMenuData.length > 0
    ? navMenuData
    : [
        { id: "morphyBeds", title: "MORPHY™ Beds", slug: "morphy-beds", href: "/products/beds?collection=morphy", is_visible: true, order: 1, hasSubmenu: true, has_submenu: true },
        { id: "traditionalBeds", title: "Clearance", slug: "traditional-beds", href: "/products/beds?collection=traditional", is_visible: true, order: 2, hasSubmenu: true, has_submenu: true, badge: "%" },
        { id: "cabinets", title: "Cabinets", slug: "cabinets", href: "/products/cabinets", is_visible: true, order: 3, hasSubmenu: true, has_submenu: true },
        { id: "mattresses", title: "Mattresses", slug: "mattresses", href: "/products/mattresses", is_visible: true, order: 4, hasSubmenu: true, has_submenu: true },
        { id: "tables", title: "Smart Tables", slug: "tables", href: "/products/tables", is_visible: true, order: 5, hasSubmenu: true, has_submenu: true },
      ]
).map((item) => {
  const hasSub = item.hasSubmenu !== undefined ? Boolean(item.hasSubmenu) : Boolean(item.has_submenu);
  const slug = item.slug || item.category_id || item.id;
  return {
    ...item,
    slug,
    hasSubmenu: hasSub,
    has_submenu: hasSub,
  };
});

const isDev = process.env.NODE_ENV === "development";

export const MAIN_NAV_ITEMS = ALL_NAV_ITEMS
  .filter((item) => item.is_visible !== false)
  .sort((a, b) => (a.order || 0) - (b.order || 0));

const SUPABASE_STORAGE_URL = "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds";
const SUPABASE_MATTRESSES_STORAGE_URL = "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/mattresses";

const morphySubmenu = {
  parent: {
    title: "All MORPHY™ Beds",
    titleKey: "nav.allMorphyBeds",
    image: `${SUPABASE_STORAGE_URL}/1K/160x200-CV-MORPHY_5.webp`,
    hoverImage: `${SUPABASE_STORAGE_URL}/1K/160x200-CV-MORPHY_1-m.webp`,
    href: "/products/beds?collection=morphy",
    tagline: "Explore all MORPHY™ models",
    taglineKey: "nav.allMorphyTagline",
  },
  items: [
    {
      title: "Classic MORPHY™ Bed",
      image: `${SUPABASE_STORAGE_URL}/1K/160x200-CV-MORPHY_5.webp`,
      hoverImage: `${SUPABASE_STORAGE_URL}/1K/160x200-CV-MORPHY_1-m.webp`,
      href: "/products/beds/classic-morphy-bed",
      price: "from £749",
      tagline: "Vertical & Horizontal",
    },
    {
      title: "Studio MORPHY™ Bed",
      image: `${SUPABASE_STORAGE_URL}/1K/160x200-SV-MORPHY_5.webp`,
      hoverImage: `${SUPABASE_STORAGE_URL}/1K/160x200-SV-MORPHY_1-m.webp`,
      href: "/products/beds/studio-morphy-bed",
      price: "from £999",
      tagline: "Vertical & Horizontal",
    },
    {
      title: "Integrated MORPHY™ Bed",
      image: `${SUPABASE_STORAGE_URL}/1K/160x200-IV-MORPHY_5.webp`,
      hoverImage: `${SUPABASE_STORAGE_URL}/1K/160x200-IV-MORPHY_1-m.webp`,
      href: "/products/beds/integrated-morphy-bed",
      price: "from £749",
      tagline: "Vertical & Horizontal",
    },
  ],
};

const traditionalSubmenu = {
  parent: {
    title: "All Clearance Beds",
    titleKey: "nav.allTraditionalBeds",
    image: `${SUPABASE_STORAGE_URL}/1K/160x200-CV-TRADITIONAL_1.webp`,
    hoverImage: `${SUPABASE_STORAGE_URL}/1K/160x200-CV-TRADITIONAL_2.webp`,
    href: "/products/beds?collection=traditional",
    tagline: "Explore clearance wall bed models",
    taglineKey: "nav.allTraditionalTagline",
  },
  items: [
    {
      title: "Classic Wall Bed",
      image: `${SUPABASE_STORAGE_URL}/1K/160x200-CV-TRADITIONAL_1.webp`,
      hoverImage: `${SUPABASE_STORAGE_URL}/1K/160x200-CV-TRADITIONAL_2.webp`,
      href: "/products/beds/classic-traditional-bed",
      price: "from £419",
      tagline: "Vertical & Horizontal",
    },
    {
      title: "Studio Wall Bed",
      image: `${SUPABASE_STORAGE_URL}/1K/150x200-SV-TRADITIONAL_1.webp`,
      hoverImage: `${SUPABASE_STORAGE_URL}/1K/150x200-SV-TRADITIONAL_2.webp`,
      href: "/products/beds/studio-traditional-bed",
      price: "from £699",
      tagline: "Vertical & Horizontal",
    },
  ],
};

export const SUBMENU_DATA = {
  "morphy-beds": morphySubmenu,
  morphyBeds: morphySubmenu,
  morphy: morphySubmenu,
  "traditional-beds": traditionalSubmenu,
  traditionalBeds: traditionalSubmenu,
  traditional: traditionalSubmenu,
  clearance: traditionalSubmenu,
  "clearance-beds": traditionalSubmenu,
  beds: {
    parent: {
      title: "All Wall Beds",
      image: `${SUPABASE_STORAGE_URL}/1K/160x200-CV-MORPHY_5.webp`,
      hoverImage: `${SUPABASE_STORAGE_URL}/1K/160x200-CV-MORPHY_1-m.webp`,
      href: "/products/beds",
      tagline: "Explore complete MORPHY™ & Clearance collections",
    },
    sections: [
      {
        id: "morphy",
        title: "MORPHY™ Beds",
        titleKey: "nav.morphyBeds",
        badge: "New Generation",
        parent: morphySubmenu.parent,
        items: morphySubmenu.items,
      },
      {
        id: "traditional",
        title: "Clearance",
        titleKey: "nav.traditionalBeds",
        badge: "%",
        parent: traditionalSubmenu.parent,
        items: traditionalSubmenu.items,
      },
    ],
    items: [...morphySubmenu.items, ...traditionalSubmenu.items],
  },
  sofas: {
    parent: {
      title: "All Sofas",
      image: "/sofa1.webp",
      href: "/products/sofas",
      tagline: "Modular living comfort",
    },
    items: [
      {
        title: "Bed Front Modular Sofa",
        image: "/sofa1.webp",
        href: "/products/sofas/bed-front-modular-sofa",
        type: "Bed Front",
        sizeRange: "80 – 140 cm modules",
        price: "from £499",
      },
      {
        title: "Free Standing Modular Sofa",
        image: "/sofa2.webp",
        href: "/products/sofas/free-standing-modular-sofa",
        type: "Free Standing",
        sizeRange: "80 – 140 cm modules",
        price: "from £499",
      },
    ],
  },
  tables: {
    parent: {
      title: "All Space Saving Tables",
      image: "/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-table070015e9-9b6d-43bb-bb5d-3c35b18ed648.webp",
      hoverImage: "/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-tablee477d391-4f57-480d-bd52-10d39d901e6d.webp",
      href: "/products/tables",
      tagline: "Multifunctional, expanding & folding space savers",
    },
    items: [
      {
        title: "Dining Tables",
        image: "/product-images/tables/b2473m-transformer-storage-shelf-to-dining-table/transformer-storage-shelf-to-dining-table070015e9-9b6d-43bb-bb5d-3c35b18ed648.webp",
        href: "/products/tables?type=Dining+Table",
        type: "Dining Table",
        badge: "Transforming",
        sizeRange: "Expanding & Foldable",
        price: "from £280",
      },
      {
        title: "Coffee & Lifting Tables",
        image: "/product-images/tables/a1492m-minimalist-lifting-coffee-table/minimalist-lifting-coffee-table320b8.webp",
        href: "/products/tables?type=Coffee+Table",
        type: "Coffee Table",
        badge: "Height-Adjustable",
        sizeRange: "Lift-Top Mechanisms",
        price: "from £299",
      },
      {
        title: "Console & Desk Tables",
        image: "/product-images/tables/b2241-4m-classical-wooden-extendable-console-table/classical-wooden-extendable-console-table38431.webp",
        href: "/products/tables?type=Desk",
        type: "Desk",
        badge: "Extends to 10 Seats",
        sizeRange: "Console to Dining",
        price: "from £440",
      },
      {
        title: "Cube Stools & Benches",
        image: "/product-images/tables/c3487-3m-multi-function-5-in-1-removable-stool/multi-function-5-in-1-removable-stool0f50c.webp",
        href: "/products/tables?type=Cube+stool",
        type: "Cube stool",
        badge: "5 in 1 Modular",
        sizeRange: "Nesting Seats",
        price: "from £480",
      },
    ],
  },
  mattresses: {
    parent: {
      title: "All Mattresses",
      image: `${SUPABASE_MATTRESSES_STORAGE_URL}/comfort.webp`,
      hoverImage: `${SUPABASE_MATTRESSES_STORAGE_URL}/luxury.webp`,
      href: "/products/mattresses",
      tagline: "Engineered for foldaway beds",
    },
    items: [
      {
        title: "Comfort Pocket Sprung Mattress",
        image: `${SUPABASE_MATTRESSES_STORAGE_URL}/comfort.webp`,
        hoverImage: `${SUPABASE_MATTRESSES_STORAGE_URL}/comfort.webp`,
        href: "/products/mattresses/comfort-mattress",
        type: "Comfort",
        sizeRange: "90x190 – 150x200 cm",
        price: "from £299",
      },
      {
        title: "Luxury Orthopaedic Mattress",
        image: `${SUPABASE_MATTRESSES_STORAGE_URL}/luxury.webp`,
        hoverImage: `${SUPABASE_MATTRESSES_STORAGE_URL}/luxury.webp`,
        href: "/products/mattresses/luxury-mattress",
        type: "Luxury",
        sizeRange: "90x190 – 150x200 cm",
        price: "from £364",
      },
      {
        title: "Supreme Hybrid Mattress",
        image: `${SUPABASE_MATTRESSES_STORAGE_URL}/supreme.webp`,
        hoverImage: `${SUPABASE_MATTRESSES_STORAGE_URL}/supreme.webp`,
        href: "/products/mattresses/supreme-mattress",
        type: "Supreme",
        sizeRange: "90x190 – 150x200 cm",
        price: "from £449",
      },
    ],
  },
  cabinets: {
    parent: {
      title: "All Cabinets",
      image: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/cabinets/1K/140x200-DV-OAK-CABINET_ANGLE_1.webp",
      hoverImage: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/cabinets/1K/140x200-DV-OAK-CABINET_ANGLE_2.webp",
      href: "/products/cabinets",
      tagline: "Tailored modular cabinetry",
    },
    items: [
      {
        title: "Vertical Enclosure Cabinet",
        image: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/cabinets/1K/140x200-DV-OAK-CABINET_ANGLE_1.webp",
        hoverImage: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/cabinets/1K/140x200-DV-OAK-CABINET_ANGLE_2.webp",
        href: "/products/cabinets/vertical-wall-bed-cabinet",
        badge: "Vertical Beds",
        price: "from £449",
      },
      {
        title: "Horizontal Enclosure Cabinet",
        image: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/cabinets/1K/160x200-KH-OAK-CABINET_ANGLE_1.webp",
        hoverImage: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/cabinets/1K/160x200-KH-OAK-CABINET_ANGLE_2.webp",
        href: "/products/cabinets/horizontal-wall-bed-cabinet",
        badge: "Horizontal Beds",
        price: "from £599",
      },
      {
        title: "Overhead Bridge Extension",
        image: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/cabinets/1K/140-160x200-KHEXT-OAK-CABINET_ANGLE_1.webp",
        hoverImage: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/cabinets/1K/140-160x200-KHEXT-OAK-CABINET_ANGLE_2.webp",
        href: "/products/cabinets/overhead-storage-extension-cabinet",
        badge: "Top Bridge",
        price: "from £319",
      },
      {
        title: "Side Storage & Wardrobe Unit",
        image: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/cabinets/1K/50x225-SIDEDHV-OAK-CABINET_ANGLE_1.webp",
        hoverImage: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/cabinets/1K/50x225-SIDEDHV-OAK-CABINET_ANGLE_2.webp",
        href: "/products/cabinets/side-storage-wardrobe-cabinet",
        badge: "Side Storage",
        price: "from £289",
      },
    ],
  },
  extras: {
    parent: {
      title: "All Accessories",
      titleKey: "nav.allAccessories",
      image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
      href: "/products/extras",
      tagline: "Hardware, kits & illumination",
      taglineKey: "nav.extrasTagline",
    },
    items: [
      {
        title: "Lighting Systems",
        titleKey: "nav.lightingSystems",
        image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
        href: "/products/extras?type=Lighting",
        badge: "Integrated LEDs",
        badgeKey: "nav.lightingBadge",
      },
      {
        title: "Hardware & Piston Kits",
        titleKey: "nav.hardwareKits",
        image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
        href: "/products/extras?type=Hardware",
        badge: "German Gas Struts",
        badgeKey: "nav.hardwareBadge",
      },
    ],
  },
  support: {
    parent: {
      title: "Support Hub",
      titleKey: "support.hubTitle",
      image: "/product-images/morphy-integrated/160x200.jpg",
      href: "/support/faq",
      tagline: "Guides, videos & assistance",
      taglineKey: "support.hubTagline",
    },
    items: [
      {
        title: "Installation Guides",
        titleKey: "support.guidesTitle",
        image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
        href: "/support/installation-guides",
        badge: "Step-by-step PDF",
        badgeKey: "support.pdfGuides",
      },
      {
        title: "Installation Videos",
        titleKey: "support.videosTitle",
        image: "/product-images/morphy-integrated/160x200.jpg",
        href: "/support/installation-videos",
        badge: "Video walkthroughs",
        badgeKey: "support.videoBadge",
      },
      {
        title: "Frequently Asked Questions",
        titleKey: "support.faqTitle",
        image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
        href: "/support/faq",
        badge: "Answers & Tech specs",
        badgeKey: "support.faqBadge",
      },
      {
        title: "Delivery & Logistics",
        titleKey: "support.deliveryTitle",
        image: "/sofa1.webp",
        href: "/support/delivery",
        badge: "UK & European shipping",
        badgeKey: "support.deliveryBadge",
      },
    ],
  },
};
