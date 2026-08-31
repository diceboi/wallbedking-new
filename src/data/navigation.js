// Navigation data mapping for WallBedKing

export const MAIN_NAV_ITEMS = [
  {
    id: "beds",
    title: "Murphy Beds",
    slug: "beds",
    href: "/products/beds",
    hasSubmenu: true,
  },
  {
    id: "sofas",
    title: "Sofas",
    slug: "sofas",
    href: "/products/sofas",
    hasSubmenu: true,
  },
  {
    id: "mattresses",
    title: "Mattresses",
    slug: "mattresses",
    href: "/products/mattresses",
    hasSubmenu: true,
  },
  {
    id: "cabinets",
    title: "Cabinets",
    slug: "cabinets",
    href: "/products/cabinets",
    hasSubmenu: true,
  },
  {
    id: "extras",
    title: "Extras",
    slug: "extras",
    href: "/products/extras",
    hasSubmenu: true,
  },
  {
    id: "support",
    title: "Support",
    slug: "support",
    href: "/support/faq",
    hasSubmenu: true,
  },
  {
    id: "about",
    title: "About Us",
    slug: "about",
    href: "/about",
    hasSubmenu: false,
  },
  {
    id: "contact",
    title: "Contact",
    slug: "contact",
    href: "/contact",
    hasSubmenu: false,
  },
];

export const SUBMENU_DATA = {
  beds: {
    parent: {
      title: "All Murphy Beds",
      image: "/product-images/morphy-integrated/160x200.jpg",
      href: "/products/beds",
      tagline: "Explore complete collection",
    },
    items: [
      {
        title: "Classic MORPHY™ Bed",
        image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
        href: "/products/beds/single-vertical-classic-morphy-bed-90x190",
        badge: "Most Popular",
      },
      {
        title: "Studio MORPHY™ Bed",
        image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
        href: "/products/beds/single-vertical-studio-morphy-bed-90x190",
        badge: "With Desk",
      },
      {
        title: "Integrated MORPHY™ Bed",
        image: "/product-images/morphy-integrated/160x200.jpg",
        href: "/products/beds/integrated-bed",
        badge: "3D Configurator",
      },
      {
        title: "Classic Wall Bed",
        image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
        href: "/products/beds/single-vertical-classic-bed-90x190",
        badge: "Core Mechanism",
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
        title: "Bed Front Sofa Modules",
        image: "/sofa1.webp",
        href: "/products/sofas/sofa-1000-bed-front-100-8x86-7",
        badge: "Space Saving",
      },
      {
        title: "Free Standing Sofa Units",
        image: "/sofa2.webp",
        href: "/products/sofas/sofa-1000-free-standing-107-2x83-4",
        badge: "Independent",
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
        title: "Comfort Mattress Range",
        image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
        href: "/products/mattresses/single-comfort-mattress-90x190",
        badge: "Essential",
      },
      {
        title: "Luxury Mattress Range",
        image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
        href: "/products/mattresses/single-luxury-mattress-90x190",
        badge: "Enhanced",
      },
      {
        title: "Supreme Mattress Range",
        image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
        href: "/products/mattresses/single-supreme-mattress-90x190",
        badge: "Premium Orthopedic",
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
        title: "Vertical Enclosures",
        image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
        href: "/products/cabinets?type=Vertical",
        badge: "Vertical Beds",
      },
      {
        title: "Horizontal Enclosures",
        image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
        href: "/products/cabinets?type=Horizontal",
        badge: "Horizontal Beds",
      },
      {
        title: "Wardrobes & Extensions",
        image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
        href: "/products/cabinets?type=Extensions",
        badge: "Storage Units",
      },
    ],
  },
  extras: {
    parent: {
      title: "All Extras",
      image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
      href: "/products/extras",
      tagline: "Hardware, kits & illumination",
    },
    items: [
      {
        title: "Lighting Systems",
        image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
        href: "/products/extras?type=Lighting",
        badge: "Integrated LEDs",
      },
      {
        title: "Hardware & Piston Kits",
        image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
        href: "/products/extras?type=Hardware",
        badge: "German Gas Struts",
      },
    ],
  },
  support: {
    parent: {
      title: "Support Hub",
      image: "/product-images/morphy-integrated/160x200.jpg",
      href: "/support/faq",
      tagline: "Guides, videos & assistance",
    },
    items: [
      {
        title: "Installation Guides",
        image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
        href: "/support/installation-guides",
        badge: "Step-by-step PDF",
      },
      {
        title: "Installation Videos",
        image: "/product-images/morphy-integrated/160x200.jpg",
        href: "/support/installation-videos",
        badge: "Video walkthroughs",
      },
      {
        title: "Frequently Asked Questions",
        image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
        href: "/support/faq",
        badge: "Answers & Tech specs",
      },
      {
        title: "Delivery & Logistics",
        image: "/sofa1.webp",
        href: "/support/delivery",
        badge: "UK & European shipping",
      },
    ],
  },
};
