"use client";

import { useState, useEffect } from "react";
import {
  IconX,
  IconCheck,
  IconAlertCircle,
  IconRefresh,
  IconTag,
  IconFolder,
  IconCurrencyPound,
  IconBox,
  IconWorld,
  IconLanguage,
  IconBrandYoutube,
  IconFileText,
  IconExternalLink,
} from "@tabler/icons-react";
import { TagIcon } from "@/components/ui/TagBadge";
import { parseYouTubeVideo, OFFICIAL_INSTALLATION_VIDEOS } from "@/lib/products";

const TARGET_LOCALES = [
  { code: "en", label: "UK", name: "United Kingdom", flag: "🇬🇧", currency: "GBP (£)" },
  { code: "us", label: "US", name: "United States", flag: "🇺🇸", currency: "USD ($)" },
  { code: "de", label: "DE", name: "Germany", flag: "🇩🇪", currency: "EUR (€)" },
  { code: "fr", label: "FR", name: "France", flag: "🇫🇷", currency: "EUR (€)" },
  { code: "es", label: "ES", name: "Spain", flag: "🇪🇸", currency: "EUR (€)" },
  { code: "por", label: "POR", name: "Portugal", flag: "🇵🇹", currency: "EUR (€)" },
  { code: "it", label: "IT", name: "Italy", flag: "🇮🇹", currency: "EUR (€)" },
];

export function BulkProductEditModal({
  isOpen,
  onClose,
  selectedProductIds = [],
  onBulkUpdateSuccess,
}) {
  const [categories, setCategories] = useState([]);
  const [tagsList, setTagsList] = useState([]);
  const [manualsList, setManualsList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Field activation flags (only enabled fields will be sent)
  const [enabledFields, setEnabledFields] = useState({
    parent_category: false,
    sub_category: false,
    type: false,
    orientation: false,
    visibility: false,
    backorder: false,
    warranty: false,
    color: false,
    tags: false,
    locales: false,
    stock: false,
    pricing: false,
    localized_names: false,
    gtins: false,
    installation_video: false,
    installation_manual: false,
  });

  // Field values
  const [values, setValues] = useState({
    parent_category: "beds",
    sub_category: "",
    type: "Classic",
    orientation: "Vertical",
    visibility: "Visible",
    backorder: true,
    warranty: "Lifetime on mechanism",
    color: "Black",
    name_en: "",
    name_us: "",
    name_de: "",
    name_fr: "",
    name_es: "",
    name_por: "",
    name_it: "",
    gtin_en: "",
    gtin_us: "",
    gtin_de: "",
    gtin_fr: "",
    gtin_es: "",
    gtin_por: "",
    gtin_it: "",
    installation_video: "",
    installation_manual: "",
  });

  // Country / Locale options
  const [localeAction, setLocaleAction] = useState("replace"); // "replace" | "add" | "remove" | "all"
  const [selectedLocales, setSelectedLocales] = useState(["en", "us", "de", "fr", "es", "por", "it"]);

  // Tag options
  const [tagAction, setTagAction] = useState("add"); // "add" | "replace" | "remove"
  const [selectedTags, setSelectedTags] = useState([]);

  // Stock options
  const [stockMode, setStockMode] = useState("set"); // "set" | "adjust"
  const [stockAmount, setStockAmount] = useState(50);

  // Pricing options
  const [pricingMode, setPricingMode] = useState("set_exact"); // "set_exact" | "percent_adjust" | "sale_percent" | "clear_sale"
  const [exactPrices, setExactPrices] = useState({ gbp: 799, euro: 799, usd: 799 });
  const [percentAdjust, setPercentAdjust] = useState(10);
  const [salePercent, setSalePercent] = useState(20);

  // Active section tab
  const [activeTab, setActiveTab] = useState("taxonomy"); // "taxonomy" | "markets" | "tags" | "inventory" | "pricing" | "names_gtins" | "guides"

  useEffect(() => {
    if (isOpen) {
      setError(null);
      // Fetch categories
      fetch("/api/admin/categories")
        .then((r) => r.json())
        .then((d) => {
          if (d.success && Array.isArray(d.categories)) setCategories(d.categories);
        })
        .catch(console.warn);

      // Fetch tags
      fetch("/api/admin/tags")
        .then((r) => r.json())
        .then((d) => {
          if (d.success && Array.isArray(d.tags)) setTagsList(d.tags);
        })
        .catch(console.warn);

      // Fetch manuals
      fetch("/api/admin/manuals")
        .then((r) => r.json())
        .then((d) => {
          if (d.success && Array.isArray(d.manuals)) setManualsList(d.manuals);
        })
        .catch(console.warn);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleField = (fieldKey) => {
    setEnabledFields((prev) => ({
      ...prev,
      [fieldKey]: !prev[fieldKey],
    }));
  };

  const handleValueChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    // Auto-enable this field
    setEnabledFields((prev) => ({ ...prev, [key]: true }));
  };

  const toggleTagSelection = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
    setEnabledFields((prev) => ({ ...prev, tags: true }));
  };

  const toggleLocaleSelection = (code) => {
    setSelectedLocales((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
    setEnabledFields((prev) => ({ ...prev, locales: true }));
  };

  const selectAllLocales = () => {
    setSelectedLocales(["en", "us", "de", "fr", "es", "por", "it"]);
    setEnabledFields((prev) => ({ ...prev, locales: true }));
  };

  const clearAllLocales = () => {
    setSelectedLocales([]);
    setEnabledFields((prev) => ({ ...prev, locales: true }));
  };

  const activeFieldsCount = Object.values(enabledFields).filter(Boolean).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeFieldsCount === 0) {
      setError("Please enable and select at least one field to update.");
      return;
    }

    setSaving(true);
    setError(null);

    const updates = {};
    if (enabledFields.parent_category) updates.parent_category = values.parent_category;
    if (enabledFields.sub_category) updates.sub_category = values.sub_category;
    if (enabledFields.type) updates.type = values.type;
    if (enabledFields.orientation) updates.orientation = values.orientation;
    if (enabledFields.visibility) updates.visibility = values.visibility;
    if (enabledFields.backorder) updates.backorder = Boolean(values.backorder);
    if (enabledFields.warranty) updates.warranty = values.warranty;
    if (enabledFields.color) updates.color = values.color;

    // Localized Product Names
    if (enabledFields.localized_names) {
      if (values.name_en?.trim()) updates.name_en = values.name_en.trim();
      if (values.name_us?.trim()) updates.name_us = values.name_us.trim();
      if (values.name_de?.trim()) updates.name_de = values.name_de.trim();
      if (values.name_fr?.trim()) updates.name_fr = values.name_fr.trim();
      if (values.name_es?.trim()) updates.name_es = values.name_es.trim();
      if (values.name_por?.trim()) {
        updates.name_por = values.name_por.trim();
        updates.name_pt = values.name_por.trim();
      }
      if (values.name_it?.trim()) updates.name_it = values.name_it.trim();
    }

    // Localized GTIN Barcodes
    if (enabledFields.gtins) {
      if (values.gtin_en?.trim()) {
        updates.gtin_en = values.gtin_en.trim();
        updates.ean_uk = values.gtin_en.trim();
      }
      if (values.gtin_us?.trim()) {
        updates.gtin_us = values.gtin_us.trim();
        updates.ean_us = values.gtin_us.trim();
      }
      if (values.gtin_de?.trim()) {
        updates.gtin_de = values.gtin_de.trim();
        updates.ean_de = values.gtin_de.trim();
      }
      if (values.gtin_fr?.trim()) {
        updates.gtin_fr = values.gtin_fr.trim();
        updates.ean_fr = values.gtin_fr.trim();
      }
      if (values.gtin_es?.trim()) {
        updates.gtin_es = values.gtin_es.trim();
        updates.ean_es = values.gtin_es.trim();
      }
      if (values.gtin_por?.trim()) {
        updates.gtin_por = values.gtin_por.trim();
        updates.gtin_pt = values.gtin_por.trim();
        updates.ean_pt = values.gtin_por.trim();
      }
      if (values.gtin_it?.trim()) {
        updates.gtin_it = values.gtin_it.trim();
        updates.ean_it = values.gtin_it.trim();
      }
    }

    // Installation Video & Assembly Manual
    if (enabledFields.installation_video) {
      updates.installation_video = values.installation_video !== undefined ? values.installation_video.trim() : "";
    }
    if (enabledFields.installation_manual) {
      updates.installation_manual = values.installation_manual !== undefined ? values.installation_manual.trim() : "";
    }

    const payload = {
      ids: selectedProductIds,
      action: "update",
      updates,
    };

    // Target Markets / Locales
    if (enabledFields.locales) {
      payload.localeAction = localeAction;
      payload.locales = selectedLocales;
    }

    // Tags
    if (enabledFields.tags) {
      if (tagAction === "remove" && selectedTags.length === 0) {
        setError("Please select at least one tag to remove below, or choose 'Clear All Tags'.");
        setSaving(false);
        return;
      }
      payload.tagAction = tagAction;
      payload.tags = selectedTags;
    }

    // Stock
    if (enabledFields.stock) {
      payload.stockAdjustment = {
        type: stockMode,
        amount: Number(stockAmount),
      };
    }

    // Pricing
    if (enabledFields.pricing) {
      if (pricingMode === "set_exact") {
        if (exactPrices.gbp) updates.price_gbp = Number(exactPrices.gbp);
        if (exactPrices.euro) updates.price_euro = Number(exactPrices.euro);
        if (exactPrices.usd) updates.price_usd = Number(exactPrices.usd);
      } else if (pricingMode === "percent_adjust") {
        payload.priceAdjustment = {
          type: "percent",
          percent: Number(percentAdjust),
        };
      } else if (pricingMode === "sale_percent") {
        updates.sale_percent = Number(salePercent);
      } else if (pricingMode === "clear_sale") {
        updates.sale_percent = null;
        updates.sale_fix_gbp = null;
        updates.sale_fix_euro = null;
        updates.sale_fix_usd = null;
        updates.sale_price_gbp = null;
        updates.sale_price_euro = null;
        updates.sale_price_usd = null;
      }
    }

    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        onBulkUpdateSuccess?.(data);
        onClose();
      } else {
        setError(data.error || "Failed to perform bulk update.");
      }
    } catch (err) {
      setError("Network error while applying bulk updates.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-white shadow-2xl z-50 flex flex-col font-poppins max-h-[90vh] overflow-hidden border border-wbk-lightgrey/80">
        {/* Header */}
        <div className="px-6 py-4 bg-[#090A0A] text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-wbk-gold uppercase tracking-wider">
                Bulk Product Editor
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-wbk-gold text-wbk-black font-bold">
                {selectedProductIds.length} Products Selected
              </span>
            </div>
            <p className="text-xs text-white/70 mt-0.5">
              Only checked fields will be applied across all selected products.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border-b border-red-200 text-red-800 text-xs flex items-center gap-2 shrink-0">
            <IconAlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-wbk-lightgrey bg-[#F4F2F0] px-6 text-xs shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("taxonomy")}
            className={`py-3 px-4 font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "taxonomy"
                ? "border-wbk-black text-wbk-black bg-white"
                : "border-transparent text-wbk-brown hover:text-wbk-black"
            }`}
          >
            <IconFolder size={15} />
            <span>Taxonomy & Category</span>
            {(enabledFields.parent_category ||
              enabledFields.sub_category ||
              enabledFields.type ||
              enabledFields.orientation ||
              enabledFields.visibility) && (
              <span className="w-2 h-2 rounded-full bg-wbk-gold shrink-0" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("markets")}
            className={`py-3 px-4 font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "markets"
                ? "border-wbk-black text-wbk-black bg-white"
                : "border-transparent text-wbk-brown hover:text-wbk-black"
            }`}
          >
            <IconWorld size={15} />
            <span>Target Markets</span>
            {enabledFields.locales && (
              <span className="w-2 h-2 rounded-full bg-wbk-gold shrink-0" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tags")}
            className={`py-3 px-4 font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "tags"
                ? "border-wbk-black text-wbk-black bg-white"
                : "border-transparent text-wbk-brown hover:text-wbk-black"
            }`}
          >
            <IconTag size={15} />
            <span>Tags & Badges</span>
            {enabledFields.tags && (
              <span className="w-2 h-2 rounded-full bg-wbk-gold shrink-0" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pricing")}
            className={`py-3 px-4 font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "pricing"
                ? "border-wbk-black text-wbk-black bg-white"
                : "border-transparent text-wbk-brown hover:text-wbk-black"
            }`}
          >
            <IconCurrencyPound size={15} />
            <span>Pricing & Discounts</span>
            {enabledFields.pricing && (
              <span className="w-2 h-2 rounded-full bg-wbk-gold shrink-0" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("inventory")}
            className={`py-3 px-4 font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "inventory"
                ? "border-wbk-black text-wbk-black bg-white"
                : "border-transparent text-wbk-brown hover:text-wbk-black"
            }`}
          >
            <IconBox size={15} />
            <span>Stock & Warranty</span>
            {(enabledFields.stock ||
              enabledFields.warranty ||
              enabledFields.backorder ||
              enabledFields.color) && (
              <span className="w-2 h-2 rounded-full bg-wbk-gold shrink-0" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("names_gtins")}
            className={`py-3 px-4 font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "names_gtins"
                ? "border-wbk-black text-wbk-black bg-white"
                : "border-transparent text-wbk-brown hover:text-wbk-black"
            }`}
          >
            <IconLanguage size={15} />
            <span>Names & GTINs</span>
            {(enabledFields.localized_names || enabledFields.gtins) && (
              <span className="w-2 h-2 rounded-full bg-wbk-gold shrink-0" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("guides")}
            className={`py-3 px-4 font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "guides"
                ? "border-wbk-black text-wbk-black bg-white"
                : "border-transparent text-wbk-brown hover:text-wbk-black"
            }`}
          >
            <IconBrandYoutube size={15} />
            <span>Guides &amp; Videos</span>
            {(enabledFields.installation_video || enabledFields.installation_manual) && (
              <span className="w-2 h-2 rounded-full bg-wbk-gold shrink-0" />
            )}
          </button>
        </div>

        {/* Form Body */}
        <form
          id="bulkEditForm"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#FBF9F8]"
        >
          {/* TAB 1: Taxonomy & Category */}
          {activeTab === "taxonomy" && (
            <div className="space-y-5 bg-white p-5 border border-wbk-lightgrey/60">
              <h4 className="text-xs font-semibold text-wbk-black uppercase tracking-wider">
                Category, Type & Status Settings
              </h4>

              {/* Parent Category */}
              <div className="p-3 bg-[#FBF9F8] border border-wbk-lightgrey/50 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enabledFields.parent_category}
                    onChange={() => toggleField("parent_category")}
                    className="accent-wbk-gold w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-wbk-black">
                    Update Primary Category
                  </span>
                </label>
                {enabledFields.parent_category && (
                  <select
                    value={values.parent_category}
                    onChange={(e) => handleValueChange("parent_category", e.target.value)}
                    className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none font-medium"
                  >
                    {categories.length > 0 ? (
                      categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name || c.title} ({c.id})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="beds">Murphy Beds (beds)</option>
                        <option value="sofas">Sofas (sofas)</option>
                        <option value="tables">Tables (tables)</option>
                        <option value="mattresses">Mattresses (mattresses)</option>
                        <option value="cabinets">Cabinets (cabinets)</option>
                        <option value="extras">Extras & Accessories (extras)</option>
                      </>
                    )}
                  </select>
                )}
              </div>

              {/* Sub Category */}
              <div className="p-3 bg-[#FBF9F8] border border-wbk-lightgrey/50 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enabledFields.sub_category}
                    onChange={() => toggleField("sub_category")}
                    className="accent-wbk-gold w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-wbk-black">
                    Update Sub-Category / Line
                  </span>
                </label>
                {enabledFields.sub_category && (
                  <input
                    type="text"
                    placeholder="e.g. Classic Vertical or Modular 2-Seater"
                    value={values.sub_category}
                    onChange={(e) => handleValueChange("sub_category", e.target.value)}
                    className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none"
                  />
                )}
              </div>

              {/* Bed / Furniture Type */}
              <div className="p-3 bg-[#FBF9F8] border border-wbk-lightgrey/50 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enabledFields.type}
                    onChange={() => toggleField("type")}
                    className="accent-wbk-gold w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-wbk-black">
                    Update Bed / Furniture Type
                  </span>
                </label>
                {enabledFields.type && (
                  <select
                    value={values.type}
                    onChange={(e) => handleValueChange("type", e.target.value)}
                    className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none"
                  >
                    <option value="Classic">Classic</option>
                    <option value="Studio">Studio</option>
                    <option value="Integrated">Integrated</option>
                    <option value="Transforming">Transforming</option>
                    <option value="Wall-Mounted">Wall-Mounted</option>
                    <option value="Extending">Extending</option>
                    <option value="Coffee & Side">Coffee & Side</option>
                    <option value="Modular">Modular</option>
                  </select>
                )}
              </div>

              {/* Orientation */}
              <div className="p-3 bg-[#FBF9F8] border border-wbk-lightgrey/50 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enabledFields.orientation}
                    onChange={() => toggleField("orientation")}
                    className="accent-wbk-gold w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-wbk-black">
                    Update Orientation
                  </span>
                </label>
                {enabledFields.orientation && (
                  <select
                    value={values.orientation}
                    onChange={(e) => handleValueChange("orientation", e.target.value)}
                    className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none"
                  >
                    <option value="Vertical">Vertical</option>
                    <option value="Horizontal">Horizontal</option>
                  </select>
                )}
              </div>

              {/* Visibility Status */}
              <div className="p-3 bg-[#FBF9F8] border border-wbk-lightgrey/50 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enabledFields.visibility}
                    onChange={() => toggleField("visibility")}
                    className="accent-wbk-gold w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-wbk-black">
                    Update Visibility Status
                  </span>
                </label>
                {enabledFields.visibility && (
                  <select
                    value={values.visibility}
                    onChange={(e) => handleValueChange("visibility", e.target.value)}
                    className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none"
                  >
                    <option value="Visible">Visible (Published on Storefront)</option>
                    <option value="Hidden">Hidden (Draft / Unpublished)</option>
                  </select>
                )}
              </div>
            </div>
          )}

          {/* TAB: Target Markets & Country Visibility */}
          {activeTab === "markets" && (
            <div className="space-y-5 bg-white p-5 border border-wbk-lightgrey/60">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-wbk-black uppercase tracking-wider flex items-center gap-1.5">
                    <IconWorld size={16} className="text-wbk-gold" />
                    <span>Bulk Country & Market Availability</span>
                  </h4>
                  <p className="text-xs text-wbk-brown mt-0.5">
                    Configure which language countries / regional storefronts display the selected products.
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none bg-[#F4F2F0] px-3 py-1.5 border border-wbk-lightgrey">
                  <input
                    type="checkbox"
                    checked={enabledFields.locales}
                    onChange={() => toggleField("locales")}
                    className="accent-wbk-gold w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-wbk-black">
                    Apply Market Visibility
                  </span>
                </label>
              </div>

              {enabledFields.locales && (
                <div className="space-y-4 pt-2 border-t border-wbk-lightgrey/40">
                  {/* Market Action Mode */}
                  <div>
                    <label className="block text-xs font-semibold uppercase text-wbk-black mb-2">
                      Operation Mode:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setLocaleAction("replace")}
                        className={`p-2.5 text-xs text-left border transition-all cursor-pointer ${
                          localeAction === "replace"
                            ? "border-wbk-black bg-[#090A0A] text-white font-medium"
                            : "border-wbk-lightgrey bg-white text-wbk-brown hover:border-wbk-black"
                        }`}
                      >
                        <div className="font-semibold">Set Exact</div>
                        <div className="text-[10px] opacity-80 mt-0.5">
                          Replace with chosen markets
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLocaleAction("add")}
                        className={`p-2.5 text-xs text-left border transition-all cursor-pointer ${
                          localeAction === "add"
                            ? "border-wbk-black bg-[#090A0A] text-white font-medium"
                            : "border-wbk-lightgrey bg-white text-wbk-brown hover:border-wbk-black"
                        }`}
                      >
                        <div className="font-semibold">Add Markets</div>
                        <div className="text-[10px] opacity-80 mt-0.5">
                          Keep existing and add chosen
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLocaleAction("remove")}
                        className={`p-2.5 text-xs text-left border transition-all cursor-pointer ${
                          localeAction === "remove"
                            ? "border-wbk-black bg-[#090A0A] text-white font-medium"
                            : "border-wbk-lightgrey bg-white text-wbk-brown hover:border-wbk-black"
                        }`}
                      >
                        <div className="font-semibold">Remove Markets</div>
                        <div className="text-[10px] opacity-80 mt-0.5">
                          Hide from chosen markets
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setLocaleAction("all");
                          selectAllLocales();
                        }}
                        className={`p-2.5 text-xs text-left border transition-all cursor-pointer ${
                          localeAction === "all"
                            ? "border-wbk-black bg-[#090A0A] text-white font-medium"
                            : "border-wbk-lightgrey bg-white text-wbk-brown hover:border-wbk-black"
                        }`}
                      >
                        <div className="font-semibold">All Markets</div>
                        <div className="text-[10px] opacity-80 mt-0.5">
                          Make visible in all 7 countries
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Market Selection Grid */}
                  {localeAction !== "all" && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold uppercase text-wbk-black">
                          Select Target Countries ({selectedLocales.length} of 7 selected):
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={selectAllLocales}
                            className="text-[11px] text-wbk-black hover:text-wbk-gold font-medium underline cursor-pointer"
                          >
                            Select All
                          </button>
                          <span className="text-wbk-brown/40">|</span>
                          <button
                            type="button"
                            onClick={clearAllLocales}
                            className="text-[11px] text-wbk-brown hover:text-red-600 font-medium underline cursor-pointer"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 p-3 bg-[#FBF9F8] border border-wbk-lightgrey">
                        {TARGET_LOCALES.map((loc) => {
                          const isSelected = selectedLocales.includes(loc.code);
                          return (
                            <label
                              key={loc.code}
                              className={`flex items-center justify-between p-3 border cursor-pointer select-none transition-all ${
                                isSelected
                                  ? "bg-amber-50/40 border-wbk-black shadow-2xs font-medium"
                                  : "bg-white border-wbk-lightgrey/80 opacity-60 hover:opacity-100 hover:border-wbk-black"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleLocaleSelection(loc.code)}
                                  className="accent-wbk-gold w-4 h-4 cursor-pointer"
                                />
                                <div>
                                  <div className="flex items-center gap-1.5 text-xs text-wbk-black">
                                    <span className="text-base leading-none">{loc.flag}</span>
                                    <span>{loc.label}</span>
                                    <span className="text-[10px] text-wbk-brown font-normal">({loc.code})</span>
                                  </div>
                                  <div className="text-[10px] text-wbk-brown mt-0.5">
                                    {loc.name} &bull; {loc.currency}
                                  </div>
                                </div>
                              </div>
                              {isSelected && (
                                <IconCheck size={14} className="text-wbk-gold" />
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
                    <strong>Note:</strong> Selected changes will be applied to all{" "}
                    <strong>{selectedProductIds.length}</strong> selected products simultaneously upon saving.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Tags & Badges */}
          {activeTab === "tags" && (
            <div className="space-y-5 bg-white p-5 border border-wbk-lightgrey/60">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-wbk-black uppercase tracking-wider">
                    Bulk Tag Management
                  </h4>
                  <p className="text-xs text-wbk-brown mt-0.5">
                    Assign, replace, or remove tags from all selected products simultaneously.
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none bg-[#F4F2F0] px-3 py-1.5 border border-wbk-lightgrey">
                  <input
                    type="checkbox"
                    checked={enabledFields.tags}
                    onChange={() => toggleField("tags")}
                    className="accent-wbk-gold w-4 h-4"
                  />
                  <span className="text-xs font-bold text-wbk-black uppercase">
                    Enable Tag Changes
                  </span>
                </label>
              </div>

              {enabledFields.tags && (
                <div className="space-y-4 pt-2 border-t border-wbk-lightgrey/40">
                  {/* Tag Action Mode */}
                  <div>
                    <label className="block text-xs font-semibold uppercase text-wbk-black mb-2">
                      Tag Operation Mode:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setTagAction("add")}
                        className={`p-2.5 text-xs text-left border transition-all cursor-pointer ${
                          tagAction === "add"
                            ? "border-wbk-black bg-[#090A0A] text-white font-medium"
                            : "border-wbk-lightgrey bg-white text-wbk-brown hover:border-wbk-black"
                        }`}
                      >
                        <div className="font-semibold">Add to Existing</div>
                        <div className="text-[10px] opacity-80 mt-0.5">
                          Keep current & add chosen
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTagAction("replace")}
                        className={`p-2.5 text-xs text-left border transition-all cursor-pointer ${
                          tagAction === "replace"
                            ? "border-wbk-black bg-[#090A0A] text-white font-medium"
                            : "border-wbk-lightgrey bg-white text-wbk-brown hover:border-wbk-black"
                        }`}
                      >
                        <div className="font-semibold">Replace All</div>
                        <div className="text-[10px] opacity-80 mt-0.5">
                          Overwrite with selection
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTagAction("remove")}
                        className={`p-2.5 text-xs text-left border transition-all cursor-pointer ${
                          tagAction === "remove"
                            ? "border-wbk-black bg-[#090A0A] text-white font-medium"
                            : "border-wbk-lightgrey bg-white text-wbk-brown hover:border-wbk-black"
                        }`}
                      >
                        <div className="font-semibold">Remove Tags</div>
                        <div className="text-[10px] opacity-80 mt-0.5">
                          Remove chosen tags below
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTagAction("clear");
                          setSelectedTags([]);
                        }}
                        className={`p-2.5 text-xs text-left border transition-all cursor-pointer ${
                          tagAction === "clear"
                            ? "border-red-600 bg-red-600 text-white font-medium"
                            : "border-wbk-lightgrey bg-white text-red-600 hover:border-red-600"
                        }`}
                      >
                        <div className="font-semibold">Clear All Tags</div>
                        <div className="text-[10px] opacity-80 mt-0.5">
                          Remove all tags from items
                        </div>
                      </button>
                    </div>
                  </div>

                  {tagAction === "clear" ? (
                    <div className="p-3.5 bg-red-50 border border-red-200 text-xs text-red-800">
                      <strong>Warning:</strong> All assigned tags will be completely removed from all{" "}
                      <strong>{selectedProductIds.length}</strong> selected products upon saving.
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold uppercase text-wbk-black">
                          {tagAction === "remove" ? "Select Tags to Remove:" : "Select Target Tags:"} ({selectedTags.length} selected):
                        </label>
                        {tagAction === "remove" && selectedTags.length === 0 && (
                          <span className="text-[11px] text-amber-700 font-medium">
                            Pick which tag(s) to remove below
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 p-3 bg-[#FBF9F8] border border-wbk-lightgrey">
                        {tagsList.length === 0 ? (
                          <span className="text-xs text-wbk-brown italic">
                            Loading tags...
                          </span>
                        ) : (
                          tagsList.map((tag) => {
                            const isSelected = selectedTags.includes(tag.id || tag.slug);

                            return (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => toggleTagSelection(tag.id || tag.slug)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-all border select-none cursor-pointer rounded-full ${
                                  isSelected
                                    ? "bg-wbk-black text-white border-wbk-black shadow-xs font-medium"
                                    : "bg-white border-wbk-lightgrey/80 text-wbk-black hover:border-wbk-black"
                                }`}
                              >
                                <TagIcon
                                  tagIdOrSlug={tag.id}
                                  iconName={tag.icon}
                                  size={12}
                                  className={isSelected ? "text-white/80 shrink-0" : "text-wbk-black/70 shrink-0"}
                                />
                                <span>{tag.name}</span>
                                {isSelected && (
                                  <IconCheck size={12} className="stroke-[2.5] text-white ml-0.5" />
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Pricing & Discounts */}
          {activeTab === "pricing" && (
            <div className="space-y-5 bg-white p-5 border border-wbk-lightgrey/60">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-wbk-black uppercase tracking-wider">
                    Bulk Pricing & Sales Adjustments
                  </h4>
                  <p className="text-xs text-wbk-brown mt-0.5">
                    Modify prices across currencies or trigger sales events.
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none bg-[#F4F2F0] px-3 py-1.5 border border-wbk-lightgrey">
                  <input
                    type="checkbox"
                    checked={enabledFields.pricing}
                    onChange={() => toggleField("pricing")}
                    className="accent-wbk-gold w-4 h-4"
                  />
                  <span className="text-xs font-bold text-wbk-black uppercase">
                    Enable Pricing Changes
                  </span>
                </label>
              </div>

              {enabledFields.pricing && (
                <div className="space-y-4 pt-2 border-t border-wbk-lightgrey/40">
                  {/* Pricing Operation Mode */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setPricingMode("set_exact")}
                      className={`p-2.5 text-xs text-left border transition-all cursor-pointer ${
                        pricingMode === "set_exact"
                          ? "border-wbk-black bg-[#090A0A] text-white font-medium"
                          : "border-wbk-lightgrey bg-white text-wbk-brown hover:border-wbk-black"
                      }`}
                    >
                      <div className="font-semibold">Set Fixed Price</div>
                      <div className="text-[10px] opacity-80 mt-0.5">Exact amount</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPricingMode("percent_adjust")}
                      className={`p-2.5 text-xs text-left border transition-all cursor-pointer ${
                        pricingMode === "percent_adjust"
                          ? "border-wbk-black bg-[#090A0A] text-white font-medium"
                          : "border-wbk-lightgrey bg-white text-wbk-brown hover:border-wbk-black"
                      }`}
                    >
                      <div className="font-semibold">Adjust %</div>
                      <div className="text-[10px] opacity-80 mt-0.5">Raise or lower</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPricingMode("sale_percent")}
                      className={`p-2.5 text-xs text-left border transition-all cursor-pointer ${
                        pricingMode === "sale_percent"
                          ? "border-wbk-black bg-[#090A0A] text-white font-medium"
                          : "border-wbk-lightgrey bg-white text-wbk-brown hover:border-wbk-black"
                      }`}
                    >
                      <div className="font-semibold">Apply Sale %</div>
                      <div className="text-[10px] opacity-80 mt-0.5">Discount event</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPricingMode("clear_sale")}
                      className={`p-2.5 text-xs text-left border transition-all cursor-pointer ${
                        pricingMode === "clear_sale"
                          ? "border-wbk-black bg-[#090A0A] text-white font-medium"
                          : "border-wbk-lightgrey bg-white text-wbk-brown hover:border-wbk-black"
                      }`}
                    >
                      <div className="font-semibold">Clear Sales</div>
                      <div className="text-[10px] opacity-80 mt-0.5">Revert discounts</div>
                    </button>
                  </div>

                  {/* Specific Controls per mode */}
                  {pricingMode === "set_exact" && (
                    <div className="grid grid-cols-3 gap-3 p-4 bg-[#FBF9F8] border border-wbk-lightgrey">
                      <div>
                        <label className="block text-xs font-medium text-wbk-black mb-1">
                          Price GBP (£)
                        </label>
                        <input
                          type="number"
                          value={exactPrices.gbp}
                          onChange={(e) =>
                            setExactPrices((p) => ({ ...p, gbp: e.target.value }))
                          }
                          className="w-full p-2 text-xs bg-white border border-wbk-lightgrey font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-wbk-black mb-1">
                          Price EUR (€)
                        </label>
                        <input
                          type="number"
                          value={exactPrices.euro}
                          onChange={(e) =>
                            setExactPrices((p) => ({ ...p, euro: e.target.value }))
                          }
                          className="w-full p-2 text-xs bg-white border border-wbk-lightgrey font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-wbk-black mb-1">
                          Price USD ($)
                        </label>
                        <input
                          type="number"
                          value={exactPrices.usd}
                          onChange={(e) =>
                            setExactPrices((p) => ({ ...p, usd: e.target.value }))
                          }
                          className="w-full p-2 text-xs bg-white border border-wbk-lightgrey font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {pricingMode === "percent_adjust" && (
                    <div className="p-4 bg-[#FBF9F8] border border-wbk-lightgrey space-y-2">
                      <label className="block text-xs font-medium text-wbk-black">
                        Price Percentage Adjustment (+ for price increase, - for price drop)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          value={percentAdjust}
                          onChange={(e) => setPercentAdjust(e.target.value)}
                          className="w-32 p-2 text-xs bg-white border border-wbk-lightgrey font-mono font-bold"
                          placeholder="e.g. 10 or -15"
                        />
                        <span className="text-xs text-wbk-brown font-mono">%</span>
                        <span className="text-xs text-wbk-brown italic">
                          (Example: 10 increases £500 to £550; -20 reduces £500 to £400)
                        </span>
                      </div>
                    </div>
                  )}

                  {pricingMode === "sale_percent" && (
                    <div className="p-4 bg-[#FBF9F8] border border-wbk-lightgrey space-y-2">
                      <label className="block text-xs font-medium text-wbk-black">
                        Sale Discount Percentage
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={salePercent}
                          onChange={(e) => setSalePercent(e.target.value)}
                          className="w-32 p-2 text-xs bg-white border border-wbk-lightgrey font-mono font-bold text-red-600"
                        />
                        <span className="text-xs text-wbk-brown font-mono">% OFF</span>
                        <span className="text-xs text-wbk-brown">
                          Displays red sale badge across UK, EU, and US storefronts.
                        </span>
                      </div>
                    </div>
                  )}

                  {pricingMode === "clear_sale" && (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                      All promotional discounts and sale prices on selected products will be removed.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Stock & Inventory & Specs */}
          {activeTab === "inventory" && (
            <div className="space-y-5 bg-white p-5 border border-wbk-lightgrey/60">
              <h4 className="text-xs font-semibold text-wbk-black uppercase tracking-wider">
                Inventory & Details
              </h4>

              {/* Stock units */}
              <div className="p-3 bg-[#FBF9F8] border border-wbk-lightgrey/50 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enabledFields.stock}
                    onChange={() => toggleField("stock")}
                    className="accent-wbk-gold w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-wbk-black">
                    Update Stock Inventory
                  </span>
                </label>
                {enabledFields.stock && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-4 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="stockMode"
                          checked={stockMode === "set"}
                          onChange={() => setStockMode("set")}
                          className="accent-wbk-gold"
                        />
                        <span>Set Exact Amount</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="stockMode"
                          checked={stockMode === "adjust"}
                          onChange={() => setStockMode("adjust")}
                          className="accent-wbk-gold"
                        />
                        <span>Adjust Units (+/-)</span>
                      </label>
                    </div>

                    <input
                      type="number"
                      value={stockAmount}
                      onChange={(e) => setStockAmount(e.target.value)}
                      className="w-36 p-2 text-xs bg-white border border-wbk-lightgrey font-mono font-medium"
                    />
                  </div>
                )}
              </div>

              {/* Warranty */}
              <div className="p-3 bg-[#FBF9F8] border border-wbk-lightgrey/50 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enabledFields.warranty}
                    onChange={() => toggleField("warranty")}
                    className="accent-wbk-gold w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-wbk-black">
                    Update Warranty Statement
                  </span>
                </label>
                {enabledFields.warranty && (
                  <input
                    type="text"
                    value={values.warranty}
                    onChange={(e) => handleValueChange("warranty", e.target.value)}
                    className="w-full p-2 text-xs bg-white border border-wbk-lightgrey"
                  />
                )}
              </div>

              {/* Backorder status */}
              <div className="p-3 bg-[#FBF9F8] border border-wbk-lightgrey/50 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enabledFields.backorder}
                    onChange={() => toggleField("backorder")}
                    className="accent-wbk-gold w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-wbk-black">
                    Update Backorder Allowance
                  </span>
                </label>
                {enabledFields.backorder && (
                  <select
                    value={values.backorder ? "true" : "false"}
                    onChange={(e) => handleValueChange("backorder", e.target.value === "true")}
                    className="w-full p-2 text-xs bg-white border border-wbk-lightgrey"
                  >
                    <option value="true">Allowed (Accept orders when out of stock)</option>
                    <option value="false">Disallowed (Strict inventory)</option>
                  </select>
                )}
              </div>

              {/* Color */}
              <div className="p-3 bg-[#FBF9F8] border border-wbk-lightgrey/50 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enabledFields.color}
                    onChange={() => toggleField("color")}
                    className="accent-wbk-gold w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-wbk-black">
                    Update Color Spec
                  </span>
                </label>
                {enabledFields.color && (
                  <input
                    type="text"
                    placeholder="e.g. Classic Black, White Satin, Anthracite"
                    value={values.color}
                    onChange={(e) => handleValueChange("color", e.target.value)}
                    className="w-full p-2 text-xs bg-white border border-wbk-lightgrey"
                  />
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Localized Names & GTINs */}
          {activeTab === "names_gtins" && (
            <div className="space-y-6 bg-white p-5 border border-wbk-lightgrey/60">
              <div>
                <h4 className="text-xs font-semibold text-wbk-black uppercase tracking-wider">
                  Bulk Override Localized Names & GTINs
                </h4>
                <p className="text-[11px] text-wbk-brown mt-0.5">
                  Update product names and GTIN barcodes across all 7 supported storefront markets simultaneously.
                </p>
              </div>

              {/* Localized Names Group */}
              <div className="p-4 bg-[#FAF9F7] border border-wbk-lightgrey/80 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enabledFields.localized_names}
                      onChange={() => toggleField("localized_names")}
                      className="accent-wbk-gold w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-wbk-black">
                      Bulk Update Localized Names
                    </span>
                  </label>
                  {enabledFields.localized_names && (
                    <span className="text-[10px] bg-wbk-gold/20 text-wbk-black font-semibold px-2 py-0.5 rounded-full">
                      Enabled
                    </span>
                  )}
                </div>

                {enabledFields.localized_names && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {[
                      { key: "name_en", label: "UK / English (EN)", flag: "🇬🇧", placeholder: "English product name" },
                      { key: "name_us", label: "United States (US)", flag: "🇺🇸", placeholder: "US product name" },
                      { key: "name_de", label: "Germany (DE)", flag: "🇩🇪", placeholder: "Deutscher Produktname" },
                      { key: "name_fr", label: "France (FR)", flag: "🇫🇷", placeholder: "Nom du produit en français" },
                      { key: "name_es", label: "Spain (ES)", flag: "🇪🇸", placeholder: "Nombre en español" },
                      { key: "name_por", label: "Portugal (POR)", flag: "🇵🇹", placeholder: "Nome em português" },
                      { key: "name_it", label: "Italy (IT)", flag: "🇮🇹", placeholder: "Nome in italiano" },
                    ].map((loc) => (
                      <div key={loc.key} className="space-y-1">
                        <label className="text-[10px] font-semibold text-wbk-brown flex items-center gap-1.5">
                          <span className="text-sm">{loc.flag}</span>
                          <span>{loc.label}</span>
                        </label>
                        <input
                          type="text"
                          placeholder={loc.placeholder}
                          value={values[loc.key] || ""}
                          onChange={(e) => handleValueChange(loc.key, e.target.value)}
                          className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Localized GTIN Barcodes Group */}
              <div className="p-4 bg-[#F4F2F0]/60 border border-wbk-lightgrey/80 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enabledFields.gtins}
                      onChange={() => toggleField("gtins")}
                      className="accent-wbk-gold w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-wbk-black">
                      Bulk Update GTIN Barcodes
                    </span>
                  </label>
                  {enabledFields.gtins && (
                    <span className="text-[10px] bg-wbk-gold/20 text-wbk-black font-semibold px-2 py-0.5 rounded-full">
                      Enabled
                    </span>
                  )}
                </div>

                {enabledFields.gtins && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {[
                      { key: "gtin_en", label: "UK GTIN (EN)", flag: "🇬🇧", placeholder: "GTIN UK" },
                      { key: "gtin_us", label: "US GTIN / UPC", flag: "🇺🇸", placeholder: "GTIN US" },
                      { key: "gtin_de", label: "Germany GTIN (DE)", flag: "🇩🇪", placeholder: "GTIN DE" },
                      { key: "gtin_fr", label: "France GTIN (FR)", flag: "🇫🇷", placeholder: "GTIN FR" },
                      { key: "gtin_es", label: "Spain GTIN (ES)", flag: "🇪🇸", placeholder: "GTIN ES" },
                      { key: "gtin_por", label: "Portugal GTIN (POR)", flag: "🇵🇹", placeholder: "GTIN POR" },
                      { key: "gtin_it", label: "Italy GTIN (IT)", flag: "🇮🇹", placeholder: "GTIN IT" },
                    ].map((loc) => (
                      <div key={loc.key} className="space-y-1">
                        <label className="text-[10px] font-semibold text-wbk-brown flex items-center gap-1.5">
                          <span className="text-sm">{loc.flag}</span>
                          <span>{loc.label}</span>
                        </label>
                        <input
                          type="text"
                          placeholder={loc.placeholder}
                          value={values[loc.key] || ""}
                          onChange={(e) => handleValueChange(loc.key, e.target.value)}
                          className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-mono"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: Guides & Videos */}
          {activeTab === "guides" && (
            <div className="space-y-5 bg-white p-5 border border-wbk-lightgrey/60">
              <div>
                <h4 className="text-xs font-semibold text-wbk-black uppercase tracking-wider flex items-center gap-2">
                  <IconBrandYoutube size={16} className="text-red-600" />
                  <span>Installation Videos &amp; PDF Manuals</span>
                </h4>
                <p className="text-[11px] text-wbk-brown mt-1">
                  Bulk assign official YouTube installation guides and PDF assembly manuals across all {selectedProductIds.length} selected products.
                </p>
              </div>

              {/* Field 1: Installation Video (YouTube) */}
              <div className="p-4 bg-[#FBF9F8] border border-wbk-lightgrey/50 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enabledFields.installation_video}
                      onChange={() => toggleField("installation_video")}
                      className="accent-wbk-gold w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-wbk-black flex items-center gap-1.5">
                      <IconBrandYoutube size={15} className="text-red-600" />
                      <span>Installation Video (YouTube)</span>
                    </span>
                  </label>
                  {enabledFields.installation_video && (
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-xs">
                      Enabled for bulk update
                    </span>
                  )}
                </div>

                {enabledFields.installation_video && (
                  <div className="space-y-3 pt-2 border-t border-wbk-lightgrey/50">
                    {/* Quick Presets */}
                    <div>
                      <label className="block text-[11px] font-medium text-wbk-black mb-1">
                        Select from Official WallBedKing Presets
                      </label>
                      <select
                        value={
                          OFFICIAL_INSTALLATION_VIDEOS.find(
                            (v) => v.videoId === parseYouTubeVideo(values.installation_video)?.videoId
                          )?.videoId || ""
                        }
                        onChange={(e) => {
                          const found = OFFICIAL_INSTALLATION_VIDEOS.find((v) => v.videoId === e.target.value);
                          if (found) {
                            handleValueChange("installation_video", found.url);
                          }
                        }}
                        className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-poppins"
                      >
                        <option value="">-- Choose an official guide video --</option>
                        {OFFICIAL_INSTALLATION_VIDEOS.map((v) => (
                          <option key={v.videoId} value={v.videoId}>
                            {v.title} ({v.model})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Custom URL or Video ID */}
                    <div>
                      <label className="block text-[11px] font-medium text-wbk-black mb-1">
                        Or Enter Custom YouTube URL / Video ID
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="e.g. https://www.youtube.com/watch?v=1MQ7Ksb2t-Y or leave empty to clear"
                            value={values.installation_video || ""}
                            onChange={(e) => handleValueChange("installation_video", e.target.value)}
                            className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-mono"
                          />
                          {values.installation_video && parseYouTubeVideo(values.installation_video) && (
                            <span className="absolute right-2.5 top-2 text-[10px] text-green-600 font-semibold flex items-center gap-1">
                              <IconCheck size={12} /> Valid
                            </span>
                          )}
                        </div>
                        {values.installation_video && (
                          <button
                            type="button"
                            onClick={() => handleValueChange("installation_video", "")}
                            className="px-3 py-2 text-xs border border-wbk-lightgrey text-wbk-brown hover:text-wbk-black rounded-none cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-wbk-brown mt-1">
                        Leave empty and keep checked if you want to clear/reset video on selected products.
                      </p>
                    </div>

                    {/* Live Preview if valid */}
                    {(() => {
                      const parsed = parseYouTubeVideo(values.installation_video);
                      if (!parsed) return null;
                      return (
                        <div className="pt-2">
                          <span className="text-[10px] text-wbk-brown block mb-1">Preview:</span>
                          <div className="relative aspect-video max-w-sm bg-black border border-wbk-lightgrey/80 overflow-hidden shadow-xs">
                            <iframe
                              src={parsed.embedUrl}
                              title="Bulk preview"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              className="absolute inset-0 w-full h-full border-0"
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Field 2: Assembly Manual (PDF) */}
              <div className="p-4 bg-[#FBF9F8] border border-wbk-lightgrey/50 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enabledFields.installation_manual}
                      onChange={() => toggleField("installation_manual")}
                      className="accent-wbk-gold w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-wbk-black flex items-center gap-1.5">
                      <IconFileText size={15} className="text-wbk-gold" />
                      <span>Assembly Manual (PDF)</span>
                    </span>
                  </label>
                  {enabledFields.installation_manual && (
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-xs">
                      Enabled for bulk update
                    </span>
                  )}
                </div>

                {enabledFields.installation_manual && (
                  <div className="space-y-3 pt-2 border-t border-wbk-lightgrey/50">
                    <div>
                      <label className="block text-[11px] font-medium text-wbk-black mb-1">
                        Select from Existing Storage Manuals ({manualsList.length} available)
                      </label>
                      <select
                        value={values.installation_manual || ""}
                        onChange={(e) => handleValueChange("installation_manual", e.target.value)}
                        className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-poppins"
                      >
                        <option value="">-- Choose a manual or clear --</option>
                        {manualsList.map((m) => (
                          <option key={m.name} value={m.url}>
                            {m.name} {m.size ? `(${Math.round(m.size / 1024)} KB)` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-wbk-black mb-1">
                        Or Enter Direct PDF URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="https://.../SupportFiles/InstallationManuals/...pdf"
                          value={values.installation_manual || ""}
                          onChange={(e) => handleValueChange("installation_manual", e.target.value)}
                          className="flex-1 p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-mono"
                        />
                        {values.installation_manual && (
                          <button
                            type="button"
                            onClick={() => handleValueChange("installation_manual", "")}
                            className="px-3 py-2 text-xs border border-wbk-lightgrey text-wbk-brown hover:text-wbk-black rounded-none cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-wbk-lightgrey flex items-center justify-between shrink-0">
          <div className="text-xs text-wbk-brown">
            {activeFieldsCount === 0 ? (
              <span className="italic">No fields enabled yet.</span>
            ) : (
              <span>
                Ready to update <strong>{activeFieldsCount} parameter(s)</strong> across{" "}
                <strong>{selectedProductIds.length} products</strong>.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-wbk-brown hover:text-wbk-black transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="bulkEditForm"
              disabled={saving || activeFieldsCount === 0}
              className="px-6 py-2.5 bg-wbk-black hover:bg-wbk-gold hover:text-wbk-black text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <IconRefresh size={15} className="animate-spin text-wbk-gold" />
                  <span>Applying to {selectedProductIds.length} Products...</span>
                </>
              ) : (
                <>
                  <IconCheck size={16} />
                  <span>Apply Bulk Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
