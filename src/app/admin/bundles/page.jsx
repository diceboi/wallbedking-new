"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconExternalLink,
  IconRefresh,
  IconEye,
  IconEyeOff,
  IconAlertCircle,
  IconAlertTriangle,
  IconCheck,
  IconTag,
  IconX,
  IconPhoto,
  IconLanguage,
  IconLayersLinked,
  IconPackage,
  IconCurrencyPound,
  IconSparkles,
  IconBox,
  IconInfoCircle,
  IconArrowRight,
  IconPercentage,
} from "@tabler/icons-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StorageMediaModal } from "@/components/admin/StorageMediaModal";

const LOCALES = [
  { code: "en", label: "UK (en)", flag: "🇬🇧" },
  { code: "us", label: "US (us)", flag: "🇺🇸" },
  { code: "de", label: "DE (de)", flag: "🇩🇪" },
  { code: "fr", label: "FR (fr)", flag: "🇫🇷" },
  { code: "es", label: "ES (es)", flag: "🇪🇸" },
  { code: "por", label: "POR (por)", flag: "🇵🇹" },
  { code: "it", label: "IT (it)", flag: "🇮🇹" },
];

const INITIAL_BUNDLE_FORM = {
  id: null,
  sku: "",
  slug: "",
  name: "",
  name_en: "",
  name_us: "",
  name_de: "",
  name_fr: "",
  name_es: "",
  name_por: "",
  name_it: "",
  description: "",
  description_en: "",
  description_us: "",
  description_de: "",
  description_fr: "",
  description_es: "",
  description_por: "",
  description_it: "",
  category: "bundles",
  parent_category: "bundles",
  sub_category: "Classic+ Packages",
  badge: "Classic+ Package • 10% Off",
  image: "",
  hover_image: "",
  product_images: [],
  meta_title: "",
  meta_description: "",
  warranty: "5-year manufacturer warranty",
  visibility: "Visible",
  discount_type: "percent",
  discount_percent: 10,
  discount_fix_gbp: 0,
  discount_fix_euro: 0,
  discount_fix_usd: 0,
  features: [
    "Guaranteed dimensional compatibility",
    "Precision-engineered gas piston mechanism",
    "Complete bed & matching cabinet set",
    "Exclusive bundle savings applied",
  ],
  items: [],
};

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [healthFilter, setHealthFilter] = useState("all");
  const [selectedCurrency, setSelectedCurrency] = useState("GBP");

  // Catalog products for component picker
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [productPickerSearch, setProductPickerSearch] = useState("");
  const [productPickerCategory, setProductPickerCategory] = useState("all");

  // Drawer / Modal state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null);
  const [activeTab, setActiveTab] = useState("components"); // components, info, translations, media, seo
  const [formData, setFormData] = useState(INITIAL_BUNDLE_FORM);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [activeLocaleTab, setActiveLocaleTab] = useState("en");

  // Media picker state
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState("image"); // 'image' | 'hover_image' | 'gallery'

  // Toast / notification
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch bundles
  const fetchBundles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bundles");
      const data = await res.json();
      if (data.success) {
        setBundles(data.bundles || []);
      } else {
        showNotification(data.error || "Failed to load bundles", "error");
      }
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch catalog products for component pairing
  const fetchCatalogProducts = async () => {
    if (catalogProducts.length > 0) return;
    setLoadingCatalog(true);
    try {
      const res = await fetch("/api/admin/products?limit=1000");
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setCatalogProducts(data.products);
      }
    } catch (err) {
      console.warn("Catalog fetch error:", err.message);
    } finally {
      setLoadingCatalog(false);
    }
  };

  useEffect(() => {
    fetchBundles();
    fetchCatalogProducts();
  }, []);

  // Filtered bundles
  const filteredBundles = useMemo(() => {
    return bundles.filter((b) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = b.name?.toLowerCase().includes(q);
        const matchesSlug = b.slug?.toLowerCase().includes(q);
        const matchesSku = b.sku?.toLowerCase().includes(q);
        const matchesComponent = b.items?.some((it) => it.product?.name?.toLowerCase().includes(q));
        if (!matchesName && !matchesSlug && !matchesSku && !matchesComponent) return false;
      }
      if (visibilityFilter !== "all") {
        if (b.visibility !== visibilityFilter) return false;
      }
      if (healthFilter !== "all") {
        const status = b.health?.health_status;
        if (healthFilter === "active" && status !== "active") return false;
        if (healthFilter === "issues" && status === "active") return false;
      }
      return true;
    });
  }, [bundles, search, visibilityFilter, healthFilter]);

  // Summary stats
  const stats = useMemo(() => {
    const total = bundles.length;
    const active = bundles.filter((b) => b.health?.health_status === "active").length;
    const issues = bundles.filter((b) => b.health?.health_status !== "active").length;
    const avgDiscount = total > 0
      ? Math.round(bundles.reduce((acc, b) => acc + (b.discount_percent || 0), 0) / total)
      : 0;
    return { total, active, issues, avgDiscount };
  }, [bundles]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingBundle(null);
    setFormData({
      ...INITIAL_BUNDLE_FORM,
      items: [],
      product_images: [],
    });
    setActiveTab("components");
    setDrawerOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (bundle) => {
    setEditingBundle(bundle);
    setFormData({
      ...INITIAL_BUNDLE_FORM,
      ...bundle,
      items: (bundle.items || []).map((it) => ({
        product_id: it.product_id,
        quantity: it.quantity || 1,
        is_required: it.is_required !== false,
        sort_order: it.sort_order || 0,
        product: it.product || null,
      })),
      features: Array.isArray(bundle.features) ? bundle.features : INITIAL_BUNDLE_FORM.features,
      product_images: Array.isArray(bundle.product_images) ? bundle.product_images : [],
    });
    setActiveTab("components");
    setDrawerOpen(true);
  };

  // Delete Bundle
  const handleDeleteBundle = async (bundle) => {
    if (!confirm(`Are you sure you want to delete bundle "${bundle.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/bundles/${bundle.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showNotification("Bundle deleted successfully!", "success");
        fetchBundles();
      } else {
        showNotification(data.error || "Failed to delete bundle", "error");
      }
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  // Toggle Visibility
  const handleToggleVisibility = async (bundle) => {
    const newVis = bundle.visibility === "Visible" ? "Hidden" : "Visible";
    try {
      const res = await fetch(`/api/admin/bundles/${bundle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: newVis }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Visibility updated: ${newVis === "Visible" ? "Visible" : "Hidden"}`, "success");
        fetchBundles();
      }
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  // Add Component to formData
  const handleAddComponent = (prod) => {
    if (formData.items.some((it) => it.product_id === prod.id)) {
      showNotification("This product is already added to this bundle!", "warning");
      return;
    }
    const newItem = {
      product_id: prod.id,
      quantity: 1,
      is_required: true,
      sort_order: formData.items.length + 1,
      product: prod,
    };
    setFormData((prev) => {
      const updated = {
        ...prev,
        items: [...prev.items, newItem],
      };
      // Auto-set images if not set
      if (!updated.image && prod.image) {
        updated.image = prod.image;
      }
      if (!updated.hover_image && prod.hover_image) {
        updated.hover_image = prod.hover_image;
      }
      return updated;
    });
    setProductPickerOpen(false);
    showNotification(`"${prod.name}" added to bundle!`, "success");
  };

  // Remove Component from formData
  const handleRemoveComponent = (productId) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((it) => it.product_id !== productId),
    }));
  };

  // Update Component quantity
  const handleUpdateComponentQty = (productId, delta) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((it) => {
        if (it.product_id === productId) {
          return { ...it, quantity: Math.max(1, (it.quantity || 1) + delta) };
        }
        return it;
      }),
    }));
  };

  // Real-time pricing calculation for form data
  const currentPricing = useMemo(() => {
    let subtotal_gbp = 0;
    let subtotal_euro = 0;
    let subtotal_usd = 0;
    let minStock = Infinity;
    let hasHidden = false;
    let hasZeroStock = false;

    for (const item of formData.items) {
      const prod = item.product || catalogProducts.find((p) => p.id === item.product_id);
      const qty = item.quantity || 1;
      if (prod) {
        subtotal_gbp += Number(prod.price_gbp || prod.price || 0) * qty;
        subtotal_euro += Number(prod.price_euro || prod.price || 0) * qty;
        subtotal_usd += Number(prod.price_usd || prod.price || 0) * qty;

        const stock = Number(prod.stock ?? 0);
        if (stock < minStock) minStock = stock;
        if (stock <= 0) hasZeroStock = true;

        const vis = String(prod.visibility || "").toLowerCase().trim();
        if (vis === "hidden" || prod.visibility === false || prod.is_visible === false) {
          hasHidden = true;
        }
      }
    }

    if (minStock === Infinity) minStock = 0;

    const discountType = formData.discount_type || "percent";
    const discountPercent = Number(formData.discount_percent ?? 10);
    const discountFixGbp = Number(formData.discount_fix_gbp || 0);
    const discountFixEuro = Number(formData.discount_fix_euro || 0);
    const discountFixUsd = Number(formData.discount_fix_usd || 0);

    let final_price_gbp = subtotal_gbp;
    let final_price_euro = subtotal_euro;
    let final_price_usd = subtotal_usd;
    let savings_gbp = 0;
    let savings_euro = 0;
    let savings_usd = 0;

    if (discountType === "percent" && discountPercent > 0) {
      savings_gbp = Math.round(subtotal_gbp * (discountPercent / 100));
      savings_euro = Math.round(subtotal_euro * (discountPercent / 100));
      savings_usd = Math.round(subtotal_usd * (discountPercent / 100));
      final_price_gbp = Math.max(0, subtotal_gbp - savings_gbp);
      final_price_euro = Math.max(0, subtotal_euro - savings_euro);
      final_price_usd = Math.max(0, subtotal_usd - savings_usd);
    } else if (discountType === "fixed") {
      savings_gbp = discountFixGbp;
      savings_euro = discountFixEuro;
      savings_usd = discountFixUsd;
      final_price_gbp = Math.max(0, subtotal_gbp - savings_gbp);
      final_price_euro = Math.max(0, subtotal_euro - savings_euro);
      final_price_usd = Math.max(0, subtotal_usd - savings_usd);
    }

    return {
      subtotal_gbp,
      subtotal_euro,
      subtotal_usd,
      final_price_gbp,
      final_price_euro,
      final_price_usd,
      savings_gbp,
      savings_euro,
      savings_usd,
      minStock,
      hasHidden,
      hasZeroStock,
    };
  }, [formData.items, formData.discount_type, formData.discount_percent, formData.discount_fix_gbp, formData.discount_fix_euro, formData.discount_fix_usd, catalogProducts]);

  // Save Bundle (Create or Update)
  const handleSaveBundle = async (e) => {
    e?.preventDefault();
    if (!formData.name?.trim()) {
      showNotification("Bundle name is required!", "error");
      setActiveTab("info");
      return;
    }
    if (formData.items.length === 0) {
      showNotification("At least one product must be paired in the bundle!", "error");
      setActiveTab("components");
      return;
    }

    setSaving(true);
    try {
      const url = editingBundle
        ? `/api/admin/bundles/${editingBundle.id}`
        : "/api/admin/bundles";
      const method = editingBundle ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        showNotification(
          editingBundle ? "Bundle updated successfully!" : "New bundle created successfully!",
          "success"
        );
        setDrawerOpen(false);
        fetchBundles();
      } else {
        showNotification(data.error || "Failed to save bundle", "error");
      }
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // AI 1-click Translation
  const handleAiTranslate = async () => {
    const textToTranslateName = formData.name_en || formData.name;
    const textToTranslateDesc = formData.description_en || formData.description;

    if (!textToTranslateName) {
      showNotification("Please enter at least an English name before translating!", "warning");
      return;
    }

    setTranslating(true);
    try {
      const targetLocales = ["us", "de", "fr", "es", "por", "it"];
      const updated = { ...formData };

      for (const loc of targetLocales) {
        // Translate Name
        if (textToTranslateName) {
          const res = await fetch("/api/admin/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ englishText: textToTranslateName, targetLocale: loc }),
          });
          const data = await res.json();
          if (data.success && data.translation) {
            updated[`name_${loc}`] = data.translation;
          }
        }
        // Translate Description
        if (textToTranslateDesc) {
          const resDesc = await fetch("/api/admin/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ englishText: textToTranslateDesc, targetLocale: loc }),
          });
          const dataDesc = await resDesc.json();
          if (dataDesc.success && dataDesc.translation) {
            updated[`description_${loc}`] = dataDesc.translation;
          }
        }
      }

      setFormData(updated);
      showNotification("AI translations completed successfully for all 6 languages!", "success");
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setTranslating(false);
    }
  };

  // Auto-populate gallery with components images
  const handleCopyComponentImages = () => {
    const images = [];
    for (const it of formData.items) {
      const prod = it.product || catalogProducts.find((p) => p.id === item.product_id);
      if (prod?.image && !images.includes(prod.image)) images.push(prod.image);
      if (prod?.hover_image && !images.includes(prod.hover_image)) images.push(prod.hover_image);
      if (Array.isArray(prod?.product_images)) {
        for (const pi of prod.product_images) {
          if (pi && !images.includes(pi)) images.push(pi);
        }
      }
    }
    if (images.length > 0) {
      setFormData((prev) => ({
        ...prev,
        image: prev.image || images[0],
        hover_image: prev.hover_image || images[1] || images[0],
        product_images: Array.from(new Set([...(prev.product_images || []), ...images])),
      }));
      showNotification(`${images.length} images imported from linked products!`, "success");
    } else {
      showNotification("No images found on linked products", "warning");
    }
  };

  // Filtered catalog products for Component Picker Modal
  const pickerFilteredProducts = useMemo(() => {
    return catalogProducts.filter((p) => {
      if (productPickerCategory !== "all") {
        if (productPickerCategory === "beds") {
          if (!["beds", "morphy-beds", "traditional-beds"].includes(p.parent_category)) return false;
        } else if (p.parent_category !== productPickerCategory) {
          return false;
        }
      }
      if (productPickerSearch.trim()) {
        const q = productPickerSearch.toLowerCase();
        return (
          p.name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          String(p.id).includes(q)
        );
      }
      return true;
    });
  }, [catalogProducts, productPickerCategory, productPickerSearch]);

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <AdminPageHeader
        badge="Catalog & Sets Management"
        title="Product Bundles"
        count={`${bundles.length} Csomag`}
        description="Create and manage product bundles (e.g. Classic + Cabinet, Morphy + Cabinet). Pricing and inventory are automatically computed from linked components in Supabase."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchBundles}
              disabled={loading}
              className="p-2.5 rounded-lg border border-wbk-lightgrey/60 hover:bg-wbk-lightgrey/30 text-wbk-brown transition-colors"
              title="Refresh"
            >
              <IconRefresh size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-wbk-black text-white text-xs font-semibold hover:bg-wbk-gold transition-colors shadow-sm"
            >
              <IconPlus size={16} />
              <span>Create New Bundle</span>
            </button>
          </div>
        }
      />

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-xs font-medium border flex items-center justify-between transition-all ${
            notification.type === "error"
              ? "bg-red-50 text-red-700 border-red-200"
              : notification.type === "warning"
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "error" ? (
              <IconAlertCircle size={18} />
            ) : notification.type === "warning" ? (
              <IconAlertTriangle size={18} />
            ) : (
              <IconCheck size={18} />
            )}
            <span>{notification.msg}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-gray-600">
            <IconX size={16} />
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white border border-wbk-lightgrey/60 shadow-xs">
          <div className="flex items-center justify-between text-wbk-brown text-xs font-medium">
            <span>Total Bundles</span>
            <IconLayersLinked size={18} className="text-wbk-gold" />
          </div>
          <div className="mt-2 text-2xl font-bold text-wbk-black">{stats.total}</div>
          <div className="text-[10px] text-wbk-brown mt-0.5">Configured packages</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-wbk-lightgrey/60 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-medium">
            <span>Active & Available</span>
            <IconCheck size={18} className="text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">{stats.active}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">All components in stock</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-wbk-lightgrey/60 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 text-xs font-medium">
            <span>Inventory Alert</span>
            <IconAlertTriangle size={18} className="text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700">{stats.issues}</div>
          <div className="text-[10px] text-amber-600 mt-0.5">Kifogyott vagy rejtett komponens</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-wbk-lightgrey/60 shadow-xs">
          <div className="flex items-center justify-between text-wbk-brown text-xs font-medium">
            <span>Average Discount</span>
            <IconTag size={18} className="text-wbk-gold" />
          </div>
          <div className="mt-2 text-2xl font-bold text-wbk-black">{stats.avgDiscount}%</div>
          <div className="text-[10px] text-wbk-brown mt-0.5">Package savings for customer</div>
        </div>
      </div>

      {/* Filter and Currency Bar */}
      <div className="p-4 rounded-xl bg-white border border-wbk-lightgrey/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, SKU, or product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-wbk-lightgrey/80 focus:outline-hidden focus:border-wbk-gold bg-wbk-lightgrey/20"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <IconX size={14} />
              </button>
            )}
          </div>

          {/* Visibility filter */}
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-wbk-lightgrey/80 bg-white text-wbk-black focus:outline-hidden focus:border-wbk-gold"
          >
            <option value="all">All Statuses</option>
            <option value="Visible">Visible Bundles</option>
            <option value="Hidden">Hidden Bundles</option>
          </select>

          {/* Health filter */}
          <select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-wbk-lightgrey/80 bg-white text-wbk-black focus:outline-hidden focus:border-wbk-gold"
          >
            <option value="all">All Stock States</option>
            <option value="active">In Stock Only</option>
            <option value="issues">With Alerts (Issues)</option>
          </select>
        </div>

        {/* Currency preview switcher */}
        <div className="flex items-center gap-1 bg-wbk-lightgrey/30 p-1 rounded-lg self-start md:self-center">
          {["GBP", "EUR", "USD"].map((curr) => (
            <button
              key={curr}
              onClick={() => setSelectedCurrency(curr)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                selectedCurrency === curr
                  ? "bg-wbk-black text-white shadow-xs"
                  : "text-wbk-brown hover:text-wbk-black"
              }`}
            >
              {curr === "GBP" ? "£ GBP" : curr === "EUR" ? "€ EUR" : "$ USD"}
            </button>
          ))}
        </div>
      </div>

      {/* Bundles List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center bg-white rounded-xl border border-wbk-lightgrey/60 text-wbk-brown">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-wbk-gold border-t-transparent mb-3"></div>
            <p className="text-xs font-medium">Loading bundles and verifying stock...</p>
          </div>
        ) : filteredBundles.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-wbk-lightgrey/60 text-wbk-brown">
            <IconLayersLinked size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-sm font-semibold text-wbk-black mb-1">No bundles found</h3>
            <p className="text-xs text-wbk-brown mb-4">
              {search || visibilityFilter !== "all" || healthFilter !== "all"
                ? "No bundles matched your search criteria."
                : "No bundles created yet. Click the button to create your first bundle!"}
            </p>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-wbk-black text-white text-xs font-semibold hover:bg-wbk-gold transition-colors"
            >
              <IconPlus size={16} />
              <span>Create New Bundle</span>
            </button>
          </div>
        ) : (
          filteredBundles.map((bundle) => {
            const pricing = bundle.pricing || {};
            const health = bundle.health || {};

            const subtotal =
              selectedCurrency === "USD"
                ? bundle.calculated_subtotal_usd
                : selectedCurrency === "EUR"
                ? bundle.calculated_subtotal_euro
                : bundle.calculated_subtotal_gbp;

            const finalPrice =
              selectedCurrency === "USD"
                ? bundle.calculated_price_usd
                : selectedCurrency === "EUR"
                ? bundle.calculated_price_euro
                : bundle.calculated_price_gbp;

            const savings =
              selectedCurrency === "USD"
                ? bundle.calculated_savings_usd
                : selectedCurrency === "EUR"
                ? bundle.calculated_savings_euro
                : bundle.calculated_savings_gbp;

            const currSymbol = selectedCurrency === "USD" ? "$" : selectedCurrency === "EUR" ? "€" : "£";

            return (
              <div
                key={bundle.id}
                className="bg-white rounded-xl border border-wbk-lightgrey/60 hover:border-wbk-gold/60 transition-all p-4 sm:p-5 shadow-xs"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Bundle Details & Thumbnail */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-gray-50 border border-wbk-lightgrey/80 overflow-hidden shrink-0">
                      {bundle.image ? (
                        <Image
                          src={bundle.image}
                          alt={bundle.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <IconPhoto size={28} />
                        </div>
                      )}
                      {bundle.badge && (
                        <span className="absolute bottom-0 inset-x-0 bg-wbk-black/85 text-[9px] font-semibold text-white px-1 py-0.5 text-center truncate">
                          {bundle.badge}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium">
                          {bundle.sku || `BDL-${bundle.id}`}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-wbk-gold/15 text-wbk-gold font-semibold">
                          {bundle.sub_category || "Bed & Cabinet Set"}
                        </span>
                        {/* Health Status Indicator */}
                        {health.health_status === "active" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Active & In Stock
                          </span>
                        ) : health.health_status === "component_hidden" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                            <IconAlertTriangle size={12} />
                            Egyik komponens rejtett
                          </span>
                        ) : health.health_status === "out_of_stock" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-red-50 text-red-700 font-semibold border border-red-200">
                            <IconAlertCircle size={12} />
                            Out of Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-semibold">
                            Rejtett csomag
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-semibold text-wbk-black truncate">{bundle.name}</h3>
                      <p className="text-xs text-wbk-brown line-clamp-1 max-w-xl">{bundle.description}</p>

                      <div className="text-[11px] text-gray-500 flex items-center gap-3 pt-1">
                        <span>Slug: <code className="text-wbk-black font-mono">/products/bundles/{bundle.slug}</code></span>
                        <span>•</span>
                        <span>Combined Stock: <strong className={bundle.calculated_stock > 0 ? "text-emerald-700" : "text-red-600"}>{bundle.calculated_stock} units</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Components Breakdown */}
                  <div className="bg-wbk-lightgrey/25 p-3 rounded-lg border border-wbk-lightgrey/60 lg:w-80 shrink-0 space-y-2">
                    <div className="text-[10px] uppercase font-bold text-wbk-brown tracking-wider flex items-center justify-between">
                      <span>Linked Products ({bundle.items?.length || 0})</span>
                      <span className="text-wbk-gold">Live Stock</span>
                    </div>

                    <div className="space-y-1.5">
                      {(bundle.items || []).map((it, idx) => {
                        const prod = it.product;
                        const isHidden =
                          prod &&
                          (String(prod.visibility || "").toLowerCase() === "hidden" ||
                            prod.visibility === false ||
                            prod.is_visible === false);
                        const isOos = !prod || (prod.stock ?? 0) <= 0;

                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-2 p-1.5 rounded-md bg-white border border-gray-100 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded bg-gray-100 relative shrink-0 overflow-hidden">
                                {prod?.image ? (
                                  <Image src={prod.image} alt="" fill sizes="28px" className="object-cover" />
                                ) : (
                                  <IconBox size={14} className="m-auto text-gray-400" />
                                )}
                              </div>
                              <span className="truncate text-wbk-black font-medium text-[11px]">
                                {prod ? prod.name : `Product ID #${it.product_id}`}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                              {isHidden ? (
                                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">Rejtve</span>
                              ) : isOos ? (
                                <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-medium">0 db</span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">{prod.stock} db</span>
                              )}
                              <span className="text-gray-500 font-mono">
                                {currSymbol}{Number(prod?.price_gbp || prod?.price || 0)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Pricing & Actions */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 shrink-0 lg:min-w-[170px] border-t lg:border-t-0 pt-3 lg:pt-0">
                    <div className="text-left lg:text-right">
                      <div className="text-[10px] text-gray-400 line-through">
                        Total: {currSymbol}{Number(subtotal).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-lg font-bold text-wbk-black">
                        {currSymbol}{Number(finalPrice).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                        Savings: -{bundle.discount_percent}% ({currSymbol}{savings})
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleVisibility(bundle)}
                        className={`p-2 rounded-lg border text-xs transition-colors ${
                          bundle.visibility === "Visible"
                            ? "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                            : "border-gray-200 text-gray-400 bg-gray-50 hover:bg-gray-100"
                        }`}
                        title={bundle.visibility === "Visible" ? "Hide bundle" : "Show bundle"}
                      >
                        {bundle.visibility === "Visible" ? <IconEye size={16} /> : <IconEyeOff size={16} />}
                      </button>

                      <button
                        onClick={() => handleOpenEdit(bundle)}
                        className="p-2 rounded-lg border border-wbk-lightgrey/80 text-wbk-brown hover:text-wbk-black hover:bg-wbk-lightgrey/30 text-xs transition-colors"
                        title="Edit bundle"
                      >
                        <IconEdit size={16} />
                      </button>

                      <button
                        onClick={() => handleDeleteBundle(bundle)}
                        className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs transition-colors"
                        title="Delete bundle"
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT BUNDLE DRAWER */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn">
          <div className="w-full max-w-4xl bg-white h-full flex flex-col shadow-2xl overflow-hidden animate-slideLeft">
            {/* Drawer Header */}
            <div className="p-5 border-b border-wbk-lightgrey/80 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-wbk-gold block">
                  {editingBundle ? "Edit Bundle" : "New Product Bundle"}
                </span>
                <h2 className="text-lg font-bold text-wbk-black">
                  {formData.name || "Untitled Bundle"}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <IconX size={20} />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 px-5 border-b border-wbk-lightgrey/60 bg-wbk-lightgrey/20 overflow-x-auto text-xs font-semibold text-wbk-brown">
              {[
                { id: "components", label: "1. Linked Products", icon: IconLayersLinked, badge: formData.items.length },
                { id: "info", label: "2. Alapadatok", icon: IconPackage },
                { id: "translations", label: "3. Translations & Languages", icon: IconLanguage },
                { id: "media", label: "4. Images & Media", icon: IconPhoto },
                { id: "seo", label: "5. SEO Settings", icon: IconSparkles },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? "border-wbk-gold text-wbk-black font-bold"
                        : "border-transparent hover:text-wbk-black"
                    }`}
                  >
                    <Icon size={16} className={isActive ? "text-wbk-gold" : "text-gray-400"} />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span className="px-1.5 py-0.2 rounded-full bg-wbk-black text-white text-[10px]">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Drawer Body */}
            <form onSubmit={handleSaveBundle} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: COMPONENTS PAIRING (CORE FEATURE) */}
              {activeTab === "components" && (
                <div className="space-y-6">
                  {/* Explanatory callout */}
                  <div className="p-4 rounded-xl bg-wbk-gold/10 border border-wbk-gold/30 text-xs text-wbk-black flex items-start gap-3">
                    <IconInfoCircle size={20} className="text-wbk-gold shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-0.5">How bundled pairings work</h4>
                      <p className="text-wbk-brown leading-relaxed">
                        Select at least two products from the Supabase catalog (e.g. a wall bed and matching cabinet unit).
                        The bundle base price is automatically calculated from the sum of components, and stock equals the lowest component stock.
                        If any paired component becomes hidden or out of stock, the bundle automatically updates its availability.
                      </p>
                    </div>
                  </div>

                  {/* Components List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-wbk-black">
                        Linked Products ({formData.items.length})
                      </h3>
                      <button
                        type="button"
                        onClick={() => setProductPickerOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-wbk-black text-white text-xs font-semibold hover:bg-wbk-gold transition-colors"
                      >
                        <IconPlus size={14} />
                        <span>Add Product From Catalog</span>
                      </button>
                    </div>

                    {formData.items.length === 0 ? (
                      <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-500">
                        <IconPackage size={32} className="mx-auto mb-2 text-gray-300" />
                        <p className="text-xs font-medium">No products added to this bundle yet.</p>
                        <p className="text-[11px] text-gray-400 mt-1 mb-3">
                          Click the button above to select components.
                        </p>
                        <button
                          type="button"
                          onClick={() => setProductPickerOpen(true)}
                          className="px-3 py-1.5 rounded-lg bg-wbk-gold text-wbk-black text-xs font-semibold hover:opacity-90"
                        >
                          Select Product
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {formData.items.map((it, idx) => {
                          const prod = it.product || catalogProducts.find((p) => p.id === it.product_id);
                          return (
                            <div
                              key={it.product_id}
                              className="flex items-center justify-between gap-3 p-3 rounded-xl border border-wbk-lightgrey/80 bg-white shadow-2xs"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-12 h-12 rounded-lg bg-gray-100 relative shrink-0 overflow-hidden border border-gray-200">
                                  {prod?.image ? (
                                    <Image src={prod.image} alt="" fill sizes="48px" className="object-cover" />
                                  ) : (
                                    <IconBox size={20} className="m-auto text-gray-400" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                                      #{it.product_id}
                                    </span>
                                    <span className="text-[10px] text-wbk-gold font-semibold uppercase">
                                      {prod?.parent_category || "Product"}
                                    </span>
                                  </div>
                                  <h4 className="text-xs font-bold text-wbk-black truncate mt-0.5">
                                    {prod?.name || `Product #${it.product_id}`}
                                  </h4>
                                  <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-3">
                                    <span>Price: <strong>£{Number(prod?.price_gbp || 0)}</strong> / €{Number(prod?.price_euro || 0)} / ${Number(prod?.price_usd || 0)}</span>
                                    <span>•</span>
                                    <span>Stock: <strong className={prod?.stock > 0 ? "text-emerald-700" : "text-red-600"}>{prod?.stock ?? 0} units</strong></span>
                                  </div>
                                </div>
                              </div>

                              {/* Quantity & Delete */}
                              <div className="flex items-center gap-3 shrink-0">
                                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50 text-xs font-semibold">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateComponentQty(it.product_id, -1)}
                                    className="px-2 py-1 hover:bg-gray-200"
                                  >
                                    -
                                  </button>
                                  <span className="px-3 py-1 font-mono">{it.quantity || 1} units</span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateComponentQty(it.product_id, 1)}
                                    className="px-2 py-1 hover:bg-gray-200"
                                  >
                                    +
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveComponent(it.product_id)}
                                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                  title="Remove"
                                >
                                  <IconTrash size={16} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Pricing & Discount Card */}
                  <div className="p-5 rounded-xl bg-gray-50 border border-wbk-lightgrey/80 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-wbk-black flex items-center justify-between">
                      <span>Bundle Pricing & Discount</span>
                      <IconPercentage size={16} className="text-wbk-gold" />
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Discount Type */}
                      <div>
                        <label className="text-xs font-medium text-wbk-brown block mb-1">Discount Type</label>
                        <select
                          value={formData.discount_type}
                          onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                          className="w-full text-xs p-2.5 rounded-lg border border-wbk-lightgrey/80 bg-white text-wbk-black focus:outline-hidden focus:border-wbk-gold"
                        >
                          <option value="percent">Percentage Discount (%)</option>
                          <option value="fixed">Fixed Amount Discount (£/€/$)</option>
                        </select>
                      </div>

                      {/* Discount Value */}
                      {formData.discount_type === "percent" ? (
                        <div>
                          <label className="text-xs font-medium text-wbk-brown block mb-1">Bundle Discount (%)</label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="99"
                              value={formData.discount_percent}
                              onChange={(e) => setFormData({ ...formData, discount_percent: Number(e.target.value) })}
                              className="w-full text-xs p-2.5 pr-8 rounded-lg border border-wbk-lightgrey/80 bg-white text-wbk-black focus:outline-hidden focus:border-wbk-gold"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">%</span>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-gray-500 block mb-1">Discount (£ GBP)</label>
                            <input
                              type="number"
                              value={formData.discount_fix_gbp}
                              onChange={(e) => setFormData({ ...formData, discount_fix_gbp: Number(e.target.value) })}
                              className="w-full text-xs p-2 rounded border border-gray-300 bg-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-500 block mb-1">Discount (€ EUR)</label>
                            <input
                              type="number"
                              value={formData.discount_fix_euro}
                              onChange={(e) => setFormData({ ...formData, discount_fix_euro: Number(e.target.value) })}
                              className="w-full text-xs p-2 rounded border border-gray-300 bg-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-500 block mb-1">Discount ($ USD)</label>
                            <input
                              type="number"
                              value={formData.discount_fix_usd}
                              onChange={(e) => setFormData({ ...formData, discount_fix_usd: Number(e.target.value) })}
                              className="w-full text-xs p-2 rounded border border-gray-300 bg-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Live Price Table Preview */}
                    <div className="bg-white p-4 rounded-xl border border-wbk-lightgrey/60 space-y-2">
                      <div className="text-[11px] font-bold text-wbk-black uppercase tracking-wider mb-2">
                        Live Customer Pricing (Calculated Automatically)
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-500 block">UNITED KINGDOM (GBP)</span>
                          <span className="text-xs text-gray-400 line-through">£{currentPricing.subtotal_gbp}</span>
                          <div className="text-base font-bold text-wbk-black">£{currentPricing.final_price_gbp}</div>
                          <span className="text-[10px] text-emerald-600 font-semibold">Savings: £{currentPricing.savings_gbp}</span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-500 block">EUROPE (EUR)</span>
                          <span className="text-xs text-gray-400 line-through">€{currentPricing.subtotal_euro}</span>
                          <div className="text-base font-bold text-wbk-black">€{currentPricing.final_price_euro}</div>
                          <span className="text-[10px] text-emerald-600 font-semibold">Savings: €{currentPricing.savings_euro}</span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-500 block">USA (USD)</span>
                          <span className="text-xs text-gray-400 line-through">${currentPricing.subtotal_usd}</span>
                          <div className="text-base font-bold text-wbk-black">${currentPricing.final_price_usd}</div>
                          <span className="text-[10px] text-emerald-600 font-semibold">Savings: ${currentPricing.savings_usd}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stock Alert Summary */}
                    <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-white border border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-wbk-black">Calculated Bundle Stock:</span>
                        <strong className={currentPricing.minStock > 0 ? "text-emerald-700" : "text-red-600"}>
                          {currentPricing.minStock} units available
                        </strong>
                      </div>
                      {currentPricing.hasHidden && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                          ⚠️ Egyik komponens rejtett
                        </span>
                      )}
                      {currentPricing.hasZeroStock && (
                        <span className="text-[10px] text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 font-medium">
                          ⚠️ Egyik komponens elfogyott
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BASIC INFO */}
              {activeTab === "info" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-wbk-brown block mb-1">Bundle Name (EN / Default) *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            name: val,
                            name_en: prev.name_en || val,
                            slug: prev.slug || val.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"),
                          }));
                        }}
                        placeholder="pl. Classic+ Single Vertical Wall Bed & Cabinet Package"
                        className="w-full text-xs p-2.5 rounded-lg border border-wbk-lightgrey/80 bg-white text-wbk-black focus:outline-hidden focus:border-wbk-gold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-wbk-brown block mb-1">URL Slug *</label>
                      <input
                        type="text"
                        required
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="classic-plus-single-vertical-package"
                        className="w-full text-xs p-2.5 rounded-lg border border-wbk-lightgrey/80 bg-white text-wbk-black font-mono focus:outline-hidden focus:border-wbk-gold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-wbk-brown block mb-1">SKU / Identifier</label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="BDL-CLP-SV-90"
                        className="w-full text-xs p-2.5 rounded-lg border border-wbk-lightgrey/80 bg-white text-wbk-black font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-wbk-brown block mb-1">Bundle Badge</label>
                      <input
                        type="text"
                        value={formData.badge}
                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                        placeholder="Classic+ Package • 10% Off"
                        className="w-full text-xs p-2.5 rounded-lg border border-wbk-lightgrey/80 bg-white text-wbk-black"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-wbk-brown block mb-1">Visibility</label>
                      <select
                        value={formData.visibility}
                        onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-lg border border-wbk-lightgrey/80 bg-white text-wbk-black"
                      >
                        <option value="Visible">Visible (Active on storefront)</option>
                        <option value="Hidden">Rejtett (Csak admin)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-wbk-brown block mb-1">Subcategory</label>
                      <input
                        type="text"
                        value={formData.sub_category}
                        onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                        placeholder="Classic+ Packages / Morphy Sets"
                        className="w-full text-xs p-2.5 rounded-lg border border-wbk-lightgrey/80 bg-white text-wbk-black"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-wbk-brown block mb-1">Garancia</label>
                      <input
                        type="text"
                        value={formData.warranty}
                        onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                        placeholder="5-year manufacturer warranty"
                        className="w-full text-xs p-2.5 rounded-lg border border-wbk-lightgrey/80 bg-white text-wbk-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-wbk-brown block mb-1">Description (English EN)</label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value, description_en: e.target.value })}
                      placeholder="Describe bundle details, component compatibility, and savings..."
                      className="w-full text-xs p-2.5 rounded-lg border border-wbk-lightgrey/80 bg-white text-wbk-black leading-relaxed"
                    />
                  </div>

                  {/* Bullet features */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-wbk-brown">Key Highlights (Bullet Points)</label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, features: [...formData.features, ""] })}
                        className="text-[11px] text-wbk-gold hover:underline font-semibold"
                      >
                        + Add highlight bullet
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={feat}
                            onChange={(e) => {
                              const updated = [...formData.features];
                              updated[idx] = e.target.value;
                              setFormData({ ...formData, features: updated });
                            }}
                            className="flex-1 text-xs p-2 rounded-lg border border-wbk-lightgrey/80 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.features.filter((_, i) => i !== idx);
                              setFormData({ ...formData, features: updated });
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-500"
                          >
                            <IconX size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TRANSLATIONS & LOCALES */}
              {activeTab === "translations" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-purple-50/60 border border-purple-200">
                    <div>
                      <h4 className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                        <IconSparkles size={16} className="text-purple-600" />
                        <span>Automatic AI Translation (1-Click)</span>
                      </h4>
                      <p className="text-[11px] text-purple-700 mt-0.5">
                        Translates bundle name and description to all 6 market languages (DE, FR, ES, POR, IT, US) matching WallBedKing terminology.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAiTranslate}
                      disabled={translating}
                      className="px-4 py-2 rounded-lg bg-purple-700 text-white text-xs font-semibold hover:bg-purple-800 transition-colors flex items-center gap-2 shrink-0 disabled:opacity-50"
                    >
                      <IconSparkles size={14} className={translating ? "animate-spin" : ""} />
                      <span>{translating ? "Translating..." : "AI Translate to All 6 Languages"}</span>
                    </button>
                  </div>

                  {/* Locale Switcher Buttons */}
                  <div className="flex items-center gap-1 border-b border-gray-200 pb-2 overflow-x-auto">
                    {LOCALES.map((loc) => (
                      <button
                        key={loc.code}
                        type="button"
                        onClick={() => setActiveLocaleTab(loc.code)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          activeLocaleTab === loc.code
                            ? "bg-wbk-black text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <span>{loc.flag}</span>
                        <span>{loc.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Active Locale Form Fields */}
                  <div className="space-y-4 bg-gray-50/70 p-4 rounded-xl border border-gray-200">
                    <div>
                      <label className="text-xs font-medium text-wbk-brown block mb-1">
                        Bundle Name ({activeLocaleTab.toUpperCase()})
                      </label>
                      <input
                        type="text"
                        value={formData[`name_${activeLocaleTab}`] || ""}
                        onChange={(e) => setFormData({ ...formData, [`name_${activeLocaleTab}`]: e.target.value })}
                        placeholder={`Csomag neve ${activeLocaleTab.toUpperCase()} nyelven...`}
                        className="w-full text-xs p-2.5 rounded-lg border border-wbk-lightgrey/80 bg-white text-wbk-black focus:outline-hidden focus:border-wbk-gold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-wbk-brown block mb-1">
                        Bundle Description ({activeLocaleTab.toUpperCase()})
                      </label>
                      <textarea
                        rows={4}
                        value={formData[`description_${activeLocaleTab}`] || ""}
                        onChange={(e) => setFormData({ ...formData, [`description_${activeLocaleTab}`]: e.target.value })}
                        placeholder={`Bundle description in ${activeLocaleTab.toUpperCase()}...`}
                        className="w-full text-xs p-2.5 rounded-lg border border-wbk-lightgrey/80 bg-white text-wbk-black leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: MEDIA & IMAGES */}
              {activeTab === "media" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-wbk-black uppercase tracking-wider">Bundle Photos & Gallery</h4>
                      <p className="text-[11px] text-gray-500">Configure product card and product page images.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyComponentImages}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-wbk-black text-xs font-semibold transition-colors"
                    >
                      <IconPhoto size={14} />
                      <span>Import Images From Components</span>
                    </button>
                  </div>

                  {/* Primary & Hover Images */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Primary Image */}
                    <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-wbk-black">Primary Image (Main Image) *</label>
                        <button
                          type="button"
                          onClick={() => {
                            setMediaPickerTarget("image");
                            setMediaPickerOpen(true);
                          }}
                          className="text-[11px] text-wbk-gold font-semibold hover:underline"
                        >
                          Browse Media Storage
                        </button>
                      </div>

                      <div className="relative w-full h-44 rounded-lg bg-white border border-gray-200 overflow-hidden flex items-center justify-center">
                        {formData.image ? (
                          <Image src={formData.image} alt="" fill sizes="400px" className="object-cover" />
                        ) : (
                          <div className="text-center text-gray-400">
                            <IconPhoto size={36} className="mx-auto mb-1 text-gray-300" />
                            <span className="text-[11px]">No image selected</span>
                          </div>
                        )}
                      </div>

                      <input
                        type="text"
                        placeholder="Image URL (https://...)"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="w-full text-xs p-2 rounded border border-gray-300 bg-white"
                      />
                    </div>

                    {/* Hover Image */}
                    <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-wbk-black">Hover Image</label>
                        <button
                          type="button"
                          onClick={() => {
                            setMediaPickerTarget("hover_image");
                            setMediaPickerOpen(true);
                          }}
                          className="text-[11px] text-wbk-gold font-semibold hover:underline"
                        >
                          Browse Media Storage
                        </button>
                      </div>

                      <div className="relative w-full h-44 rounded-lg bg-white border border-gray-200 overflow-hidden flex items-center justify-center">
                        {formData.hover_image ? (
                          <Image src={formData.hover_image} alt="" fill sizes="400px" className="object-cover" />
                        ) : (
                          <div className="text-center text-gray-400">
                            <IconPhoto size={36} className="mx-auto mb-1 text-gray-300" />
                            <span className="text-[11px]">No hover image selected</span>
                          </div>
                        )}
                      </div>

                      <input
                        type="text"
                        placeholder="Hover image URL (https://...)"
                        value={formData.hover_image}
                        onChange={(e) => setFormData({ ...formData, hover_image: e.target.value })}
                        className="w-full text-xs p-2 rounded border border-gray-300 bg-white"
                      />
                    </div>
                  </div>

                  {/* Gallery Images List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-wbk-black">Additional Gallery Images</label>
                      <button
                        type="button"
                        onClick={() => {
                          setMediaPickerTarget("gallery");
                          setMediaPickerOpen(true);
                        }}
                        className="text-[11px] text-wbk-gold font-semibold hover:underline"
                      >
                        + Add image from media storage
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(formData.product_images || []).map((imgUrl, idx) => (
                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 h-28 bg-gray-100">
                          <Image src={imgUrl} alt="" fill sizes="150px" className="object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.product_images.filter((_, i) => i !== idx);
                              setFormData({ ...formData, product_images: updated });
                            }}
                            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <IconX size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: SEO */}
              {activeTab === "seo" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-wbk-brown block mb-1">Meta Title (SEO Title)</label>
                    <input
                      type="text"
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      placeholder={`${formData.name || "Csomag"} | WallBedKing`}
                      className="w-full text-xs p-2.5 rounded-lg border border-wbk-lightgrey/80 bg-white text-wbk-black"
                    />
                    <span className="text-[10px] text-gray-400 mt-0.5 block">
                      Hossz: {formData.meta_title?.length || 0} / 60 karakter
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-wbk-brown block mb-1">Meta Description (SEO Description)</label>
                    <textarea
                      rows={3}
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      placeholder="Search-optimized description for Google..."
                      className="w-full text-xs p-2.5 rounded-lg border border-wbk-lightgrey/80 bg-white text-wbk-black leading-relaxed"
                    />
                    <span className="text-[10px] text-gray-400 mt-0.5 block">
                      Hossz: {formData.meta_description?.length || 0} / 160 karakter
                    </span>
                  </div>
                </div>
              )}

              {/* Drawer Footer Buttons */}
              <div className="pt-6 border-t border-wbk-lightgrey/80 flex items-center justify-between sticky bottom-0 bg-white z-10">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-wbk-black text-white text-xs font-semibold hover:bg-wbk-gold transition-colors shadow-sm disabled:opacity-50"
                  >
                    <IconCheck size={16} />
                    <span>{saving ? "Saving..." : editingBundle ? "Save Changes" : "Create Bundle"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPONENT PRODUCT PICKER MODAL */}
      {productPickerOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="text-sm font-bold text-wbk-black">Select Product From Catalog</h3>
                <p className="text-[11px] text-gray-500">Pair a bed, cabinet, sofa or mattress to this bundle.</p>
              </div>
              <button
                onClick={() => setProductPickerOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Modal Search & Category Filter */}
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-2 bg-white">
              <div className="relative flex-1">
                <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by product name or SKU..."
                  value={productPickerSearch}
                  onChange={(e) => setProductPickerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-300 bg-gray-50 focus:outline-hidden focus:border-wbk-gold"
                />
              </div>

              <select
                value={productPickerCategory}
                onChange={(e) => setProductPickerCategory(e.target.value)}
                className="text-xs px-3 py-2 rounded-lg border border-gray-300 bg-white text-wbk-black"
              >
                <option value="all">All Categories</option>
                <option value="beds">Wall Beds</option>
                <option value="cabinets">Cabinets & Storage</option>
                <option value="mattresses">Mattresses</option>
                <option value="sofas">Sofas & Seating</option>
                <option value="extras">Accessories & Extras</option>
              </select>
            </div>

            {/* Modal Product List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loadingCatalog ? (
                <div className="p-8 text-center text-xs text-gray-500">Loading catalog...</div>
              ) : pickerFilteredProducts.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500">No products matched your search criteria.</div>
              ) : (
                pickerFilteredProducts.map((prod) => {
                  const isSelected = formData.items.some((it) => it.product_id === prod.id);
                  return (
                    <div
                      key={prod.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isSelected
                          ? "border-wbk-gold bg-wbk-gold/10"
                          : "border-gray-200 hover:border-wbk-gold/50 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 relative shrink-0 overflow-hidden border border-gray-200">
                          {prod.image ? (
                            <Image src={prod.image} alt="" fill sizes="48px" className="object-cover" />
                          ) : (
                            <IconBox size={20} className="m-auto text-gray-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                              #{prod.id}
                            </span>
                            <span className="text-[10px] text-wbk-gold font-semibold uppercase">
                              {prod.parent_category || prod.category}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-wbk-black truncate mt-0.5">{prod.name}</h4>
                          <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-3">
                            <span>Price: <strong>£{Number(prod.price_gbp || prod.price || 0)}</strong> / €{Number(prod.price_euro || 0)}</span>
                            <span>•</span>
                            <span>Stock: <strong className={prod.stock > 0 ? "text-emerald-700" : "text-red-600"}>{prod.stock ?? 0} units</strong></span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddComponent(prod)}
                        disabled={isSelected}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                          isSelected
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-wbk-black text-white hover:bg-wbk-gold"
                        }`}
                      >
                        {isSelected ? "Added" : "Select"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => setProductPickerOpen(false)}
                className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STORAGE MEDIA MODAL FOR IMAGES */}
      <StorageMediaModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        selectedUrl={mediaPickerTarget === "image" ? formData.image : formData.hover_image}
        onSelect={(url) => {
          if (mediaPickerTarget === "image") {
            setFormData((prev) => ({ ...prev, image: url }));
          } else if (mediaPickerTarget === "hover_image") {
            setFormData((prev) => ({ ...prev, hover_image: url }));
          } else if (mediaPickerTarget === "gallery") {
            setFormData((prev) => ({
              ...prev,
              product_images: Array.from(new Set([...(prev.product_images || []), url])),
            }));
          }
          setMediaPickerOpen(false);
          showNotification("Image selected successfully!", "success");
        }}
        initialBucket="ProductImages"
        initialFolder="cabinets"
        title="Select Image from Supabase Media Storage"
      />
    </div>
  );
}
