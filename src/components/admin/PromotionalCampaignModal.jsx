"use client";

import { useState, useEffect } from "react";
import {
  IconX,
  IconCheck,
  IconCalendar,
  IconPercentage,
  IconSpeakerphone,
  IconPhoto,
  IconClock,
  IconAlertCircle,
  IconEyeCheck,
  IconShield,
  IconTrash,
  IconVideo,
  IconPlayerPlay,
  IconWorld,
  IconLanguage,
  IconSparkles,
  IconLoader2,
  IconCopy,
} from "@tabler/icons-react";

export const STOREFRONT_LANGUAGES = [
  { code: "en", label: "UK English (Default)", flag: "🇬🇧" },
  { code: "de", label: "German (DE)", flag: "🇩🇪" },
  { code: "fr", label: "French (FR)", flag: "🇫🇷" },
  { code: "es", label: "Spanish (ES)", flag: "🇪🇸" },
  { code: "it", label: "Italian (IT)", flag: "🇮🇹" },
  { code: "por", label: "Portuguese (POR)", flag: "🇵🇹" },
  { code: "us", label: "US English (US)", flag: "🇺🇸" },
];

export const STOREFRONT_MARKETS = [
  { code: "en", label: "United Kingdom", flag: "🇬🇧", currency: "£ GBP" },
  { code: "us", label: "United States", flag: "🇺🇸", currency: "$ USD" },
  { code: "de", label: "Germany / Austria", flag: "🇩🇪", currency: "€ EUR" },
  { code: "fr", label: "France", flag: "🇫🇷", currency: "€ EUR" },
  { code: "es", label: "Spain", flag: "🇪🇸", currency: "€ EUR" },
  { code: "it", label: "Italy", flag: "🇮🇹", currency: "€ EUR" },
  { code: "por", label: "Portugal", flag: "🇵🇹", currency: "€ EUR" },
];

const PRESET_COLORS = [
  { name: "WBK Green", hex: "#2D5A27" },
  { name: "WBK Brown", hex: "#332B26" },
  { name: "Gold Accent", hex: "#C19A6B" },
  { name: "Deep Navy", hex: "#1E3A8A" },
  { name: "Crimson Red", hex: "#991B1B" },
  { name: "Slate Dark", hex: "#1F2937" },
];

const CATEGORIES_LIST = [
  { id: "beds", label: "Wall Beds (All)" },
  { id: "morphy-beds", label: "Morphy™ Beds" },
  { id: "traditional-beds", label: "Traditional Beds" },
  { id: "tables", label: "Smart Tables" },
  { id: "sofas", label: "Sofas & Seating" },
  { id: "mattresses", label: "Mattresses" },
  { id: "cabinets", label: "Cabinets & Storage" },
  { id: "bundles", label: "Bundles & Packages" },
];

const DAYS_OF_WEEK = [
  { id: 1, label: "Monday" },
  { id: 2, label: "Tuesday" },
  { id: 3, label: "Wednesday" },
  { id: 4, label: "Thursday" },
  { id: 5, label: "Friday" },
  { id: 6, label: "Saturday" },
  { id: 0, label: "Sunday" },
];

export function PromotionalCampaignModal({
  isOpen,
  onClose,
  campaign,
  onSave,
  onDelete,
}) {
  const [activeTab, setActiveTab] = useState("general");
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (campaign) {
      setForm({
        id: campaign.id || "",
        name: campaign.name || "",
        slug: campaign.slug || "",
        status: campaign.status || "preview",
        priority: campaign.priority ?? 5,
        discount_type: campaign.discount_type || "percentage",
        discount_value: campaign.discount_value ?? 10,
        target_markets: Array.isArray(campaign.target_markets) ? campaign.target_markets : [],
        apply_to: campaign.apply_to || "all",
        target_categories: campaign.target_categories || [],
        target_products: campaign.target_products || [],
        excluded_categories: campaign.excluded_categories || [],
        excluded_products: campaign.excluded_products || [],
        allow_stacking: Boolean(campaign.allow_stacking),
        schedule_type: campaign.schedule_type || "fixed",
        start_date: campaign.start_date
          ? campaign.start_date.slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        end_date: campaign.end_date
          ? campaign.end_date.slice(0, 16)
          : "",
        recurring: campaign.recurring || {
          frequency: "weekly",
          days_of_week: [5, 6, 0],
          start_time: "00:00",
          end_time: "23:59",
        },
        top_bar: {
          enabled: Boolean(campaign.top_bar?.enabled),
          text: campaign.top_bar?.text || "",
          link: campaign.top_bar?.link || "/products",
          link_text: campaign.top_bar?.link_text || "Shop Now",
          bg_color: campaign.top_bar?.bg_color || "#2D5A27",
          text_color: campaign.top_bar?.text_color || "#FFFFFF",
          dismissible: campaign.top_bar?.dismissible !== false,
          translations: campaign.top_bar?.translations || {},
        },
        hero_banner: {
          enabled: Boolean(campaign.hero_banner?.enabled),
          badge: campaign.hero_banner?.badge || "",
          headline: campaign.hero_banner?.headline || "",
          subtitle: campaign.hero_banner?.subtitle || "",
          cta_text: campaign.hero_banner?.cta_text || "Explore Deals",
          cta_link: campaign.hero_banner?.cta_link || "/products",
          secondary_cta_text: campaign.hero_banner?.secondary_cta_text || "",
          secondary_cta_link: campaign.hero_banner?.secondary_cta_link || "",
          media_type:
            campaign.hero_banner?.media_type ||
            (/\.(mp4|webm|ogg|mov)($|\?)/i.test(campaign.hero_banner?.image || campaign.hero_banner?.video || "")
              ? "video"
              : "image"),
          image:
            campaign.hero_banner?.image && !/\.(mp4|webm|ogg|mov)($|\?)/i.test(campaign.hero_banner.image)
              ? campaign.hero_banner.image
              : "",
          video:
            campaign.hero_banner?.video ||
            (/\.(mp4|webm|ogg|mov)($|\?)/i.test(campaign.hero_banner?.image || "")
              ? campaign.hero_banner?.image
              : ""),
          translations: campaign.hero_banner?.translations || {},
        },
      });
    }
    setActiveTab("general");
    setTopBarLang("en");
    setHeroLang("en");
    setError(null);
  }, [campaign, isOpen]);

  const [topBarLang, setTopBarLang] = useState("en");
  const [heroLang, setHeroLang] = useState("en");

  const [translatingTopBar, setTranslatingTopBar] = useState(false);
  const [translatingHero, setTranslatingHero] = useState(false);
  const [translatingSingle, setTranslatingSingle] = useState(null);
  const [translateFeedback, setTranslateFeedback] = useState(null);

  const showTranslateFeedback = (type, message, isError = false) => {
    setTranslateFeedback({ type, message, isError });
    setTimeout(() => {
      setTranslateFeedback((prev) => (prev?.message === message ? null : prev));
    }, 5000);
  };

  // 1. Auto-translate Top Announcement Bar to ALL languages in one click
  const handleAutoTranslateTopBarAll = async () => {
    const englishText = form.top_bar?.text?.trim() || "";
    const englishLinkText = form.top_bar?.link_text?.trim() || "";

    if (!englishText && !englishLinkText) {
      showTranslateFeedback("top_bar", "Please enter English announcement text first before translating.", true);
      return;
    }

    setTranslatingTopBar(true);
    try {
      const targetLocales = STOREFRONT_LANGUAGES.filter((l) => l.code !== "en").map((l) => l.code);
      const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts: {
            text: englishText,
            link_text: englishLinkText,
          },
          targetLocales,
        }),
      });

      const data = await res.json();
      if (data.success && data.translations) {
        setForm((prev) => ({
          ...prev,
          top_bar: {
            ...prev.top_bar,
            translations: {
              ...(prev.top_bar?.translations || {}),
              ...data.translations,
            },
          },
        }));
        showTranslateFeedback("top_bar", `✓ Top announcement translated to all ${targetLocales.length} languages!`);
      } else {
        showTranslateFeedback("top_bar", data.error || "Translation failed", true);
      }
    } catch (err) {
      showTranslateFeedback("top_bar", err.message || "Translation failed", true);
    } finally {
      setTranslatingTopBar(false);
    }
  };

  // 2. Auto-translate Top Announcement Bar for a single language
  const handleAutoTranslateTopBarLang = async (langCode) => {
    const englishText = form.top_bar?.text?.trim() || "";
    const englishLinkText = form.top_bar?.link_text?.trim() || "";

    if (!englishText && !englishLinkText) {
      showTranslateFeedback("top_bar", "Please enter English announcement text first.", true);
      return;
    }

    setTranslatingSingle(`top_bar_${langCode}`);
    try {
      const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts: {
            text: englishText,
            link_text: englishLinkText,
          },
          targetLocale: langCode,
        }),
      });

      const data = await res.json();
      if (data.success && data.translations) {
        setForm((prev) => ({
          ...prev,
          top_bar: {
            ...prev.top_bar,
            translations: {
              ...(prev.top_bar?.translations || {}),
              [langCode]: {
                ...(prev.top_bar?.translations?.[langCode] || {}),
                ...data.translations,
              },
            },
          },
        }));
        showTranslateFeedback("top_bar", `✓ Translated for ${langCode.toUpperCase()}!`);
      } else {
        showTranslateFeedback("top_bar", data.error || "Translation failed", true);
      }
    } catch (err) {
      showTranslateFeedback("top_bar", err.message, true);
    } finally {
      setTranslatingSingle(null);
    }
  };

  // 3. Auto-translate single field in Top Bar
  const handleAutoTranslateTopBarField = async (langCode, fieldName) => {
    const englishText = form.top_bar?.[fieldName]?.trim() || "";
    if (!englishText) return;

    setTranslatingSingle(`top_bar_${langCode}_${fieldName}`);
    try {
      const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          englishText,
          targetLocale: langCode,
        }),
      });

      const data = await res.json();
      if (data.success && data.translation) {
        updateTopBarTranslation(langCode, fieldName, data.translation);
      }
    } catch (err) {
      console.warn("Field translation error:", err);
    } finally {
      setTranslatingSingle(null);
    }
  };

  // 4. Auto-translate Hero Banner to ALL languages in one click
  const handleAutoTranslateHeroAll = async () => {
    const englishHero = {
      badge: form.hero_banner?.badge?.trim() || "",
      headline: form.hero_banner?.headline?.trim() || "",
      subtitle: form.hero_banner?.subtitle?.trim() || "",
      cta_text: form.hero_banner?.cta_text?.trim() || "",
      secondary_cta_text: form.hero_banner?.secondary_cta_text?.trim() || "",
    };

    if (!englishHero.headline) {
      showTranslateFeedback("hero", "Please enter English headline first before translating.", true);
      return;
    }

    setTranslatingHero(true);
    try {
      const targetLocales = STOREFRONT_LANGUAGES.filter((l) => l.code !== "en").map((l) => l.code);
      const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts: englishHero,
          targetLocales,
        }),
      });

      const data = await res.json();
      if (data.success && data.translations) {
        setForm((prev) => ({
          ...prev,
          hero_banner: {
            ...prev.hero_banner,
            translations: {
              ...(prev.hero_banner?.translations || {}),
              ...data.translations,
            },
          },
        }));
        showTranslateFeedback("hero", `✓ Hero content translated to all ${targetLocales.length} languages!`);
      } else {
        showTranslateFeedback("hero", data.error || "Translation failed", true);
      }
    } catch (err) {
      showTranslateFeedback("hero", err.message || "Translation failed", true);
    } finally {
      setTranslatingHero(false);
    }
  };

  // 5. Auto-translate Hero Banner for a single language
  const handleAutoTranslateHeroLang = async (langCode) => {
    const englishHero = {
      badge: form.hero_banner?.badge?.trim() || "",
      headline: form.hero_banner?.headline?.trim() || "",
      subtitle: form.hero_banner?.subtitle?.trim() || "",
      cta_text: form.hero_banner?.cta_text?.trim() || "",
      secondary_cta_text: form.hero_banner?.secondary_cta_text?.trim() || "",
    };

    if (!englishHero.headline) {
      showTranslateFeedback("hero", "Please enter English headline first.", true);
      return;
    }

    setTranslatingSingle(`hero_${langCode}`);
    try {
      const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts: englishHero,
          targetLocale: langCode,
        }),
      });

      const data = await res.json();
      if (data.success && data.translations) {
        setForm((prev) => ({
          ...prev,
          hero_banner: {
            ...prev.hero_banner,
            translations: {
              ...(prev.hero_banner?.translations || {}),
              [langCode]: {
                ...(prev.hero_banner?.translations?.[langCode] || {}),
                ...data.translations,
              },
            },
          },
        }));
        showTranslateFeedback("hero", `✓ Translated for ${langCode.toUpperCase()}!`);
      } else {
        showTranslateFeedback("hero", data.error || "Translation failed", true);
      }
    } catch (err) {
      showTranslateFeedback("hero", err.message, true);
    } finally {
      setTranslatingSingle(null);
    }
  };

  // 6. Auto-translate single field in Hero
  const handleAutoTranslateHeroField = async (langCode, fieldName) => {
    const englishText = form.hero_banner?.[fieldName]?.trim() || "";
    if (!englishText) return;

    setTranslatingSingle(`hero_${langCode}_${fieldName}`);
    try {
      const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          englishText,
          targetLocale: langCode,
        }),
      });

      const data = await res.json();
      if (data.success && data.translation) {
        updateHeroTranslation(langCode, fieldName, data.translation);
      }
    } catch (err) {
      console.warn("Field translation error:", err);
    } finally {
      setTranslatingSingle(null);
    }
  };

  if (!isOpen || !form) return null;

  const updateField = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const toggleMarket = (marketCode) => {
    const current = form.target_markets || [];
    const next = current.includes(marketCode)
      ? current.filter((m) => m !== marketCode)
      : [...current, marketCode];
    updateField("target_markets", next);
  };

  const updateTopBar = (field, val) => {
    setForm((prev) => ({
      ...prev,
      top_bar: { ...prev.top_bar, [field]: val },
    }));
  };

  const updateTopBarTranslation = (lang, field, value) => {
    if (lang === "en") {
      updateTopBar(field, value);
    } else {
      setForm((prev) => ({
        ...prev,
        top_bar: {
          ...prev.top_bar,
          translations: {
            ...prev.top_bar?.translations,
            [lang]: {
              ...prev.top_bar?.translations?.[lang],
              [field]: value,
            },
          },
        },
      }));
    }
  };

  const updateHero = (field, val) => {
    setForm((prev) => ({
      ...prev,
      hero_banner: { ...prev.hero_banner, [field]: val },
    }));
  };

  const updateHeroTranslation = (lang, field, value) => {
    if (lang === "en") {
      updateHero(field, value);
    } else {
      setForm((prev) => ({
        ...prev,
        hero_banner: {
          ...prev.hero_banner,
          translations: {
            ...prev.hero_banner?.translations,
            [lang]: {
              ...prev.hero_banner?.translations?.[lang],
              [field]: value,
            },
          },
        },
      }));
    }
  };

  const updateRecurring = (field, val) => {
    setForm((prev) => ({
      ...prev,
      recurring: { ...prev.recurring, [field]: val },
    }));
  };

  const toggleCategory = (catId) => {
    const current = form.target_categories || [];
    const next = current.includes(catId)
      ? current.filter((c) => c !== catId)
      : [...current, catId];
    updateField("target_categories", next);
  };

  const toggleExcludedCategory = (catId) => {
    const current = form.excluded_categories || [];
    const next = current.includes(catId)
      ? current.filter((c) => c !== catId)
      : [...current, catId];
    updateField("excluded_categories", next);
  };

  const toggleDayOfWeek = (dayId) => {
    const current = form.recurring?.days_of_week || [];
    const next = current.includes(dayId)
      ? current.filter((d) => d !== dayId)
      : [...current, dayId];
    updateRecurring("days_of_week", next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Campaign name is required.");
      setActiveTab("general");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const heroMediaIsVideo =
        form.hero_banner?.media_type === "video" ||
        Boolean(
          form.hero_banner?.video ||
            /\.(mp4|webm|ogg|mov)($|\?)/i.test(form.hero_banner?.image || "")
        );

      const heroBannerPayload = form.hero_banner
        ? {
            ...form.hero_banner,
            media_type: heroMediaIsVideo ? "video" : "image",
            video: heroMediaIsVideo
              ? form.hero_banner.video || form.hero_banner.image
              : "",
            image:
              form.hero_banner.image &&
              !/\.(mp4|webm|ogg|mov)($|\?)/i.test(form.hero_banner.image)
                ? form.hero_banner.image
                : "",
          }
        : form.hero_banner;

      const payload = {
        ...form,
        hero_banner: heroBannerPayload,
        start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
        end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err?.message || "An error occurred while saving the campaign");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {form.id ? "Edit Promotional Campaign" : "Create New Promotional Campaign"}
            </h2>
            <p className="text-xs text-gray-500">
              Customize discounts, timing schedules, top announcement bar and hero banner.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50/40 px-6 gap-1 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-1.5 py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "general"
                ? "border-wbk-green text-wbk-green"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <IconPercentage className="w-4 h-4" />
            General & Status
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("timing")}
            className={`flex items-center gap-1.5 py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "timing"
                ? "border-wbk-green text-wbk-green"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <IconCalendar className="w-4 h-4" />
            Schedule & Recurrence
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("scope")}
            className={`flex items-center gap-1.5 py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "scope"
                ? "border-wbk-green text-wbk-green"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <IconShield className="w-4 h-4" />
            Targeting & Exclusions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("topbar")}
            className={`flex items-center gap-1.5 py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "topbar"
                ? "border-wbk-green text-wbk-green"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <IconSpeakerphone className="w-4 h-4" />
            Top Announcement Bar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("hero")}
            className={`flex items-center gap-1.5 py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "hero"
                ? "border-wbk-green text-wbk-green"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <IconPhoto className="w-4 h-4" />
            Hero Banner
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <IconAlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[65vh] overflow-y-auto space-y-5">
            {/* ── TAB 1: GENERAL & STATUS ── */}
            {activeTab === "general" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Campaign Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="e.g. Spring Space-Saving Event"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-wbk-green/30 focus:border-wbk-green outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Campaign Slug (URL identifier)
                    </label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => updateField("slug", e.target.value)}
                      placeholder="e.g. spring-space-saving-event"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-wbk-green/30 focus:border-wbk-green outline-none font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Status selector: Live, Admin Preview, Inactive */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Campaign Status
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label
                      className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                        form.status === "active"
                          ? "border-green-500 bg-green-50/50 shadow-sm"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-green-800 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                          Live (Active)
                        </span>
                        <input
                          type="radio"
                          name="status"
                          value="active"
                          checked={form.status === "active"}
                          onChange={() => updateField("status", "active")}
                          className="text-green-600 focus:ring-green-500"
                        />
                      </div>
                      <p className="text-[11px] text-gray-500">
                        Visible to all storefront visitors according to schedule.
                      </p>
                    </label>

                    <label
                      className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                        form.status === "preview"
                          ? "border-amber-500 bg-amber-50/50 shadow-sm"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                          <IconEyeCheck className="w-4 h-4 text-amber-600 inline-block" />
                          Admin Preview
                        </span>
                        <input
                          type="radio"
                          name="status"
                          value="preview"
                          checked={form.status === "preview"}
                          onChange={() => updateField("status", "preview")}
                          className="text-amber-600 focus:ring-amber-500"
                        />
                      </div>
                      <p className="text-[11px] text-gray-500">
                        Visible ONLY when logged in as admin. Regular visitors see normal prices and banners.
                      </p>
                    </label>

                    <label
                      className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                        form.status === "inactive"
                          ? "border-gray-400 bg-gray-50 shadow-sm"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block" />
                          Inactive / Draft
                        </span>
                        <input
                          type="radio"
                          name="status"
                          value="inactive"
                          checked={form.status === "inactive"}
                          onChange={() => updateField("status", "inactive")}
                          className="text-gray-600 focus:ring-gray-500"
                        />
                      </div>
                      <p className="text-[11px] text-gray-500">
                        Completely disabled on both storefront and previews.
                      </p>
                    </label>
                  </div>
                </div>

                {/* Discount type & value */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Discount Type
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => updateField("discount_type", "percentage")}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                          form.discount_type === "percentage"
                            ? "bg-wbk-green text-white border-wbk-green"
                            : "border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Percentage (%)
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField("discount_type", "fixed")}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                          form.discount_type === "fixed"
                            ? "bg-wbk-green text-white border-wbk-green"
                            : "border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Fixed Amount (£/€/$)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Discount Value{" "}
                      {form.discount_type === "percentage" ? "(%)" : "(Currency)"}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={form.discount_type === "percentage" ? "99" : "10000"}
                      value={form.discount_value}
                      onChange={(e) => updateField("discount_value", Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-wbk-green/30 focus:border-wbk-green outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Priority (Conflict Resolution)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={form.priority}
                      onChange={(e) => updateField("priority", Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-wbk-green/30 focus:border-wbk-green outline-none"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Higher number = takes priority in conflict situations (default: 5).
                    </p>
                  </div>

                  <div className="flex flex-col justify-center">
                    <label className="flex items-center gap-2 cursor-pointer pt-4">
                      <input
                        type="checkbox"
                        checked={form.allow_stacking}
                        onChange={(e) => updateField("allow_stacking", e.target.checked)}
                        className="rounded text-wbk-green focus:ring-wbk-green w-4 h-4"
                      />
                      <span className="text-xs font-medium text-gray-700">
                        Allow Stacking with Product-level Sales
                      </span>
                    </label>
                    <p className="text-[11px] text-gray-400 ml-6">
                      When unchecked, the "Best Deal" principle applies (highest discount wins).
                    </p>
                  </div>
                </div>

                {/* Target Countries & Storefronts */}
                <div className="pt-3 border-t border-gray-100 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                        <IconWorld className="w-4 h-4 text-emerald-600" />
                        Target Countries & Storefronts
                      </label>
                      <span className="text-[11px] text-gray-400">
                        Choose which country domains will run this promotion.
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-100 p-0.5 rounded-lg text-xs self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => updateField("target_markets", [])}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                          !form.target_markets || form.target_markets.length === 0
                            ? "bg-white text-gray-900 shadow-xs"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        All Countries (Global)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!form.target_markets || form.target_markets.length === 0) {
                            updateField("target_markets", ["en"]);
                          }
                        }}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                          form.target_markets && form.target_markets.length > 0
                            ? "bg-white text-gray-900 shadow-xs"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        Specific Countries Only
                      </button>
                    </div>
                  </div>

                  {form.target_markets && form.target_markets.length > 0 ? (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                      <span className="text-[11px] text-gray-500 block">
                        Select applicable country storefronts (unselected countries will not see this discount or banners):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {STOREFRONT_MARKETS.map((m) => {
                          const active = form.target_markets.includes(m.code);
                          return (
                            <button
                              key={m.code}
                              type="button"
                              onClick={() => toggleMarket(m.code)}
                              className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                                active
                                  ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-2xs ring-1 ring-emerald-300"
                                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                              }`}
                            >
                              <span className="text-base">{m.flag}</span>
                              <div className="min-w-0">
                                <span className="block text-xs truncate">{m.label}</span>
                                <span className="block text-[10px] text-gray-400 font-normal">
                                  {m.currency}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
                      <span className="text-sm">🌍</span>
                      <span>This promotion is currently enabled across <strong>all international storefronts</strong> (UK, US, DE, FR, ES, IT, POR).</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB 2: TIMING & RECURRENCE ── */}
            {activeTab === "timing" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Schedule Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateField("schedule_type", "fixed")}
                      className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg border transition-colors ${
                        form.schedule_type === "fixed"
                          ? "bg-wbk-green text-white border-wbk-green"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Fixed Period (From Date To Date)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField("schedule_type", "recurring")}
                      className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg border transition-colors ${
                        form.schedule_type === "recurring"
                          ? "bg-wbk-green text-white border-wbk-green"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Recurring Schedule (Weekly / Monthly Time Windows)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Start Date & Time (UTC)
                    </label>
                    <input
                      type="datetime-local"
                      value={form.start_date || ""}
                      onChange={(e) => updateField("start_date", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-wbk-green/30 focus:border-wbk-green outline-none"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-gray-700">
                        {form.schedule_type === "recurring" ? "End Date & Time (Optional)" : "End Date & Time (UTC)"}
                      </label>
                      {form.schedule_type === "recurring" && form.end_date && (
                        <button
                          type="button"
                          onClick={() => updateField("end_date", "")}
                          className="text-[11px] text-amber-700 hover:text-amber-900 underline font-medium"
                        >
                          Clear (Run Perpetually)
                        </button>
                      )}
                    </div>
                    <input
                      type="datetime-local"
                      value={form.end_date || ""}
                      onChange={(e) => updateField("end_date", e.target.value)}
                      placeholder={form.schedule_type === "recurring" ? "Optional: leave blank for perpetual" : ""}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-wbk-green/30 focus:border-wbk-green outline-none"
                    />
                    {form.schedule_type === "recurring" && !form.end_date && (
                      <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                        ✓ No expiration date set. Campaign will recur continuously on selected days.
                      </p>
                    )}
                  </div>
                </div>

                {/* Recurring Options */}
                {form.schedule_type === "recurring" && (
                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <IconClock className="w-4 h-4 text-amber-700" />
                      Recurring Cycle Settings
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Frequency
                      </label>
                      <select
                        value={form.recurring?.frequency || "weekly"}
                        onChange={(e) => updateRecurring("frequency", e.target.value)}
                        className="w-full sm:w-60 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white outline-none"
                      >
                        <option value="weekly">Weekly (Specific Days)</option>
                        <option value="monthly">Monthly (Specific Days)</option>
                      </select>
                    </div>

                    {/* Weekly days selector */}
                    {form.recurring?.frequency === "weekly" && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Active Days of Week (e.g. Friday to Sunday for Weekend Sales)
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {DAYS_OF_WEEK.map((d) => {
                            const checked = (form.recurring?.days_of_week || []).includes(d.id);
                            return (
                              <button
                                key={d.id}
                                type="button"
                                onClick={() => toggleDayOfWeek(d.id)}
                                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors text-left flex items-center justify-between ${
                                  checked
                                    ? "bg-wbk-green text-white border-wbk-green"
                                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                }`}
                              >
                                <span>{d.label}</span>
                                {checked && <IconCheck className="w-3.5 h-3.5" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Time Window */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Daily Start Time
                        </label>
                        <input
                          type="time"
                          value={form.recurring?.start_time || "00:00"}
                          onChange={(e) => updateRecurring("start_time", e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Daily End Time
                        </label>
                        <input
                          type="time"
                          value={form.recurring?.end_time || "23:59"}
                          onChange={(e) => updateRecurring("end_time", e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 3: SCOPE & EXCLUSIONS ── */}
            {activeTab === "scope" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Apply To Scope
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => updateField("apply_to", "all")}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                        form.apply_to === "all"
                          ? "bg-wbk-green text-white border-wbk-green"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      All Products
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField("apply_to", "categories")}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                        form.apply_to === "categories"
                          ? "bg-wbk-green text-white border-wbk-green"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Specific Categories
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField("apply_to", "products")}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                        form.apply_to === "products"
                          ? "bg-wbk-green text-white border-wbk-green"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Specific Products
                    </button>
                  </div>
                </div>

                {/* Target Categories */}
                {form.apply_to === "categories" && (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                    <label className="block text-xs font-semibold text-gray-700">
                      Select target categories:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CATEGORIES_LIST.map((cat) => {
                        const checked = (form.target_categories || []).includes(cat.id);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleCategory(cat.id)}
                            className={`p-2 rounded-lg text-xs font-medium border text-left flex items-center justify-between ${
                              checked
                                ? "bg-wbk-green text-white border-wbk-green"
                                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            <span>{cat.label}</span>
                            {checked && <IconCheck className="w-3.5 h-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Target Products (SKUs / Slugs list) */}
                {form.apply_to === "products" && (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                    <label className="block text-xs font-semibold text-gray-700">
                      Target Product SKUs or Slugs (comma separated):
                    </label>
                    <textarea
                      rows={3}
                      value={(form.target_products || []).join(", ")}
                      onChange={(e) =>
                        updateField(
                          "target_products",
                          e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        )
                      }
                      placeholder="e.g. B2401M-M014+W023, space-saving-glass-extending-dining-table"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white outline-none font-mono"
                    />
                  </div>
                )}

                {/* Exclusions */}
                <div className="pt-3 border-t border-gray-200 space-y-3">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Exclusions
                  </h4>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Excluded Categories (campaign will not apply to these):
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CATEGORIES_LIST.map((cat) => {
                        const checked = (form.excluded_categories || []).includes(cat.id);
                        return (
                          <button
                            key={`ex-${cat.id}`}
                            type="button"
                            onClick={() => toggleExcludedCategory(cat.id)}
                            className={`p-2 rounded-lg text-xs font-medium border text-left flex items-center justify-between ${
                              checked
                                ? "bg-red-600 text-white border-red-600"
                                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            <span>{cat.label}</span>
                            {checked && <IconX className="w-3.5 h-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Excluded Product SKUs or Slugs (comma separated):
                    </label>
                    <textarea
                      rows={2}
                      value={(form.excluded_products || []).join(", ")}
                      onChange={(e) =>
                        updateField(
                          "excluded_products",
                          e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        )
                      }
                      placeholder="e.g. clear-01, clearance-mattress"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 4: TOP ANNOUNCEMENT BAR ── */}
            {activeTab === "topbar" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">
                      Enable Top Announcement Bar
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Displays a slim banner directly above the navigation header
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.top_bar?.enabled}
                    onChange={(e) => updateTopBar("enabled", e.target.checked)}
                    className="w-5 h-5 rounded text-wbk-green focus:ring-wbk-green"
                  />
                </div>

                {form.top_bar?.enabled && (
                  <div className="space-y-4 p-4 rounded-xl border border-gray-200 bg-white">
                    {/* Multilingual Selector for Announcement Bar */}
                    <div className="flex flex-col gap-2 pb-3 border-b border-gray-100">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-xs text-gray-800 font-bold flex items-center gap-1.5">
                            <IconLanguage className="w-4 h-4 text-emerald-600" />
                            <span>Announcement Bar Language</span>
                          </span>
                          <span className="text-[11px] text-gray-500">
                            {topBarLang === "en"
                              ? "Editing base English text (used as source for translations)"
                              : `Translating for ${STOREFRONT_LANGUAGES.find((l) => l.code === topBarLang)?.label}`}
                          </span>
                        </div>

                        {/* Master Auto-Translate Button */}
                        <button
                          type="button"
                          onClick={handleAutoTranslateTopBarAll}
                          disabled={translatingTopBar || !form.top_bar?.text}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                            translatingTopBar
                              ? "bg-amber-100 text-amber-900 border border-amber-300 cursor-wait"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 cursor-pointer"
                          } ${!form.top_bar?.text ? "opacity-50 cursor-not-allowed" : ""}`}
                          title="Automatically translate English announcement text into DE, FR, ES, IT, POR, US in 1 click"
                        >
                          {translatingTopBar ? (
                            <>
                              <IconLoader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Translating All Languages...</span>
                            </>
                          ) : (
                            <>
                              <IconSparkles className="w-3.5 h-3.5 text-amber-300" />
                              <span>Auto-Translate All Languages</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Translate Feedback Banner */}
                      {translateFeedback?.type === "top_bar" && (
                        <div
                          className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                            translateFeedback.isError
                              ? "bg-red-50 text-red-800 border border-red-200"
                              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {translateFeedback.isError ? (
                            <IconAlertCircle className="w-4 h-4 flex-shrink-0" />
                          ) : (
                            <IconCheck className="w-4 h-4 flex-shrink-0" />
                          )}
                          <span>{translateFeedback.message}</span>
                        </div>
                      )}

                      {/* Language Selection Pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                        {STOREFRONT_LANGUAGES.map((lang) => {
                          const isCurrent = topBarLang === lang.code;
                          const hasTranslation =
                            lang.code === "en"
                              ? Boolean(form.top_bar?.text)
                              : Boolean(form.top_bar?.translations?.[lang.code]?.text);

                          return (
                            <button
                              key={lang.code}
                              type="button"
                              onClick={() => setTopBarLang(lang.code)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                                isCurrent
                                  ? "bg-wbk-green text-white shadow-xs"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              <span>{lang.flag}</span>
                              <span>{lang.code.toUpperCase()}</span>
                              {hasTranslation && (
                                <span
                                  className={`text-[11px] font-bold ${
                                    isCurrent ? "text-emerald-200" : "text-emerald-700"
                                  }`}
                                >
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Current Language Fast Action Banner (when not EN) */}
                      {topBarLang !== "en" && (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs mt-1">
                          <span className="text-emerald-900 font-medium">
                            Language: <strong>{STOREFRONT_LANGUAGES.find((l) => l.code === topBarLang)?.label}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAutoTranslateTopBarLang(topBarLang)}
                            disabled={translatingSingle === `top_bar_${topBarLang}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-semibold text-[11px] transition-colors shadow-xs cursor-pointer"
                          >
                            {translatingSingle === `top_bar_${topBarLang}` ? (
                              <IconLoader2 className="w-3 h-3 animate-spin text-emerald-700" />
                            ) : (
                              <IconSparkles className="w-3 h-3 text-amber-600" />
                            )}
                            <span>Auto-Translate {topBarLang.toUpperCase()}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-gray-700">
                          Banner Text ({topBarLang.toUpperCase()}) *
                        </label>
                        {topBarLang !== "en" && (
                          <div className="flex items-center gap-2">
                            {form.top_bar?.text && (
                              <button
                                type="button"
                                onClick={() => handleAutoTranslateTopBarField(topBarLang, "text")}
                                disabled={translatingSingle === `top_bar_${topBarLang}_text`}
                                className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold inline-flex items-center gap-0.5 underline cursor-pointer"
                              >
                                {translatingSingle === `top_bar_${topBarLang}_text` ? (
                                  <IconLoader2 className="w-3 h-3 animate-spin inline" />
                                ) : (
                                  <IconSparkles className="w-3 h-3 inline text-amber-600" />
                                )}
                                <span>Auto-Translate</span>
                              </button>
                            )}
                            {form.top_bar?.text && (
                              <button
                                type="button"
                                onClick={() => updateTopBarTranslation(topBarLang, "text", form.top_bar.text)}
                                className="text-[11px] text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-0.5"
                              >
                                <IconCopy className="w-3 h-3" />
                                <span>Copy EN</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        value={
                          topBarLang === "en"
                            ? form.top_bar?.text || ""
                            : form.top_bar?.translations?.[topBarLang]?.text || ""
                        }
                        onChange={(e) => updateTopBarTranslation(topBarLang, "text", e.target.value)}
                        placeholder={
                          topBarLang === "en"
                            ? "e.g. 🌿 Special Offer: 15% OFF across all space-saving beds this weekend!"
                            : `Translate: "${form.top_bar?.text || "Announcement text"}"`
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-wbk-green/30 focus:border-wbk-green outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Clickable Target Link URL
                        </label>
                        <input
                          type="text"
                          value={form.top_bar?.link || ""}
                          onChange={(e) => updateTopBar("link", e.target.value)}
                          placeholder="/products or /products/tables"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-gray-700">
                            Link Text (Button) ({topBarLang.toUpperCase()})
                          </label>
                          {topBarLang !== "en" && (
                            <div className="flex items-center gap-2">
                              {form.top_bar?.link_text && (
                                <button
                                  type="button"
                                  onClick={() => handleAutoTranslateTopBarField(topBarLang, "link_text")}
                                  disabled={translatingSingle === `top_bar_${topBarLang}_link_text`}
                                  className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold inline-flex items-center gap-0.5 underline cursor-pointer"
                                >
                                  {translatingSingle === `top_bar_${topBarLang}_link_text` ? (
                                    <IconLoader2 className="w-3 h-3 animate-spin inline" />
                                  ) : (
                                    <IconSparkles className="w-3 h-3 inline text-amber-600" />
                                  )}
                                  <span>Auto-Translate</span>
                                </button>
                              )}
                              {form.top_bar?.link_text && (
                                <button
                                  type="button"
                                  onClick={() => updateTopBarTranslation(topBarLang, "link_text", form.top_bar.link_text)}
                                  className="text-[11px] text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-0.5"
                                >
                                  <IconCopy className="w-3 h-3" />
                                  <span>Copy EN</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        <input
                          type="text"
                          value={
                            topBarLang === "en"
                              ? form.top_bar?.link_text || ""
                              : form.top_bar?.translations?.[topBarLang]?.link_text || ""
                          }
                          onChange={(e) => updateTopBarTranslation(topBarLang, "link_text", e.target.value)}
                          placeholder={
                            topBarLang === "en"
                              ? "e.g. Shop Now"
                              : `Translate: "${form.top_bar?.link_text || "Shop Now"}"`
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none"
                        />
                      </div>
                    </div>

                    {/* Color selection */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Background Color
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        {PRESET_COLORS.map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            onClick={() => updateTopBar("bg_color", c.hex)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                              form.top_bar?.bg_color === c.hex
                                ? "ring-2 ring-offset-1 ring-gray-800 font-bold"
                                : "border-gray-200"
                            }`}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/10"
                              style={{ backgroundColor: c.hex }}
                            />
                            <span>{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="dismissible"
                        checked={form.top_bar?.dismissible !== false}
                        onChange={(e) => updateTopBar("dismissible", e.target.checked)}
                        className="rounded text-wbk-green focus:ring-wbk-green"
                      />
                      <label htmlFor="dismissible" className="text-xs text-gray-700 font-medium">
                        Dismissible by visitors (Displays close 'X' button)
                      </label>
                    </div>

                    {/* Live Preview */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                        Live Preview ({topBarLang.toUpperCase()})
                      </span>
                      <div
                        style={{
                          backgroundColor: form.top_bar?.bg_color || "#2D5A27",
                          color: form.top_bar?.text_color || "#FFFFFF",
                        }}
                        className="px-4 py-2 rounded-lg text-xs font-medium flex items-center justify-between shadow-sm"
                      >
                        <div className="flex items-center justify-center gap-2 flex-1 text-center">
                          {form.status === "preview" && (
                            <span className="bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded text-[10px] font-bold">
                              Admin Preview
                            </span>
                          )}
                          <span>
                            {(topBarLang === "en"
                              ? form.top_bar?.text
                              : form.top_bar?.translations?.[topBarLang]?.text || form.top_bar?.text) ||
                              "Announcement banner text will display here"}
                          </span>
                          {(topBarLang === "en"
                            ? form.top_bar?.link_text
                            : form.top_bar?.translations?.[topBarLang]?.link_text || form.top_bar?.link_text) && (
                            <span className="underline font-bold">
                              {topBarLang === "en"
                                ? form.top_bar?.link_text
                                : form.top_bar?.translations?.[topBarLang]?.link_text || form.top_bar?.link_text}{" "}
                              →
                            </span>
                          )}
                        </div>
                        {form.top_bar?.dismissible !== false && (
                          <span className="opacity-70">✕</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 5: HERO BANNER ── */}
            {activeTab === "hero" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">
                      Enable Homepage Hero Banner
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Overrides or rotates the main homepage hero background image and headlines
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.hero_banner?.enabled}
                    onChange={(e) => updateHero("enabled", e.target.checked)}
                    className="w-5 h-5 rounded text-wbk-green focus:ring-wbk-green"
                  />
                </div>

                {form.hero_banner?.enabled && (
                  <div className="space-y-4 p-4 rounded-xl border border-gray-200 bg-white">
                    {/* Multilingual Selector for Hero Content */}
                    <div className="flex flex-col gap-2 pb-3 border-b border-gray-100">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-xs text-gray-800 font-bold flex items-center gap-1.5">
                            <IconLanguage className="w-4 h-4 text-emerald-600" />
                            <span>Hero Content Language</span>
                          </span>
                          <span className="text-[11px] text-gray-500">
                            {heroLang === "en"
                              ? "Editing base English text (used as source for translations)"
                              : `Translating for ${STOREFRONT_LANGUAGES.find((l) => l.code === heroLang)?.label}`}
                          </span>
                        </div>

                        {/* Master Auto-Translate Button for Hero */}
                        <button
                          type="button"
                          onClick={handleAutoTranslateHeroAll}
                          disabled={translatingHero || !form.hero_banner?.headline}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                            translatingHero
                              ? "bg-amber-100 text-amber-900 border border-amber-300 cursor-wait"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 cursor-pointer"
                          } ${!form.hero_banner?.headline ? "opacity-50 cursor-not-allowed" : ""}`}
                          title="Automatically translate English hero texts (headline, subtitle, badge, buttons) into DE, FR, ES, IT, POR, US in 1 click"
                        >
                          {translatingHero ? (
                            <>
                              <IconLoader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Translating All Languages...</span>
                            </>
                          ) : (
                            <>
                              <IconSparkles className="w-3.5 h-3.5 text-amber-300" />
                              <span>Auto-Translate All Languages</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Translate Feedback Banner */}
                      {translateFeedback?.type === "hero" && (
                        <div
                          className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                            translateFeedback.isError
                              ? "bg-red-50 text-red-800 border border-red-200"
                              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {translateFeedback.isError ? (
                            <IconAlertCircle className="w-4 h-4 flex-shrink-0" />
                          ) : (
                            <IconCheck className="w-4 h-4 flex-shrink-0" />
                          )}
                          <span>{translateFeedback.message}</span>
                        </div>
                      )}

                      {/* Language Selection Pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                        {STOREFRONT_LANGUAGES.map((lang) => {
                          const isCurrent = heroLang === lang.code;
                          const hasTranslation =
                            lang.code === "en"
                              ? Boolean(form.hero_banner?.headline)
                              : Boolean(form.hero_banner?.translations?.[lang.code]?.headline);

                          return (
                            <button
                              key={lang.code}
                              type="button"
                              onClick={() => setHeroLang(lang.code)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                                isCurrent
                                  ? "bg-wbk-green text-white shadow-xs"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              <span>{lang.flag}</span>
                              <span>{lang.code.toUpperCase()}</span>
                              {hasTranslation && (
                                <span
                                  className={`text-[11px] font-bold ${
                                    isCurrent ? "text-emerald-200" : "text-emerald-700"
                                  }`}
                                >
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Current Language Fast Action Banner (when not EN) */}
                      {heroLang !== "en" && (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs mt-1">
                          <span className="text-emerald-900 font-medium">
                            Language: <strong>{STOREFRONT_LANGUAGES.find((l) => l.code === heroLang)?.label}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAutoTranslateHeroLang(heroLang)}
                            disabled={translatingSingle === `hero_${heroLang}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-semibold text-[11px] transition-colors shadow-xs cursor-pointer"
                          >
                            {translatingSingle === `hero_${heroLang}` ? (
                              <IconLoader2 className="w-3 h-3 animate-spin text-emerald-700" />
                            ) : (
                              <IconSparkles className="w-3 h-3 text-amber-600" />
                            )}
                            <span>Auto-Translate {heroLang.toUpperCase()}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-gray-700">
                          Badge Text ({heroLang.toUpperCase()})
                        </label>
                        {heroLang !== "en" && (
                          <div className="flex items-center gap-2">
                            {form.hero_banner?.badge && (
                              <button
                                type="button"
                                onClick={() => handleAutoTranslateHeroField(heroLang, "badge")}
                                disabled={translatingSingle === `hero_${heroLang}_badge`}
                                className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold inline-flex items-center gap-0.5 underline cursor-pointer"
                              >
                                {translatingSingle === `hero_${heroLang}_badge` ? (
                                  <IconLoader2 className="w-3 h-3 animate-spin inline" />
                                ) : (
                                  <IconSparkles className="w-3 h-3 inline text-amber-600" />
                                )}
                                <span>Auto-Translate</span>
                              </button>
                            )}
                            {form.hero_banner?.badge && (
                              <button
                                type="button"
                                onClick={() => updateHeroTranslation(heroLang, "badge", form.hero_banner.badge)}
                                className="text-[11px] text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-0.5"
                              >
                                <IconCopy className="w-3 h-3" />
                                <span>Copy EN</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        value={
                          heroLang === "en"
                            ? form.hero_banner?.badge || ""
                            : form.hero_banner?.translations?.[heroLang]?.badge || ""
                        }
                        onChange={(e) => updateHeroTranslation(heroLang, "badge", e.target.value)}
                        placeholder={
                          heroLang === "en"
                            ? "e.g. Weekend Flash Sale • 15% OFF"
                            : `Translate: "${form.hero_banner?.badge || "Flash Sale"}"`
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-gray-700">
                          Main Headline ({heroLang.toUpperCase()}) *
                        </label>
                        {heroLang !== "en" && (
                          <div className="flex items-center gap-2">
                            {form.hero_banner?.headline && (
                              <button
                                type="button"
                                onClick={() => handleAutoTranslateHeroField(heroLang, "headline")}
                                disabled={translatingSingle === `hero_${heroLang}_headline`}
                                className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold inline-flex items-center gap-0.5 underline cursor-pointer"
                              >
                                {translatingSingle === `hero_${heroLang}_headline` ? (
                                  <IconLoader2 className="w-3 h-3 animate-spin inline" />
                                ) : (
                                  <IconSparkles className="w-3 h-3 inline text-amber-600" />
                                )}
                                <span>Auto-Translate</span>
                              </button>
                            )}
                            {form.hero_banner?.headline && (
                              <button
                                type="button"
                                onClick={() => updateHeroTranslation(heroLang, "headline", form.hero_banner.headline)}
                                className="text-[11px] text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-0.5"
                              >
                                <IconCopy className="w-3 h-3" />
                                <span>Copy EN</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        value={
                          heroLang === "en"
                            ? form.hero_banner?.headline || ""
                            : form.hero_banner?.translations?.[heroLang]?.headline || ""
                        }
                        onChange={(e) => updateHeroTranslation(heroLang, "headline", e.target.value)}
                        placeholder={
                          heroLang === "en"
                            ? "e.g. Save 15% On Smart Furniture This Weekend"
                            : `Translate: "${form.hero_banner?.headline || "Headline"}"`
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-gray-700">
                          Subtitle ({heroLang.toUpperCase()})
                        </label>
                        {heroLang !== "en" && (
                          <div className="flex items-center gap-2">
                            {form.hero_banner?.subtitle && (
                              <button
                                type="button"
                                onClick={() => handleAutoTranslateHeroField(heroLang, "subtitle")}
                                disabled={translatingSingle === `hero_${heroLang}_subtitle`}
                                className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold inline-flex items-center gap-0.5 underline cursor-pointer"
                              >
                                {translatingSingle === `hero_${heroLang}_subtitle` ? (
                                  <IconLoader2 className="w-3 h-3 animate-spin inline" />
                                ) : (
                                  <IconSparkles className="w-3 h-3 inline text-amber-600" />
                                )}
                                <span>Auto-Translate</span>
                              </button>
                            )}
                            {form.hero_banner?.subtitle && (
                              <button
                                type="button"
                                onClick={() => updateHeroTranslation(heroLang, "subtitle", form.hero_banner.subtitle)}
                                className="text-[11px] text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-0.5"
                              >
                                <IconCopy className="w-3 h-3" />
                                <span>Copy EN</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <textarea
                        rows={2}
                        value={
                          heroLang === "en"
                            ? form.hero_banner?.subtitle || ""
                            : form.hero_banner?.translations?.[heroLang]?.subtitle || ""
                        }
                        onChange={(e) => updateHeroTranslation(heroLang, "subtitle", e.target.value)}
                        placeholder={
                          heroLang === "en"
                            ? "e.g. Premium handcrafted space-saving wall beds and smart tables at limited-time promotional prices."
                            : `Translate: "${form.hero_banner?.subtitle || "Subtitle"}"`
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none"
                      />
                    </div>

                    {/* Media Type Selection: Image vs Video */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Hero Background Media Type
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => updateHero("media_type", "image")}
                          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                            form.hero_banner?.media_type !== "video"
                              ? "bg-wbk-green text-white border-wbk-green"
                              : "border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <IconPhoto className="w-4 h-4" />
                          <span>Image Background</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateHero("media_type", "video");
                            if (!form.hero_banner?.video) {
                              updateHero("video", "/hero-video.mp4");
                            }
                          }}
                          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                            form.hero_banner?.media_type === "video"
                              ? "bg-wbk-green text-white border-wbk-green"
                              : "border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <IconVideo className="w-4 h-4" />
                          <span>Video Background (.mp4 / .webm)</span>
                        </button>
                      </div>
                    </div>

                    {/* Media Inputs based on Media Type */}
                    {form.hero_banner?.media_type === "video" ? (
                      <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-semibold text-blue-950 flex items-center gap-1">
                              <IconVideo className="w-3.5 h-3.5 text-blue-600" />
                              <span>Background Video URL (.mp4, .webm) *</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                updateHero("video", "/hero-video2.mp4");
                                if (!form.hero_banner?.image || form.hero_banner?.image.endsWith(".mp4")) {
                                  updateHero("image", "/hero-video2.png");
                                }
                              }}
                              className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 underline cursor-pointer"
                            >
                              Preset: /hero-video2.mp4
                            </button>
                          </div>
                          <input
                            type="text"
                            value={form.hero_banner?.video || ""}
                            onChange={(e) => updateHero("video", e.target.value)}
                            placeholder="/hero-video2.mp4"
                            className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg outline-none font-mono text-xs bg-white"
                          />
                          <p className="text-[11px] text-blue-700 mt-1">
                            Video will autoplay in a seamless loop (muted) across all devices. Videos placed in the project's <code className="font-mono bg-blue-100 px-1 py-0.5 rounded text-blue-900">public/</code> folder can be referenced directly with <code className="font-mono bg-blue-100 px-1 py-0.5 rounded text-blue-900">/hero-video2.mp4</code>.
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Fallback / Poster Image URL (shown while video buffers)
                          </label>
                          <input
                            type="text"
                            value={
                              form.hero_banner?.image && !/\.(mp4|webm|ogg|mov)($|\?)/i.test(form.hero_banner.image)
                                ? form.hero_banner.image
                                : ""
                            }
                            onChange={(e) => updateHero("image", e.target.value)}
                            placeholder="e.g. /hero-video2.png or image URL"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none font-mono text-xs bg-white"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Background Image URL *
                        </label>
                        <input
                          type="text"
                          value={form.hero_banner?.image || ""}
                          onChange={(e) => updateHero("image", e.target.value)}
                          placeholder="/hero2.webp or /product-images/tables/..."
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none font-mono text-xs"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-gray-700">
                            Primary CTA Button Text ({heroLang.toUpperCase()})
                          </label>
                          {heroLang !== "en" && (
                            <div className="flex items-center gap-2">
                              {form.hero_banner?.cta_text && (
                                <button
                                  type="button"
                                  onClick={() => handleAutoTranslateHeroField(heroLang, "cta_text")}
                                  disabled={translatingSingle === `hero_${heroLang}_cta_text`}
                                  className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold inline-flex items-center gap-0.5 underline cursor-pointer"
                                >
                                  {translatingSingle === `hero_${heroLang}_cta_text` ? (
                                    <IconLoader2 className="w-3 h-3 animate-spin inline" />
                                  ) : (
                                    <IconSparkles className="w-3 h-3 inline text-amber-600" />
                                  )}
                                  <span>Auto-Translate</span>
                                </button>
                              )}
                              {form.hero_banner?.cta_text && (
                                <button
                                  type="button"
                                  onClick={() => updateHeroTranslation(heroLang, "cta_text", form.hero_banner.cta_text)}
                                  className="text-[11px] text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-0.5"
                                >
                                  <IconCopy className="w-3 h-3" />
                                  <span>Copy EN</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        <input
                          type="text"
                          value={
                            heroLang === "en"
                              ? form.hero_banner?.cta_text || ""
                              : form.hero_banner?.translations?.[heroLang]?.cta_text || ""
                          }
                          onChange={(e) => updateHeroTranslation(heroLang, "cta_text", e.target.value)}
                          placeholder={
                            heroLang === "en"
                              ? "Explore Deals"
                              : `Translate: "${form.hero_banner?.cta_text || "Explore Deals"}"`
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Primary CTA Link
                        </label>
                        <input
                          type="text"
                          value={form.hero_banner?.cta_link || ""}
                          onChange={(e) => updateHero("cta_link", e.target.value)}
                          placeholder="/products"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-gray-700">
                            Secondary CTA Button Text ({heroLang.toUpperCase()})
                          </label>
                          {heroLang !== "en" && (
                            <div className="flex items-center gap-2">
                              {form.hero_banner?.secondary_cta_text && (
                                <button
                                  type="button"
                                  onClick={() => handleAutoTranslateHeroField(heroLang, "secondary_cta_text")}
                                  disabled={translatingSingle === `hero_${heroLang}_secondary_cta_text`}
                                  className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold inline-flex items-center gap-0.5 underline cursor-pointer"
                                >
                                  {translatingSingle === `hero_${heroLang}_secondary_cta_text` ? (
                                    <IconLoader2 className="w-3 h-3 animate-spin inline" />
                                  ) : (
                                    <IconSparkles className="w-3 h-3 inline text-amber-600" />
                                  )}
                                  <span>Auto-Translate</span>
                                </button>
                              )}
                              {form.hero_banner?.secondary_cta_text && (
                                <button
                                  type="button"
                                  onClick={() => updateHeroTranslation(heroLang, "secondary_cta_text", form.hero_banner.secondary_cta_text)}
                                  className="text-[11px] text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-0.5"
                                >
                                  <IconCopy className="w-3 h-3" />
                                  <span>Copy EN</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        <input
                          type="text"
                          value={
                            heroLang === "en"
                              ? form.hero_banner?.secondary_cta_text || ""
                              : form.hero_banner?.translations?.[heroLang]?.secondary_cta_text || ""
                          }
                          onChange={(e) => updateHeroTranslation(heroLang, "secondary_cta_text", e.target.value)}
                          placeholder={
                            heroLang === "en"
                              ? "e.g. View Tables"
                              : `Translate: "${form.hero_banner?.secondary_cta_text || "View Tables"}"`
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Secondary CTA Link
                        </label>
                        <input
                          type="text"
                          value={form.hero_banner?.secondary_cta_link || ""}
                          onChange={(e) => updateHero("secondary_cta_link", e.target.value)}
                          placeholder="/products/tables"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none"
                        />
                      </div>
                    </div>

                    {/* Live Hero Media & Banner Preview */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                        Live Hero Media Preview ({heroLang.toUpperCase()})
                      </span>
                      <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] rounded-xl overflow-hidden bg-neutral-900 flex items-center justify-center text-center p-4 border border-gray-200">
                        {form.hero_banner?.media_type === "video" && (form.hero_banner?.video || form.hero_banner?.image) ? (
                          <video
                            key={form.hero_banner?.video || form.hero_banner?.image}
                            src={form.hero_banner?.video || form.hero_banner?.image}
                            autoPlay
                            muted
                            loop
                            playsInline
                            poster={
                              form.hero_banner?.image && !/\.(mp4|webm|ogg|mov)($|\?)/i.test(form.hero_banner.image)
                                ? form.hero_banner.image
                                : undefined
                            }
                            className="absolute inset-0 w-full h-full object-cover opacity-85"
                          />
                        ) : form.hero_banner?.image && !/\.(mp4|webm|ogg|mov)($|\?)/i.test(form.hero_banner.image) ? (
                          <img
                            src={form.hero_banner.image}
                            alt="Hero Preview"
                            className="absolute inset-0 w-full h-full object-cover opacity-85"
                          />
                        ) : (
                          <div className="text-gray-400 text-xs">No media configured</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/35 pointer-events-none" />
                        <div className="relative z-10 max-w-lg text-white space-y-1 pointer-events-none">
                          {(heroLang === "en"
                            ? form.hero_banner?.badge
                            : form.hero_banner?.translations?.[heroLang]?.badge || form.hero_banner?.badge) && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-wbk-green text-[10px] font-bold uppercase tracking-wider shadow-sm">
                              {heroLang === "en"
                                ? form.hero_banner?.badge
                                : form.hero_banner?.translations?.[heroLang]?.badge || form.hero_banner?.badge}
                            </span>
                          )}
                          <h4 className="text-base sm:text-lg font-bold font-new-york leading-tight drop-shadow">
                            {(heroLang === "en"
                              ? form.hero_banner?.headline
                              : form.hero_banner?.translations?.[heroLang]?.headline || form.hero_banner?.headline) ||
                              "Your Headline Will Appear Here"}
                          </h4>
                          {(heroLang === "en"
                            ? form.hero_banner?.subtitle
                            : form.hero_banner?.translations?.[heroLang]?.subtitle || form.hero_banner?.subtitle) && (
                            <p className="text-[11px] text-white/90 line-clamp-1 drop-shadow">
                              {heroLang === "en"
                                ? form.hero_banner?.subtitle
                                : form.hero_banner?.translations?.[heroLang]?.subtitle || form.hero_banner?.subtitle}
                            </p>
                          )}
                          <div className="pt-1 flex items-center justify-center gap-2">
                            {(heroLang === "en"
                              ? form.hero_banner?.cta_text
                              : form.hero_banner?.translations?.[heroLang]?.cta_text || form.hero_banner?.cta_text) && (
                              <span className="px-3 py-1 bg-wbk-green text-white text-[10px] font-semibold uppercase tracking-wider rounded shadow-xs">
                                {heroLang === "en"
                                  ? form.hero_banner?.cta_text
                                  : form.hero_banner?.translations?.[heroLang]?.cta_text || form.hero_banner?.cta_text}
                              </span>
                            )}
                            {(heroLang === "en"
                              ? form.hero_banner?.secondary_cta_text
                              : form.hero_banner?.translations?.[heroLang]?.secondary_cta_text || form.hero_banner?.secondary_cta_text) && (
                              <span className="px-3 py-1 border border-white/60 text-white text-[10px] font-semibold uppercase tracking-wider rounded shadow-xs">
                                {heroLang === "en"
                                  ? form.hero_banner?.secondary_cta_text
                                  : form.hero_banner?.translations?.[heroLang]?.secondary_cta_text || form.hero_banner?.secondary_cta_text}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/70">
            {form.id && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete campaign "${form.name}"?`)) {
                    onDelete(form.id);
                  }
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                <IconTrash className="w-4 h-4" />
                Delete Campaign
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-wbk-green hover:bg-wbk-green/90 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <IconCheck className="w-4 h-4" />
                )}
                {form.id ? "Save Changes" : "Create Campaign"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
