"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  IconTicket,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCopy,
  IconCheck,
  IconUpload,
  IconRefresh,
  IconDownload,
  IconUsers,
  IconClick,
  IconShoppingBag,
  IconCoin,
  IconX,
  IconLink,
  IconLoader2,
  IconSparkles,
  IconCash,
} from "@tabler/icons-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const MARKETS = [
  { id: "en", label: "UK (GBP)", domain: "https://wallbedking.co.uk" },
  { id: "us", label: "US (USD)", domain: "https://www.wallbedking.com" },
  { id: "de", label: "DE (EUR)", domain: "https://www.wallbedking.com" },
  { id: "fr", label: "FR (EUR)", domain: "https://www.wallbedking.com" },
  { id: "es", label: "ES (EUR)", domain: "https://www.wallbedking.com" },
  { id: "it", label: "IT (EUR)", domain: "https://www.wallbedking.com" },
  { id: "por", label: "POR (EUR)", domain: "https://www.wallbedking.com" },
];

const CATEGORIES = [
  { id: "beds", label: "Wall Beds" },
  { id: "tables", label: "Smart Tables" },
  { id: "sofas", label: "Sofas" },
  { id: "mattresses", label: "Mattresses" },
  { id: "cabinets", label: "Cabinets" },
  { id: "extras", label: "Accessories" },
];

const CURRENCY_SYM = { GBP: "£", EUR: "€", USD: "$" };

function formatCurrencyMap(map = {}) {
  const entries = Object.entries(map || {}).filter(([, v]) => Number(v) > 0);
  if (entries.length === 0) return "—";
  return entries
    .map(([c, v]) => `${CURRENCY_SYM[c] || c + " "}${Number(v).toFixed(2)}`)
    .join(" • ");
}

function buildAffiliateUrl(code, marketId = "en") {
  const m = MARKETS.find((x) => x.id === marketId) || MARKETS[0];
  return `${m.domain}/${m.id}?ref=${encodeURIComponent(code)}`;
}

const EMPTY_FORM = {
  id: "",
  code: "",
  active: true,
  description: "",
  discount_type: "percent",
  discount_value: 10,
  fixed_amounts: { GBP: 50, EUR: 50, USD: 50 },
  allow_stack_with_promotions: false,
  allow_stack_with_delivery_discount: false,
  target_markets: [],
  target_categories: [],
  excluded_categories: [],
  min_order_amount: 0,
  max_uses: "",
  one_per_customer: false,
  start_date: "",
  end_date: "",
  is_influencer: true,
  influencer_name: "",
  influencer_handle: "",
  influencer_email: "",
  influencer_avatar: "",
  influencer_message: "",
  commission_percent: 5,
  auto_apply_on_ref: true,
  cookie_days: 30,
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [linkMarket, setLinkMarket] = useState("en");
  const [copiedId, setCopiedId] = useState("");
  const [feedback, setFeedback] = useState(null);

  // Create / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Payout Modal
  const [payoutModalCoupon, setPayoutModalCoupon] = useState(null);
  const [payoutForm, setPayoutForm] = useState({ amount: "", currency: "GBP", note: "" });
  const [savingPayout, setSavingPayout] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons || []);
        setAnalytics(data.analytics || {});
      }
    } catch (err) {
      console.error("Failed loading coupons:", err);
      setFeedback({ type: "error", text: "Failed to load coupons & affiliates." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totals = useMemo(() => {
    let activeCount = 0;
    let totalClicks = 0;
    let totalOrders = 0;
    for (const c of coupons) {
      if (c.active) activeCount++;
      const st = analytics[c.code];
      if (st) {
        totalClicks += Number(st.clicks || 0);
        totalOrders += Number(st.ordersCount || 0);
      }
    }
    const convRate = totalClicks > 0 ? Math.round((totalOrders / totalClicks) * 1000) / 10 : 0;
    return { activeCount, totalClicks, totalOrders, convRate };
  }, [coupons, analytics]);

  const filteredCoupons = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return coupons;
    return coupons.filter(
      (c) =>
        String(c.code || "").toLowerCase().includes(q) ||
        String(c.influencer_name || "").toLowerCase().includes(q) ||
        String(c.influencer_handle || "").toLowerCase().includes(q) ||
        String(c.influencer_email || "").toLowerCase().includes(q) ||
        String(c.description || "").toLowerCase().includes(q)
    );
  }, [coupons, search]);

  const openCreateModal = () => {
    setForm({ ...EMPTY_FORM, fixed_amounts: { GBP: 50, EUR: 50, USD: 50 } });
    setIsModalOpen(true);
  };

  const openEditModal = (c) => {
    setForm({
      ...EMPTY_FORM,
      ...c,
      fixed_amounts: {
        GBP: c.fixed_amounts?.GBP ?? c.discount_value ?? 50,
        EUR: c.fixed_amounts?.EUR ?? c.discount_value ?? 50,
        USD: c.fixed_amounts?.USD ?? c.discount_value ?? 50,
      },
      max_uses: c.max_uses ?? "",
      start_date: c.start_date ? String(c.start_date).slice(0, 10) : "",
      end_date: c.end_date ? String(c.end_date).slice(0, 10) : "",
    });
    setIsModalOpen(true);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "ProductImages");
      fd.append("folder", "influencers");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }
      setForm((prev) => ({ ...prev, influencer_avatar: data.url }));
    } catch (err) {
      setFeedback({ type: "error", text: `Avatar upload failed: ${err.message}` });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const toggleArrayValue = (field, val) => {
    setForm((prev) => {
      const arr = Array.isArray(prev[field]) ? prev[field] : [];
      return {
        ...prev,
        [field]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val],
      };
    });
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const payload = {
        ...form,
        start_date: form.start_date ? new Date(`${form.start_date}T00:00:00Z`).toISOString() : null,
        end_date: form.end_date ? new Date(`${form.end_date}T23:59:59Z`).toISOString() : null,
      };
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coupon: payload }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save coupon");
      }
      setCoupons(data.coupons || []);
      setAnalytics(data.analytics || {});
      setIsModalOpen(false);
      setFeedback({ type: "success", text: `Saved coupon ${data.coupon?.code}!` });
    } catch (err) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCoupon = async (coupon) => {
    if (!confirm(`Delete coupon "${coupon.code}"?`)) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${encodeURIComponent(coupon.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons || []);
        setAnalytics(data.analytics || {});
        setFeedback({ type: "success", text: `Deleted coupon ${coupon.code}.` });
      }
    } catch (err) {
      setFeedback({ type: "error", text: err.message });
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coupon: { ...coupon, active: !coupon.active } }),
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons || []);
        setAnalytics(data.analytics || {});
      }
    } catch {}
  };

  const handleRecordPayout = async (e) => {
    e.preventDefault();
    if (!payoutModalCoupon || !payoutForm.amount) return;
    setSavingPayout(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record_payout",
          code: payoutModalCoupon.code,
          amount: Number(payoutForm.amount),
          currency: payoutForm.currency,
          note: payoutForm.note,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons || []);
        setAnalytics(data.analytics || {});
        setPayoutModalCoupon(null);
        setPayoutForm({ amount: "", currency: "GBP", note: "" });
        setFeedback({ type: "success", text: `Recorded payout for ${payoutModalCoupon.code}.` });
      }
    } catch (err) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setSavingPayout(false);
    }
  };

  const handleCopy = (text, key) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(key);
      setTimeout(() => setCopiedId(""), 1800);
    } catch {}
  };

  const handleExportCsv = () => {
    const header = [
      "Code",
      "Active",
      "Influencer Name",
      "Handle",
      "Email",
      "Discount",
      "Commission %",
      "Clicks",
      "Orders",
      "Conversion %",
      "Revenue",
      "Commission Earned",
      "Paid Out",
    ];
    const rows = coupons.map((c) => {
      const st = analytics[c.code] || {};
      const discStr =
        c.discount_type === "fixed"
          ? `Fixed £${c.fixed_amounts?.GBP || 0}/€${c.fixed_amounts?.EUR || 0}/$${c.fixed_amounts?.USD || 0}`
          : `${c.discount_value}%`;
      return [
        c.code,
        c.active ? "Yes" : "No",
        c.influencer_name || "",
        c.influencer_handle || "",
        c.influencer_email || "",
        discStr,
        c.commission_percent || 0,
        st.clicks || 0,
        st.ordersCount || 0,
        `${st.conversionRate || 0}%`,
        formatCurrencyMap(st.revenueByCurrency),
        formatCurrencyMap(st.commissionByCurrency),
        formatCurrencyMap(st.paidOutByCurrency),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",");
    });
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wbk-coupons-affiliates-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-poppins">
      <AdminPageHeader
        title="Coupons & Influencer Affiliates"
        subtitle="Create custom discount codes, influencer avatar popups, affiliate links (?ref=CODE), commission rules, and track conversions."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-2 border border-wbk-lightgrey bg-white hover:border-wbk-black text-xs font-semibold text-wbk-black flex items-center gap-1.5 cursor-pointer"
            >
              <IconDownload size={15} />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={loadData}
              className="px-3.5 py-2 border border-wbk-lightgrey bg-white hover:border-wbk-black text-xs font-semibold text-wbk-black flex items-center gap-1.5 cursor-pointer"
            >
              <IconRefresh size={15} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="px-4 py-2 bg-wbk-black hover:bg-wbk-green text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <IconPlus size={15} />
              <span>New Coupon / Influencer</span>
            </button>
          </div>
        }
      />

      {feedback && (
        <div
          className={`p-3 text-xs border flex items-center justify-between ${
            feedback.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-900"
          }`}
        >
          <span>{feedback.text}</span>
          <button type="button" onClick={() => setFeedback(null)} className="cursor-pointer">
            <IconX size={14} />
          </button>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-wbk-lightgrey p-4">
          <div className="flex items-center justify-between text-xs text-wbk-brown">
            <span>Active Codes</span>
            <IconTicket size={16} className="text-wbk-gold" />
          </div>
          <div className="text-2xl font-bold text-wbk-black mt-1">
            {totals.activeCount}{" "}
            <span className="text-xs font-normal text-wbk-brown">/ {coupons.length}</span>
          </div>
        </div>
        <div className="bg-white border border-wbk-lightgrey p-4">
          <div className="flex items-center justify-between text-xs text-wbk-brown">
            <span>Affiliate Clicks</span>
            <IconClick size={16} className="text-wbk-gold" />
          </div>
          <div className="text-2xl font-bold text-wbk-black mt-1">{totals.totalClicks}</div>
        </div>
        <div className="bg-white border border-wbk-lightgrey p-4">
          <div className="flex items-center justify-between text-xs text-wbk-brown">
            <span>Attributed Orders</span>
            <IconShoppingBag size={16} className="text-wbk-gold" />
          </div>
          <div className="text-2xl font-bold text-wbk-black mt-1">{totals.totalOrders}</div>
        </div>
        <div className="bg-white border border-wbk-lightgrey p-4">
          <div className="flex items-center justify-between text-xs text-wbk-brown">
            <span>Avg Conversion</span>
            <IconCoin size={16} className="text-wbk-gold" />
          </div>
          <div className="text-2xl font-bold text-wbk-black mt-1">{totals.convRate}%</div>
        </div>
      </div>

      {/* Filter & Link Market Toolbar */}
      <div className="bg-white border border-wbk-lightgrey p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by code, influencer name, @handle, or email..."
          className="px-3 py-1.5 text-xs border border-wbk-lightgrey focus:border-wbk-black outline-none w-full sm:w-80"
        />
        <div className="flex items-center gap-2 text-xs">
          <span className="text-wbk-brown">Copy affiliate link for market:</span>
          <select
            value={linkMarket}
            onChange={(e) => setLinkMarket(e.target.value)}
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

      {/* Coupons Table */}
      <div className="bg-white border border-wbk-lightgrey overflow-x-auto">
        {loading ? (
          <div className="py-12 text-center text-xs text-wbk-brown flex items-center justify-center gap-2">
            <IconLoader2 size={18} className="animate-spin" />
            <span>Loading coupons & affiliate stats...</span>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="py-14 text-center space-y-3">
            <IconTicket size={32} className="mx-auto text-wbk-brown/40" />
            <p className="text-sm font-semibold text-wbk-black">No coupons or influencers yet</p>
            <p className="text-xs text-wbk-brown max-w-md mx-auto">
              Create your first influencer coupon code with custom discount rules, avatar photo, commission rate, and shareable affiliate link.
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="px-4 py-2 bg-wbk-black text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              + Create First Coupon
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F7F5] border-b border-wbk-lightgrey text-[10px] uppercase tracking-wider text-wbk-brown">
              <tr>
                <th className="py-3 px-4">Code & Influencer</th>
                <th className="py-3 px-4">Offer & Rules</th>
                <th className="py-3 px-4">Performance</th>
                <th className="py-3 px-4">Revenue & Commission</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wbk-lightgrey/60">
              {filteredCoupons.map((c) => {
                const st = analytics[c.code] || {};
                const affUrl = buildAffiliateUrl(c.code, linkMarket);
                return (
                  <tr key={c.id} className="hover:bg-[#FCFBF9]">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {c.influencer_avatar ? (
                          <img
                            src={c.influencer_avatar}
                            alt={c.influencer_name || c.code}
                            className="w-10 h-10 rounded-full object-cover border border-wbk-lightgrey shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#F4F2F0] border border-wbk-lightgrey flex items-center justify-center text-xs font-bold text-wbk-black shrink-0">
                            {(c.influencer_name?.[0] || c.code?.[0] || "C").toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-wbk-black">{c.code}</span>
                            <button
                              type="button"
                              onClick={() => handleToggleActive(c)}
                              className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full cursor-pointer ${
                                c.active
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {c.active ? "Active" : "Paused"}
                            </button>
                          </div>
                          {c.is_influencer && (c.influencer_name || c.influencer_handle) && (
                            <div className="text-[11px] text-wbk-black font-medium mt-0.5">
                              {c.influencer_name}{" "}
                              {c.influencer_handle && (
                                <span className="text-wbk-brown">{c.influencer_handle}</span>
                              )}
                            </div>
                          )}
                          {c.influencer_email && (
                            <div className="text-[10px] text-wbk-brown font-mono">
                              Portal: {c.influencer_email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 space-y-1">
                      <div className="font-bold text-wbk-black">
                        {c.discount_type === "fixed"
                          ? `Fixed £${c.fixed_amounts?.GBP || 0} / €${c.fixed_amounts?.EUR || 0} / $${c.fixed_amounts?.USD || 0}`
                          : `${c.discount_value}% OFF`}
                        {c.commission_percent > 0 && (
                          <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-semibold">
                            {c.commission_percent}% Comm.
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 text-[10px]">
                        <span className="px-1.5 py-0.5 bg-[#F4F2F0] text-wbk-brown">
                          {c.target_markets?.length ? c.target_markets.map((m) => m.toUpperCase()).join(", ") : "All Markets"}
                        </span>
                        {c.target_categories?.length > 0 && (
                          <span className="px-1.5 py-0.5 bg-[#F4F2F0] text-wbk-brown">
                            Cats: {c.target_categories.join(", ")}
                          </span>
                        )}
                        <span
                          className={`px-1.5 py-0.5 ${
                            c.allow_stack_with_promotions
                              ? "bg-emerald-50 text-emerald-800"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {c.allow_stack_with_promotions ? "Stacks w/ Sale" : "No Sale Stack"}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 ${
                            c.allow_stack_with_delivery_discount
                              ? "bg-emerald-50 text-emerald-800"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {c.allow_stack_with_delivery_discount ? "Stacks w/ -5% Deliv" : "No -5% Deliv Stack"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-wbk-black">
                        <strong>{st.clicks || 0}</strong> clicks • <strong>{st.ordersCount || 0}</strong> orders
                      </div>
                      <div className="text-[11px] text-wbk-brown">
                        Conv. rate: <strong className="text-wbk-black">{st.conversionRate || 0}%</strong>
                        {c.max_uses ? ` • Max ${c.max_uses}` : ""}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-[11px] text-wbk-brown">
                        Sales: <strong className="text-wbk-black">{formatCurrencyMap(st.revenueByCurrency)}</strong>
                      </div>
                      <div className="text-[11px] text-emerald-800">
                        Comm: <strong>{formatCurrencyMap(st.commissionByCurrency)}</strong>
                      </div>
                      {Object.keys(st.paidOutByCurrency || {}).length > 0 && (
                        <div className="text-[10px] text-wbk-brown">
                          Paid out: {formatCurrencyMap(st.paidOutByCurrency)}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopy(affUrl, `link-${c.id}`)}
                          title={affUrl}
                          className="px-2.5 py-1.5 border border-wbk-lightgrey hover:border-wbk-black bg-white text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === `link-${c.id}` ? (
                            <IconCheck size={13} className="text-emerald-600" />
                          ) : (
                            <IconLink size={13} />
                          )}
                          <span>{copiedId === `link-${c.id}` ? "Copied!" : "Link"}</span>
                        </button>
                        {c.is_influencer && (
                          <button
                            type="button"
                            onClick={() => {
                              setPayoutModalCoupon(c);
                              setPayoutForm({ amount: "", currency: "GBP", note: "" });
                            }}
                            title="Record Commission Payout"
                            className="p-1.5 border border-wbk-lightgrey hover:border-emerald-700 hover:text-emerald-800 bg-white cursor-pointer"
                          >
                            <IconCash size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEditModal(c)}
                          title="Edit"
                          className="p-1.5 border border-wbk-lightgrey hover:border-wbk-black bg-white cursor-pointer"
                        >
                          <IconEdit size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(c)}
                          title="Delete"
                          className="p-1.5 border border-wbk-lightgrey hover:border-red-600 hover:text-red-600 bg-white cursor-pointer"
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── CREATE / EDIT COUPON & INFLUENCER MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-wbk-lightgrey w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 z-10 bg-white border-b border-wbk-lightgrey px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconSparkles size={18} className="text-wbk-gold" />
                <h2 className="font-new-york text-xl text-wbk-black">
                  {form.id ? `Edit Coupon: ${form.code}` : "Create Coupon / Influencer Partner"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-wbk-brown hover:text-wbk-black cursor-pointer"
              >
                <IconX size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="p-6 space-y-6 text-xs">
              {/* Section 1: Code & Discount */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-wbk-black border-b border-wbk-lightgrey pb-1.5">
                  1. Coupon Code &amp; Discount
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Coupon Code *</label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        required
                        value={form.code}
                        onChange={(e) =>
                          setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "") })
                        }
                        placeholder="e.g. ANNA10"
                        className="w-full px-3 py-2 border border-wbk-lightgrey focus:border-wbk-black outline-none font-mono font-bold uppercase"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            code: `WBK${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
                          })
                        }
                        className="px-2.5 border border-wbk-lightgrey hover:border-wbk-black bg-[#F8F7F5] text-[10px] font-semibold cursor-pointer"
                      >
                        Auto
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Discount Type</label>
                    <select
                      value={form.discount_type}
                      onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                      className="w-full px-3 py-2 border border-wbk-lightgrey bg-white outline-none"
                    >
                      <option value="percent">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (£ / € / $)</option>
                    </select>
                  </div>
                  {form.discount_type === "percent" ? (
                    <div>
                      <label className="block font-semibold mb-1">Discount (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="95"
                        step="0.5"
                        value={form.discount_value}
                        onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-wbk-lightgrey focus:border-wbk-black outline-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block font-semibold mb-1">Status</label>
                      <label className="flex items-center gap-2 py-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.active}
                          onChange={(e) => setForm({ ...form, active: e.target.checked })}
                          className="accent-wbk-black"
                        />
                        <span className="font-semibold">Coupon Active</span>
                      </label>
                    </div>
                  )}
                </div>

                {form.discount_type === "fixed" && (
                  <div className="grid grid-cols-3 gap-3 bg-[#FAF8F5] p-3 border border-wbk-lightgrey">
                    {["GBP", "EUR", "USD"].map((curr) => (
                      <div key={curr}>
                        <label className="block font-semibold mb-1">
                          Fixed Discount ({CURRENCY_SYM[curr]} {curr})
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={form.fixed_amounts?.[curr] ?? 0}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              fixed_amounts: {
                                ...form.fixed_amounts,
                                [curr]: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 border border-wbk-lightgrey bg-white outline-none"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-5 pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setForm({ ...form, active: e.target.checked })}
                      className="accent-wbk-black"
                    />
                    <span className="font-semibold">Active</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.allow_stack_with_promotions}
                      onChange={(e) =>
                        setForm({ ...form, allow_stack_with_promotions: e.target.checked })
                      }
                      className="accent-wbk-black"
                    />
                    <span>Stackable with active Sale Campaigns</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.allow_stack_with_delivery_discount}
                      onChange={(e) =>
                        setForm({ ...form, allow_stack_with_delivery_discount: e.target.checked })
                      }
                      className="accent-wbk-black"
                    />
                    <span>Stackable with -5% Slow Delivery</span>
                  </label>
                </div>
              </div>

              {/* Section 2: Influencer & Avatar Settings */}
              <div className="space-y-4 p-4 bg-[#FAF8F5] border border-wbk-lightgrey">
                <div className="flex items-center justify-between border-b border-wbk-lightgrey pb-2">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-wbk-black flex items-center gap-1.5">
                    <IconUsers size={15} className="text-wbk-gold" />
                    <span>2. Influencer Profile, Avatar &amp; Affiliate Settings</span>
                  </h3>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_influencer}
                      onChange={(e) => setForm({ ...form, is_influencer: e.target.checked })}
                      className="accent-wbk-black"
                    />
                    <span className="font-semibold">Influencer / Affiliate Campaign</span>
                  </label>
                </div>

                {form.is_influencer && (
                  <div className="space-y-4">
                    {/* Avatar Upload Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="relative w-16 h-16 rounded-full bg-white border-2 border-wbk-gold overflow-hidden shrink-0 flex items-center justify-center">
                        {form.influencer_avatar ? (
                          <img
                            src={form.influencer_avatar}
                            alt="Influencer avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-wbk-brown">
                            {(form.influencer_name?.[0] || "?").toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <label className="block font-semibold">
                          Influencer Portrait Photo (shown in welcome popup &amp; header badge)
                        </label>
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-wbk-black hover:bg-wbk-green text-white text-[11px] font-semibold cursor-pointer">
                            {uploadingAvatar ? (
                              <IconLoader2 size={14} className="animate-spin" />
                            ) : (
                              <IconUpload size={14} />
                            )}
                            <span>{uploadingAvatar ? "Uploading..." : "Upload Photo"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarUpload}
                              className="hidden"
                            />
                          </label>
                          <input
                            type="text"
                            value={form.influencer_avatar}
                            onChange={(e) => setForm({ ...form, influencer_avatar: e.target.value })}
                            placeholder="Or paste image URL..."
                            className="flex-1 min-w-[180px] px-2.5 py-1.5 border border-wbk-lightgrey bg-white text-[11px] outline-none"
                          />
                          {form.influencer_avatar && (
                            <button
                              type="button"
                              onClick={() => setForm({ ...form, influencer_avatar: "" })}
                              className="text-[11px] text-red-600 underline cursor-pointer"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Influencer Name</label>
                        <input
                          type="text"
                          value={form.influencer_name}
                          onChange={(e) => setForm({ ...form, influencer_name: e.target.value })}
                          placeholder="e.g. Anna Smith"
                          className="w-full px-3 py-2 border border-wbk-lightgrey bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Social Handle</label>
                        <input
                          type="text"
                          value={form.influencer_handle}
                          onChange={(e) => setForm({ ...form, influencer_handle: e.target.value })}
                          placeholder="@annasmith"
                          className="w-full px-3 py-2 border border-wbk-lightgrey bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">
                          Account Email (links Influencer Portal)
                        </label>
                        <input
                          type="email"
                          value={form.influencer_email}
                          onChange={(e) => setForm({ ...form, influencer_email: e.target.value })}
                          placeholder="anna@example.com"
                          className="w-full px-3 py-2 border border-wbk-lightgrey bg-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Commission Rate (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          step="0.5"
                          value={form.commission_percent}
                          onChange={(e) =>
                            setForm({ ...form, commission_percent: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 border border-wbk-lightgrey bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Cookie Window (days)</label>
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={form.cookie_days}
                          onChange={(e) => setForm({ ...form, cookie_days: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-wbk-lightgrey bg-white outline-none"
                        />
                      </div>
                      <div className="flex items-end pb-2">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.auto_apply_on_ref}
                            onChange={(e) =>
                              setForm({ ...form, auto_apply_on_ref: e.target.checked })
                            }
                            className="accent-wbk-black"
                          />
                          <span className="font-semibold">Auto-apply on ?ref= link</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">
                        Custom Welcome Message (optional — leave blank for auto localized text)
                      </label>
                      <input
                        type="text"
                        value={form.influencer_message}
                        onChange={(e) => setForm({ ...form, influencer_message: e.target.value })}
                        placeholder="e.g. You get 10% OFF everything courtesy of Anna!"
                        className="w-full px-3 py-2 border border-wbk-lightgrey bg-white outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Restrictions (Markets, Categories, Limits, Dates) */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-wbk-black border-b border-wbk-lightgrey pb-1.5">
                  3. Restrictions, Markets &amp; Validity
                </h3>

                <div>
                  <label className="block font-semibold mb-1.5">
                    Allowed Markets / Countries (leave all unchecked for All Markets)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {MARKETS.map((m) => {
                      const active = (form.target_markets || []).includes(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => toggleArrayValue("target_markets", m.id)}
                          className={`px-3 py-1 border text-[11px] font-semibold cursor-pointer ${
                            active
                              ? "bg-wbk-black text-white border-wbk-black"
                              : "bg-white text-wbk-black border-wbk-lightgrey hover:border-wbk-black"
                          }`}
                        >
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1.5">
                    Allowed Categories (leave all unchecked for All Categories)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => {
                      const active = (form.target_categories || []).includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleArrayValue("target_categories", cat.id)}
                          className={`px-3 py-1 border text-[11px] font-semibold cursor-pointer ${
                            active
                              ? "bg-wbk-black text-white border-wbk-black"
                              : "bg-white text-wbk-black border-wbk-lightgrey hover:border-wbk-black"
                          }`}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Min Order Amount</label>
                    <input
                      type="number"
                      min="0"
                      value={form.min_order_amount}
                      onChange={(e) => setForm({ ...form, min_order_amount: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-wbk-lightgrey outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Max Uses (blank = ∞)</label>
                    <input
                      type="number"
                      min="1"
                      value={form.max_uses}
                      onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                      placeholder="Unlimited"
                      className="w-full px-3 py-2 border border-wbk-lightgrey outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Start Date</label>
                    <input
                      type="date"
                      value={form.start_date}
                      onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-wbk-lightgrey outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">End Date</label>
                    <input
                      type="date"
                      value={form.end_date}
                      onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-wbk-lightgrey outline-none"
                    />
                  </div>
                </div>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.one_per_customer}
                    onChange={(e) => setForm({ ...form, one_per_customer: e.target.checked })}
                    className="accent-wbk-black"
                  />
                  <span>Limit to 1 use per customer email</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-wbk-lightgrey">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-wbk-lightgrey text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-wbk-black hover:bg-wbk-green text-white text-xs font-semibold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── RECORD PAYOUT MODAL ── */}
      {payoutModalCoupon && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-wbk-lightgrey w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-wbk-lightgrey pb-3">
              <h3 className="font-new-york text-lg text-wbk-black">
                Record Payout — {payoutModalCoupon.influencer_name || payoutModalCoupon.code}
              </h3>
              <button
                type="button"
                onClick={() => setPayoutModalCoupon(null)}
                className="cursor-pointer"
              >
                <IconX size={16} />
              </button>
            </div>
            <form onSubmit={handleRecordPayout} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Amount *</label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={payoutForm.amount}
                    onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-wbk-lightgrey outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Currency</label>
                  <select
                    value={payoutForm.currency}
                    onChange={(e) => setPayoutForm({ ...payoutForm, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-wbk-lightgrey bg-white outline-none"
                  >
                    <option value="GBP">GBP (£)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Reference / Note</label>
                <input
                  type="text"
                  value={payoutForm.note}
                  onChange={(e) => setPayoutForm({ ...payoutForm, note: e.target.value })}
                  placeholder="e.g. Nov 2026 bank transfer"
                  className="w-full px-3 py-2 border border-wbk-lightgrey outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayoutModalCoupon(null)}
                  className="px-4 py-2 border border-wbk-lightgrey cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPayout}
                  className="px-5 py-2 bg-wbk-black text-white font-semibold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  {savingPayout ? "Saving..." : "Save Payout"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
