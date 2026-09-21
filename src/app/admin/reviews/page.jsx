"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  IconStar,
  IconCheck,
  IconX,
  IconTrash,
  IconSearch,
  IconRefresh,
  IconPhoto,
  IconAlertCircle,
  IconClock,
  IconShieldCheck,
  IconThumbUp,
} from "@tabler/icons-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'pending' | 'approved' | 'rejected'
  const [search, setSearch] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();
      if (data.success && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      }
    } catch (err) {
      setToastMessage({ type: "error", text: "Failed to load customer reviews." });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reviewId, newStatus) => {
    setActionLoadingId(reviewId);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r))
        );
        setToastMessage({
          type: "success",
          text: `Review status updated to "${newStatus.toUpperCase()}".`,
        });
      }
    } catch (err) {
      setToastMessage({ type: "error", text: "Failed to update review status." });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to permanently delete this review?")) return;
    setActionLoadingId(reviewId);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        setToastMessage({ type: "success", text: "Review permanently deleted." });
      }
    } catch (err) {
      setToastMessage({ type: "error", text: "Failed to delete review." });
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        (r.author_name && r.author_name.toLowerCase().includes(q)) ||
        (r.author_email && r.author_email.toLowerCase().includes(q)) ||
        (r.product_name && r.product_name.toLowerCase().includes(q)) ||
        (r.content && r.content.toLowerCase().includes(q)) ||
        (r.title && r.title.toLowerCase().includes(q));

      return matchStatus && matchSearch;
    });
  }, [reviews, statusFilter, search]);

  const stats = useMemo(() => {
    return {
      total: reviews.length,
      pending: reviews.filter((r) => r.status === "pending").length,
      approved: reviews.filter((r) => r.status === "approved").length,
      rejected: reviews.filter((r) => r.status === "rejected").length,
    };
  }, [reviews]);

  return (
    <div className="space-y-6 text-wbk-black font-poppins pb-16">
      {/* Header */}
      <AdminPageHeader
        badge="Product Feedback & Social Proof"
        title="Customer Reviews Moderation"
        count={stats.total}
        description="Review customer ratings, testimonials, and submitted setup photos. Approved reviews appear live on product pages."
        actions={
          <button
            onClick={fetchReviews}
            disabled={loading}
            className="p-2.5 bg-white border border-wbk-lightgrey hover:border-wbk-black text-wbk-black rounded-full transition-colors cursor-pointer shadow-2xs"
            title="Refresh reviews"
          >
            <IconRefresh size={16} className={loading ? "animate-spin" : ""} />
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-wbk-lightgrey/70 p-4 shadow-2xs">
          <span className="text-[10px] text-wbk-brown uppercase tracking-wider font-semibold block">Total Reviews</span>
          <span className="text-2xl font-bold text-wbk-black mt-1 block">{stats.total}</span>
        </div>

        <div className={`p-4 border shadow-2xs ${stats.pending > 0 ? "bg-amber-50/70 border-amber-300" : "bg-white border-wbk-lightgrey/70"}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-amber-900 uppercase tracking-wider font-semibold">Pending Approval</span>
            {stats.pending > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
          <span className="text-2xl font-bold text-amber-950 mt-1 block">{stats.pending}</span>
        </div>

        <div className="bg-white border border-wbk-lightgrey/70 p-4 shadow-2xs">
          <span className="text-[10px] text-emerald-800 uppercase tracking-wider font-semibold block">Approved (Live on Store)</span>
          <span className="text-2xl font-bold text-emerald-900 mt-1 block">{stats.approved}</span>
        </div>

        <div className="bg-white border border-wbk-lightgrey/70 p-4 shadow-2xs">
          <span className="text-[10px] text-red-800 uppercase tracking-wider font-semibold block">Rejected</span>
          <span className="text-2xl font-bold text-stone-600 mt-1 block">{stats.rejected}</span>
        </div>
      </div>

      {/* Toast message */}
      {toastMessage && (
        <div
          className={`p-3 text-xs border flex items-center justify-between shadow-xs ${
            toastMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === "success" ? <IconCheck size={16} /> : <IconAlertCircle size={16} />}
            <span className="font-medium">{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-stone-500 hover:text-stone-800 cursor-pointer">
            <IconX size={14} />
          </button>
        </div>
      )}

      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-wbk-lightgrey/70 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: `All (${stats.total})` },
            { id: "pending", label: `Pending (${stats.pending})`, badge: stats.pending > 0 },
            { id: "approved", label: `Approved (${stats.approved})` },
            { id: "rejected", label: `Rejected (${stats.rejected})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer relative ${
                statusFilter === tab.id
                  ? "bg-wbk-black text-white font-semibold shadow-xs"
                  : "bg-[#FBF9F8] hover:bg-wbk-lightgrey/30 text-wbk-black/80 hover:text-wbk-black border border-wbk-lightgrey/50"
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && statusFilter !== tab.id && (
                <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 inline-block align-middle" />
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-wbk-brown" />
          <input
            type="text"
            placeholder="Search by customer, product, or review text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#FBF9F8] border border-wbk-lightgrey text-xs text-wbk-black placeholder:text-wbk-brown/50 focus:outline-none focus:border-wbk-gold"
          />
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="p-12 text-center text-wbk-brown text-xs bg-white border border-wbk-lightgrey/60">
          <div className="w-8 h-8 border-2 border-wbk-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading customer reviews...
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="p-12 text-center text-wbk-brown text-xs bg-white border border-wbk-lightgrey/70">
          No reviews match the selected filter or search criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((rev) => {
            const isPending = rev.status === "pending";
            const isApproved = rev.status === "approved";
            const isRejected = rev.status === "rejected";
            const hasPhotos = Array.isArray(rev.photos) && rev.photos.length > 0;
            const isBusy = actionLoadingId === rev.id;

            return (
              <div
                key={rev.id}
                className={`p-5 border transition-all ${
                  isPending
                    ? "bg-amber-50/20 border-2 border-amber-300 shadow-xs"
                    : isApproved
                    ? "bg-white border border-wbk-lightgrey/70 hover:border-wbk-brown/40 shadow-2xs"
                    : "bg-stone-50 border border-stone-200 opacity-80"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Review Content */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-amber-500 font-bold text-sm tracking-wide">
                        {"★".repeat(rev.rating || 5)}{"☆".repeat(5 - (rev.rating || 5))}
                      </div>

                      <span className="text-wbk-brown/40 text-[11px]">•</span>

                      <span className="text-xs font-semibold text-wbk-black">
                        {rev.author_name}
                      </span>

                      {rev.author_email && (
                        <span className="text-[11px] text-wbk-brown font-mono">
                          ({rev.author_email})
                        </span>
                      )}

                      {rev.verified_buyer && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[9px] uppercase font-semibold">
                          <IconShieldCheck size={11} />
                          <span>Verified Buyer</span>
                        </span>
                      )}

                      <span className="text-wbk-brown/40 text-[11px]">•</span>

                      <span className="text-[11px] text-wbk-brown">
                        {new Date(rev.created_at || Date.now()).toLocaleDateString("en-GB", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`ml-auto px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border ${
                          isPending
                            ? "bg-amber-100 text-amber-900 border-amber-200"
                            : isApproved
                            ? "bg-emerald-100 text-emerald-900 border-emerald-200"
                            : "bg-red-100 text-red-900 border-red-200"
                        }`}
                      >
                        {rev.status}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-wbk-brown">
                      Product: <span className="text-wbk-black font-semibold">{rev.product_name || rev.product_slug}</span>
                    </div>

                    {rev.title && (
                      <h4 className="font-poppins text-sm font-semibold text-wbk-black mt-1">
                        {rev.title}
                      </h4>
                    )}

                    <p className="text-xs text-wbk-black/85 leading-relaxed max-w-3xl">
                      "{rev.content}"
                    </p>

                    {/* Photos Gallery */}
                    {hasPhotos && (
                      <div className="pt-2">
                        <div className="flex items-center gap-1.5 text-[11px] text-wbk-brown mb-2 font-medium">
                          <IconPhoto size={13} />
                          <span>Customer submitted photos ({rev.photos.length}):</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {rev.photos.map((p, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => setSelectedPhoto(p)}
                              className="relative w-16 h-16 border border-wbk-lightgrey rounded overflow-hidden group hover:border-wbk-gold transition-colors cursor-pointer shadow-2xs"
                            >
                              <img
                                src={p}
                                alt={`Customer upload ${pIdx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions / Moderation Controls */}
                  <div className="flex lg:flex-col items-center lg:items-end gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-wbk-lightgrey/60">
                    {/* Approve Button */}
                    {!isApproved ? (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleUpdateStatus(rev.id, "approved")}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                        title="Approve and publish to product page"
                      >
                        <IconCheck size={14} />
                        <span>Approve (Publish)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleUpdateStatus(rev.id, "pending")}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-medium rounded border border-stone-200 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Revert to pending moderation"
                      >
                        <IconClock size={13} />
                        <span>Revert to Pending</span>
                      </button>
                    )}

                    {/* Reject Button */}
                    {!isRejected && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleUpdateStatus(rev.id, "rejected")}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-medium rounded transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Reject review"
                      >
                        <IconX size={13} />
                        <span>Reject</span>
                      </button>
                    )}

                    {/* Delete Permanently */}
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleDelete(rev.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50"
                      title="Delete Permanently"
                    >
                      <IconTrash size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Size Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-white border border-wbk-lightgrey p-3 max-w-2xl w-full rounded shadow-2xl overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-wbk-lightgrey/60 mb-2">
              <span className="text-xs text-wbk-brown font-semibold">Customer Uploaded Photo</span>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-stone-400 hover:text-stone-800 cursor-pointer"
              >
                <IconX size={18} />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-hidden flex items-center justify-center bg-stone-100 rounded">
              <img
                src={selectedPhoto}
                alt="Full customer review photo"
                className="max-h-[70vh] w-auto object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
