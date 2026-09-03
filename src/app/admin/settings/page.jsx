"use client";

import { useState } from "react";
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
    </div>
  );
}
