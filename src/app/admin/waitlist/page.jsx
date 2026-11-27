"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  IconBell,
  IconRefresh,
  IconSearch,
  IconSend,
  IconTrash,
  IconDownload,
  IconCheck,
  IconClock,
  IconAlertCircle,
  IconPackage,
  IconUsers,
  IconExternalLink,
  IconRotateClockwise,
  IconChevronDown,
  IconChevronUp,
  IconSparkles,
} from "@tabler/icons-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AdminWaitlistPage() {
  const [items, setItems] = useState([]);
  const [productGroups, setProductGroups] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    waiting: 0,
    notified: 0,
    comingSoon: 0,
    uniqueEmails: 0,
    uniqueProducts: 0,
    resendConfigured: true,
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("products"); // "products" | "subscribers"
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "waiting" | "notified"
  const [typeFilter, setTypeFilter] = useState("all"); // "all" | "coming_soon" | "restock"
  const [search, setSearch] = useState("");
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [actionLoadingKey, setActionLoadingKey] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => {
      setToast((curr) => (curr?.text === text ? null : curr));
    }, 5500);
  };

  const fetchWaitlist = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/waitlist", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setItems(Array.isArray(data.items) ? data.items : []);
        setProductGroups(Array.isArray(data.productGroups) ? data.productGroups : []);
        if (data.stats) setStats(data.stats);
      } else {
        showToast("error", data.error || "Failed to load waitlist.");
      }
    } catch {
      showToast("error", "Network error loading waitlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (typeFilter === "coming_soon" && !item.is_coming_soon) return false;
      if (typeFilter === "restock" && item.is_coming_soon) return false;
      if (!q) return true;
      return (
        String(item.customer_email || "").toLowerCase().includes(q) ||
        String(item.customer_name || "").toLowerCase().includes(q) ||
        String(item.product_name || "").toLowerCase().includes(q) ||
        String(item.product_slug || "").toLowerCase().includes(q) ||
        String(item.variant_name || "").toLowerCase().includes(q) ||
        String(item.locale || "").toLowerCase().includes(q)
      );
    });
  }, [items, statusFilter, typeFilter, search]);

  const filteredGroups = useMemo(() => {
    const q = search.toLowerCase().trim();
    return productGroups.filter((g) => {
      if (statusFilter === "waiting" && g.waitingCount === 0) return false;
      if (statusFilter === "notified" && g.notifiedCount === 0) return false;
      if (typeFilter === "coming_soon" && !g.is_coming_soon) return false;
      if (typeFilter === "restock" && g.is_coming_soon) return false;
      if (!q) return true;
      return (
        String(g.product_name || "").toLowerCase().includes(q) ||
        String(g.product_slug || "").toLowerCase().includes(q) ||
        g.subscribers.some(
          (s) =>
            String(s.email || "").toLowerCase().includes(q) ||
            String(s.name || "").toLowerCase().includes(q)
        )
      );
    });
  }, [productGroups, statusFilter, typeFilter, search]);

  const handleNotifyProduct = async (group) => {
    if (group.waitingCount === 0) return;
    const confirmed = window.confirm(
      `Send email notification to ${group.waitingCount} waiting subscriber(s) for "${group.product_name}"?`
    );
    if (!confirmed) return;

    setActionLoadingKey(`group:${group.key}`);
    try {
      const res = await fetch("/api/admin/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: group.product_id,
          productSlug: group.product_slug,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", data.message || `Notified ${data.notifiedCount} subscriber(s).`);
        await fetchWaitlist();
      } else {
        showToast("error", data.error || "Failed to send notifications.");
      }
    } catch {
      showToast("error", "Network error while sending notifications.");
    } finally {
      setActionLoadingKey(null);
    }
  };

  const handleNotifySingle = async (item, isResend = false) => {
    const confirmed = window.confirm(
      `${isResend ? "Re-send" : "Send"} notification email to ${item.customer_email} for "${item.product_name}"?`
    );
    if (!confirmed) return;

    setActionLoadingKey(`notify:${item.id}`);
    try {
      const res = await fetch("/api/admin/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          waitlistIds: [item.id],
          productId: item.product_id,
          productSlug: item.product_slug,
          includeNotified: isResend,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", data.message || `Notification sent to ${item.customer_email}.`);
        await fetchWaitlist();
      } else {
        showToast("error", data.error || "Failed to send notification.");
      }
    } catch {
      showToast("error", "Network error while sending notification.");
    } finally {
      setActionLoadingKey(null);
    }
  };

  const handleResetStatus = async (item) => {
    setActionLoadingKey(`reset:${item.id}`);
    try {
      const res = await fetch("/api/admin/waitlist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, status: "waiting" }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", `${item.customer_email} reset to WAITING.`);
        await fetchWaitlist();
      } else {
        showToast("error", data.error || "Failed to reset status.");
      }
    } catch {
      showToast("error", "Network error updating status.");
    } finally {
      setActionLoadingKey(null);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Remove ${item.customer_email} from the waitlist for "${item.product_name}"?`
    );
    if (!confirmed) return;

    setActionLoadingKey(`del:${item.id}`);
    try {
      const res = await fetch("/api/admin/waitlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Waitlist entry removed.");
        await fetchWaitlist();
      } else {
        showToast("error", data.error || "Failed to remove entry.");
      }
    } catch {
      showToast("error", "Network error removing entry.");
    } finally {
      setActionLoadingKey(null);
    }
  };

  const handleExportCsv = () => {
    const rows = filteredItems;
    if (rows.length === 0) {
      showToast("error", "No subscribers to export with current filters.");
      return;
    }

    const headers = [
      "Email",
      "Name",
      "Product",
      "Variant",
      "Product Slug",
      "Category",
      "Locale",
      "Type",
      "Status",
      "Signed Up At",
      "Notified At",
    ];

    const escapeCsv = (val) => {
      const s = String(val ?? "");
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const csvLines = [
      headers.join(","),
      ...rows.map((r) =>
        [
          r.customer_email,
          r.customer_name || "",
          r.product_name || "",
          r.variant_name || "",
          r.product_slug || "",
          r.parent_category || "",
          r.locale || "en",
          r.is_coming_soon ? "Launch (Coming Soon)" : "Restock",
          r.status || "waiting",
          r.created_at || "",
          r.notified_at || "",
        ]
          .map(escapeCsv)
          .join(",")
      ),
    ];

    const blob = new Blob(["\uFEFF" + csvLines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wbk-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("success", `Exported ${rows.length} waitlist row(s) to CSV.`);
  };

  return (
    <div className="space-y-6 text-wbk-black font-poppins pb-16">
      <AdminPageHeader
        badge="Launch & Stock Alerts"
        title="Waitlist Subscribers"
        count={stats.total}
        description="Track customer launch and back-in-stock signups. Export emails to CSV or trigger localized Resend notifications in one click."
        actions={
          <>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-wbk-black text-white hover:bg-wbk-gold hover:text-wbk-black text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <IconDownload size={15} />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={fetchWaitlist}
              disabled={loading}
              className="p-2.5 bg-white border border-wbk-lightgrey hover:border-wbk-black text-wbk-black rounded-full transition-colors cursor-pointer shadow-2xs"
              title="Refresh waitlist"
            >
              <IconRefresh size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </>
        }
      />

      {/* Resend Warning Banner if not configured */}
      {!loading && !stats.resendConfigured && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-300 text-amber-950 text-xs">
          <IconAlertCircle size={18} className="text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">RESEND_API_KEY is not configured in this environment.</strong>{" "}
            Sending notifications locally will run in simulation (mock) mode and log to the server console without sending real emails.
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toast && (
        <div
          className={`flex items-center justify-between gap-3 px-4 py-3 text-xs font-medium border shadow-sm ${
            toast.type === "error"
              ? "bg-red-50 border-red-200 text-red-900"
              : "bg-emerald-50 border-emerald-200 text-emerald-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "error" ? (
              <IconAlertCircle size={16} />
            ) : (
              <IconCheck size={16} />
            )}
            <span>{toast.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-[11px] uppercase tracking-wider underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-wbk-lightgrey/70 p-4 shadow-2xs">
          <span className="text-[10px] text-wbk-brown uppercase tracking-wider font-semibold block">
            Total Signups
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-wbk-black">{stats.total}</span>
            <span className="text-[11px] text-wbk-brown">
              ({stats.uniqueEmails} unique)
            </span>
          </div>
        </div>

        <div
          className={`p-4 border shadow-2xs ${
            stats.waiting > 0
              ? "bg-amber-50/70 border-amber-300"
              : "bg-white border-wbk-lightgrey/70"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-amber-900 uppercase tracking-wider font-semibold">
              Waiting for Alert
            </span>
            {stats.waiting > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
          <span className="text-2xl font-bold text-amber-950 mt-1 block">
            {stats.waiting}
          </span>
        </div>

        <div className="bg-white border border-wbk-lightgrey/70 p-4 shadow-2xs">
          <span className="text-[10px] text-emerald-800 uppercase tracking-wider font-semibold block">
            Notified
          </span>
          <span className="text-2xl font-bold text-emerald-900 mt-1 block">
            {stats.notified}
          </span>
        </div>

        <div className="bg-white border border-wbk-lightgrey/70 p-4 shadow-2xs">
          <span className="text-[10px] text-wbk-gold uppercase tracking-wider font-semibold block">
            Launch / Coming Soon
          </span>
          <span className="text-2xl font-bold text-wbk-black mt-1 block">
            {stats.comingSoon}
          </span>
        </div>
      </div>

      {/* Filter & View Bar */}
      <div className="bg-white border border-wbk-lightgrey/80 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 bg-[#F4F2F0] p-1 self-start">
          <button
            type="button"
            onClick={() => setViewMode("products")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              viewMode === "products"
                ? "bg-wbk-black text-white"
                : "text-wbk-brown hover:text-wbk-black"
            }`}
          >
            <IconPackage size={14} />
            <span>By Product ({filteredGroups.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("subscribers")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              viewMode === "subscribers"
                ? "bg-wbk-black text-white"
                : "text-wbk-brown hover:text-wbk-black"
            }`}
          >
            <IconUsers size={14} />
            <span>All Subscribers ({filteredItems.length})</span>
          </button>
        </div>

        {/* Search + Status + Type */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 lg:justify-end">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <IconSearch
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-wbk-brown"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search email, name, product..."
              className="w-full pl-9 pr-3 py-2 bg-[#FBF9F8] border border-wbk-lightgrey text-xs text-wbk-black focus:outline-none focus:border-wbk-black"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-wbk-lightgrey text-xs text-wbk-black focus:outline-none focus:border-wbk-black cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="waiting">Waiting Only</option>
            <option value="notified">Notified Only</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-wbk-lightgrey text-xs text-wbk-black focus:outline-none focus:border-wbk-black cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="coming_soon">Coming Soon / Launch</option>
            <option value="restock">Out of Stock / Restock</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="bg-white border border-wbk-lightgrey/80 p-12 text-center text-xs text-wbk-brown">
          Loading waitlist subscribers...
        </div>
      ) : viewMode === "products" ? (
        filteredGroups.length === 0 ? (
          <div className="bg-white border border-wbk-lightgrey/80 p-12 text-center space-y-2">
            <IconBell size={28} className="mx-auto text-wbk-brown/40" />
            <p className="text-sm font-medium text-wbk-black">No waitlist signups match your filters</p>
            <p className="text-xs text-wbk-brown">
              When customers click &ldquo;Notify Me&rdquo; on out-of-stock or coming-soon products, they will appear here grouped by model.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGroups.map((group) => {
              const isExpanded = expandedGroup === group.key;
              const isBusy = actionLoadingKey === `group:${group.key}`;
              const productHref = group.product_slug
                ? `/products/${group.parent_category || "beds"}/${group.product_slug}`
                : null;

              return (
                <div
                  key={group.key}
                  className="bg-white border border-wbk-lightgrey/80 shadow-2xs overflow-hidden"
                >
                  <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-14 h-14 bg-[#FBF9F8] border border-wbk-lightgrey/70 shrink-0 flex items-center justify-center overflow-hidden p-1">
                        {group.product_image ? (
                          <img
                            src={group.product_image}
                            alt={group.product_name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <IconPackage size={20} className="text-wbk-brown/50" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-wbk-black truncate">
                            {group.product_name}
                          </h3>
                          {group.is_coming_soon && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                              <IconSparkles size={11} />
                              Launch / Coming Soon
                            </span>
                          )}
                          {group.current_stock !== null && (
                            <span
                              className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                group.current_stock > 0
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              }`}
                            >
                              Stock: {group.current_stock}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-wbk-brown mt-1">
                          <span className="font-mono">{group.product_slug || "—"}</span>
                          <span>•</span>
                          <span className="uppercase">{group.parent_category}</span>
                          {productHref && (
                            <>
                              <span>•</span>
                              <Link
                                href={productHref}
                                target="_blank"
                                className="inline-flex items-center gap-1 text-wbk-black hover:text-wbk-gold underline"
                              >
                                View page
                                <IconExternalLink size={11} />
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      <div className="flex items-center gap-2 mr-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                          <IconClock size={12} />
                          {group.waitingCount} waiting
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <IconCheck size={12} />
                          {group.notifiedCount} notified
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={group.waitingCount === 0 || isBusy}
                        onClick={() => handleNotifyProduct(group)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-wbk-black text-white hover:bg-wbk-gold hover:text-wbk-black disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        <IconSend size={13} />
                        <span>
                          {isBusy
                            ? "Sending..."
                            : `Notify Waiting (${group.waitingCount})`}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedGroup(isExpanded ? null : group.key)
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-2 bg-[#F4F2F0] hover:bg-wbk-lightgrey/60 text-wbk-black text-[11px] font-medium cursor-pointer transition-colors"
                      >
                        <span>Subscribers</span>
                        {isExpanded ? (
                          <IconChevronUp size={14} />
                        ) : (
                          <IconChevronDown size={14} />
                        )}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-wbk-lightgrey/70 bg-[#FBF9F8] overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-wbk-lightgrey/70 text-[10px] uppercase tracking-wider text-wbk-brown bg-[#F4F2F0]">
                            <th className="py-2.5 px-4">Email</th>
                            <th className="py-2.5 px-3">Name</th>
                            <th className="py-2.5 px-3">Variant</th>
                            <th className="py-2.5 px-3">Locale</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3">Signed Up</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-wbk-lightgrey/50">
                          {group.subscribers.map((sub) => (
                            <tr key={sub.id} className="hover:bg-white">
                              <td className="py-2.5 px-4 font-medium text-wbk-black">
                                {sub.email}
                              </td>
                              <td className="py-2.5 px-3 text-wbk-brown">
                                {sub.name || "—"}
                              </td>
                              <td className="py-2.5 px-3 text-wbk-brown">
                                {sub.variant_name || "—"}
                              </td>
                              <td className="py-2.5 px-3 uppercase font-mono text-[11px]">
                                {sub.locale}
                              </td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                    sub.status === "waiting"
                                      ? "bg-amber-100 text-amber-900"
                                      : "bg-emerald-100 text-emerald-900"
                                  }`}
                                >
                                  {sub.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-wbk-brown">
                                {formatDate(sub.created_at)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : filteredItems.length === 0 ? (
        <div className="bg-white border border-wbk-lightgrey/80 p-12 text-center space-y-2">
          <IconBell size={28} className="mx-auto text-wbk-brown/40" />
          <p className="text-sm font-medium text-wbk-black">No subscribers found</p>
        </div>
      ) : (
        <div className="bg-white border border-wbk-lightgrey/80 shadow-2xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-wbk-lightgrey bg-[#F4F2F0] text-[10px] uppercase tracking-wider text-wbk-brown">
                <th className="py-3 px-4">Subscriber</th>
                <th className="py-3 px-3">Product & Variant</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Locale</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wbk-lightgrey/60">
              {filteredItems.map((item) => {
                const isNotifying = actionLoadingKey === `notify:${item.id}`;
                const isResetting = actionLoadingKey === `reset:${item.id}`;
                const isDeleting = actionLoadingKey === `del:${item.id}`;

                return (
                  <tr key={item.id} className="hover:bg-[#FBF9F8]">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-wbk-black">
                        {item.customer_email}
                      </p>
                      {item.customer_name && (
                        <p className="text-[11px] text-wbk-brown">
                          {item.customer_name}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-wbk-black">
                        {item.product_name}
                      </p>
                      <p className="text-[11px] text-wbk-brown">
                        {item.variant_name || item.product_slug || "—"}
                      </p>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          item.is_coming_soon
                            ? "bg-amber-100 text-amber-900"
                            : "bg-neutral-100 text-neutral-700"
                        }`}
                      >
                        {item.is_coming_soon ? "Launch" : "Restock"}
                      </span>
                    </td>
                    <td className="py-3 px-3 uppercase font-mono text-[11px]">
                      {item.locale || "en"}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          item.status === "waiting"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-emerald-100 text-emerald-900"
                        }`}
                      >
                        {item.status === "waiting" ? (
                          <IconClock size={11} />
                        ) : (
                          <IconCheck size={11} />
                        )}
                        {item.status}
                      </span>
                      {item.notified_at && (
                        <p className="text-[10px] text-wbk-brown mt-0.5">
                          {formatDate(item.notified_at)}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-3 text-wbk-brown whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={isNotifying}
                          onClick={() =>
                            handleNotifySingle(item, item.status === "notified")
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-wbk-black text-white hover:bg-wbk-gold hover:text-wbk-black text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                          title={
                            item.status === "notified"
                              ? "Resend notification email"
                              : "Send notification email now"
                          }
                        >
                          <IconSend size={12} />
                          <span>
                            {isNotifying
                              ? "..."
                              : item.status === "notified"
                              ? "Resend"
                              : "Notify"}
                          </span>
                        </button>

                        {item.status === "notified" && (
                          <button
                            type="button"
                            disabled={isResetting}
                            onClick={() => handleResetStatus(item)}
                            className="p-1.5 border border-wbk-lightgrey hover:border-wbk-black text-wbk-brown hover:text-wbk-black transition-colors cursor-pointer"
                            title="Reset back to waiting"
                          >
                            <IconRotateClockwise size={13} />
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => handleDelete(item)}
                          className="p-1.5 border border-wbk-lightgrey hover:border-red-500 text-wbk-brown hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete entry"
                        >
                          <IconTrash size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
