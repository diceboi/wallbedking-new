// Central Product & Category Catalog for WallBedKing

export const GLOBAL_GALLERY_TEMPLATES = [
  { src: "/product-images/morphy-integrated/160x200.jpg", alt: "MORPHY Bed Integrated 160x200 - Main view" },
  { src: "/product-images/morphy-integrated/160x200-2.jpg", alt: "MORPHY Bed Integrated 160x200 - Angle view" },
  { src: "/product-images/morphy-integrated/160x200-3.jpg", alt: "MORPHY Bed Integrated 160x200 - Open view" },
  { src: "/product-images/morphy-integrated/160x200-4.jpg", alt: "MORPHY Bed Integrated 160x200 - Frame detail" },
  { src: "/product-images/morphy-integrated/160x200-5.jpg", alt: "MORPHY Bed Integrated 160x200 - Side perspective" },
  { src: "/product-images/morphy-integrated/160x200-6.jpg", alt: "MORPHY Bed Integrated 160x200 - Mechanism detail" },
  { src: "/product-images/morphy-integrated/160x200-7.jpg", alt: "MORPHY Bed Integrated 160x200 - Headboard view" },
  { src: "/product-images/morphy-integrated/160x200-8.jpg", alt: "MORPHY Bed Integrated 160x200 - Room setting" },
  { src: "/product-images/morphy-integrated/160x200-9.jpg", alt: "MORPHY Bed Integrated 160x200 - Closed position" },
  { src: "/product-images/morphy-integrated/160x200-10.jpg", alt: "MORPHY Bed Integrated 160x200 - Lifestyle view" },
  { src: "/product-images/morphy-integrated/160x200-11.jpg", alt: "MORPHY Bed Integrated 160x200 - Compact view" },
  { src: "/product-images/morphy-integrated/160x200-12.jpg", alt: "MORPHY Bed Integrated 160x200 - Full setup" },
];

export const CATEGORIES_INFO = {
  beds: { label: "Murphy Beds", title: "Murphy Beds", slug: "beds" },
  sofas: { label: "Sofas", title: "Sofas & Wall Beds", slug: "sofas" },
  mattresses: { label: "Mattresses", title: "Mattresses", slug: "mattresses" },
  cabinets: { label: "Cabinets", title: "Cabinets & Storage", slug: "cabinets" },
  extras: { label: "Extras", title: "Extras & Accessories", slug: "extras" },
};

export const OTHER_CATEGORIES_LIST = [
  { slug: "beds", label: "Murphy Beds", image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp" },
  { slug: "sofas", label: "Sofas", image: "/sofa1.webp" },
  { slug: "mattresses", label: "Mattresses", image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp" },
  { slug: "cabinets", label: "Cabinets", image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp" },
  { slug: "extras", label: "Extras", image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp" },
];

export const ALL_PRODUCTS = {
  beds: [
    {
      id: "wallbed-1",
      slug: "integrated-bed",
      title: "Integrated MORPHY™ Bed",
      orientation: "Vertical",
      size: "King",
      colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"],
      price: "£799",
      numericPrice: 799,
      image: "/product-images/morphy-integrated/160x200.jpg",
      hoverImage: "/product-images/morphy-integrated/160x200-3.jpg",
      sale: "Sale",
    },
    {
      id: "wallbed-2",
      slug: "bed-with-sofa",
      title: "Bed with sofa",
      orientation: "Vertical",
      size: "King",
      colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"],
      price: "£799",
      numericPrice: 799,
      image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
      hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    },
    {
      id: "wallbed-3",
      slug: "classic-wall-bed",
      title: "Classic Wall Bed",
      orientation: "Horizontal",
      size: "Double",
      colors: ["#A5988E", "#E4E0DE", "#090A0A"],
      price: "£699",
      numericPrice: 699,
      image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
      hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    },
    {
      id: "wallbed-4",
      slug: "studio-bed",
      title: "Studio Murphy Bed",
      orientation: "Vertical",
      size: "Single",
      colors: ["#A5988E", "#D2AA7C", "#E4E0DE"],
      price: "£599",
      numericPrice: 599,
      image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
      hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    },
    {
      id: "wallbed-5",
      slug: "premium-bed",
      title: "Premium Wall Bed",
      orientation: "Vertical",
      size: "Double",
      colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"],
      price: "£699",
      numericPrice: 699,
      image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
      hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    },
    {
      id: "wallbed-6",
      slug: "luxury-murphy-bed",
      title: "Luxury Murphy Bed",
      orientation: "Vertical",
      size: "Super King",
      colors: ["#A5988E", "#090A0A"],
      price: "£899",
      numericPrice: 899,
      image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
      hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    },
  ],
  sofas: [
    {
      id: "sofa-1",
      slug: "bed-with-sofa",
      title: "MORPHY™ Bed with Sofa",
      orientation: "Vertical",
      size: "King",
      colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"],
      price: "£799",
      numericPrice: 799,
      image: "/sofa1.webp",
      hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    },
    {
      id: "sofa-2",
      slug: "studio-sofa-wallbed",
      title: "Studio Sofa Wallbed",
      orientation: "Vertical",
      size: "Double",
      colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"],
      price: "£849",
      numericPrice: 849,
      image: "/sofa2.webp",
      hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    },
    {
      id: "sofa-3",
      slug: "classic-sofa-bed",
      title: "Classic Sofa Bed",
      orientation: "Horizontal",
      size: "Double",
      colors: ["#A5988E", "#E4E0DE", "#090A0A"],
      price: "£749",
      numericPrice: 749,
      image: "/sofa3.webp",
      hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    },
    {
      id: "sofa-4",
      slug: "modular-sofa-bed",
      title: "Modular Sofa Bed",
      orientation: "Vertical",
      size: "Super King",
      colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"],
      price: "£899",
      numericPrice: 899,
      image: "/sofa1.webp",
      hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    },
    {
      id: "sofa-5",
      slug: "deluxe-sofa-wallbed",
      title: "Deluxe Sofa Wallbed",
      orientation: "Vertical",
      size: "King",
      colors: ["#A5988E", "#D2AA7C", "#E4E0DE", "#090A0A"],
      price: "£949",
      numericPrice: 949,
      image: "/sofa2.webp",
      hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    },
  ],
  mattresses: [
    {
      id: "mattress-1",
      slug: "orthopedic-spring-mattress",
      title: "Orthopedic Spring Mattress",
      orientation: "Vertical",
      size: "King",
      colors: ["#E4E0DE"],
      price: "£299",
      numericPrice: 299,
      image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
      hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    },
    {
      id: "mattress-2",
      slug: "memory-foam-mattress",
      title: "Memory Foam Mattress",
      orientation: "Vertical",
      size: "Double",
      colors: ["#E4E0DE"],
      price: "£349",
      numericPrice: 349,
      image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
      hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    },
  ],
  cabinets: [
    {
      id: "cabinet-1",
      slug: "side-storage-cabinet",
      title: "Side Storage Cabinet",
      orientation: "Vertical",
      size: "Single",
      colors: ["#A5988E", "#E4E0DE", "#090A0A"],
      price: "£199",
      numericPrice: 199,
      image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
      hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    },
  ],
  extras: [
    {
      id: "extras-1",
      slug: "led-lighting-kit",
      title: "LED Lighting Kit",
      orientation: "Universal",
      size: "One Size",
      colors: ["#090A0A"],
      price: "£89",
      numericPrice: 89,
      image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
      hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    },
  ],
};

// Helper to look up a product by category and product slug
export const findProductBySlug = (categorySlug, productSlug) => {
  if (categorySlug && ALL_PRODUCTS[categorySlug]) {
    const match = ALL_PRODUCTS[categorySlug].find(
      (p) => p.slug === productSlug || p.id === productSlug
    );
    if (match) return { ...match, categoryKey: categorySlug };
  }

  // Fallback search across all categories
  for (const cat of Object.keys(ALL_PRODUCTS)) {
    const match = ALL_PRODUCTS[cat].find(
      (p) => p.slug === productSlug || p.id === productSlug
    );
    if (match) return { ...match, categoryKey: cat };
  }

  return null;
};

// Fallback generator for unknown product slugs
export const getFallbackProduct = (categorySlug, productSlug) => {
  const cleanSlug = productSlug || "integrated-bed";
  const title = cleanSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const isSofa = cleanSlug.toLowerCase().includes("sofa") || (categorySlug && categorySlug.toLowerCase().includes("sofa"));

  return {
    id: cleanSlug,
    slug: cleanSlug,
    title: title,
    price: "£799",
    numericPrice: 799,
    image: isSofa ? "/sofa1.webp" : "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
    hoverImage: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-2-mattress.webp",
    orientation: "Vertical",
    size: "King",
    categoryKey: categorySlug || "beds",
  };
};
