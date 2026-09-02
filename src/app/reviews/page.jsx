"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import {
  IconStarFilled,
  IconCheck,
  IconShieldCheck,
  IconFilter,
  IconBuildingWarehouse,
} from "@tabler/icons-react";

const REVIEWS_DATA = [
  {
    id: 1,
    author: "David Goode",
    source: "Google Reviews",
    rating: 5,
    date: "Verified Customer",
    model: "Classic Double Bed",
    review:
      "We have bought both a double and single wall bed. Both orders were handled efficiently and with courtesy at all times. The products are of good quality and easy to assemble. I’d be happy to recommend this company to anyone.",
  },
  {
    id: 2,
    author: "Alison Pritchard",
    source: "Google Reviews",
    rating: 5,
    date: "Verified Customer",
    model: "Studio Double & Luxury Mattress",
    review:
      "One of the best choices I've made. Bought a double studio style bed with the luxury mattress and it is wonderful. All visitors have said how secure and comfortable the bed feels. It was all delivered exactly as promised. Couldn't be happier.",
  },
  {
    id: 3,
    author: "Liliana Devesa",
    source: "Google Reviews",
    rating: 5,
    date: "Verified Customer",
    model: "Vertical Double Wall Bed",
    review:
      "We bought a vertical double wallbed that has proved to be a fantastic addition to our converted garage. It takes mere seconds to open and fold away, completely opening up the room during daytime.",
  },
  {
    id: 4,
    author: "Alexander Alexander",
    source: "Google Reviews",
    rating: 5,
    date: "Verified Customer",
    model: "Classic King Size",
    review:
      "Very happy with the Wall Bed King experience. Ordering was straightforward. Communication kept me updated with the delivery. Delivery itself went as planned. Product straightforward to put together and very robust.",
  },
  {
    id: 5,
    author: "Roz M",
    source: "Google Reviews",
    rating: 5,
    date: "Verified Customer",
    model: "Studio Wall Bed",
    review:
      "I am really pleased with the quality of the Wall Bed and also found everyone I dealt with extremely helpful both before and after my purchase. Top notch customer service.",
  },
  {
    id: 6,
    author: "Lynn Wilde",
    source: "Google Reviews",
    rating: 5,
    date: "Verified Customer",
    model: "Studio Bed Pair",
    review:
      "Great space saving product. I bought two of these and as a result have two really versatile rooms. When up against the wall, the footprint is minimal. Overall a great purchase!",
  },
  {
    id: 7,
    author: "Alan Hudson",
    source: "Google Reviews",
    rating: 5,
    date: "Verified Customer",
    model: "Classic Wall Bed & Cabinet",
    review:
      "Great bed. Easy to install and very easy to use. Well organised delivery and good communicative staff. Very pleased we bought our bed from Wall Bed King. A great solution for our sitting room.",
  },
  {
    id: 8,
    author: "Jim Kerr",
    source: "Google Reviews",
    rating: 5,
    date: "Verified Customer",
    model: "Classic Vertical Mechanism",
    review:
      "We have bought 2 beds recently and are very pleased with them. They are easy to assemble and are very robust. The company have given us excellent service which has made for a very smooth transaction.",
  },
  {
    id: 9,
    author: "Aaron Clark",
    source: "Google Reviews",
    rating: 5,
    date: "Verified Customer",
    model: "Studio Horizontal Wall Bed",
    review:
      "Had a great experience with this company. It seems an absolute bargain and if you're lacking space in your bedroom this is definitely the route you need to go down. Cannot recommend this company enough.",
  },
  {
    id: 10,
    author: "Kévin Tanguy",
    source: "Google Reviews",
    rating: 5,
    date: "Verified Customer",
    model: "Integrated Vertical Bed",
    review:
      "Excellent support from the customer service team. Prices are competitive, quality materials and fast shipping times. The mechanism is completely counterbalanced.",
  },
  {
    id: 11,
    author: "Margaret Mansfield",
    source: "Google Reviews",
    rating: 5,
    date: "Verified Customer",
    model: "Classic Single Wall Bed",
    review:
      "The bed mechanism is very easy to operate, and takes only seconds. The bed is concealed in the built-in cupboard during the day so we can still use our dining room without anyone needing to know that it is there.",
  },
  {
    id: 12,
    author: "Evan Ewart",
    source: "Google Reviews",
    rating: 5,
    date: "Verified Customer",
    model: "Classic Double Frame",
    review:
      "I am over the moon with my bed. It took a bit of working out to assemble the bed but once the mattress was on it was fantastic. The gas pistons make it feather-light.",
  },
];

export default function ReviewsPage() {
  const [selectedFilter, setSelectedFilter] = useState("All");

  const filteredReviews = useMemo(() => {
    if (selectedFilter === "All") return REVIEWS_DATA;
    return REVIEWS_DATA.filter((r) => r.model.toLowerCase().includes(selectedFilter.toLowerCase()));
  }, [selectedFilter]);

  return (
    <div className="bg-wbk-white min-h-screen pt-12 pb-24 font-poppins">
      {/* Header */}
      <section className="border-b border-wbk-lightgrey/60 bg-[#FBF9F8] py-16 sm:py-20">
        <Container size="xl">
          <div className="max-w-3xl">
            <nav className="flex items-center gap-1.5 text-[11px] text-wbk-brown/80 mb-4">
              <Link href="/" className="hover:text-wbk-black transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-wbk-black font-medium">Customer Reviews</span>
            </nav>

            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-wbk-gold mb-3">
              Independent Verified Feedback
            </span>
            <h1 className="font-new-york text-4xl sm:text-5xl md:text-6xl text-wbk-black tracking-tight leading-tight">
              Loved by thousands of homeowners
            </h1>
            <p className="mt-4 text-sm sm:text-base text-wbk-brown leading-relaxed font-light">
              See what genuine customers say about our space-saving Murphy beds,
              build quality, and customer support across the UK.
            </p>

            {/* Aggregate Trust Badge */}
            <div className="mt-8 flex flex-wrap items-center gap-6 p-4 bg-white rounded-2xl border border-wbk-lightgrey max-w-lg shadow-xs">
              <div className="flex items-center gap-1 text-wbk-gold">
                {[...Array(5)].map((_, i) => (
                  <IconStarFilled key={i} size={20} />
                ))}
              </div>
              <div className="text-xs">
                <span className="font-bold text-wbk-black text-sm">4.9 out of 5</span>
                <span className="text-wbk-brown ml-1.5">• Based on Google & Verified Customer Reviews</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Filter Tabs */}
      <Container size="xl" className="pt-12">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-wbk-lightgrey/60">
          <div className="flex items-center gap-2">
            {["All", "Classic", "Studio", "Mattress"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedFilter(tab)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  selectedFilter === tab
                    ? "bg-wbk-black text-white shadow-xs"
                    : "bg-[#FBF9F8] text-wbk-black hover:bg-[#F4F2F0] border border-wbk-lightgrey/60"
                }`}
              >
                {tab === "All" ? "All Reviews" : `${tab} Range`}
              </button>
            ))}
          </div>
          <span className="text-xs text-wbk-brown">
            Showing {filteredReviews.length} reviews
          </span>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {filteredReviews.map((item) => (
            <div
              key={item.id}
              className="bg-white p-7 rounded-3xl border border-wbk-lightgrey/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-wbk-gold">
                    {[...Array(item.rating)].map((_, i) => (
                      <IconStarFilled key={i} size={14} />
                    ))}
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-wbk-brown bg-[#FBF9F8] px-2.5 py-1 rounded-full border border-wbk-lightgrey/60">
                    {item.source}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-wbk-black leading-relaxed mb-6 font-normal">
                  &ldquo;{item.review}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-wbk-lightgrey/50 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-xs text-wbk-black">{item.author}</h4>
                  <p className="text-[11px] text-wbk-brown">{item.model}</p>
                </div>
                <span className="text-[10px] text-wbk-green font-medium flex items-center gap-1">
                  <IconShieldCheck size={13} />
                  <span>Verified</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
