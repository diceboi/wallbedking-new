"use client";

import { useState, useEffect } from "react";
import {
  IconSettings,
  IconDatabase,
  IconCreditCard,
  IconRefresh,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";

export default function AdminSettingsPage() {
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);
  const [spApiConfig, setSpApiConfig] = useState(null);

  useEffect(() => {
    fetchSpApiConfig();
  }, []);

  const fetchSpApiConfig = async () => {
    try {
      const res = await fetch("/api/admin/feeds/amazon-fr-classic/sync-amazon");
      const data = await res.json();
      if (data.success && data.config) {
        setSpApiConfig(data.config);
      }
    } catch (e) {
      console.error("Failed to load SP-API config", e);
    }
  };

  const handleSyncCatalog = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/admin/products?limit=250");
      const data = await res.json();
      if (data.success) {
        setSyncMessage({
          type: "success",
          text: `Catalog synchronized successfully! ${data.count} products active in Supabase.`,
        });
      } else {
        setSyncMessage({ type: "error", text: "Failed to synchronize catalog." });
      }
    } catch (err) {
      setSyncMessage({ type: "error", text: "Network error during sync." });
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6 font-poppins max-w-4xl">
      <div>
        <h2 className="font-new-york text-2xl font-medium text-wbk-black">
          System Settings
        </h2>
        <p className="text-xs text-wbk-brown">
          Database connection parameters, payment gateways, and global store configurations
        </p>
      </div>

      {syncMessage && (
        <div
          className={`p-3.5 text-xs font-medium flex items-center gap-2 border ${
            syncMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {syncMessage.type === "success" ? (
            <IconCheck size={16} />
          ) : (
            <IconAlertCircle size={16} />
          )}
          <span>{syncMessage.text}</span>
        </div>
      )}

      {/* Supabase Connection */}
      <div className="bg-white p-6 border border-wbk-lightgrey/60 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-wbk-black">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-full">
            <IconDatabase size={18} />
          </div>
          <div>
            <h3 className="font-new-york text-base font-semibold">
              Supabase Database Connection
            </h3>
            <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected: unrqbejocbteebsworuq.supabase.co
            </span>
          </div>
        </div>

        <div className="space-y-2 pt-2 text-xs text-wbk-brown">
          <p>
            Product prices, promotional discounts, and technical specifications are read and updated live from the Supabase <code className="text-wbk-black font-semibold">products</code> table.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleSyncCatalog}
            disabled={syncing}
            className="flex items-center gap-2 px-5 py-2.5 bg-wbk-black hover:bg-wbk-gold hover:text-wbk-black text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-colors cursor-pointer disabled:opacity-50"
          >
            <IconRefresh size={15} className={syncing ? "animate-spin" : ""} />
            <span>{syncing ? "Synchronizing..." : "Resync Database Catalog"}</span>
          </button>
        </div>
      </div>

      {/* Payment Gateway (Stripe) */}
      <div className="bg-white p-6 border border-wbk-lightgrey/60 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-wbk-black">
          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-full">
            <IconCreditCard size={18} />
          </div>
          <div>
            <h3 className="font-new-york text-base font-semibold">
              Stripe Payment Gateway
            </h3>
            <span className="text-[11px] text-wbk-brown">
              Multi-currency secure payment processing (GBP, EUR, USD)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="p-3 bg-[#FBF9F8] border border-wbk-lightgrey/50">
            <span className="font-medium text-wbk-black block mb-0.5">Supported Currencies</span>
            <span className="text-wbk-brown">GBP (£), EUR (€), USD ($) with automatic market switching</span>
          </div>
          <div className="p-3 bg-[#FBF9F8] border border-wbk-lightgrey/50">
            <span className="font-medium text-wbk-black block mb-0.5">API Endpoint</span>
            <span className="font-mono text-wbk-brown">/api/checkout/stripe</span>
          </div>
        </div>
      </div>

      {/* Amazon SP-API Settings & Status */}
      <div className="bg-white p-6 border border-wbk-lightgrey/60 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-wbk-black">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#FF9900]/10 text-[#FF9900] rounded-full font-black text-sm">
              a
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-new-york text-base font-semibold">
                  Amazon Selling Partner API (SP-API)
                </h3>
                {spApiConfig?.isConfigured ? (
                  <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                    Connected
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-800">
                    Awaiting Credentials
                  </span>
                )}
              </div>
              <span className="text-[11px] text-wbk-brown">
                Automated feed submission pipeline (Feeds API 2021-06-30) for Amazon European Marketplaces (France, Germany, UK).
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 space-y-3 text-xs">
          <div className="p-4 bg-[#FBF9F8] border border-wbk-lightgrey/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-wbk-black uppercase tracking-wider text-[11px]">
                Required Environment Keys (.env.local)
              </span>
              <span className="text-[11px] text-wbk-brown">
                Region: <strong className="text-wbk-black">EU (sellingpartnerapi-eu.amazon.com)</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="p-2 bg-white border border-wbk-lightgrey/60 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-wbk-black block">AMAZON_SP_API_CLIENT_ID</span>
                  <span className="text-[10px] text-wbk-brown">LWA App Client ID</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-semibold ${spApiConfig?.clientId ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {spApiConfig?.clientId ? 'Configured' : 'Missing'}
                </span>
              </div>

              <div className="p-2 bg-white border border-wbk-lightgrey/60 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-wbk-black block">AMAZON_SP_API_CLIENT_SECRET</span>
                  <span className="text-[10px] text-wbk-brown">LWA Client Secret</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-semibold ${spApiConfig?.hasSecret ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {spApiConfig?.hasSecret ? 'Configured' : 'Missing'}
                </span>
              </div>

              <div className="p-2 bg-white border border-wbk-lightgrey/60 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-wbk-black block">AMAZON_SP_API_REFRESH_TOKEN</span>
                  <span className="text-[10px] text-wbk-brown">OAuth Refresh Token (Atzr|...)</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-semibold ${spApiConfig?.hasRefreshToken ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {spApiConfig?.hasRefreshToken ? 'Configured' : 'Missing'}
                </span>
              </div>

              <div className="p-2 bg-white border border-wbk-lightgrey/60 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-wbk-black block">AMAZON_SELLER_ID</span>
                  <span className="text-[10px] text-wbk-brown">Seller Merchant Token</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-semibold ${spApiConfig?.sellerId ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
                  {spApiConfig?.sellerId ? 'Configured' : 'Optional'}
                </span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-wbk-brown leading-relaxed border-t border-wbk-lightgrey/40">
              <strong className="text-wbk-black font-semibold">How to obtain these in Amazon Seller Central:</strong>
              <ol className="list-decimal list-inside space-y-0.5 mt-1">
                <li>Log in to Amazon Seller Central with your developer account.</li>
                <li>Go to <strong>Partner Network</strong> &rarr; <strong>Develop Apps</strong>.</li>
                <li>Add a new application or edit existing, select the <strong>Product Listing / Pricing</strong> role.</li>
                <li>Copy the <strong>LWA Client ID</strong> and <strong>Client Secret</strong>.</li>
                <li>Authorize your Seller account to generate the permanent <strong>LWA Refresh Token</strong>.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

