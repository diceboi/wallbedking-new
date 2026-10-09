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
import { useLocale } from "@/context/LocaleContext";
import { getFaqs } from "@/data/faqs";

const FAQ_CATEGORIES = [
  { id: "all", label: "All Questions", labelKey: "support.faqCatAll", icon: IconHelpCircle },
  { id: "payments", label: "Payments & Refunds", labelKey: "support.faqCatPayments", icon: IconCreditCard },
  { id: "deliveries", label: "Deliveries & Shipping", labelKey: "support.faqCatDeliveries", icon: IconTruck },
  { id: "mattresses", label: "Mattresses", labelKey: "support.faqCatMattresses", icon: IconBed },
  { id: "installation", label: "Installation & Assembly", labelKey: "support.faqCatInstallation", icon: IconTools },
  { id: "usage", label: "Everyday Usage", labelKey: "support.faqCatUsage", icon: IconSparkles },
  { id: "warranty", label: "Warranty & Guarantee", labelKey: "support.faqCatWarranty", icon: IconShieldCheck },
];

export default function FAQPage() {
  const { t, localizedHref, locale } = useLocale();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState(0);

  const faqItems = useMemo(() => getFaqs(locale), [locale]);

  const filteredFAQs = useMemo(() => {
    return faqItems.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch =
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [faqItems, activeCategory, searchQuery]);

  const activeCategoryObj = FAQ_CATEGORIES.find((c) => c.id === activeCategory);
  const activeCategoryLabel = activeCategoryObj
    ? activeCategoryObj.labelKey
      ? t(activeCategoryObj.labelKey, activeCategoryObj.label)
      : activeCategoryObj.label
    : t("support.faqCatAll", "Questions");

  return (
    <div className="bg-wbk-white min-h-screen pt-12 pb-24">
      {/* Top Breadcrumb & Hero Header */}
      <section className="border-b border-wbk-lightgrey/60 bg-[#FBF9F8] py-14 sm:py-20">
        <Container size="xl">
          <div className="max-w-3xl">
            <nav className="flex items-center gap-1.5 text-[11px] font-poppins text-wbk-brown/80 mb-4">
              <Link href={localizedHref("/")} className="hover:text-wbk-black transition-colors">
                {t("nav.home", "Home")}
              </Link>
              <span>/</span>
              <span className="text-wbk-brown/80">{t("nav.support", "Support")}</span>
              <span>/</span>
              <span className="text-wbk-black font-medium">{t("support.faqTitle", "FAQ")}</span>
            </nav>

            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-wbk-gold mb-3">
              {t("support.helpCenterBadge", "Help Center & Answers")}
            </span>
            <h1 className="font-new-york text-4xl sm:text-5xl md:text-6xl text-wbk-black tracking-tight leading-tight">
              {t("support.faqTitle", "Frequently Asked Questions")}
            </h1>
            <p className="mt-4 text-sm sm:text-base text-wbk-brown font-poppins leading-relaxed">
              {t(
                "support.faqSubtitle",
                "Find quick, comprehensive answers regarding our space-saving Murphy beds, installation requirements, delivery timelines, and lifetime warranty."
              )}
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
                placeholder={t(
                  "support.faqSearchPlaceholder",
                  "Search questions (e.g. wall fixing, mattress thickness, delivery)..."
                )}
                className="w-full h-12 pl-12 pr-4 text-xs sm:text-sm bg-white border border-wbk-lightgrey rounded-none font-poppins text-wbk-black placeholder:text-wbk-brown/70 focus:outline-none focus:border-wbk-black shadow-xs transition-colors"
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
            <div className="sticky top-32 bg-[#FBF9F8] p-3 rounded-none border border-wbk-lightgrey/80">
              <p className="px-3 py-2 text-[10px] uppercase font-semibold tracking-wider text-wbk-brown">
                {t("categories.title", "Categories")}
              </p>
              <div className="space-y-1">
                {FAQ_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  const count =
                    cat.id === "all"
                      ? faqItems.length
                      : faqItems.filter((i) => i.category === cat.id).length;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setOpenIndex(0);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full text-xs font-poppins transition-all text-left cursor-pointer ${
                        isActive
                          ? "bg-wbk-black text-white font-medium shadow-xs"
                          : "text-wbk-black hover:bg-white hover:text-wbk-green"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon size={16} className={isActive ? "text-wbk-gold" : "text-wbk-brown"} />
                        <span>{cat.labelKey ? t(cat.labelKey, cat.label) : cat.label}</span>
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
              <div className="mt-6 pt-6 border-t border-wbk-lightgrey/60 p-3 bg-white rounded-none">
                <p className="text-xs font-semibold text-wbk-black">
                  {t("support.stillHaveQuestions", "Still have questions?")}
                </p>
                <p className="mt-1 text-[11px] text-wbk-brown font-poppins leading-relaxed">
                  {t(
                    "support.stillHaveQuestionsDesc",
                    "Our wall bed specialists are available to assist with room measurements and specifications."
                  )}
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <a
                    href="tel:01928583469"
                    className="inline-flex items-center gap-2 text-xs font-medium text-wbk-black hover:text-wbk-green transition-colors"
                  >
                    <IconPhoneCall size={14} className="text-wbk-gold" />
                    <span>01928 583 469</span>
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
                {activeCategoryLabel}
              </h2>
              <span className="text-xs font-poppins text-wbk-brown">
                {t("support.faqShowing", "Showing")} {filteredFAQs.length}{" "}
                {filteredFAQs.length === 1
                  ? t("support.faqAnswerCount", "answer")
                  : t("support.faqAnswersCount", "answers")}
              </span>
            </div>

            {filteredFAQs.length === 0 ? (
              <div className="py-16 text-center bg-[#FBF9F8] rounded-none border border-wbk-lightgrey/80 p-8">
                <IconHelpCircle size={36} className="mx-auto text-wbk-brown/60 mb-3" />
                <p className="font-new-york text-xl text-wbk-black">
                  {t("support.faqNoQuestions", "No matching questions found")}
                </p>
                <p className="mt-2 text-xs font-poppins text-wbk-brown">
                  {t(
                    "support.faqNoQuestionsDesc",
                    "Try adjusting your search terms or contact our support team directly."
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-5 px-5 py-2 text-xs font-medium rounded-full bg-wbk-black text-white hover:bg-wbk-green transition-colors cursor-pointer"
                >
                  {t("support.faqClearSearch", "Clear search")}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFAQs.map((faq, idx) => {
                  const isOpen = openIndex === idx;

                  return (
                    <div
                      key={faq.id || faq.question}
                      className="border border-wbk-lightgrey rounded-none bg-white overflow-hidden transition-shadow hover:shadow-xs"
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
