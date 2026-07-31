"use client";

import Link from "next/link";

export function CategoryGrid() {
  const categories = [
    // Top Row (col-span-3)
    {
      title: "Classic beds",
      link: "/products/classic-beds",
      gridClass:
        "col-span-6 md:col-span-3 border-b md:border-r border-wbk-lightgrey/40",
    },
    {
      title: "Studio Beds",
      link: "/products/studio-beds",
      gridClass: "col-span-6 md:col-span-3 border-b border-wbk-lightgrey/40",
    },
    // Bottom Row (col-span-2)
    {
      title: "Sofas",
      link: "/products/sofas",
      gridClass:
        "col-span-6 md:col-span-2 border-b md:border-b-0 md:border-r border-wbk-lightgrey/40",
    },
    {
      title: "Integrated Beds",
      link: "/products/integrated-beds",
      gridClass:
        "col-span-6 md:col-span-2 border-b md:border-b-0 md:border-r border-wbk-lightgrey/40",
    },
    {
      title: "Other extras",
      link: "/products/extras",
      gridClass: "col-span-6 md:col-span-2",
    },
  ];

  return (
    <section className="w-full bg-wbk-white">
      <div className="grid grid-cols-6 gap-1 w-full">
        {categories.map((cat, idx) => (
          <Link
            key={idx}
            href={cat.link}
            className={`group relative block w-full overflow-hidden h-[340px] md:h-[420px] bg-[#F4F2F0] ${cat.gridClass}`}
          >
            {/* Background Image */}
            <img
              src="/category-images/integrated-beds.webp"
              alt={cat.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Subtle warm brown gradient starting from top-left */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#F4F2F0]/75 to-transparent z-10 pointer-events-none" />

            {/* Text Overlay */}
            <div className="relative z-20 h-full w-full p-10 md:p-12 flex flex-col justify-start items-start">
              <h3 className="font-new-york text-3xl md:text-4xl text-wbk-black leading-tight tracking-wide transition-colors duration-300">
                {cat.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
