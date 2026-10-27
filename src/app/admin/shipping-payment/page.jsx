"use client";

import { useState, useEffect, useMemo } from "react";
import {
  IconTruck,
  IconCreditCard,
  IconBrandPaypal,
  IconBuildingBank,
  IconCheck,
  IconAlertCircle,
  IconRefresh,
  IconCopy,
  IconEye,
  IconDeviceFloppy,
  IconBolt,
  IconPackage,
  IconArrowRight,
  IconMapPin,
  IconClock,
  IconCurrencyPound,
  IconCurrencyDollar,
  IconCurrencyEuro,
  IconDatabase,
} from "@tabler/icons-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const MARKETS = [
  { code: "en", label: "UK", name: "United Kingdom", flag: "🇬🇧", currency: "GBP", symbol: "£" },
  { code: "us", label: "US", name: "United States", flag: "🇺🇸", currency: "USD", symbol: "$" },
  { code: "de", label: "DE", name: "Deutschland & Österreich", flag: "🇩🇪", currency: "EUR", symbol: "€" },
  { code: "fr", label: "FR", name: "France", flag: "🇫🇷", currency: "EUR", symbol: "€" },
  { code: "es", label: "ES", name: "España", flag: "🇪🇸", currency: "EUR", symbol: "€" },
  { code: "por", label: "POR", name: "Portugal", flag: "🇵🇹", currency: "EUR", symbol: "€" },
  { code: "it", label: "IT", name: "Italia", flag: "🇮🇹", currency: "EUR", symbol: "€" },
];

export default function AdminShippingPaymentPage() {
  const [settings, setSettings] = useState(null);
  const [activeLocale, setActiveLocale] = useState("en");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [copySourceLocale, setCopySourceLocale] = useState("");
  const [fromSupabase, setFromSupabase] = useState(false);
  const [dbTableMissing, setDbTableMissing] = useState(false);
  const [syncingToSupabase, setSyncingToSupabase] = useState(false);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4500);
  };

  // Load settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/checkout-settings?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
        setFromSupabase(Boolean(data.fromSupabase));
        setDbTableMissing(Boolean(data.dbTableMissing));
        setHasChanges(false);
      } else {
        showToast("error", "Failed to load checkout settings.");
      }
    } catch (err) {
      showToast("error", "Network error while loading settings.");
    } finally {
      setLoading(false);
    }
  };

  const currentConfig = useMemo(() => {
    if (!settings || !settings[activeLocale]) return null;
    return settings[activeLocale];
  }, [settings, activeLocale]);

  // Update a payment field for active locale
  const handlePaymentToggle = (gatewayKey) => {
    if (!settings) return;
    setSettings((prev) => {
      const localeConf = prev[activeLocale] || {};
      const currentGateway = localeConf.payments?.[gatewayKey] || {};
      return {
        ...prev,
        [activeLocale]: {
          ...localeConf,
          payments: {
            ...localeConf.payments,
            [gatewayKey]: {
              ...currentGateway,
              enabled: !currentGateway.enabled,
            },
          },
        },
      };
    });
    setHasChanges(true);
  };

  const handlePaymentChange = (gatewayKey, field, value) => {
    if (!settings) return;
    setSettings((prev) => {
      const localeConf = prev[activeLocale] || {};
      const currentGateway = localeConf.payments?.[gatewayKey] || {};
      return {
        ...prev,
        [activeLocale]: {
          ...localeConf,
          payments: {
            ...localeConf.payments,
            [gatewayKey]: {
              ...currentGateway,
              [field]: value,
            },
          },
        },
      };
    });
    setHasChanges(true);
  };

  // Update a shipping field for active locale
  const handleShippingToggle = (tierKey) => {
    if (!settings) return;
    setSettings((prev) => {
      const localeConf = prev[activeLocale] || {};
      const currentTier = localeConf.shipping?.[tierKey] || {};
      return {
        ...prev,
        [activeLocale]: {
          ...localeConf,
          shipping: {
            ...localeConf.shipping,
            [tierKey]: {
              ...currentTier,
              enabled: !currentTier.enabled,
            },
          },
        },
      };
    });
    setHasChanges(true);
  };

  const handleShippingChange = (tierKey, field, value) => {
    if (!settings) return;
    setSettings((prev) => {
      const localeConf = prev[activeLocale] || {};
      const currentTier = localeConf.shipping?.[tierKey] || {};
      return {
        ...prev,
        [activeLocale]: {
          ...localeConf,
          shipping: {
            ...localeConf.shipping,
            [tierKey]: {
              ...currentTier,
              [field]: value,
            },
          },
        },
      };
    });
    setHasChanges(true);
  };

  // Copy settings from another country
  const handleCopyFromCountry = (sourceLocale) => {
    if (!sourceLocale || sourceLocale === activeLocale || !settings[sourceLocale]) return;
    const source = JSON.parse(JSON.stringify(settings[sourceLocale]));

    setSettings((prev) => ({
      ...prev,
      [activeLocale]: {
        ...prev[activeLocale],
        payments: source.payments,
        shipping: source.shipping,
      },
    }));
    setHasChanges(true);
    setCopySourceLocale("");
    showToast(
      "success",
      `Settings copied from ${source.countryName || sourceLocale.toUpperCase()} to ${
        prevCountryName(activeLocale)
      }!`
    );
  };

  const prevCountryName = (code) => {
    return MARKETS.find((m) => m.code === code)?.name || code.toUpperCase();
  };

  // Save changes to API
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/checkout-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.settings) {
          setSettings(data.settings);
        }
        if (data.savedToSupabase) {
          setFromSupabase(true);
          setDbTableMissing(false);
        } else if (data.dbTableMissing) {
          setDbTableMissing(true);
          setFromSupabase(false);
        }
        setHasChanges(false);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("wbk_settings_updated"));
          localStorage.setItem("wbk_settings_updated", Date.now().toString());
        }
        if (data.savedToSupabase) {
          showToast("success", "Beállítások elmentve és Supabase adatbázisba szinkronizálva!");
        } else if (data.dbTableMissing) {
          showToast("error", "Helyi gyorsítótárba mentve, de a Supabase tábla hiányzik! Futtasd le a supabase/checkout_settings.sql szkriptet.");
        } else {
          showToast("success", "Beállítások sikeresen elmentve!");
        }
      } else {
        showToast("error", data.error || "A mentés nem sikerült.");
      }
    } catch (err) {
      showToast("error", "Hálózati hiba történt a mentés során.");
    } finally {
      setSaving(false);
    }
  };

  const handleSyncToSupabase = async () => {
    setSyncingToSupabase(true);
    try {
      const res = await fetch("/api/admin/checkout-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_to_supabase" }),
      });
      const data = await res.json();
      if (data.savedToSupabase) {
        showToast("success", "Minden piac beállítása sikeresen szinkronizálva a Supabase adatbázisba!");
        fetchSettings();
      } else {
        showToast("error", data.message || "A szinkronizálás nem sikerült.");
      }
    } catch (err) {
      showToast("error", "Hálózati hiba történt a szinkronizálás során.");
    } finally {
      setSyncingToSupabase(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="space-y-6 font-poppins max-w-7xl">
        <AdminPageHeader
          badge="Store Operations"
          title="Shipping & Payment Methods"
          description="Configure payment gateways and delivery options by country and market"
        />
        <div className="p-12 text-center bg-white border border-wbk-lightgrey/60 space-y-3">
          <div className="w-8 h-8 border-2 border-wbk-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-wbk-brown font-medium">Loading store configurations...</p>
        </div>
      </div>
    );
  }

  const activeMarket = MARKETS.find((m) => m.code === activeLocale) || MARKETS[0];
  const currencySymbol = currentConfig?.currencySymbol || activeMarket.symbol;

  return (
    <div className="space-y-6 font-poppins max-w-7xl pb-16">
      {/* Page Header */}
      <AdminPageHeader
        badge="Store Operations"
        title="Shipping & Payment Methods"
        count={`${MARKETS.length} Markets`}
        description="Enable or disable payment gateways (Stripe, PayPal, Bank Wire) and delivery speeds per country. Changes take effect on the storefront immediately."
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={fetchSettings}
              disabled={saving}
              className="px-3.5 py-2 border border-wbk-lightgrey bg-white hover:border-wbk-black text-xs font-medium uppercase tracking-wider text-wbk-black transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <IconRefresh size={14} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="px-5 py-2 bg-wbk-black hover:bg-wbk-green hover:text-wbk-black text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-xs flex items-center gap-2 disabled:opacity-40 disabled:hover:bg-wbk-black disabled:hover:text-white cursor-pointer"
            >
              {saving ? (
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <IconDeviceFloppy size={15} />
              )}
              <span>{saving ? "Saving..." : hasChanges ? "Save Changes *" : "Saved"}</span>
            </button>
          </div>
        }
      />

      {/* Database Storage Status Banner */}
      {fromSupabase ? (
        <div className="bg-emerald-50 border border-emerald-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <IconDatabase size={16} className="text-emerald-600 shrink-0" />
            <span className="font-semibold">Connected to Supabase Database:</span>
            <span>
              Shipping and payment methods are loaded dynamically and saved directly in{" "}
              <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono text-emerald-800">
                public.checkout_settings
              </code>
              .
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSyncToSupabase}
              disabled={syncingToSupabase}
              className="px-2.5 py-1 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded text-[11px] font-medium transition-colors cursor-pointer"
            >
              {syncingToSupabase ? "Syncing..." : "Force DB Re-sync"}
            </button>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live DB Synced
            </span>
          </div>
        </div>
      ) : dbTableMissing ? (
        <div className="bg-amber-50 border border-amber-300 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-start gap-2.5">
            <IconAlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">Database Table Setup Ready</p>
              <p className="text-amber-800 mt-0.5">
                To store shipping and payment options directly in Supabase, run the migration script in{" "}
                <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-semibold">
                  supabase/checkout_settings.sql
                </code>{" "}
                in your Supabase SQL Editor. Currently operating in fallback cache mode.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText("supabase/checkout_settings.sql");
                showToast("success", "Szkript elérési út másolva: supabase/checkout_settings.sql");
              }}
              className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 font-semibold rounded text-[11px] whitespace-nowrap transition-colors cursor-pointer"
            >
              Copy Script Path
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-sky-50 border border-sky-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-sky-950">
          <div className="flex items-center gap-2">
            <IconDatabase size={16} className="text-sky-600 shrink-0" />
            <span className="font-semibold">Supabase Table Ready:</span>
            <span>Table found, but no market records yet. Click to sync default settings.</span>
          </div>
          <button
            type="button"
            onClick={handleSyncToSupabase}
            disabled={syncingToSupabase}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded text-[11px] whitespace-nowrap transition-colors cursor-pointer self-start sm:self-center"
          >
            {syncingToSupabase ? "Syncing to Supabase..." : "Sync All Defaults to Supabase"}
          </button>
        </div>
      )}

      {/* Floating Save Notification if Unsaved Changes */}
      {hasChanges && (
        <div className="bg-amber-50 border border-amber-300 p-3.5 flex items-center justify-between gap-3 text-amber-900 text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <IconAlertCircle size={17} className="text-amber-700 shrink-0" />
            <span className="font-medium">
              You have unsaved changes for <strong>{activeMarket.name}</strong>. Remember to click <strong>Save Changes</strong> to publish them to the live storefront.
            </span>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1 bg-amber-900 text-white hover:bg-amber-800 text-[11px] font-semibold uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
          >
            Save Now
          </button>
        </div>
      )}

      {/* Toast Feedback */}
      {toast && (
        <div
          className={`p-3.5 text-xs font-medium flex items-center gap-2 border ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {toast.type === "success" ? <IconCheck size={16} /> : <IconAlertCircle size={16} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Market / Country Selector Tabs */}
      <div className="bg-white border border-wbk-lightgrey/60 p-2 shadow-xs">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-wbk-brown px-3 pt-2 pb-1.5 flex items-center justify-between">
          <span>Select Storefront Market:</span>
          <span className="text-[10px] text-wbk-brown/70 lowercase">
            currency: {currentConfig?.currency || activeMarket.currency} ({currencySymbol})
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
          {MARKETS.map((m) => {
            const isSelected = activeLocale === m.code;
            const conf = settings[m.code] || {};
            const stripeOn = conf.payments?.stripe?.enabled;
            const paypalOn = conf.payments?.paypal?.enabled;
            const activeShippingCount = Object.values(conf.shipping || {}).filter((s) => s.enabled).length;

            return (
              <button
                key={m.code}
                type="button"
                onClick={() => setActiveLocale(m.code)}
                className={`p-3 text-left border transition-all cursor-pointer relative ${
                  isSelected
                    ? "border-wbk-black bg-[#FBF9F8] shadow-xs"
                    : "border-wbk-lightgrey/70 bg-white hover:border-wbk-brown hover:bg-[#FAF9F6]"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xl">{m.flag}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected ? "bg-wbk-black text-white" : "bg-wbk-lightgrey/50 text-wbk-black"
                    }`}
                  >
                    {m.label}
                  </span>
                </div>
                <div className="text-xs font-semibold text-wbk-black truncate">{m.name}</div>
                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-wbk-brown">
                  <span className={`w-1.5 h-1.5 rounded-full ${stripeOn ? "bg-emerald-500" : "bg-gray-300"}`} title="Stripe" />
                  <span className={`w-1.5 h-1.5 rounded-full ${paypalOn ? "bg-blue-500" : "bg-gray-300"}`} title="PayPal" />
                  <span className="text-[9.5px] font-mono text-wbk-brown/70 ml-auto">
                    {activeShippingCount} ship
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Configuration Workspace: 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Market Bar & Quick Tools */}
          <div className="bg-[#FAF8F5] p-4 border border-wbk-lightgrey flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activeMarket.flag}</span>
              <div>
                <h2 className="font-new-york text-lg text-wbk-black flex items-center gap-2">
                  <span>{activeMarket.name}</span>
                  <span className="text-xs font-poppins px-2 py-0.5 bg-white border border-wbk-lightgrey font-semibold">
                    Locale: {activeLocale}
                  </span>
                </h2>
                <p className="text-xs text-wbk-brown">
                  Storefront URL: <code className="bg-white px-1.5 py-0.5 text-[11px]">/{activeLocale}</code> • Currency: <strong>{currentConfig?.currency} ({currencySymbol})</strong>
                </p>
              </div>
            </div>

            {/* Copy Settings tool */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <select
                value={copySourceLocale}
                onChange={(e) => {
                  setCopySourceLocale(e.target.value);
                  if (e.target.value) handleCopyFromCountry(e.target.value);
                }}
                className="text-xs bg-white border border-wbk-lightgrey px-2.5 py-1.5 focus:outline-none focus:border-wbk-black font-medium"
              >
                <option value="">Copy settings from...</option>
                {MARKETS.filter((m) => m.code !== activeLocale).map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.flag} {m.name} ({m.label})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 1: Payment Gateways */}
          <div className="bg-white border border-wbk-lightgrey/80 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-wbk-lightgrey/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-full">
                  <IconCreditCard size={18} />
                </div>
                <div>
                  <h3 className="font-poppins text-sm font-semibold text-wbk-black">
                    Payment Gateways ({activeMarket.label})
                  </h3>
                  <p className="text-[11px] text-wbk-brown">
                    Select which payment methods are accepted for customers shopping in {activeMarket.name}.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Stripe Gateway */}
              <div
                className={`p-4 border transition-all ${
                  currentConfig?.payments?.stripe?.enabled
                    ? "border-wbk-black bg-[#FBF9F8]"
                    : "border-wbk-lightgrey bg-white opacity-70"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center shrink-0 mt-0.5">
                      <IconCreditCard size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-wbk-black">Stripe (Credit / Debit Card)</span>
                        <button
                          type="button"
                          onClick={() => handlePaymentToggle("stripe")}
                          className={`text-[9.5px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity ${
                            currentConfig?.payments?.stripe?.enabled
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {currentConfig?.payments?.stripe?.enabled ? "Active on Storefront" : "Disabled"}
                        </button>
                      </div>
                      <p className="text-[11px] text-wbk-brown mt-0.5">
                        Enables direct Visa, Mastercard, AMEX, Apple Pay, and Google Pay card checkout.
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={Boolean(currentConfig?.payments?.stripe?.enabled)}
                      onChange={() => handlePaymentToggle("stripe")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-wbk-black"></div>
                  </label>
                </div>

                {currentConfig?.payments?.stripe?.enabled && (
                  <div className="mt-3 pt-3 border-t border-wbk-lightgrey/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-wbk-brown mb-1">
                        Display Title
                      </label>
                      <input
                        type="text"
                        value={currentConfig?.payments?.stripe?.label || ""}
                        onChange={(e) => handlePaymentChange("stripe", "label", e.target.value)}
                        placeholder="e.g. Credit / Debit Card"
                        className="w-full text-xs px-2.5 py-1.5 border border-wbk-lightgrey bg-white focus:outline-none focus:border-wbk-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-wbk-brown mb-1">
                        Subtitle / Supported Brands
                      </label>
                      <input
                        type="text"
                        value={currentConfig?.payments?.stripe?.sublabel || ""}
                        onChange={(e) => handlePaymentChange("stripe", "sublabel", e.target.value)}
                        placeholder="e.g. Stripe & Apple Pay"
                        className="w-full text-xs px-2.5 py-1.5 border border-wbk-lightgrey bg-white focus:outline-none focus:border-wbk-black"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* PayPal Gateway */}
              <div
                className={`p-4 border transition-all ${
                  currentConfig?.payments?.paypal?.enabled
                    ? "border-wbk-black bg-[#FBF9F8]"
                    : "border-wbk-lightgrey bg-white opacity-70"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-[#003087]/10 text-[#003087] flex items-center justify-center shrink-0 mt-0.5">
                      <IconBrandPaypal size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-wbk-black">PayPal Smart Buttons</span>
                        <button
                          type="button"
                          onClick={() => handlePaymentToggle("paypal")}
                          className={`text-[9.5px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity ${
                            currentConfig?.payments?.paypal?.enabled
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {currentConfig?.payments?.paypal?.enabled ? "Active on Storefront" : "Disabled"}
                        </button>
                      </div>
                      <p className="text-[11px] text-wbk-brown mt-0.5">
                        Native PayPal checkout with embedded Card fields and Pay in 3 / Pay Later funding.
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={Boolean(currentConfig?.payments?.paypal?.enabled)}
                      onChange={() => handlePaymentToggle("paypal")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-wbk-black"></div>
                  </label>
                </div>

                {currentConfig?.payments?.paypal?.enabled && (
                  <div className="mt-3 pt-3 border-t border-wbk-lightgrey/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-wbk-brown mb-1">
                        Display Title
                      </label>
                      <input
                        type="text"
                        value={currentConfig?.payments?.paypal?.label || ""}
                        onChange={(e) => handlePaymentChange("paypal", "label", e.target.value)}
                        placeholder="e.g. PayPal"
                        className="w-full text-xs px-2.5 py-1.5 border border-wbk-lightgrey bg-white focus:outline-none focus:border-wbk-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-wbk-brown mb-1">
                        Subtitle / Tagline
                      </label>
                      <input
                        type="text"
                        value={currentConfig?.payments?.paypal?.sublabel || ""}
                        onChange={(e) => handlePaymentChange("paypal", "sublabel", e.target.value)}
                        placeholder="e.g. Express & Pay in 3"
                        className="w-full text-xs px-2.5 py-1.5 border border-wbk-lightgrey bg-white focus:outline-none focus:border-wbk-black"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Express Quick Pay in Cart */}
              <div
                className={`p-4 border transition-all ${
                  currentConfig?.payments?.quickPayInCart?.enabled
                    ? "border-wbk-black bg-[#FBF9F8]"
                    : "border-wbk-lightgrey bg-white opacity-70"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                      <IconBolt size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-wbk-black">Express Quick Pay in Cart</span>
                        <button
                          type="button"
                          onClick={() => handlePaymentToggle("quickPayInCart")}
                          className={`text-[9.5px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity ${
                            currentConfig?.payments?.quickPayInCart?.enabled
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {currentConfig?.payments?.quickPayInCart?.enabled ? "Enabled" : "Disabled"}
                        </button>
                      </div>
                      <p className="text-[11px] text-wbk-brown mt-0.5">
                        Shows instant 1-click payment buttons directly on the <code className="bg-white px-1">/cart</code> page and slide-over cart drawer.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={Boolean(currentConfig?.payments?.quickPayInCart?.enabled)}
                      onChange={() => handlePaymentToggle("quickPayInCart")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-wbk-black"></div>
                  </label>
                </div>
              </div>

              {/* Bank Transfer Gateway */}
              <div
                className={`p-4 border transition-all ${
                  currentConfig?.payments?.bankTransfer?.enabled
                    ? "border-wbk-black bg-[#FBF9F8]"
                    : "border-wbk-lightgrey bg-white opacity-70"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <IconBuildingBank size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-wbk-black">Direct Bank Transfer / Wire</span>
                        <button
                          type="button"
                          onClick={() => handlePaymentToggle("bankTransfer")}
                          className={`text-[9.5px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity ${
                            currentConfig?.payments?.bankTransfer?.enabled
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {currentConfig?.payments?.bankTransfer?.enabled ? "Active on Storefront" : "Disabled"}
                        </button>
                      </div>
                      <p className="text-[11px] text-wbk-brown mt-0.5">
                        Allows customers to place orders and receive bank wire (HSBC / BACS / SEPA) transfer instructions.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={Boolean(currentConfig?.payments?.bankTransfer?.enabled)}
                      onChange={() => handlePaymentToggle("bankTransfer")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-wbk-black"></div>
                  </label>
                </div>

                {currentConfig?.payments?.bankTransfer?.enabled && (
                  <div className="mt-3 pt-3 border-t border-wbk-lightgrey/60 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-wbk-brown mb-1">
                          Display Title
                        </label>
                        <input
                          type="text"
                          value={currentConfig?.payments?.bankTransfer?.label || ""}
                          onChange={(e) => handlePaymentChange("bankTransfer", "label", e.target.value)}
                          placeholder="e.g. Bank Wire Transfer"
                          className="w-full text-xs px-2.5 py-1.5 border border-wbk-lightgrey bg-white focus:outline-none focus:border-wbk-black"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-wbk-brown mb-1">
                          Payment Subtitle
                        </label>
                        <input
                          type="text"
                          value={currentConfig?.payments?.bankTransfer?.sublabel || ""}
                          onChange={(e) => handlePaymentChange("bankTransfer", "sublabel", e.target.value)}
                          placeholder="e.g. SEPA / BACS Transfer"
                          className="w-full text-xs px-2.5 py-1.5 border border-wbk-lightgrey bg-white focus:outline-none focus:border-wbk-black"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-wbk-brown mb-1">
                        Instructions shown to Customer
                      </label>
                      <textarea
                        rows={2}
                        value={currentConfig?.payments?.bankTransfer?.instructions || ""}
                        onChange={(e) => handlePaymentChange("bankTransfer", "instructions", e.target.value)}
                        placeholder="Instructions provided to customer upon checkout..."
                        className="w-full text-xs p-2.5 border border-wbk-lightgrey bg-white focus:outline-none focus:border-wbk-black"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Shipping Methods & Speeds */}
          <div className="bg-white border border-wbk-lightgrey/80 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-wbk-lightgrey/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-full">
                  <IconTruck size={18} />
                </div>
                <div>
                  <h3 className="font-poppins text-sm font-semibold text-wbk-black">
                    Shipping Speeds & Delivery Tiers ({activeMarket.label})
                  </h3>
                  <p className="text-[11px] text-wbk-brown">
                    Set delivery rates, dispatch timelines, and available options for {activeMarket.name}.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* 1. Economy / Free Delivery */}
              <div
                className={`p-4 border transition-all ${
                  currentConfig?.shipping?.delivery_option_economy?.enabled
                    ? "border-wbk-black bg-[#FBF9F8]"
                    : "border-wbk-lightgrey bg-white opacity-70"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <IconPackage size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-wbk-black">Economy / Free Delivery</span>
                        <button
                          type="button"
                          onClick={() => handleShippingToggle("delivery_option_economy")}
                          className={`text-[9.5px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity ${
                            currentConfig?.shipping?.delivery_option_economy?.enabled
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {currentConfig?.shipping?.delivery_option_economy?.enabled ? "Active" : "Disabled"}
                        </button>
                      </div>
                      <p className="text-[11px] text-wbk-brown mt-0.5">
                        Standard inclusive delivery option. Usually free or included in price.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={Boolean(currentConfig?.shipping?.delivery_option_economy?.enabled)}
                      onChange={() => handleShippingToggle("delivery_option_economy")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-wbk-black"></div>
                  </label>
                </div>

                {currentConfig?.shipping?.delivery_option_economy?.enabled && (
                  <div className="mt-3 pt-3 border-t border-wbk-lightgrey/60 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-wbk-brown mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={currentConfig?.shipping?.delivery_option_economy?.label || ""}
                        onChange={(e) => handleShippingChange("delivery_option_economy", "label", e.target.value)}
                        placeholder="e.g. Free Delivery"
                        className="w-full text-xs px-2.5 py-1.5 border border-wbk-lightgrey bg-white focus:outline-none focus:border-wbk-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-wbk-brown mb-1">
                        Shipping Cost ({currencySymbol})
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={currentConfig?.shipping?.delivery_option_economy?.cost ?? 0}
                        onChange={(e) =>
                          handleShippingChange("delivery_option_economy", "cost", Number(e.target.value))
                        }
                        className="w-full text-xs px-2.5 py-1.5 border border-wbk-lightgrey bg-white focus:outline-none focus:border-wbk-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-wbk-brown mb-1">
                        Timeframe Message
                      </label>
                      <input
                        type="text"
                        value={currentConfig?.shipping?.delivery_option_economy?.message || ""}
                        onChange={(e) =>
                          handleShippingChange("delivery_option_economy", "message", e.target.value)
                        }
                        placeholder="e.g. Delivery within 2 - 4 weeks"
                        className="w-full text-xs px-2.5 py-1.5 border border-wbk-lightgrey bg-white focus:outline-none focus:border-wbk-black"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Standard Delivery */}
              <div
                className={`p-4 border transition-all ${
                  currentConfig?.shipping?.delivery_option_standard?.enabled
                    ? "border-wbk-black bg-[#FBF9F8]"
                    : "border-wbk-lightgrey bg-white opacity-70"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                      <IconTruck size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-wbk-black">Standard Delivery</span>
                        <button
                          type="button"
                          onClick={() => handleShippingToggle("delivery_option_standard")}
                          className={`text-[9.5px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity ${
                            currentConfig?.shipping?.delivery_option_standard?.enabled
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {currentConfig?.shipping?.delivery_option_standard?.enabled ? "Active" : "Disabled"}
                        </button>
                      </div>
                      <p className="text-[11px] text-wbk-brown mt-0.5">
                        Faster dispatch option with tracking (normally 1 - 2 weeks).
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={Boolean(currentConfig?.shipping?.delivery_option_standard?.enabled)}
                      onChange={() => handleShippingToggle("delivery_option_standard")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-wbk-black"></div>
                  </label>
                </div>

                {currentConfig?.shipping?.delivery_option_standard?.enabled && (
                  <div className="mt-3 pt-3 border-t border-wbk-lightgrey/60 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-wbk-brown mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={currentConfig?.shipping?.delivery_option_standard?.label || ""}
                        onChange={(e) => handleShippingChange("delivery_option_standard", "label", e.target.value)}
                        placeholder="e.g. Standard Delivery"
                        className="w-full text-xs px-2.5 py-1.5 border border-wbk-lightgrey bg-white focus:outline-none focus:border-wbk-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-wbk-brown mb-1">
                        Shipping Cost ({currencySymbol})
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={currentConfig?.shipping?.delivery_option_standard?.cost ?? 49}
                        onChange={(e) =>
                          handleShippingChange("delivery_option_standard", "cost", Number(e.target.value))
                        }
                        className="w-full text-xs px-2.5 py-1.5 border border-wbk-lightgrey bg-white focus:outline-none focus:border-wbk-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-wbk-brown mb-1">
                        Timeframe Message
                      </label>
                      <input
                        type="text"
                        value={currentConfig?.shipping?.delivery_option_standard?.message || ""}
                        onChange={(e) =>
                          handleShippingChange("delivery_option_standard", "message", e.target.value)
                        }
                        placeholder="e.g. Delivery within 1 - 2 weeks"
                        className="w-full text-xs px-2.5 py-1.5 border border-wbk-lightgrey bg-white focus:outline-none focus:border-wbk-black"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Express Delivery */}
              <div
                className={`p-4 border transition-all ${
                  currentConfig?.shipping?.delivery_option_express?.enabled
                    ? "border-wbk-black bg-[#FBF9F8]"
                    : "border-wbk-lightgrey bg-white opacity-70"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                      <IconBolt size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-wbk-black">Express Delivery</span>
                        <button
                          type="button"
                          onClick={() => handleShippingToggle("delivery_option_express")}
                          className={`text-[9.5px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity ${
                            currentConfig?.shipping?.delivery_option_express?.enabled
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {currentConfig?.shipping?.delivery_option_express?.enabled ? "Active" : "Disabled"}
                        </button>
                      </div>
                      <p className="text-[11px] text-wbk-brown mt-0.5">
                        Priority express courier dispatch (normally 2 - 5 working days).
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={Boolean(currentConfig?.shipping?.delivery_option_express?.enabled)}
                      onChange={() => handleShippingToggle("delivery_option_express")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-wbk-black"></div>
                  </label>
                </div>

                {currentConfig?.shipping?.delivery_option_express?.enabled && (
                  <div className="mt-3 pt-3 border-t border-wbk-lightgrey/60 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-wbk-brown mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={currentConfig?.shipping?.delivery_option_express?.label || ""}
                        onChange={(e) => handleShippingChange("delivery_option_express", "label", e.target.value)}
                        placeholder="e.g. Express Delivery"
                        className="w-full text-xs px-2.5 py-1.5 border border-wbk-lightgrey bg-white focus:outline-none focus:border-wbk-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-wbk-brown mb-1">
                        Shipping Cost ({currencySymbol})
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={currentConfig?.shipping?.delivery_option_express?.cost ?? 79}
                        onChange={(e) =>
                          handleShippingChange("delivery_option_express", "cost", Number(e.target.value))
                        }
                        className="w-full text-xs px-2.5 py-1.5 border border-wbk-lightgrey bg-white focus:outline-none focus:border-wbk-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-wbk-brown mb-1">
                        Timeframe Message
                      </label>
                      <input
                        type="text"
                        value={currentConfig?.shipping?.delivery_option_express?.message || ""}
                        onChange={(e) =>
                          handleShippingChange("delivery_option_express", "message", e.target.value)
                        }
                        placeholder="e.g. Delivery within 2 - 5 working days"
                        className="w-full text-xs px-2.5 py-1.5 border border-wbk-lightgrey bg-white focus:outline-none focus:border-wbk-black"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Warehouse Collection */}
              <div
                className={`p-4 border transition-all ${
                  currentConfig?.shipping?.delivery_option_pickup?.enabled
                    ? "border-wbk-black bg-[#FBF9F8]"
                    : "border-wbk-lightgrey bg-white opacity-70"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                      <IconMapPin size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-wbk-black">Warehouse Collection (Free)</span>
                        <button
                          type="button"
                          onClick={() => handleShippingToggle("delivery_option_pickup")}
                          className={`text-[9.5px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity ${
                            currentConfig?.shipping?.delivery_option_pickup?.enabled
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {currentConfig?.shipping?.delivery_option_pickup?.enabled ? "Active" : "Disabled"}
                        </button>
                      </div>
                      <p className="text-[11px] text-wbk-brown mt-0.5">
                        Free pickup directly from warehouse (usually active in UK only).
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={Boolean(currentConfig?.shipping?.delivery_option_pickup?.enabled)}
                      onChange={() => handleShippingToggle("delivery_option_pickup")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-wbk-black"></div>
                  </label>
                </div>

                {currentConfig?.shipping?.delivery_option_pickup?.enabled && (
                  <div className="mt-3 pt-3 border-t border-wbk-lightgrey/60 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-wbk-brown mb-1">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={currentConfig?.shipping?.delivery_option_pickup?.label || ""}
                          onChange={(e) => handleShippingChange("delivery_option_pickup", "label", e.target.value)}
                          placeholder="e.g. Warehouse Collection"
                          className="w-full text-xs px-2.5 py-1.5 border border-wbk-lightgrey bg-white focus:outline-none focus:border-wbk-black"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-wbk-brown mb-1">
                          Pickup Instructions / Hours
                        </label>
                        <input
                          type="text"
                          value={currentConfig?.shipping?.delivery_option_pickup?.message || ""}
                          onChange={(e) => handleShippingChange("delivery_option_pickup", "message", e.target.value)}
                          placeholder="e.g. Mon - Fri, 10am - 4pm"
                          className="w-full text-xs px-2.5 py-1.5 border border-wbk-lightgrey bg-white focus:outline-none focus:border-wbk-black"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Storefront Simulation (4 cols) */}
        <div className="lg:col-span-4 sticky top-6 space-y-4">
          <div className="bg-white border-2 border-wbk-black p-5 shadow-md space-y-4 font-poppins">
            <div className="flex items-center justify-between pb-3 border-b border-wbk-lightgrey">
              <div className="flex items-center gap-2">
                <span className="text-xl">{activeMarket.flag}</span>
                <span className="text-xs font-bold text-wbk-black uppercase tracking-wider">
                  Live Preview: {activeMarket.name}
                </span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-semibold rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Storefront
              </span>
            </div>

            {/* Simulated Checkout Shipping Step */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-wbk-brown block">
                Step 3: Shipping Options
              </span>
              <div className="space-y-1.5">
                {Object.entries(currentConfig?.shipping || {})
                  .filter(([_, opt]) => opt.enabled)
                  .map(([key, opt], idx) => (
                    <div
                      key={key}
                      className={`p-2.5 border text-xs flex items-center justify-between ${
                        idx === 0 ? "border-wbk-black bg-[#FBF9F8] font-medium" : "border-wbk-lightgrey bg-white"
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-wbk-black">{opt.label}</div>
                        <div className="text-[10px] text-wbk-brown">{opt.message}</div>
                      </div>
                      <span className="text-xs font-bold text-wbk-black shrink-0 ml-2">
                        {opt.cost === 0 ? "Free" : `${currencySymbol}${opt.cost}`}
                      </span>
                    </div>
                  ))}

                {Object.values(currentConfig?.shipping || {}).filter((s) => s.enabled).length === 0 && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs text-center border border-red-200">
                    No shipping options active for this country!
                  </div>
                )}
              </div>
            </div>

            {/* Simulated Checkout Payment Step */}
            <div className="space-y-2 pt-2 border-t border-wbk-lightgrey/60">
              <span className="text-[10px] font-bold uppercase tracking-widest text-wbk-brown block">
                Step 4: Payment Methods
              </span>
              <div className="space-y-2">
                {currentConfig?.payments?.stripe?.enabled && (
                  <div className="p-2.5 border border-wbk-black bg-[#FBF9F8] text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconCreditCard size={16} className="text-[#635BFF]" />
                      <span className="font-semibold text-wbk-black">
                        {currentConfig.payments.stripe.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-wbk-brown">
                      {currentConfig.payments.stripe.sublabel}
                    </span>
                  </div>
                )}

                {currentConfig?.payments?.paypal?.enabled && (
                  <div className="p-2.5 border border-wbk-lightgrey bg-white text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconBrandPaypal size={16} className="text-[#003087]" />
                      <span className="font-semibold text-[#003087]">
                        {currentConfig.payments.paypal.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-wbk-brown">
                      {currentConfig.payments.paypal.sublabel}
                    </span>
                  </div>
                )}

                {currentConfig?.payments?.bankTransfer?.enabled && (
                  <div className="p-2.5 border border-wbk-lightgrey bg-white text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconBuildingBank size={16} className="text-emerald-700" />
                      <span className="font-semibold text-wbk-black">
                        {currentConfig.payments.bankTransfer.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-wbk-brown">Direct Wire</span>
                  </div>
                )}

                {!currentConfig?.payments?.stripe?.enabled &&
                  !currentConfig?.payments?.paypal?.enabled &&
                  !currentConfig?.payments?.bankTransfer?.enabled && (
                    <div className="p-3 bg-red-50 text-red-700 text-xs text-center border border-red-200">
                      Warning: No payment methods enabled for this country!
                    </div>
                  )}
              </div>
            </div>

            {/* Quick Pay in Cart Simulation */}
            <div className="space-y-2 pt-2 border-t border-wbk-lightgrey/60">
              <span className="text-[10px] font-bold uppercase tracking-widest text-wbk-brown block">
                Cart Page Instant Buttons
              </span>
              {currentConfig?.payments?.quickPayInCart?.enabled ? (
                <div className="space-y-1.5">
                  {currentConfig?.payments?.stripe?.enabled && (
                    <div className="py-2 px-3 bg-[#635BFF] text-white text-[11px] font-semibold text-center rounded flex items-center justify-center gap-1.5 shadow-xs">
                      <IconCreditCard size={14} />
                      <span>Instant Pay with Card (Stripe)</span>
                    </div>
                  )}
                  {currentConfig?.payments?.paypal?.enabled && (
                    <div className="py-2 px-3 bg-[#FFC439] text-[#003087] text-[11px] font-bold text-center rounded flex items-center justify-center gap-1.5 shadow-xs">
                      <IconBrandPaypal size={14} />
                      <span>PayPal Checkout</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[11px] text-wbk-brown italic">
                  Quick Pay buttons hidden in cart for {activeMarket.name}.
                </div>
              )}
            </div>

            <div className="pt-2 text-[10px] text-wbk-brown border-t border-wbk-lightgrey/50 flex items-center justify-between">
              <span>Currency: {currentConfig?.currency}</span>
              <span>Symbol: {currencySymbol}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Sticky Save Bar at the bottom for easy access */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-wbk-black text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 border border-wbk-gold animate-bounce-short">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
            <span className="font-medium">
              Nem mentett módosítások: <strong>{activeMarket.name}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-wbk-gold hover:bg-white text-wbk-black text-xs font-bold uppercase tracking-wider rounded-full transition-all flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <IconDeviceFloppy size={15} />
            )}
            <span>{saving ? "Mentés folyamatban..." : "Módosítások Mentése Most"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
