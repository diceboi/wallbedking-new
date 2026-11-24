"use client";

import { useState, useEffect, useMemo } from "react";
import {
  IconBuildingStore,
  IconPercentage,
  IconCreditCard,
  IconBrandPaypal,
  IconBuildingBank,
  IconCheck,
  IconAlertCircle,
  IconDeviceFloppy,
  IconRefresh,
  IconSearch,
  IconDatabase,
  IconPackage,
  IconBox,
  IconEye,
  IconEyeOff,
  IconExternalLink,
} from "@tabler/icons-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  WHOLESALE_MARKETS,
  WHOLESALE_TIER_TYPES,
  DEFAULT_WHOLESALE_TIERS_CONFIG,
  DEFAULT_WHOLESALE_PAYMENT_SETTINGS,
  formatWholesaleRoleKey,
} from "@/lib/wholesale-constants";

const PRICE_LIST_OPTIONS = [
  { value: "auto", label: "Auto (Market currency → USD fallback)" },
  { value: "hk_usd", label: "Always HK USD" },
  { value: "uk_gbp", label: "UK GBP (Excl. VAT) → USD fallback" },
  { value: "eu_eur", label: "EU EUR (Excl. VAT) → USD fallback" },
  { value: "us_usd", label: "US USD → HK USD fallback" },
];

export default function AdminWholesalePage() {
  const [activeTab, setActiveTab] = useState("tiers"); // "tiers" | "prices" | "payments"
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncingSql, setSyncingSql] = useState(false);
  const [toast, setToast] = useState(null);

  // Tiers & payment settings
  const [tiersConfig, setTiersConfig] = useState(DEFAULT_WHOLESALE_TIERS_CONFIG);
  const [paymentSettings, setPaymentSettings] = useState(DEFAULT_WHOLESALE_PAYMENT_SETTINGS);
  const [selectedMarket, setSelectedMarket] = useState("fr");

  // Product wholesale prices
  const [products, setProducts] = useState([]);
  const [pricesMap, setPricesMap] = useState({});
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [onlyWithPrice, setOnlyWithPrice] = useState(false);
  const [savingProdId, setSavingProdId] = useState(null);
  const [draftEdits, setDraftEdits] = useState({});

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 5000);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [tiersRes, pricesRes, prodsRes] = await Promise.all([
        fetch(`/api/admin/wholesale/tiers?_t=${Date.now()}`, { cache: "no-store" }),
        fetch(`/api/admin/wholesale/prices?_t=${Date.now()}`, { cache: "no-store" }),
        fetch(`/api/admin/products?limit=1000&_t=${Date.now()}`, { cache: "no-store" }),
      ]);
      const tiersData = await tiersRes.json();
      const pricesData = await pricesRes.json();
      const prodsData = await prodsRes.json();

      if (tiersData?.success) {
        if (tiersData.tiersConfig) setTiersConfig(tiersData.tiersConfig);
        if (tiersData.paymentSettings) setPaymentSettings(tiersData.paymentSettings);
      }
      if (pricesData?.success && pricesData.prices) {
        setPricesMap(pricesData.prices);
      }
      if (Array.isArray(prodsData?.products)) {
        setProducts(prodsData.products);
      } else if (Array.isArray(prodsData)) {
        setProducts(prodsData);
      }
    } catch (err) {
      showToast("error", `Failed to load wholesale settings: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleTierDefaultChange = (tierId, field, value) => {
    setTiersConfig((prev) => ({
      ...prev,
      tierDefaults: {
        ...prev.tierDefaults,
        [tierId]: {
          ...(prev.tierDefaults?.[tierId] || {}),
          [field]: value,
        },
      },
    }));
  };

  const handleMarketOverrideChange = (marketCode, tierId, field, value) => {
    const key = `${marketCode}-${tierId}`;
    setTiersConfig((prev) => {
      const existing = prev.marketOverrides?.[key] || {};
      const base = prev.tierDefaults?.[tierId] || {
        discountPercent: 0,
        allowSingleUnit: true,
        allowContainer: true,
        priceList: "auto",
      };
      return {
        ...prev,
        marketOverrides: {
          ...(prev.marketOverrides || {}),
          [key]: {
            ...base,
            ...existing,
            [field]: value,
          },
        },
      };
    });
  };

  const handleClearMarketOverride = (marketCode, tierId) => {
    const key = `${marketCode}-${tierId}`;
    setTiersConfig((prev) => {
      const next = { ...(prev.marketOverrides || {}) };
      delete next[key];
      return { ...prev, marketOverrides: next };
    });
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/wholesale/tiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tiersConfig, paymentSettings }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Wholesale roles, discounts & payment methods saved!");
      } else {
        showToast("error", data.error || "Failed to save wholesale configuration.");
      }
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSyncToProductsColumns = async () => {
    setSyncingSql(true);
    try {
      const res = await fetch("/api/admin/wholesale/tiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_products_columns" }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", `Synced ${data.synced} product wholesale prices into native Supabase products columns!`);
      } else {
        showToast("error", data.error || "Sync failed. Ensure supabase/wholesale_schema.sql has been executed.");
      }
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setSyncingSql(false);
    }
  };

  const getProductWholesaleRow = (prod) => {
    const key = String(prod.id);
    const saved = pricesMap[key] || {};
    const draft = draftEdits[key] || {};
    return {
      wholesale_hk_usd: draft.wholesale_hk_usd ?? saved.wholesale_hk_usd ?? prod.wholesale_hk_usd ?? "",
      wholesale_uk_gbp: draft.wholesale_uk_gbp ?? saved.wholesale_uk_gbp ?? prod.wholesale_uk_gbp ?? "",
      wholesale_eu_eur: draft.wholesale_eu_eur ?? saved.wholesale_eu_eur ?? prod.wholesale_eu_eur ?? "",
      wholesale_us_usd: draft.wholesale_us_usd ?? saved.wholesale_us_usd ?? prod.wholesale_us_usd ?? "",
      container_qty: draft.container_qty ?? saved.container_qty ?? prod.container_qty ?? "",
      wholesale_visible:
        draft.wholesale_visible !== undefined
          ? draft.wholesale_visible
          : saved.wholesale_visible !== undefined
          ? saved.wholesale_visible
          : prod.wholesale_visible !== false,
    };
  };

  const updateDraftField = (prodId, field, value) => {
    const key = String(prodId);
    setDraftEdits((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [field]: value,
      },
    }));
  };

  const saveSingleProductPrice = async (prod) => {
    const key = String(prod.id);
    const row = getProductWholesaleRow(prod);
    setSavingProdId(key);
    try {
      const res = await fetch("/api/admin/wholesale/prices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: prod.id,
          wholesale_hk_usd: row.wholesale_hk_usd === "" ? null : Number(row.wholesale_hk_usd),
          wholesale_uk_gbp: row.wholesale_uk_gbp === "" ? null : Number(row.wholesale_uk_gbp),
          wholesale_eu_eur: row.wholesale_eu_eur === "" ? null : Number(row.wholesale_eu_eur),
          wholesale_us_usd: row.wholesale_us_usd === "" ? null : Number(row.wholesale_us_usd),
          container_qty: row.container_qty === "" ? null : parseInt(row.container_qty, 10),
          wholesale_visible: Boolean(row.wholesale_visible),
        }),
      });
      const data = await res.json();
      if (data.success && data.price) {
        setPricesMap((prev) => ({ ...prev, [key]: data.price }));
        setDraftEdits((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
        showToast("success", `Saved wholesale pricing for #${prod.id} (${prod.sku || prod.name}).`);
      } else {
        showToast("error", data.error || "Failed to save product wholesale price.");
      }
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setSavingProdId(null);
    }
  };

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryFilter !== "all") {
        const pc = String(p.parent_category || "").toLowerCase();
        if (categoryFilter === "beds") {
          if (!["beds", "morphy-beds", "traditional-beds"].includes(pc)) return false;
        } else if (pc !== categoryFilter) {
          return false;
        }
      }
      const row = getProductWholesaleRow(p);
      if (onlyWithPrice && !row.wholesale_hk_usd && !row.wholesale_uk_gbp && !row.wholesale_eu_eur) {
        return false;
      }
      if (!q) return true;
      return (
        String(p.id).includes(q) ||
        String(p.name || "").toLowerCase().includes(q) ||
        String(p.sku || "").toLowerCase().includes(q) ||
        String(p.ean || "").toLowerCase().includes(q)
      );
    });
  }, [products, search, categoryFilter, onlyWithPrice, pricesMap, draftEdits]);

  const pricedCount = useMemo(
    () =>
      Object.values(pricesMap).filter(
        (r) => r?.wholesale_hk_usd || r?.wholesale_uk_gbp || r?.wholesale_eu_eur || r?.wholesale_us_usd
      ).length,
    [pricesMap]
  );

  return (
    <div className="space-y-6 pb-20 font-poppins">
      <AdminPageHeader
        title="Wholesale & B2B Portal"
        description="Manage country partner roles (e.g. fr-retailer, uk-trade-partner), tier discounts, net product/container prices (excl. VAT), and B2B payment methods."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/en/wholesale"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-wbk-lightgrey bg-white hover:border-wbk-black text-wbk-black transition-colors"
            >
              <IconExternalLink size={14} />
              <span>Preview /en/wholesale</span>
            </a>
            <button
              type="button"
              onClick={loadAll}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-wbk-lightgrey bg-white hover:border-wbk-black text-wbk-black transition-colors cursor-pointer"
            >
              <IconRefresh size={14} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
            {activeTab !== "prices" && (
              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-wbk-black hover:bg-wbk-green text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                <IconDeviceFloppy size={15} />
                <span>{saving ? "Saving..." : "Save Configuration"}</span>
              </button>
            )}
          </div>
        }
      />

      {toast && (
        <div
          className={`p-3.5 text-xs font-medium flex items-center gap-2 border ${
            toast.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-900"
          }`}
        >
          {toast.type === "error" ? <IconAlertCircle size={16} /> : <IconCheck size={16} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-wbk-lightgrey pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("tiers")}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === "tiers"
              ? "bg-wbk-black text-white"
              : "bg-white border border-wbk-lightgrey text-wbk-brown hover:text-wbk-black"
          }`}
        >
          <IconPercentage size={15} />
          <span>Partner Roles & Discounts</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("prices")}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === "prices"
              ? "bg-wbk-black text-white"
              : "bg-white border border-wbk-lightgrey text-wbk-brown hover:text-wbk-black"
          }`}
        >
          <IconPackage size={15} />
          <span>Product Net Prices & Containers ({pricedCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("payments")}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === "payments"
              ? "bg-wbk-black text-white"
              : "bg-white border border-wbk-lightgrey text-wbk-brown hover:text-wbk-black"
          }`}
        >
          <IconCreditCard size={15} />
          <span>Wholesale Payment Methods</span>
        </button>
      </div>

      {/* TAB 1: PARTNER ROLES & DISCOUNTS */}
      {activeTab === "tiers" && (
        <div className="space-y-6">
          {/* Global Tier Defaults */}
          <div className="bg-white border border-wbk-lightgrey p-5 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-wbk-black">Global Partner Tier Defaults</h2>
              <p className="text-xs text-wbk-brown mt-0.5">
                Applied across all countries unless overridden per country below. All prices remain strictly <strong>Net (Excl. VAT)</strong>.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F7F5] border-y border-wbk-lightgrey text-[10px] uppercase tracking-wider text-wbk-brown">
                  <tr>
                    <th className="py-2.5 px-3">Partner Role</th>
                    <th className="py-2.5 px-3">Discount off Wholesale (%)</th>
                    <th className="py-2.5 px-3">Price List Source</th>
                    <th className="py-2.5 px-3 text-center">Single Unit</th>
                    <th className="py-2.5 px-3 text-center">Full Container</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wbk-lightgrey/60">
                  {WHOLESALE_TIER_TYPES.map((tier) => {
                    const rule = tiersConfig?.tierDefaults?.[tier.id] || {
                      discountPercent: 0,
                      allowSingleUnit: true,
                      allowContainer: true,
                      priceList: "auto",
                    };
                    return (
                      <tr key={tier.id} className="hover:bg-[#FCFBF9]">
                        <td className="py-3 px-3 font-semibold text-wbk-black">
                          {tier.label}
                          <span className="block text-[10px] font-mono text-wbk-brown font-normal">{tier.id}</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              max="90"
                              step="0.5"
                              value={rule.discountPercent ?? 0}
                              onChange={(e) =>
                                handleTierDefaultChange(tier.id, "discountPercent", Number(e.target.value))
                              }
                              className="w-20 px-2.5 py-1.5 border border-wbk-lightgrey text-xs font-mono"
                            />
                            <span className="text-wbk-brown">%</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={rule.priceList || "auto"}
                            onChange={(e) => handleTierDefaultChange(tier.id, "priceList", e.target.value)}
                            className="px-2.5 py-1.5 border border-wbk-lightgrey text-xs bg-white"
                          >
                            {PRICE_LIST_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={rule.allowSingleUnit !== false}
                            onChange={(e) => handleTierDefaultChange(tier.id, "allowSingleUnit", e.target.checked)}
                            className="w-4 h-4 accent-wbk-black cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={rule.allowContainer !== false}
                            onChange={(e) => handleTierDefaultChange(tier.id, "allowContainer", e.target.checked)}
                            className="w-4 h-4 accent-wbk-black cursor-pointer"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Country-Specific Overrides */}
          <div className="bg-white border border-wbk-lightgrey p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-wbk-black">Country-Specific Role Overrides</h2>
                <p className="text-xs text-wbk-brown mt-0.5">
                  Customize discounts & access individually per country role (e.g. <code className="bg-gray-100 px-1">fr-retailer</code>, <code className="bg-gray-100 px-1">de-interior-designer</code>).
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {WHOLESALE_MARKETS.map((m) => (
                  <button
                    key={m.code}
                    type="button"
                    onClick={() => setSelectedMarket(m.code)}
                    className={`px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer ${
                      selectedMarket === m.code
                        ? "bg-wbk-black text-white border-wbk-black"
                        : "bg-white border-wbk-lightgrey text-wbk-brown hover:border-wbk-black"
                    }`}
                  >
                    {m.flag} {m.label} ({m.currency})
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F7F5] border-y border-wbk-lightgrey text-[10px] uppercase tracking-wider text-wbk-brown">
                  <tr>
                    <th className="py-2.5 px-3">Role Key</th>
                    <th className="py-2.5 px-3">Discount (%)</th>
                    <th className="py-2.5 px-3">Price List</th>
                    <th className="py-2.5 px-3 text-center">Single Unit</th>
                    <th className="py-2.5 px-3 text-center">Full Container</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wbk-lightgrey/60">
                  {WHOLESALE_TIER_TYPES.map((tier) => {
                    const key = `${selectedMarket}-${tier.id}`;
                    const override = tiersConfig?.marketOverrides?.[key];
                    const base = tiersConfig?.tierDefaults?.[tier.id] || {
                      discountPercent: 0,
                      allowSingleUnit: true,
                      allowContainer: true,
                      priceList: "auto",
                    };
                    const eff = { ...base, ...(override || {}) };
                    const roleKey = formatWholesaleRoleKey(selectedMarket, tier.id);

                    return (
                      <tr key={key} className="hover:bg-[#FCFBF9]">
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-wbk-black">{roleKey}</span>
                          <span className="block text-[10px] text-wbk-brown">{tier.label}</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              max="90"
                              step="0.5"
                              value={eff.discountPercent ?? 0}
                              onChange={(e) =>
                                handleMarketOverrideChange(selectedMarket, tier.id, "discountPercent", Number(e.target.value))
                              }
                              className="w-20 px-2.5 py-1.5 border border-wbk-lightgrey text-xs font-mono"
                            />
                            <span className="text-wbk-brown">%</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={eff.priceList || "auto"}
                            onChange={(e) =>
                              handleMarketOverrideChange(selectedMarket, tier.id, "priceList", e.target.value)
                            }
                            className="px-2.5 py-1.5 border border-wbk-lightgrey text-xs bg-white"
                          >
                            {PRICE_LIST_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={eff.allowSingleUnit !== false}
                            onChange={(e) =>
                              handleMarketOverrideChange(selectedMarket, tier.id, "allowSingleUnit", e.target.checked)
                            }
                            className="w-4 h-4 accent-wbk-black cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={eff.allowContainer !== false}
                            onChange={(e) =>
                              handleMarketOverrideChange(selectedMarket, tier.id, "allowContainer", e.target.checked)
                            }
                            className="w-4 h-4 accent-wbk-black cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-3 text-right">
                          {override ? (
                            <button
                              type="button"
                              onClick={() => handleClearMarketOverride(selectedMarket, tier.id)}
                              className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 hover:bg-amber-100 cursor-pointer"
                            >
                              Custom (Reset)
                            </button>
                          ) : (
                            <span className="text-[11px] text-wbk-brown">Inherits default</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT NET PRICES & CONTAINERS */}
      {activeTab === "prices" && (
        <div className="space-y-4">
          <div className="bg-white border border-wbk-lightgrey p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-wbk-brown" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search ID, name, SKU, or EAN..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-wbk-lightgrey focus:border-wbk-black outline-none"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-wbk-lightgrey bg-white"
              >
                <option value="all">All Categories ({products.length})</option>
                <option value="tables">Smart Tables</option>
                <option value="beds">Wall Beds</option>
                <option value="mattresses">Mattresses</option>
                <option value="cabinets">Cabinets</option>
                <option value="sofas">Sofas</option>
              </select>
              <label className="inline-flex items-center gap-1.5 text-xs text-wbk-black cursor-pointer ml-1">
                <input
                  type="checkbox"
                  checked={onlyWithPrice}
                  onChange={(e) => setOnlyWithPrice(e.target.checked)}
                  className="accent-wbk-black"
                />
                <span>Only priced items ({pricedCount})</span>
              </label>
            </div>

            <button
              type="button"
              onClick={handleSyncToProductsColumns}
              disabled={syncingSql}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-emerald-700 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-50"
              title="Pushes all wholesale prices into native Supabase products columns after running supabase/wholesale_schema.sql"
            >
              <IconDatabase size={15} />
              <span>{syncingSql ? "Syncing..." : "Sync to SQL Products Columns"}</span>
            </button>
          </div>

          <div className="bg-white border border-wbk-lightgrey overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F7F5] border-b border-wbk-lightgrey text-[10px] uppercase tracking-wider text-wbk-brown">
                <tr>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-2">HK USD (Fallback)</th>
                  <th className="py-3 px-2">UK GBP (Excl. VAT)</th>
                  <th className="py-3 px-2">EU EUR (Excl. VAT)</th>
                  <th className="py-3 px-2">US USD</th>
                  <th className="py-3 px-2">Qty / Container</th>
                  <th className="py-3 px-2 text-center">Visible</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wbk-lightgrey/60">
                {filteredProducts.slice(0, 150).map((p) => {
                  const row = getProductWholesaleRow(p);
                  const isDirty = Boolean(draftEdits[String(p.id)]);
                  const isSavingThis = savingProdId === String(p.id);
                  return (
                    <tr key={p.id} className="hover:bg-[#FCFBF9]">
                      <td className="py-2.5 px-3 max-w-[260px]">
                        <div className="font-semibold text-wbk-black truncate">
                          #{p.id} {p.name}
                        </div>
                        <div className="text-[10px] text-wbk-brown font-mono truncate">
                          {p.sku || "No SKU"} {p.ean ? `• ${p.ean}` : ""}
                        </div>
                      </td>
                      <td className="py-2.5 px-2">
                        <input
                          type="number"
                          step="0.01"
                          value={row.wholesale_hk_usd}
                          onChange={(e) => updateDraftField(p.id, "wholesale_hk_usd", e.target.value)}
                          placeholder="$"
                          className="w-24 px-2 py-1 border border-wbk-lightgrey font-mono text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-2">
                        <input
                          type="number"
                          step="0.01"
                          value={row.wholesale_uk_gbp}
                          onChange={(e) => updateDraftField(p.id, "wholesale_uk_gbp", e.target.value)}
                          placeholder="£"
                          className="w-24 px-2 py-1 border border-wbk-lightgrey font-mono text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-2">
                        <input
                          type="number"
                          step="0.01"
                          value={row.wholesale_eu_eur}
                          onChange={(e) => updateDraftField(p.id, "wholesale_eu_eur", e.target.value)}
                          placeholder="€"
                          className="w-24 px-2 py-1 border border-wbk-lightgrey font-mono text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-2">
                        <input
                          type="number"
                          step="0.01"
                          value={row.wholesale_us_usd}
                          onChange={(e) => updateDraftField(p.id, "wholesale_us_usd", e.target.value)}
                          placeholder="$"
                          className="w-24 px-2 py-1 border border-wbk-lightgrey font-mono text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-2">
                        <input
                          type="number"
                          step="1"
                          min="1"
                          value={row.container_qty}
                          onChange={(e) => updateDraftField(p.id, "container_qty", e.target.value)}
                          placeholder="pcs"
                          className="w-20 px-2 py-1 border border-wbk-lightgrey font-mono text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => updateDraftField(p.id, "wholesale_visible", !row.wholesale_visible)}
                          className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold border cursor-pointer ${
                            row.wholesale_visible
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          }`}
                        >
                          {row.wholesale_visible ? <IconEye size={12} /> : <IconEyeOff size={12} />}
                          <span>{row.wholesale_visible ? "Shown" : "Hidden"}</span>
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => saveSingleProductPrice(p)}
                          disabled={isSavingThis}
                          className={`px-3 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                            isDirty
                              ? "bg-wbk-green text-white hover:bg-wbk-black"
                              : "border border-wbk-lightgrey text-wbk-black hover:border-wbk-black bg-white"
                          }`}
                        >
                          {isSavingThis ? "..." : "Save"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredProducts.length > 150 && (
              <div className="p-3 text-center text-[11px] text-wbk-brown bg-[#F8F7F5] border-t border-wbk-lightgrey">
                Showing first 150 of {filteredProducts.length} products. Use search or category filter to narrow down.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: WHOLESALE PAYMENT METHODS */}
      {activeTab === "payments" && (
        <div className="bg-white border border-wbk-lightgrey p-6 space-y-5 max-w-3xl">
          <div>
            <h2 className="text-sm font-bold text-wbk-black">Wholesale Checkout Payment Methods</h2>
            <p className="text-xs text-wbk-brown mt-0.5">
              Choose which payment methods are available for B2B wholesale orders. Shipping is arranged separately (no retail shipping charges).
            </p>
          </div>

          {[
            {
              key: "bankTransfer",
              title: "Bank Transfer / Proforma Wire",
              desc: "Recommended for B2B & container orders. Sends net (excl. VAT) order confirmation & bank wire coordinates.",
              icon: IconBuildingBank,
            },
            {
              key: "paypal",
              title: "PayPal Business",
              desc: "Allows wholesale partners to pay immediately via PayPal.",
              icon: IconBrandPaypal,
            },
            {
              key: "stripe",
              title: "Credit / Debit Card (Stripe)",
              desc: "Allows corporate card payments via Stripe checkout.",
              icon: IconCreditCard,
            },
          ].map((gw) => {
            const Icon = gw.icon;
            const cfg = paymentSettings[gw.key] || {};
            return (
              <div
                key={gw.key}
                className={`p-4 border flex items-start justify-between gap-4 ${
                  cfg.enabled ? "border-wbk-black bg-[#FBF9F8]" : "border-wbk-lightgrey bg-white opacity-75"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded bg-wbk-black/5 text-wbk-black flex items-center justify-center shrink-0">
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-wbk-black">{gw.title}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                          cfg.enabled ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {cfg.enabled ? "Active" : "Disabled"}
                      </span>
                    </div>
                    <p className="text-[11px] text-wbk-brown mt-0.5">{gw.desc}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={Boolean(cfg.enabled)}
                    onChange={() =>
                      setPaymentSettings((prev) => ({
                        ...prev,
                        [gw.key]: {
                          ...prev[gw.key],
                          enabled: !prev[gw.key]?.enabled,
                        },
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-wbk-black" />
                </label>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
