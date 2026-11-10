"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  IconTag,
  IconPlus,
  IconRefresh,
  IconCheck,
  IconAlertCircle,
  IconSearch,
  IconEyeCheck,
  IconCalendar,
  IconPercentage,
  IconSpeakerphone,
  IconPhoto,
  IconEdit,
  IconTrash,
  IconCopy,
  IconClock,
  IconInfoCircle,
} from "@tabler/icons-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PromotionalCampaignModal } from "@/components/admin/PromotionalCampaignModal";
import { isCampaignActive } from "@/lib/promotions";

export default function AdminPricingPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState("all"); // "all" | "active" | "preview" | "inactive" | "expired"
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/promotions", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.campaigns)) {
        setCampaigns(data.campaigns);
      }
    } catch (e) {
      console.error("Failed to fetch campaigns:", e);
      setMessage({ type: "error", text: "Failed to load promotional campaigns." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleCreateNew = () => {
    const nowIso = new Date().toISOString();
    const newCamp = {
      name: "",
      slug: "",
      status: "preview", // Default to admin preview mode for safety
      priority: 5,
      discount_type: "percentage",
      discount_value: 15,
      apply_to: "all",
      target_categories: [],
      target_products: [],
      excluded_categories: [],
      excluded_products: [],
      allow_stacking: false,
      schedule_type: "fixed",
      start_date: nowIso,
      end_date: new Date(Date.now() + 14 * 86400000).toISOString(),
      recurring: {
        frequency: "weekly",
        days_of_week: [5, 6, 0],
        start_time: "00:00",
        end_time: "23:59",
      },
      top_bar: {
        enabled: true,
        text: "🌿 Special Promotion: 15% OFF across all space-saving furniture this weekend!",
        link: "/products",
        link_text: "Shop Now",
        bg_color: "#2D5A27",
        text_color: "#FFFFFF",
        dismissible: true,
      },
      hero_banner: {
        enabled: true,
        badge: "Flash Sale • 15% OFF",
        headline: "Save 15% On Space-Saving Furniture",
        subtitle: "Premium foldaway wall beds, multi-functional tables and modular living solutions at exclusive prices.",
        cta_text: "Explore Deals",
        cta_link: "/products",
        image: "/hero2.webp",
      },
    };
    setSelectedCampaign(newCamp);
    setIsModalOpen(true);
  };

  const handleEdit = (camp) => {
    setSelectedCampaign(camp);
    setIsModalOpen(true);
  };

  const handleDuplicate = async (camp) => {
    const copy = {
      ...camp,
      id: undefined,
      name: `${camp.name} (Copy)`,
      slug: `${camp.slug || "campaign"}-copy`,
      status: "inactive",
    };
    try {
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign: copy }),
      });
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.campaigns);
        setMessage({ type: "success", text: "Campaign duplicated successfully as draft." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to duplicate campaign." });
    }
  };

  const handleSave = async (campaignData) => {
    const res = await fetch("/api/admin/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaign: campaignData }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to save campaign");
    }
    setCampaigns(data.campaigns);
    setMessage({ type: "success", text: "Promotional campaign saved successfully!" });
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/admin/promotions?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.campaigns)) {
        setCampaigns(data.campaigns);
        setIsModalOpen(false);
        setMessage({ type: "success", text: "Campaign deleted successfully." });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to delete campaign." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to delete campaign." });
    }
  };

  // Quick cycle status: active -> preview -> inactive -> active
  const handleCycleStatus = async (camp, e) => {
    e.stopPropagation();
    const nextStatus =
      camp.status === "active"
        ? "preview"
        : camp.status === "preview"
          ? "inactive"
          : "active";

    const updated = { ...camp, status: nextStatus };
    try {
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign: updated }),
      });
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.campaigns);
        setMessage({
          type: "success",
          text: `Status updated to: ${
            nextStatus === "active"
              ? "Live"
              : nextStatus === "preview"
                ? "Admin Preview"
                : "Inactive"
          }`,
        });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to update status." });
    }
  };

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    const now = new Date();
    return campaigns.filter((camp) => {
      // Search query filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = (camp.name || "").toLowerCase().includes(q);
        const matchesSlug = (camp.slug || "").toLowerCase().includes(q);
        const matchesTopBar = (camp.top_bar?.text || "").toLowerCase().includes(q);
        const matchesHero = (camp.hero_banner?.headline || "").toLowerCase().includes(q);
        if (!matchesName && !matchesSlug && !matchesTopBar && !matchesHero) {
          return false;
        }
      }

      // Tab filter
      const isExpired =
        camp.end_date && new Date(camp.end_date).getTime() < now.getTime();

      if (filterTab === "active") return camp.status === "active" && !isExpired;
      if (filterTab === "preview") return camp.status === "preview";
      if (filterTab === "inactive") return camp.status === "inactive" && !isExpired;
      if (filterTab === "expired") return isExpired;

      return true;
    });
  }, [campaigns, search, filterTab]);

  // Tab counts
  const counts = useMemo(() => {
    const now = new Date();
    return {
      all: campaigns.length,
      active: campaigns.filter(
        (c) => c.status === "active" && (!c.end_date || new Date(c.end_date) >= now),
      ).length,
      preview: campaigns.filter((c) => c.status === "preview").length,
      inactive: campaigns.filter(
        (c) => c.status === "inactive" && (!c.end_date || new Date(c.end_date) >= now),
      ).length,
      expired: campaigns.filter(
        (c) => c.end_date && new Date(c.end_date) < now,
      ).length,
    };
  }, [campaigns]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        title="Pricing & Promotional Campaigns"
        description="Manage marketing promotions, scheduled sales, top announcement bars and hero banners."
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={fetchCampaigns}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
              title="Refresh"
            >
              <IconRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-wbk-green hover:bg-wbk-green/90 rounded-xl transition-colors shadow-sm"
            >
              <IconPlus className="w-4 h-4" />
              <span>Create Campaign</span>
            </button>
          </div>
        }
      />

      {/* Info Banner on Admin Preview mode */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-start gap-3">
        <IconEyeCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <span className="font-bold">Admin Preview Mode: </span>
          When a campaign is set to <span className="font-semibold text-amber-800">"Admin Preview"</span>, storefront visitors only see regular prices and normal banners. As a logged-in administrator, you will see the campaign live on the storefront with an admin preview indicator, allowing safe pre-launch testing.
        </div>
      </div>

      {/* Notification Toast */}
      {message && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between shadow-sm ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <IconCheck className="w-4 h-4 text-green-600" />
            ) : (
              <IconAlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-semibold pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterTab("all")}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filterTab === "all"
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("active")}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              filterTab === "active"
                ? "bg-green-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            Live ({counts.active})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("preview")}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              filterTab === "preview"
                ? "bg-amber-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <IconEyeCheck className="w-3.5 h-3.5" />
            Admin Preview ({counts.preview})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("inactive")}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filterTab === "inactive"
                ? "bg-gray-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Inactive ({counts.inactive})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("expired")}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filterTab === "expired"
                ? "bg-red-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Expired ({counts.expired})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <IconSearch className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-wbk-green/30 focus:border-wbk-green"
          />
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            <div className="w-6 h-6 border-2 border-wbk-green border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading campaigns...
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="p-12 text-center text-gray-400 space-y-3">
            <IconTag className="w-10 h-10 mx-auto text-gray-300 stroke-1" />
            <p className="text-sm font-medium text-gray-600">No campaigns found.</p>
            <p className="text-xs text-gray-400">
              {search
                ? "No campaigns matched your search criteria."
                : "Create a new campaign using the button above."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredCampaigns.map((camp) => {
              const now = new Date();
              const isCurrentlyActive = isCampaignActive(camp, now);
              const isExpired =
                camp.end_date && new Date(camp.end_date).getTime() < now.getTime();

              return (
                <div
                  key={camp.id}
                  onClick={() => handleEdit(camp)}
                  className="p-5 hover:bg-gray-50/80 transition-all cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4 group"
                >
                  {/* Left Column: Info & Badges */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status Pill with 1-click toggle */}
                      <button
                        type="button"
                        onClick={(e) => handleCycleStatus(camp, e)}
                        title="Click to cycle status (Live -> Preview -> Inactive)"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm ${
                          camp.status === "active"
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : camp.status === "preview"
                              ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {camp.status === "active" && (
                          <>
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Live (Active)
                          </>
                        )}
                        {camp.status === "preview" && (
                          <>
                            <IconEyeCheck className="w-3.5 h-3.5 text-amber-700" />
                            Admin Preview
                          </>
                        )}
                        {camp.status === "inactive" && (
                          <>
                            <span className="w-2 h-2 rounded-full bg-gray-400" />
                            Inactive (Draft)
                          </>
                        )}
                      </button>

                      {isExpired && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-700">
                          Expired
                        </span>
                      )}

                      {/* Discount Badge */}
                      <span className="px-2.5 py-0.5 rounded-lg bg-wbk-green/10 text-wbk-green text-xs font-bold border border-wbk-green/20">
                        {camp.discount_type === "percentage"
                          ? `${camp.discount_value}% OFF`
                          : `£${camp.discount_value} OFF`}
                      </span>

                      {/* Scope Badge */}
                      <span className="text-[11px] font-medium text-gray-500">
                        {camp.apply_to === "all"
                          ? "All Products"
                          : camp.apply_to === "categories"
                            ? `Categories: ${(camp.target_categories || []).join(", ") || "none specified"}`
                            : `${camp.target_products?.length || 0} specific products`}
                      </span>

                      {camp.allow_stacking && (
                        <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded">
                          Stackable
                        </span>
                      )}
                    </div>

                    {/* Campaign Title & Slug */}
                    <div>
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-wbk-green transition-colors flex items-center gap-2">
                        <span>{camp.name}</span>
                        <span className="text-xs font-normal text-gray-400 font-mono">
                          ({camp.slug || camp.id})
                        </span>
                      </h3>
                    </div>

                    {/* Schedule Snippet */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <IconCalendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          {camp.start_date ? new Date(camp.start_date).toLocaleDateString() : "Immediate"}
                          {" — "}
                          {camp.end_date ? new Date(camp.end_date).toLocaleDateString() : "Ongoing"}
                        </span>
                      </div>

                      {camp.schedule_type === "recurring" && camp.recurring && (
                        <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          <IconClock className="w-3.5 h-3.5" />
                          <span>
                            Recurring: {camp.recurring.days_of_week?.length || 0} days/week ({camp.recurring.start_time || "00:00"}-{camp.recurring.end_time || "23:59"})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Visual Creatives & Actions */}
                  <div className="flex flex-wrap items-center gap-4 lg:justify-end">
                    {/* Visual Creatives indicator pills */}
                    <div className="flex items-center gap-2">
                      {camp.top_bar?.enabled && (
                        <div
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-gray-200 bg-gray-50 text-[11px] text-gray-700"
                          title={`Top bar: "${camp.top_bar.text}"`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/20"
                            style={{ backgroundColor: camp.top_bar.bg_color || "#2D5A27" }}
                          />
                          <IconSpeakerphone className="w-3.5 h-3.5 text-gray-500" />
                          <span>Top Bar</span>
                        </div>
                      )}

                      {camp.hero_banner?.enabled && (
                        <div
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-gray-200 bg-gray-50 text-[11px] text-gray-700"
                          title={`Hero Banner: "${camp.hero_banner.headline}"`}
                        >
                          <IconPhoto className="w-3.5 h-3.5 text-gray-500" />
                          <span>Hero Banner</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div
                      className="flex items-center gap-1 border-l border-gray-200 pl-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleDuplicate(camp)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Duplicate"
                      >
                        <IconCopy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(camp)}
                        className="p-1.5 text-gray-400 hover:text-wbk-green hover:bg-wbk-green/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <IconEdit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete campaign "${camp.name}"?`)) {
                            handleDelete(camp.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit / Create Modal Popup */}
      <PromotionalCampaignModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaign={selectedCampaign}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
