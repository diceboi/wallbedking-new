"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/Container";
import {
  IconSearch,
  IconChevronDown,
  IconHelpCircle,
  IconCreditCard,
  IconTruck,
  IconBed,
  IconTools,
  IconShieldCheck,
  IconSparkles,
  IconPhoneCall,
  IconMail,
} from "@tabler/icons-react";

const FAQ_CATEGORIES = [
  { id: "all", label: "All Questions", icon: IconHelpCircle },
  { id: "payments", label: "Payments & Refunds", icon: IconCreditCard },
  { id: "deliveries", label: "Deliveries & Shipping", icon: IconTruck },
  { id: "mattresses", label: "Mattresses", icon: IconBed },
  { id: "installation", label: "Installation & Assembly", icon: IconTools },
  { id: "usage", label: "Everyday Usage", icon: IconSparkles },
  { id: "warranty", label: "Warranty & Guarantee", icon: IconShieldCheck },
];

const FAQ_ITEMS = [
  // Payments
  {
    category: "payments",
    question: "What payment methods do you accept?",
    answer:
      "Wall Bed King accepts all major credit and debit cards (Visa, MasterCard, Maestro, American Express) as well as PayPal and PayPal Credit. All transactions are processed using high-grade SSL encryption through trusted online payment gateways for maximum security.",
  },
  {
    category: "payments",
    question: "What is your refund and return policy?",
    answer:
      "All our wall beds are backed by a no-quibble 30-day money back guarantee. If for any reason you wish to return your items within 30 days of receipt, we will issue a refund of the purchase price once the goods are returned to our warehouse. Please note that return delivery charges are not refundable and items should be in good, resalable condition. Missing original packaging is not a problem.",
  },
  {
    category: "payments",
    question: "Can I pay over the telephone or upon collection?",
    answer:
      "Yes! If you prefer not to order online, our customer service specialists can take your order and payment directly over the telephone during business hours. Alternatively, if you choose Click & Collect from our Harlow warehouse, you can pay in advance or inspect upon arrival.",
  },
  {
    category: "payments",
    question: "How secure are my personal details?",
    answer:
      "Online security is our utmost priority. Our store utilizes 256-bit SSL encryption to guarantee that all personal and payment information is completely protected. We never store credit card numbers on our servers.",
  },

  // Deliveries
  {
    category: "deliveries",
    question: "What shipping options are available and how long does delivery take?",
    answer:
      "We offer three delivery options for mainland UK:\n• Economy (Free): 2 to 4 weeks delivery time.\n• Standard (£49): 1 to 2 weeks delivery time.\n• Express (£79): 2 to 5 working days (subject to in-stock availability).\nWe also offer Click & Collect free of charge directly from our Harlow, Essex warehouse (CM20 2HU).",
  },
  {
    category: "deliveries",
    question: "Do you deliver outside of the United Kingdom?",
    answer:
      "Yes! We regularly deliver across the European Union and internationally. Because international freight depends on dimensions and destination postal code, please contact our support team before placing your order so we can calculate and confirm your tailored shipping rate.",
  },
  {
    category: "deliveries",
    question: "How will my wall bed be packaged?",
    answer:
      "Wall Bed King frames are flat-packed into heavy-duty reinforced corrugated cartons with internal protective padding. This ensures compact transport that easily fits through standard doorways, elevators, and narrow stairwells.",
  },

  // Mattresses
  {
    category: "mattresses",
    question: "Can I use my existing standard mattress on a Wall Bed King?",
    answer:
      "Yes! All our bed frames are engineered to standard UK and European mattress sizes (Small Single, Single, Small Double, Double, King, and Super King). You can use any standard coil, pocket sprung, or memory foam mattress up to 30cm (12 inches) thick. Alternatively, you can pair your frame with our specially weighted Comfort, Luxury, or Supreme wall bed mattresses.",
  },
  {
    category: "mattresses",
    question: "Do wall bed frames come with a mattress included?",
    answer:
      "Our bed frame kits include the complete structural mechanism, sprung birch slats, and hardware, but mattresses are sold separately. This allows you to either reuse your current mattress or select from our Comfort, Luxury, and Supreme models designed specifically for vertical and horizontal fold-away operation.",
  },

  // Installation
  {
    category: "installation",
    question: "Does my bed need to be fixed to a wall, the floor, or both?",
    answer:
      "Unlike many older Murphy bed systems that strictly require masonry walls, Wall Bed King’s versatile mounting brackets allow you to fix the mechanism to a solid wall, to the floor, or to both. If you have stud walls (plasterboard), you can easily attach the brackets into timber/metal studs or anchor the frame directly into the subfloor.",
  },
  {
    category: "installation",
    question: "How difficult is it to assemble and install the bed?",
    answer:
      "Our mechanism is designed for DIY assembly with clear, step-by-step illustrated manuals and video tutorials. On average, two people can assemble and mount the entire bed frame in about 1 to 2 hours using standard household tools (screwdriver, wrench/spanner, drill, and spirit level).",
  },
  {
    category: "installation",
    question: "Can I remove or relocate the bed if I move home?",
    answer:
      "Absolutely. The entire system can be unbolted and disassembled without damaging your room. Many of our customers take their Wall Bed King with them when moving house or relocate it between bedrooms as their family's needs evolve.",
  },

  // Everyday Usage
  {
    category: "usage",
    question: "Are Wall Bed King beds designed for everyday, permanent use?",
    answer:
      "Yes, 100%! Unlike temporary sofa beds or folding cots with thin wire springs, our wall beds feature heavy-gauge cold-rolled steel construction and individually cushioned sprung birch slats. When paired with a quality mattress, they provide the exact same orthopedic comfort and spinal support as a luxury fixed bed.",
  },
  {
    category: "usage",
    question: "Can I leave sheets, blankets, and pillows on the bed when folding it away?",
    answer:
      "Yes! Our mechanism includes dedicated quick-release mattress retaining straps. You can leave your fitted sheet, duvet, and pillows neatly made up on the mattress, buckle the strap across, and fold the bed away in seconds.",
  },
  {
    category: "usage",
    question: "How easy is it to raise and lower the bed?",
    answer:
      "Thanks to our high-precision German-engineered gas piston cylinders, the bed frame is virtually weightless during operation. Lowering or lifting takes less than 5 seconds and can be done effortlessly with just one hand.",
  },

  // Warranty
  {
    category: "warranty",
    question: "What warranty do you offer on your wall beds?",
    answer:
      "We provide an industry-leading Lifetime Mechanism Warranty on all Wall Bed King steel frames and gas piston systems. While competitors typically offer 1 to 5 years, we stand behind our European engineering with complete confidence.",
  },
  {
    category: "warranty",
    question: "Do you manufacture these beds or are you a reseller?",
    answer:
      "Wall Bed King is a direct European manufacturer. We design, precision-engineer, and produce all our mechanisms in our own facilities. There are no middlemen or external distributors, which allows us to offer industrial-grade quality at direct factory prices.",
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState(0);

  const filteredFAQs = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="bg-wbk-white min-h-screen pt-12 pb-24">
      {/* Top Breadcrumb & Hero Header */}
      <section className="border-b border-wbk-lightgrey/60 bg-[#FBF9F8] py-14 sm:py-20">
        <Container size="xl">
          <div className="max-w-3xl">
            <nav className="flex items-center gap-1.5 text-[11px] font-poppins text-wbk-brown/80 mb-4">
              <Link href="/" className="hover:text-wbk-black transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-wbk-brown/80">Support</span>
              <span>/</span>
              <span className="text-wbk-black font-medium">FAQ</span>
            </nav>

            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-wbk-gold mb-3">
              Help Center & Answers
            </span>
            <h1 className="font-new-york text-4xl sm:text-5xl md:text-6xl text-wbk-black tracking-tight leading-tight">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 text-sm sm:text-base text-wbk-brown font-poppins leading-relaxed">
              Find quick, comprehensive answers regarding our space-saving Murphy
              beds, installation requirements, delivery timelines, and lifetime warranty.
            </p>

            {/* Instant search inside FAQ */}
            <div className="relative mt-8 max-w-xl">
              <IconSearch
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-wbk-brown pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions (e.g. wall fixing, mattress thickness, delivery)..."
                className="w-full h-12 pl-12 pr-4 text-xs sm:text-sm bg-white border border-wbk-lightgrey rounded-full font-poppins text-wbk-black placeholder:text-wbk-brown/70 focus:outline-none focus:border-wbk-black shadow-xs transition-colors"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Main FAQ Content Section */}
      <Container size="xl" className="pt-12 sm:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12">
          {/* Left Category Tabs Sidebar */}
          <aside className="lg:col-span-4 space-y-2">
            <div className="sticky top-32 bg-[#FBF9F8] p-3 rounded-2xl border border-wbk-lightgrey/80">
              <p className="px-3 py-2 text-[10px] uppercase font-semibold tracking-wider text-wbk-brown">
                Categories
              </p>
              <div className="space-y-1">
                {FAQ_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  const count =
                    cat.id === "all"
                      ? FAQ_ITEMS.length
                      : FAQ_ITEMS.filter((i) => i.category === cat.id).length;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setOpenIndex(0);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-poppins transition-all text-left cursor-pointer ${
                        isActive
                          ? "bg-wbk-black text-white font-medium shadow-xs"
                          : "text-wbk-black hover:bg-white hover:text-wbk-green"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon size={16} className={isActive ? "text-wbk-gold" : "text-wbk-brown"} />
                        <span>{cat.label}</span>
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-wbk-lightgrey/60 text-wbk-brown"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Direct Assistance Box */}
              <div className="mt-6 pt-6 border-t border-wbk-lightgrey/60 p-3 bg-white rounded-xl">
                <p className="text-xs font-semibold text-wbk-black">Still have questions?</p>
                <p className="mt-1 text-[11px] text-wbk-brown font-poppins leading-relaxed">
                  Our UK wall bed specialists are available to assist with room measurements and specifications.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <a
                    href="tel:08000288940"
                    className="inline-flex items-center gap-2 text-xs font-medium text-wbk-black hover:text-wbk-green transition-colors"
                  >
                    <IconPhoneCall size={14} className="text-wbk-gold" />
                    <span>0800 028 8940</span>
                  </a>
                  <a
                    href="mailto:support@wallbedking.com"
                    className="inline-flex items-center gap-2 text-xs font-medium text-wbk-black hover:text-wbk-green transition-colors"
                  >
                    <IconMail size={14} className="text-wbk-gold" />
                    <span>support@wallbedking.com</span>
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Accordion List */}
          <main className="lg:col-span-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-wbk-lightgrey/60">
              <h2 className="font-new-york text-2xl text-wbk-black">
                {FAQ_CATEGORIES.find((c) => c.id === activeCategory)?.label || "Questions"}
              </h2>
              <span className="text-xs font-poppins text-wbk-brown">
                Showing {filteredFAQs.length} {filteredFAQs.length === 1 ? "answer" : "answers"}
              </span>
            </div>

            {filteredFAQs.length === 0 ? (
              <div className="py-16 text-center bg-[#FBF9F8] rounded-2xl border border-wbk-lightgrey/80 p-8">
                <IconHelpCircle size={36} className="mx-auto text-wbk-brown/60 mb-3" />
                <p className="font-new-york text-xl text-wbk-black">No matching questions found</p>
                <p className="mt-2 text-xs font-poppins text-wbk-brown">
                  Try adjusting your search terms or contact our support team directly.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-5 px-5 py-2 text-xs font-medium rounded-full bg-wbk-black text-white hover:bg-wbk-green transition-colors cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFAQs.map((faq, idx) => {
                  const isOpen = openIndex === idx;

                  return (
                    <div
                      key={faq.question}
                      className="border border-wbk-lightgrey rounded-2xl bg-white overflow-hidden transition-shadow hover:shadow-xs"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenIndex(isOpen ? null : idx)}
                        className="w-full px-5 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between gap-4 cursor-pointer select-none"
                      >
                        <span className="font-poppins font-medium text-sm sm:text-base text-wbk-black leading-snug">
                          {faq.question}
                        </span>
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                            isOpen ? "rotate-180 bg-wbk-black text-white" : "bg-[#F4F2F0] text-wbk-black"
                          }`}
                        >
                          <IconChevronDown size={15} />
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: "easeInOut" }}
                          >
                            <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm font-poppins text-wbk-brown leading-relaxed border-t border-wbk-lightgrey/40 whitespace-pre-line">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </Container>
    </div>
  );
}
