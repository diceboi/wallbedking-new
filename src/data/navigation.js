import navMenuData from "./navigation_menu.json";

export const ALL_NAV_ITEMS = (
  Array.isArray(navMenuData) && navMenuData.length > 0
    ? navMenuData
    : [
        { id: "beds", title: "Wall Beds", slug: "beds", href: "/products/beds", is_visible: true, order: 1, hasSubmenu: true, has_submenu: true },
        { id: "sofas", title: "Sofas", slug: "sofas", href: "/products/sofas", is_visible: true, order: 2, hasSubmenu: true, has_submenu: true },
        { id: "cabinets", title: "Cabinets", slug: "cabinets", href: "/products/cabinets", is_visible: true, order: 3, hasSubmenu: true, has_submenu: true },
        { id: "mattresses", title: "Mattresses", slug: "mattresses", href: "/products/mattresses", is_visible: true, order: 4, hasSubmenu: true, has_submenu: true },
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

export const MAIN_NAV_ITEMS = ALL_NAV_ITEMS
  .filter((item) => item.is_visible !== false)
  .sort((a, b) => (a.order || 0) - (b.order || 0));

const SUPABASE_STORAGE_URL = "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/ProductImages/wallbeds";

export const SUBMENU_DATA = {
  beds: {
    parent: {
      title: "All Wall Beds",
      image: `${SUPABASE_STORAGE_URL}/1K/160x200-CV-MORPHY_1.webp`,
      hoverImage: `${SUPABASE_STORAGE_URL}/1K/160x200-CV-MORPHY_1-m.webp`,
      href: "/products/beds",
      tagline: "Explore complete MORPHY™ & Traditional collections",
    },
    sections: [
      {
        id: "morphy",
        title: "MORPHY™ Beds",
        titleKey: "nav.morphyBeds",
        badge: "New Generation",
        parent: {
          title: "All MORPHY™ Beds",
          titleKey: "nav.allMorphyBeds",
          image: `${SUPABASE_STORAGE_URL}/1K/160x200-CV-MORPHY_1.webp`,
          hoverImage: `${SUPABASE_STORAGE_URL}/1K/160x200-CV-MORPHY_1-m.webp`,
          href: "/products/beds?collection=morphy",
          tagline: "Explore all MORPHY™ models",
          taglineKey: "nav.allMorphyTagline",
        },
        items: [
          {
            title: "Classic Vertical MORPHY™ Bed",
            image: `${SUPABASE_STORAGE_URL}/1K/160x200-CV-MORPHY_1.webp`,
            hoverImage: `${SUPABASE_STORAGE_URL}/1K/160x200-CV-MORPHY_1-m.webp`,
            href: "/products/beds/classic-vertical-wall-bed",
            price: "from £419",
          },
          {
            title: "Classic Horizontal MORPHY™ Bed",
            image: `${SUPABASE_STORAGE_URL}/1K/160x200-CH-MORPHY_1.webp`,
            hoverImage: `${SUPABASE_STORAGE_URL}/1K/160x200-CH-MORPHY_1-m.webp`,
            href: "/products/beds/classic-horizontal-wall-bed",
            price: "from £419",
          },
          {
            title: "Studio Vertical MORPHY™ Bed",
            image: `${SUPABASE_STORAGE_URL}/1K/160x200-SV-MORPHY_1.webp`,
            hoverImage: `${SUPABASE_STORAGE_URL}/1K/160x200-SV-MORPHY_1-m.webp`,
            href: "/products/beds/studio-vertical-wall-bed",
            price: "from £524",
          },
          {
            title: "Studio Horizontal MORPHY™ Bed",
            image: `${SUPABASE_STORAGE_URL}/1K/160x200-SH-MORPHY_1.webp`,
            hoverImage: `${SUPABASE_STORAGE_URL}/1K/160x200-SH-MORPHY_1-m.webp`,
            href: "/products/beds/studio-horizontal-wall-bed",
            price: "from £524",
          },
          {
            title: "Integrated Vertical MORPHY™ Bed",
            image: `${SUPABASE_STORAGE_URL}/1K/160x200-IV-MORPHY_1.webp`,
            hoverImage: `${SUPABASE_STORAGE_URL}/1K/160x200-IV-MORPHY_1-m.webp`,
            href: "/products/beds/integrated-vertical-wall-bed",
            price: "from £699",
          },
          {
            title: "Integrated Horizontal MORPHY™ Bed",
            image: `${SUPABASE_STORAGE_URL}/1K/160x200-IH-MORPHY_1.webp`,
            hoverImage: `${SUPABASE_STORAGE_URL}/1K/160x200-IH-MORPHY_1-m.webp`,
            href: "/products/beds/integrated-horizontal-wall-bed",
            price: "from £699",
          },
        ],
      },
      {
        id: "traditional",
        title: "Traditional Beds",
        titleKey: "nav.traditionalBeds",
        badge: "Classic Line",
        parent: {
          title: "All Traditional Beds",
          titleKey: "nav.allTraditionalBeds",
          image: `${SUPABASE_STORAGE_URL}/1K/160x200-CV-TRADITIONAL_1.webp`,
          hoverImage: `${SUPABASE_STORAGE_URL}/1K/160x200-CV-TRADITIONAL_2.webp`,
          href: "/products/beds?collection=traditional",
          tagline: "Explore classic wall bed models",
          taglineKey: "nav.allTraditionalTagline",
        },
        items: [
          {
            title: "Classic Vertical Wall Bed",
            image: `${SUPABASE_STORAGE_URL}/1K/160x200-CV-TRADITIONAL_1.webp`,
            hoverImage: `${SUPABASE_STORAGE_URL}/1K/160x200-CV-TRADITIONAL_2.webp`,
            href: "/products/beds/classic-vertical-traditional-bed",
            price: "from £399",
          },
          {
            title: "Classic Horizontal Wall Bed",
            image: `${SUPABASE_STORAGE_URL}/1K/160x200-CH-TRADITIONAL_1.webp`,
            hoverImage: `${SUPABASE_STORAGE_URL}/1K/160x200-CH-TRADITIONAL_2.webp`,
            href: "/products/beds/classic-horizontal-traditional-bed",
            price: "from £399",
          },
          {
            title: "Studio Vertical Wall Bed",
            image: `${SUPABASE_STORAGE_URL}/1K/150x200-SV-TRADITIONAL_1.webp`,
            hoverImage: `${SUPABASE_STORAGE_URL}/1K/150x200-SV-TRADITIONAL_2.webp`,
            href: "/products/beds/studio-vertical-traditional-bed",
            price: "from £499",
          },
          {
            title: "Studio Horizontal Wall Bed",
            image: `${SUPABASE_STORAGE_URL}/1K/150x200-SH-TRADITIONAL_1.webp`,
            hoverImage: `${SUPABASE_STORAGE_URL}/1K/150x200-SH-TRADITIONAL_2.webp`,
            href: "/products/beds/studio-horizontal-traditional-bed",
            price: "from £499",
          },
        ],
      },
    ],
    items: [
      {
        title: "Classic Vertical MORPHY™ Bed",
        image: `${SUPABASE_STORAGE_URL}/1K/160x200-CV-MORPHY_1.webp`,
        hoverImage: `${SUPABASE_STORAGE_URL}/1K/160x200-CV-MORPHY_1-m.webp`,
        href: "/products/beds/classic-vertical-wall-bed",
        price: "from £419",
      },
      {
        title: "Classic Horizontal MORPHY™ Bed",
        image: `${SUPABASE_STORAGE_URL}/1K/160x200-CH-MORPHY_1.webp`,
        hoverImage: `${SUPABASE_STORAGE_URL}/1K/160x200-CH-MORPHY_1-m.webp`,
        href: "/products/beds/classic-horizontal-wall-bed",
        price: "from £419",
      },
      {
        title: "Studio Vertical MORPHY™ Bed",
        image: `${SUPABASE_STORAGE_URL}/1K/160x200-SV-MORPHY_1.webp`,
        hoverImage: `${SUPABASE_STORAGE_URL}/1K/160x200-SV-MORPHY_1-m.webp`,
        href: "/products/beds/studio-vertical-wall-bed",
        price: "from £524",
      },
      {
        title: "Studio Horizontal MORPHY™ Bed",
        image: `${SUPABASE_STORAGE_URL}/1K/160x200-SH-MORPHY_1.webp`,
        hoverImage: `${SUPABASE_STORAGE_URL}/1K/160x200-SH-MORPHY_1-m.webp`,
        href: "/products/beds/studio-horizontal-wall-bed",
        price: "from £524",
      },
      {
        title: "Integrated Vertical MORPHY™ Bed",
        image: `${SUPABASE_STORAGE_URL}/1K/160x200-IV-MORPHY_1.webp`,
        hoverImage: `${SUPABASE_STORAGE_URL}/1K/160x200-IV-MORPHY_1-m.webp`,
        href: "/products/beds/integrated-vertical-wall-bed",
        price: "from £699",
      },
      {
        title: "Integrated Horizontal MORPHY™ Bed",
        image: `${SUPABASE_STORAGE_URL}/1K/160x200-IH-MORPHY_1.webp`,
        hoverImage: `${SUPABASE_STORAGE_URL}/1K/160x200-IH-MORPHY_1-m.webp`,
        href: "/products/beds/integrated-horizontal-wall-bed",
        price: "from £699",
      },
      {
        title: "Classic Vertical Wall Bed",
        image: `${SUPABASE_STORAGE_URL}/1K/160x200-CV-TRADITIONAL_1.webp`,
        hoverImage: `${SUPABASE_STORAGE_URL}/1K/160x200-CV-TRADITIONAL_2.webp`,
        href: "/products/beds/classic-vertical-traditional-bed",
        price: "from £399",
      },
      {
        title: "Classic Horizontal Wall Bed",
        image: `${SUPABASE_STORAGE_URL}/1K/160x200-CH-TRADITIONAL_1.webp`,
        hoverImage: `${SUPABASE_STORAGE_URL}/1K/160x200-CH-TRADITIONAL_2.webp`,
        href: "/products/beds/classic-horizontal-traditional-bed",
        price: "from £399",
      },
      {
        title: "Studio Vertical Wall Bed",
        image: `${SUPABASE_STORAGE_URL}/1K/150x200-SV-TRADITIONAL_1.webp`,
        hoverImage: `${SUPABASE_STORAGE_URL}/1K/150x200-SV-TRADITIONAL_2.webp`,
        href: "/products/beds/studio-vertical-traditional-bed",
        price: "from £499",
      },
      {
        title: "Studio Horizontal Wall Bed",
        image: `${SUPABASE_STORAGE_URL}/1K/150x200-SH-TRADITIONAL_1.webp`,
        hoverImage: `${SUPABASE_STORAGE_URL}/1K/150x200-SH-TRADITIONAL_2.webp`,
        href: "/products/beds/studio-horizontal-traditional-bed",
        price: "from £499",
      },
    ],
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
      title: "All Smart Tables",
      image: "/sofa1.webp",
      href: "/products/tables",
      tagline: "Space-saving folding & transforming designs",
    },
    items: [
      {
        title: "Transforming Coffee-to-Dining Table",
        image: "/sofa1.webp",
        href: "/products/tables/transforming-coffee-dining-table",
        type: "Transforming",
        badge: "Space Saver",
        sizeRange: "70x120 – 140x120 cm",
        price: "from £449",
      },
      {
        title: "Wall-Mounted Drop-Leaf Folding Table",
        image: "/sofa2.webp",
        href: "/products/tables/wall-mounted-folding-table",
        type: "Wall-Mounted",
        badge: "Compact Living",
        sizeRange: "80x60 cm folded to 10 cm",
        price: "from £299",
      },
      {
        title: "Extending Console-to-Dining Table",
        image: "/sofa1.webp",
        href: "/products/tables/extending-console-dining-table",
        type: "Extending",
        badge: "Extends to 10 seats",
        sizeRange: "45x90 – 200x90 cm",
        price: "from £599",
      },
      {
        title: "Compact Bed-Front Side Table",
        image: "/sofa2.webp",
        href: "/products/tables/bed-front-side-table",
        type: "Coffee & Side",
        badge: "Bed Compatible",
        sizeRange: "45x45x50 cm",
        price: "from £199",
      },
    ],
  },
  mattresses: {
    parent: {
      title: "All Mattresses",
      image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
      href: "/products/mattresses",
      tagline: "Engineered for foldaway beds",
    },
    items: [
      {
        title: "Comfort Pocket Sprung Mattress",
        image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
        href: "/products/mattresses/comfort-mattress",
        type: "Comfort",
        sizeRange: "90x190 – 150x200 cm",
        price: "from £399",
      },
      {
        title: "Luxury Orthopaedic Mattress",
        image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
        href: "/products/mattresses/luxury-mattress",
        type: "Luxury",
        sizeRange: "90x190 – 150x200 cm",
        price: "from £499",
      },
      {
        title: "Supreme Hybrid Mattress",
        image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
        href: "/products/mattresses/supreme-mattress",
        type: "Supreme",
        sizeRange: "90x190 – 150x200 cm",
        price: "from £599",
      },
    ],
  },
  cabinets: {
    parent: {
      title: "All Cabinets",
      image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
      href: "/products/cabinets",
      tagline: "Tailored modular cabinetry",
    },
    items: [
      {
        title: "Vertical Enclosure Cabinet",
        image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
        href: "/products/cabinets/vertical-wall-bed-cabinet",
        badge: "Vertical Beds",
        price: "from £649",
      },
      {
        title: "Horizontal Enclosure Cabinet",
        image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
        href: "/products/cabinets/horizontal-wall-bed-cabinet",
        badge: "Horizontal Beds",
        price: "from £829",
      },
      {
        title: "Side Storage & Wardrobe Unit",
        image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
        href: "/products/cabinets/side-storage-wardrobe-cabinet",
        badge: "Side Storage",
        price: "from £459",
      },
      {
        title: "Overhead Bridge Extension",
        image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
        href: "/products/cabinets/overhead-storage-extension-cabinet",
        badge: "Top Bridge",
        price: "from £499",
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
