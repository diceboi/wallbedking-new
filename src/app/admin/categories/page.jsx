"use client";

import Link from "next/link";
import {
  IconFolder,
  IconExternalLink,
  IconArrowRight,
} from "@tabler/icons-react";
import { CATEGORY_SLUGS } from "@/data/slugs";

const CATEGORY_DATA = [
  {
    id: "beds",
    title: "Murphy Beds (Wall Beds)",
    description: "Premium vertical and horizontal wall beds with gas piston counterbalancing mechanism and integrated slatted bed frame.",
    count: 114,
    subcategories: [
      "Classic Vertical (19 sizes)",
      "Classic Horizontal (19 sizes)",
      "Studio Vertical Desk Bed (19 sizes)",
      "Studio Horizontal Desk Bed (19 sizes)",
      "Integrated Front Bed (38 models)",
    ],
  },
  {
    id: "sofas",
    title: "Sofas & Modular Fronts",
    description: "Modular sofas, chaise lounges, and ottomans engineered specifically to fit seamlessly in front of WallBedKing murphy beds.",
    count: 42,
    subcategories: [
      "Modular 2-Seater Sofa",
      "Modular 3-Seater Sofa",
      "L-Shape Chaise Lounge Extension",
      "Storage Ottoman Footstool",
    ],
  },
  {
    id: "mattresses",
    title: "Mattresses",
    description: "Rigorously tested, max. 30 cm depth orthopaedic memory foam and pocket sprung mattresses crafted for vertical storage.",
    count: 36,
    subcategories: [
      "Orthopaedic Memory Foam (Single, Double, King, Super King)",
      "Pocket Spring Hybrid Comfort",
      "Hypoallergenic Slim Mattress",
    ],
  },
  {
    id: "cabinets",
    title: "Cabinets & Bookcases",
    description: "Matching modular wardrobes, shelving systems, and overhead bridge storage designed to complement wall bed finishes.",
    count: 24,
    subcategories: [
      "Single Wardrobe with Hanging Rail",
      "Bookcase Shelf Unit with Soft-Close Doors",
      "Overhead Bridge Storage",
    ],
  },
  {
    id: "extras",
    title: "Extras & Accessories",
    description: "Integrated dual LED reading lights, recessed USB-C fast charging stations, headboards, and mattress retaining straps.",
    count: 18,
    subcategories: [
      "Integrated Dual LED Reading Lights",
      "Recessed USB-C Fast Charger Ports",
      "Upholstered Padded Headboard",
    ],
  },
];

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6 font-poppins">
      <div>
        <h2 className="font-new-york text-2xl font-medium text-wbk-black">
          Categories & Hierarchy
        </h2>
        <p className="text-xs text-wbk-brown">
          Core WallBedKing product families, subcategories, and localized SEO URL slug definitions
        </p>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {CATEGORY_DATA.map((cat) => {
          const deSlug = CATEGORY_SLUGS[cat.id]?.de || cat.id;
          const frSlug = CATEGORY_SLUGS[cat.id]?.fr || cat.id;
          const esSlug = CATEGORY_SLUGS[cat.id]?.es || cat.id;

          return (
            <div
              key={cat.id}
              className="bg-white p-6 border border-wbk-lightgrey/60 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#F4F2F0] text-wbk-black rounded-full">
                      <IconFolder size={18} />
                    </div>
                    <div>
                      <h3 className="font-new-york text-base font-semibold text-wbk-black">
                        {cat.title}
                      </h3>
                      <span className="text-[11px] font-mono text-wbk-brown">
                        parent_category: <code className="text-wbk-black font-bold">{cat.id}</code>
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-wbk-gold text-wbk-black shrink-0">
                    {cat.count} products
                  </span>
                </div>

                <p className="text-xs text-wbk-brown mt-3 leading-relaxed">
                  {cat.description}
                </p>

                {/* Subcategories list */}
                <div className="mt-4 pt-3 border-t border-wbk-lightgrey/40 space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-wbk-brown block">
                    Available Models & Subcategories:
                  </span>
                  <ul className="space-y-1">
                    {cat.subcategories.map((sub, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-wbk-black flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-wbk-gold" />
                        <span>{sub}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Localized slugs pills */}
                <div className="mt-4 pt-3 border-t border-wbk-lightgrey/40 space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-wbk-brown block">
                    Localized URL Slugs:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono text-wbk-brown">
                    <span className="px-2 py-0.5 bg-[#F4F2F0] text-wbk-black">
                      EN/US: /{cat.id}
                    </span>
                    <span className="px-2 py-0.5 bg-[#F4F2F0] text-wbk-black">
                      DE: /{deSlug}
                    </span>
                    <span className="px-2 py-0.5 bg-[#F4F2F0] text-wbk-black">
                      FR: /{frSlug}
                    </span>
                    <span className="px-2 py-0.5 bg-[#F4F2F0] text-wbk-black">
                      ES: /{esSlug}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-wbk-lightgrey/40 flex items-center justify-between">
                <Link
                  href={`/admin/products?category=${cat.id}`}
                  className="text-xs font-semibold uppercase tracking-wider text-wbk-black hover:text-wbk-gold transition-colors flex items-center gap-1"
                >
                  <span>Filter Products</span>
                  <IconArrowRight size={14} />
                </Link>

                <Link
                  href={`/products/${cat.id}`}
                  target="_blank"
                  className="p-1.5 text-wbk-brown hover:text-wbk-black transition-colors"
                  title="View category on storefront"
                >
                  <IconExternalLink size={16} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
