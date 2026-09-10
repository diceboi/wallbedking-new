"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconArrowLeft,
  IconCopy,
  IconCheck,
  IconDownload,
  IconExternalLink,
  IconSearch,
  IconEdit,
  IconRefresh,
  IconEye,
  IconPackage,
  IconCloudUpload,
  IconAlertCircle,
  IconInfoCircle,
  IconSettings,
  IconSend,
  IconBolt,
} from "@tabler/icons-react";
import { FeedItemEditDrawer } from "@/components/admin/FeedItemEditDrawer";

export default function AdminFeedDetailPage() {
  const params = useParams();
  const router = useRouter();
  const feedId = params?.feedId || "amazon-fr-classic";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'parent' | 'child'
  const [selectedItem, setSelectedItem] = useState(null);
  const [copiedFormat, setCopiedFormat] = useState(null);
  const [message, setMessage] = useState(null);
  const [baseUrl, setBaseUrl] = useState("");

  // Amazon SP-API sync states
  const [spApiConfig, setSpApiConfig] = useState(null);
  const [syncingAmazon, setSyncingAmazon] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
    fetchFeedItems();
    fetchSpApiConfig();
  }, [feedId]);

  const fetchSpApiConfig = async () => {
    try {
      const res = await fetch(`/api/admin/feeds/${feedId}/sync-amazon`);
      const data = await res.json();
      if (data.success && data.config) {
        setSpApiConfig(data.config);
      }
    } catch (e) {
      console.error("Failed to load SP-API config", e);
    }
  };

  const handleSyncToAmazon = async () => {
    setSyncingAmazon(true);
    try {
      const res = await fetch(`/api/admin/feeds/${feedId}/sync-amazon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketplace: "FR" }),
      });
      const data = await res.json();
      setSyncResult(data);
    } catch (err) {
      setSyncResult({
        success: false,
        error: err.message || "Failed to trigger Amazon SP-API sync.",
      });
    } finally {
      setSyncingAmazon(false);
    }
  };

  const fetchFeedItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/feeds/${feedId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setItems(data.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (format) => {
    const url = `${baseUrl}/api/feeds/${feedId}?format=${format}`;
    navigator.clipboard.writeText(url);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  const handleSaveSuccess = (updatedItem) => {
    setItems((prev) =>
      prev.map((it) => (it.item_sku === updatedItem.item_sku ? { ...it, ...updatedItem } : it))
    );
    setMessage({
      type: "success",
      text: `Item "${updatedItem.item_sku}" saved successfully! Live feed is updated.`,
    });
    setTimeout(() => setMessage(null), 3500);
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filterType !== "all" && item.parent_child !== filterType) {
        return false;
      }
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        (item.item_sku && item.item_sku.toLowerCase().includes(q)) ||
        (item.external_product_id && item.external_product_id.toLowerCase().includes(q)) ||
        (item.item_name && item.item_name.toLowerCase().includes(q)) ||
        (item.parent_sku && item.parent_sku.toLowerCase().includes(q)) ||
        (item.size_name && item.size_name.toLowerCase().includes(q))
      );
    });
  }, [items, search, filterType]);

  const parentCount = items.filter((p) => p.parent_child === "parent").length;
  const childCount = items.filter((p) => p.parent_child === "child").length;

  return (
    <div className="space-y-8 font-poppins">
      {/* Top Navigation & Breadcrumbs */}
      <div>
        <Link
          href="/admin/feeds"
          className="inline-flex items-center gap-1.5 text-xs text-wbk-brown hover:text-wbk-black transition-colors mb-3"
        >
          <IconArrowLeft size={14} />
          <span>Back to All Feeds</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-wbk-lightgrey/60 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">🇫🇷</span>
              <span className="text-xs uppercase tracking-widest text-wbk-gold font-semibold">
                Amazon France Syndication
              </span>
            </div>
            <h1 className="font-new-york text-2xl sm:text-3xl text-wbk-black tracking-tight font-medium">
              Morphy Classic Bedframes Feed
            </h1>
            <p className="text-xs text-wbk-brown mt-1">
              Official Flat File inventory feed for Amazon.fr with automated French listing content.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchFeedItems}
            className="inline-flex items-center gap-2 px-3 py-2 border border-wbk-lightgrey bg-white text-xs text-wbk-black hover:bg-[#FBF9F8] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <IconRefresh size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Status banner */}
      {message && (
        <div className="p-3 text-xs font-medium bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <IconCheck size={16} />
          <span>{message.text}</span>
        </div>
      )}

      {/* Live Feed Link Card */}
      <div className="bg-white p-6 border border-wbk-lightgrey/70 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-wbk-black">
              Official Live Feed URL (TSV / Tab-Separated)
            </span>
          </div>
          <span className="text-[11px] text-wbk-brown">
            Feed ID: <code className="font-mono">{feedId}</code>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <input
            type="text"
            readOnly
            value={`${baseUrl}/api/feeds/${feedId}?format=tsv`}
            className="flex-1 p-2.5 text-xs font-mono bg-[#FBF9F8] border border-wbk-lightgrey text-wbk-black select-all focus:outline-none"
          />
          <button
            type="button"
            onClick={() => handleCopy("tsv")}
            className="px-4 py-2.5 bg-wbk-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-wbk-gold hover:text-wbk-black transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            {copiedFormat === "tsv" ? (
              <>
                <IconCheck size={15} className="text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <IconCopy size={15} />
                <span>Copy Feed URL</span>
              </>
            )}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-wbk-brown border-t border-wbk-lightgrey/40">
          <div className="flex items-center gap-3">
            <span>Direct Downloads:</span>
            <a
              href={`/api/feeds/${feedId}?format=tsv&download=1`}
              className="underline hover:text-wbk-black font-medium flex items-center gap-1"
            >
              <IconDownload size={13} />
              <span>TSV File (Amazon format)</span>
            </a>
            <span>&bull;</span>
            <a
              href={`/api/feeds/${feedId}?format=csv&download=1`}
              className="underline hover:text-wbk-black font-medium flex items-center gap-1"
            >
              <IconDownload size={13} />
              <span>CSV File (Excel)</span>
            </a>
          </div>

          <a
            href={`/api/feeds/${feedId}?format=tsv`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-wbk-brown hover:text-wbk-black underline flex items-center gap-1"
          >
            <span>Preview Raw TSV in Browser</span>
            <IconExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Amazon SP-API Automation Card */}
      <div className="bg-white p-6 border border-wbk-lightgrey/70 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#FF9900]/10 text-[#FF9900] rounded-sm font-black text-xs">
                a
              </span>
              <h3 className="font-new-york text-base font-semibold text-wbk-black">
                Amazon Selling Partner API (SP-API) Automation
              </h3>
              {spApiConfig?.isConfigured ? (
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  Live API Connected
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-800">
                  Simulation & Preparation Ready
                </span>
              )}
            </div>
            <p className="text-xs text-wbk-brown">
              Direct integration via Amazon Feeds API 2021-06-30. Uploads and updates French listings in Amazon Seller Central automatically.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-1 px-3 py-2 border border-wbk-lightgrey text-xs text-wbk-brown hover:text-wbk-black bg-[#FBF9F8] transition-colors"
            >
              <IconSettings size={14} />
              <span>API Settings</span>
            </Link>
            <button
              type="button"
              onClick={handleSyncToAmazon}
              disabled={syncingAmazon}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF9900] text-black font-semibold text-xs uppercase tracking-wider hover:bg-[#e68a00] transition-colors cursor-pointer disabled:opacity-60 shadow-xs"
            >
              {syncingAmazon ? (
                <>
                  <IconRefresh size={14} className="animate-spin" />
                  <span>Submitting to Amazon...</span>
                </>
              ) : (
                <>
                  <IconCloudUpload size={14} />
                  <span>Sync to Amazon (SP-API)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* SP-API Configuration summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 bg-[#FBF9F8] border border-wbk-lightgrey/50">
            <span className="text-[11px] text-wbk-brown block uppercase tracking-wider font-medium">
              Target Marketplace
            </span>
            <span className="font-semibold text-wbk-black mt-0.5 flex items-center gap-1.5">
              <span>🇫🇷 France</span>
              <code className="text-[10px] text-wbk-brown font-mono">A13V1IB3VIYZZH</code>
            </span>
          </div>

          <div className="p-3 bg-[#FBF9F8] border border-wbk-lightgrey/50">
            <span className="text-[11px] text-wbk-brown block uppercase tracking-wider font-medium">
              Feed Document Type
            </span>
            <span className="font-mono text-xs text-wbk-black mt-0.5 block truncate">
              POST_FLAT_FILE_LISTINGS_DATA
            </span>
          </div>

          <div className="p-3 bg-[#FBF9F8] border border-wbk-lightgrey/50">
            <span className="text-[11px] text-wbk-brown block uppercase tracking-wider font-medium">
              Status & Mode
            </span>
            <span className="text-xs font-medium text-wbk-black mt-0.5 block">
              {spApiConfig?.isConfigured
                ? "Live (Submits to Amazon S3 & Seller Central)"
                : "Simulation (Ready — waiting for developer keys)"}
            </span>
          </div>
        </div>

        {/* Sync Result Details Banner */}
        {syncResult && (
          <div
            className={`p-4 text-xs border space-y-2 animate-in fade-in ${
              syncResult.success
                ? syncResult.mode === "live"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                  : "bg-amber-50 border-amber-300 text-amber-950"
                : "bg-red-50 border-red-300 text-red-950"
            }`}
          >
            <div className="flex items-center justify-between font-semibold">
              <div className="flex items-center gap-2">
                {syncResult.success ? (
                  <IconCheck size={16} className="text-emerald-700" />
                ) : (
                  <IconAlertCircle size={16} className="text-red-700" />
                )}
                <span>
                  {syncResult.mode === "simulation"
                    ? "Simulation Execution Successful"
                    : syncResult.success
                    ? "Feed Submitted to Amazon SP-API"
                    : "Amazon SP-API Error"}
                </span>
              </div>
              <span className="font-mono text-[11px] px-2 py-0.5 bg-white/70 border border-black/10">
                Status: {syncResult.status}
              </span>
            </div>

            <p className="text-xs">{syncResult.message || syncResult.error}</p>

            <div className="flex flex-wrap items-center gap-4 text-[11px] pt-1 border-t border-black/10 font-mono">
              {syncResult.amazonFeedId && (
                <span>
                  <strong>Feed ID:</strong> {syncResult.amazonFeedId}
                </span>
              )}
              {syncResult.itemCount != null && (
                <span>
                  <strong>Listings:</strong> {syncResult.itemCount} items
                </span>
              )}
              {syncResult.submittedAt && (
                <span>
                  <strong>Timestamp:</strong> {new Date(syncResult.submittedAt).toLocaleTimeString()}
                </span>
              )}
            </div>

            {syncResult.mode === "simulation" && syncResult.missingCredentials && (
              <div className="mt-2 p-2.5 bg-white/80 border border-amber-200 text-amber-900 rounded-none space-y-1">
                <span className="font-semibold block">
                  Keys required to enable Live Submissions:
                </span>
                <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                  {syncResult.missingCredentials.map((key) => (
                    <span key={key} className="px-1.5 py-0.5 bg-amber-100 border border-amber-300">
                      {key}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-amber-800 mt-1">
                  Once you add these keys to <code className="font-bold">.env.local</code>, this button will immediately transmit directly to Amazon Seller Central.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 border border-wbk-lightgrey/60 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-wbk-brown font-medium shrink-0">Type:</span>
          <div className="inline-flex rounded-none border border-wbk-lightgrey overflow-hidden">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                filterType === "all" ? "bg-wbk-black text-white font-medium" : "bg-white text-wbk-brown hover:text-wbk-black"
              }`}
            >
              All ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("parent")}
              className={`px-3 py-1.5 text-xs transition-colors cursor-pointer border-l border-wbk-lightgrey ${
                filterType === "parent" ? "bg-wbk-black text-white font-medium" : "bg-white text-wbk-brown hover:text-wbk-black"
              }`}
            >
              Parents ({parentCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("child")}
              className={`px-3 py-1.5 text-xs transition-colors cursor-pointer border-l border-wbk-lightgrey ${
                filterType === "child" ? "bg-wbk-black text-white font-medium" : "bg-white text-wbk-brown hover:text-wbk-black"
              }`}
            >
              Children ({childCount})
            </button>
          </div>
        </div>

        <div className="relative w-full sm:w-80">
          <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-wbk-brown" />
          <input
            type="text"
            placeholder="Search by SKU, EAN, size, or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black"
          />
        </div>
      </div>

      {/* Feed Items Table */}
      <div className="bg-white border border-wbk-lightgrey/60 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-poppins">
          <thead>
            <tr className="bg-[#F4F2F0] border-b border-wbk-lightgrey text-wbk-black uppercase tracking-wider text-[10px] font-semibold select-none">
              <th className="py-3 px-3 w-14">Img</th>
              <th className="py-3 px-3">Item SKU</th>
              <th className="py-3 px-3">Barcode (EAN)</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-4 min-w-[280px]">Product Title (French) & Size</th>
              <th className="py-3 px-3">Parent SKU</th>
              <th className="py-3 px-3">Price</th>
              <th className="py-3 px-3 text-center">Stock</th>
              <th className="py-3 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wbk-lightgrey/40">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-wbk-brown">
                  <IconRefresh size={20} className="animate-spin mx-auto mb-2" />
                  Loading feed items...
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-wbk-brown">
                  No feed items found matching your filters.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isParent = item.parent_child === "parent";
                const img = item.main_image_url || "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp";

                return (
                  <tr
                    key={item.item_sku}
                    className={`hover:bg-[#FBF9F8] transition-colors ${
                      isParent ? "bg-[#FDFCFB]" : ""
                    }`}
                  >
                    {/* Thumbnail */}
                    <td className="py-2.5 px-3">
                      <div className="w-10 h-10 relative bg-[#F4F2F0] border border-wbk-lightgrey/50 overflow-hidden shrink-0">
                        <img
                          src={img}
                          alt={item.item_sku}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-2.5 px-3 font-mono font-semibold text-wbk-black">
                      {item.item_sku}
                    </td>

                    {/* EAN */}
                    <td className="py-2.5 px-3 font-mono text-wbk-brown">
                      {item.external_product_id || (
                        <span className="text-[11px] text-wbk-brown/40 italic">Parent / None</span>
                      )}
                    </td>

                    {/* Parent / Child */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-none ${
                          isParent
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-50 text-blue-800"
                        }`}
                      >
                        {item.parent_child || "child"}
                      </span>
                    </td>

                    {/* Title & Size */}
                    <td className="py-2.5 px-4">
                      <div className="font-medium text-wbk-black line-clamp-1 max-w-md">
                        {item.item_name}
                      </div>
                      <div className="text-[11px] text-wbk-brown mt-0.5 flex items-center gap-1.5">
                        <span className="font-medium text-wbk-black">{item.size_name || "Standard"}</span>
                        {item.variation_theme && (
                          <span>&bull; Theme: {item.variation_theme}</span>
                        )}
                      </div>
                    </td>

                    {/* Parent SKU */}
                    <td className="py-2.5 px-3 font-mono text-[11px] text-wbk-brown">
                      {item.parent_sku || "—"}
                    </td>

                    {/* Price */}
                    <td className="py-2.5 px-3 font-semibold text-wbk-black">
                      {item.standard_price != null ? (
                        <span>€{Number(item.standard_price).toFixed(2)}</span>
                      ) : (
                        <span className="text-[11px] text-wbk-brown/50">—</span>
                      )}
                    </td>

                    {/* Quantity */}
                    <td className="py-2.5 px-3 text-center">
                      {item.quantity != null ? (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-800">
                          {item.quantity} in stock
                        </span>
                      ) : (
                        <span className="text-[11px] text-wbk-brown/50">—</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs border border-wbk-lightgrey bg-white hover:bg-wbk-black hover:text-white transition-colors cursor-pointer"
                        title="Edit French Title, Bullets, Prices, EAN, or Images"
                      >
                        <IconEdit size={13} />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Drawer */}
      <FeedItemEditDrawer
        feedId={feedId}
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
}
