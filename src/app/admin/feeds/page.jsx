"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconBuildingStore,
  IconDownload,
  IconCopy,
  IconCheck,
  IconExternalLink,
  IconRefresh,
  IconArrowRight,
  IconPlus,
} from "@tabler/icons-react";
import { FlagIcon } from "@/components/ui/FlagIcon";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminFeedsPage() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
    fetchFeeds();
  }, []);

  const fetchFeeds = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/feeds");
      const data = await res.json();
      if (data.success && Array.isArray(data.feeds)) {
        setFeeds(data.feeds);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = (feedId, format = "tsv") => {
    const fullUrl = `${baseUrl}/api/feeds/${feedId}?format=${format}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(`${feedId}_${format}`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const totalItems = feeds.reduce((sum, f) => sum + (f.itemCount || 0), 0);
  const activeFeeds = feeds.filter((f) => f.status === "Active").length;

  return (
    <div className="space-y-8 font-poppins">
      {/* Page Header */}
      <AdminPageHeader
        badge="Syndication & Export"
        title="Marketplace Product Feeds"
        count={feeds.length}
        description="Automated live catalog feeds for Amazon, OTTO, Mirakl, and external sales channels."
        actions={
          <button
            type="button"
            onClick={fetchFeeds}
            disabled={loading}
            className="p-2.5 bg-white border border-wbk-lightgrey hover:border-wbk-black text-wbk-black rounded-full transition-colors cursor-pointer shadow-2xs"
            title="Refresh feeds status"
          >
            <IconRefresh size={16} className={loading ? "animate-spin" : ""} />
          </button>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 border border-wbk-lightgrey/50 shadow-xs">
          <div className="text-xs text-wbk-brown font-medium">Active Feeds</div>
          <div className="text-2xl font-bold font-poppins text-wbk-black mt-1">
            {activeFeeds} <span className="text-xs text-wbk-brown font-normal font-poppins">of {feeds.length} channels</span>
          </div>
        </div>

        <div className="bg-white p-5 border border-wbk-lightgrey/50 shadow-xs">
          <div className="text-xs text-wbk-brown font-medium">Syndicated Products</div>
          <div className="text-2xl font-bold font-poppins text-wbk-black mt-1">
            {totalItems} <span className="text-xs text-wbk-brown font-normal font-poppins">SKUs managed</span>
          </div>
        </div>

        <div className="bg-white p-5 border border-wbk-lightgrey/50 shadow-xs">
          <div className="text-xs text-wbk-brown font-medium">Feed Protocol</div>
          <div className="text-xs font-mono font-semibold text-wbk-black mt-2">
            Live HTTP TSV / CSV / JSON
          </div>
        </div>
      </div>

      {/* Feeds Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-poppins text-sm font-semibold uppercase tracking-wider text-wbk-black">
            Available Feed Integrations
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {feeds.map((feed) => {
            const isLive = feed.status === "Active";
            const fullFeedUrl = `${baseUrl}${feed.feedUrl}?format=tsv`;

            return (
              <div
                key={feed.id}
                className="bg-white border border-wbk-lightgrey/70 shadow-xs p-6 flex flex-col justify-between hover:border-wbk-black transition-colors"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">
                        {feed.flag === "fr" ? "🇫🇷" : feed.flag === "de" ? "🇩🇪" : "🌐"}
                      </span>
                      <div>
                        <h3 className="font-poppins text-base text-wbk-black font-semibold">
                          {feed.name}
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] text-wbk-brown">
                          <span>Marketplace: <strong>{feed.marketplace}</strong></span>
                          <span>&bull;</span>
                          <span>Country: {feed.country}</span>
                          <span>&bull;</span>
                          <span>Currency: {feed.currency}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-full ${
                        isLive
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {feed.status}
                    </span>
                  </div>

                  <p className="text-xs text-wbk-brown/90 mt-2 mb-4">
                    Target Category: <strong className="text-wbk-black font-mono">{feed.targetCategory}</strong>.
                    {feed.itemCount > 0 ? (
                      <span> Contains <strong>{feed.itemCount}</strong> items ({feed.parentCount} Parent containers + {feed.childCount} Child variations).</span>
                    ) : (
                      <span> Channel configured for future product mapping.</span>
                    )}
                  </p>

                  {/* Live Feed URL Box */}
                  {isLive && (
                    <div className="bg-[#F4F2F0]/70 p-4 border border-wbk-lightgrey/60 space-y-2 mb-5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] uppercase tracking-wider font-semibold text-wbk-brown">
                          Live Amazon Flat File Feed URL (TSV / Tab-Separated)
                        </label>
                        <span className="text-[10px] text-wbk-green font-medium">
                          Auto-synchronized
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={fullFeedUrl}
                          className="flex-1 p-2 text-xs font-mono bg-white border border-wbk-lightgrey rounded-none text-wbk-black select-all focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(feed.id, "tsv")}
                          className="px-3 py-2 bg-wbk-black text-white text-xs font-medium hover:bg-wbk-gold hover:text-wbk-black transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                          title="Copy Feed URL to clipboard"
                        >
                          {copiedId === `${feed.id}_tsv` ? (
                            <>
                              <IconCheck size={14} className="text-emerald-400" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <IconCopy size={14} />
                              <span>Copy URL</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-wbk-brown">
                        <span>Direct download format:</span>
                        <a
                          href={`/api/feeds/${feed.id}?format=tsv&download=1`}
                          className="underline hover:text-wbk-black flex items-center gap-1"
                        >
                          <IconDownload size={13} />
                          <span>TSV (Amazon)</span>
                        </a>
                        <span>|</span>
                        <a
                          href={`/api/feeds/${feed.id}?format=csv&download=1`}
                          className="underline hover:text-wbk-black flex items-center gap-1"
                        >
                          <IconDownload size={13} />
                          <span>CSV (Excel)</span>
                        </a>
                        <span>|</span>
                        <a
                          href={`/api/feeds/${feed.id}?format=json`}
                          target="_blank"
                          rel="noreferrer"
                          className="underline hover:text-wbk-black flex items-center gap-1"
                        >
                          <IconExternalLink size={13} />
                          <span>JSON View</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between pt-3 border-t border-wbk-lightgrey/40 mt-2">
                  <span className="text-[11px] text-wbk-brown">
                    Template source: <code className="font-mono text-[10px]">{feed.templateFile || "Custom mapping"}</code>
                  </span>

                  <Link
                    href={`/admin/feeds/${feed.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-wbk-black text-white text-xs font-medium uppercase tracking-wider hover:bg-wbk-gold hover:text-wbk-black transition-colors"
                  >
                    <span>Manage Products in Feed</span>
                    <IconArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
