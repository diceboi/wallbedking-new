"use client";

import { useState } from "react";
import {
  IconCopy,
  IconCheck,
  IconLink,
  IconClick,
  IconShoppingBag,
  IconCoin,
  IconSparkles,
  IconPercentage,
} from "@tabler/icons-react";

const MARKETS = [
  { id: "en", label: "UK (wallbedking.co.uk/en)", domain: "https://wallbedking.co.uk" },
  { id: "us", label: "US (wallbedking.com/us)", domain: "https://www.wallbedking.com" },
  { id: "de", label: "DE (wallbedking.com/de)", domain: "https://www.wallbedking.com" },
  { id: "fr", label: "FR (wallbedking.com/fr)", domain: "https://www.wallbedking.com" },
  { id: "es", label: "ES (wallbedking.com/es)", domain: "https://www.wallbedking.com" },
  { id: "it", label: "IT (wallbedking.com/it)", domain: "https://www.wallbedking.com" },
  { id: "por", label: "POR (wallbedking.com/por)", domain: "https://www.wallbedking.com" },
];

const CURRENCY_SYM = { GBP: "£", EUR: "€", USD: "$" };

function formatCurrMap(map = {}) {
  const entries = Object.entries(map || {}).filter(([, v]) => Number(v) > 0);
  if (entries.length === 0) return "0.00";
  return entries
    .map(([c, v]) => `${CURRENCY_SYM[c] || c + " "}${Number(v).toFixed(2)}`)
    .join(" • ");
}

export function InfluencerPortalTab({ campaigns = [] }) {
  const [selectedMarket, setSelectedMarket] = useState("en");
  const [copiedKey, setCopiedKey] = useState("");

  const handleCopy = (text, key) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1800);
    } catch {}
  };

  if (!Array.isArray(campaigns) || campaigns.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 font-poppins">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-wbk-gold mb-1">
            <IconSparkles size={13} />
            <span>Influencer Partner Portal</span>
          </span>
          <h2 className="font-new-york text-2xl text-wbk-black">
            Your Affiliate Links, Clicks &amp; Commissions
          </h2>
          <p className="text-xs text-wbk-brown mt-0.5">
            Share your personal link or discount code. Visitors automatically receive your discount and are tracked for {campaigns[0]?.cookie_days || 30} days.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs shrink-0">
          <span className="text-wbk-brown">Link Market:</span>
          <select
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
            className="px-2.5 py-1.5 border border-wbk-lightgrey bg-white text-xs font-semibold outline-none"
          >
            {MARKETS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {campaigns.map((camp) => {
        const st = camp.stats || {};
        const marketObj = MARKETS.find((m) => m.id === selectedMarket) || MARKETS[0];
        const shareUrl = `${marketObj.domain}/${marketObj.id}?ref=${encodeURIComponent(camp.code)}`;
        const discText =
          camp.discount_type === "fixed"
            ? `Fixed £${camp.fixed_amounts?.GBP || 0} / €${camp.fixed_amounts?.EUR || 0} / $${camp.fixed_amounts?.USD || 0}`
            : `${camp.discount_value}% OFF`;

        return (
          <div key={camp.id} className="border border-wbk-lightgrey bg-white overflow-hidden">
            {/* Campaign Header & Share Bar */}
            <div className="p-5 bg-[#FBF9F8] border-b border-wbk-lightgrey flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {camp.influencer_avatar ? (
                  <img
                    src={camp.influencer_avatar}
                    alt={camp.influencer_name || camp.code}
                    className="w-12 h-12 rounded-full object-cover border-2 border-wbk-gold shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-wbk-black text-wbk-gold font-bold flex items-center justify-center shrink-0">
                    {(camp.influencer_name?.[0] || camp.code[0] || "P").toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-base text-wbk-black">
                      {camp.code}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                        camp.active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {camp.active ? "Active" : "Paused"}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-wbk-black text-wbk-gold">
                      Customer: {discText}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-100 text-amber-900">
                      Commission: {camp.commission_percent}%
                    </span>
                  </div>
                  <div className="text-xs text-wbk-brown mt-1">
                    {camp.influencer_name}{" "}
                    {camp.influencer_handle ? `(${camp.influencer_handle})` : ""}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(camp.code, `code-${camp.id}`)}
                  className="px-3.5 py-2 border border-wbk-lightgrey hover:border-wbk-black bg-white text-xs font-semibold rounded-full inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === `code-${camp.id}` ? (
                    <IconCheck size={14} className="text-emerald-600" />
                  ) : (
                    <IconCopy size={14} />
                  )}
                  <span>{copiedKey === `code-${camp.id}` ? "Code Copied" : "Copy Code"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(shareUrl, `link-${camp.id}`)}
                  className="px-4 py-2 bg-wbk-black hover:bg-wbk-green text-white text-xs font-semibold rounded-full inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedKey === `link-${camp.id}` ? (
                    <IconCheck size={14} />
                  ) : (
                    <IconLink size={14} />
                  )}
                  <span>{copiedKey === `link-${camp.id}` ? "Affiliate Link Copied!" : "Copy Affiliate Link"}</span>
                </button>
              </div>
            </div>

            {/* Shareable URL display */}
            <div className="px-5 py-2.5 bg-[#F4F2F0]/60 border-b border-wbk-lightgrey/60 text-[11px] flex items-center justify-between gap-2">
              <span className="font-mono text-wbk-black truncate">{shareUrl}</span>
              <span className="text-wbk-brown shrink-0 hidden sm:inline">
                {camp.cookie_days || 30}-day attribution
              </span>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-wbk-lightgrey/70 border-b border-wbk-lightgrey">
              <div className="p-4">
                <div className="flex items-center gap-1.5 text-[11px] text-wbk-brown">
                  <IconClick size={14} className="text-wbk-gold" />
                  <span>Link Clicks</span>
                </div>
                <div className="text-xl font-bold text-wbk-black mt-1">{st.clicks || 0}</div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1.5 text-[11px] text-wbk-brown">
                  <IconShoppingBag size={14} className="text-wbk-gold" />
                  <span>Orders</span>
                </div>
                <div className="text-xl font-bold text-wbk-black mt-1">{st.ordersCount || 0}</div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1.5 text-[11px] text-wbk-brown">
                  <IconPercentage size={14} className="text-wbk-gold" />
                  <span>Conversion Rate</span>
                </div>
                <div className="text-xl font-bold text-wbk-black mt-1">
                  {st.conversionRate || 0}%
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1.5 text-[11px] text-wbk-brown">
                  <IconCoin size={14} className="text-emerald-700" />
                  <span>Total Commission</span>
                </div>
                <div className="text-base font-bold text-emerald-800 mt-1">
                  {formatCurrMap(st.commissionByCurrency)}
                </div>
                <div className="text-[10px] text-wbk-brown mt-0.5">
                  Sales: {formatCurrMap(st.revenueByCurrency)}
                </div>
              </div>
            </div>

            {/* Commission Breakdown (Pending 30d vs Payable vs Paid Out) */}
            <div className="px-5 py-3 bg-[#FAF8F5] border-b border-wbk-lightgrey flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
              <span className="text-wbk-brown">
                In 30-day return window:{" "}
                <strong className="text-amber-800">
                  {formatCurrMap(st.pendingCommissionByCurrency)}
                </strong>
              </span>
              <span className="text-wbk-brown">
                Cleared / Payable:{" "}
                <strong className="text-emerald-800">
                  {formatCurrMap(st.payableCommissionByCurrency)}
                </strong>
              </span>
              <span className="text-wbk-brown">
                Paid Out:{" "}
                <strong className="text-wbk-black">
                  {formatCurrMap(st.paidOutByCurrency)}
                </strong>
              </span>
            </div>

            {/* Recent Attributed Orders (Privacy-safe: zero customer PII) */}
            <div className="p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-wbk-black mb-3">
                Recent Attributed Orders ({st.recentOrders?.length || 0})
              </h3>
              {!st.recentOrders || st.recentOrders.length === 0 ? (
                <p className="text-xs text-wbk-brown py-4 text-center bg-[#FAF8F5] border border-wbk-lightgrey/60">
                  No orders attributed to <strong>{camp.code}</strong> yet. Share your link above to start earning!
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-wbk-lightgrey text-[10px] uppercase tracking-wider text-wbk-brown">
                      <tr>
                        <th className="py-2 pr-3">Order</th>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Net Sale</th>
                        <th className="py-2 pl-3 text-right">Commission</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-wbk-lightgrey/50">
                      {st.recentOrders.map((ord) => {
                        const sym = CURRENCY_SYM[ord.currency] || `${ord.currency} `;
                        const d = new Date(ord.created_at);
                        const dateStr = Number.isNaN(d.getTime())
                          ? ord.created_at
                          : d.toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            });
                        return (
                          <tr key={ord.id}>
                            <td className="py-2.5 pr-3 font-mono font-semibold text-wbk-black">
                              #{ord.id}
                            </td>
                            <td className="py-2.5 px-3 text-wbk-brown">{dateStr}</td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                                  ord.eligibility === "payable"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : ord.eligibility === "return_window"
                                      ? "bg-amber-100 text-amber-800"
                                      : ord.eligibility === "cancelled"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {ord.eligibility === "payable"
                                  ? "Cleared"
                                  : ord.eligibility === "return_window"
                                    ? "Pending (30d)"
                                    : ord.eligibility === "cancelled"
                                      ? "Cancelled"
                                      : "Unpaid"}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium text-wbk-black">
                              {sym}
                              {Number(ord.net_value || 0).toFixed(2)}
                            </td>
                            <td className="py-2.5 pl-3 text-right font-bold text-emerald-800">
                              {sym}
                              {Number(ord.commission || 0).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
