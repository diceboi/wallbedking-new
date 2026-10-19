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
  IconBrandGoogle,
  IconInfoCircle,
  IconWorld,
  IconChecklist,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { GOOGLE_FEED_COUNTRIES } from "@/lib/google-feed-constants";

export default function AdminFeedsPage() {
  const [activeTab, setActiveTab] = useState("google"); // "google" | "marketplaces"
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [baseUrl, setBaseUrl] = useState("");
  const [showSetupGuide, setShowSetupGuide] = useState(true);

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

  const handleCopyText = (text, idKey) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idKey);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const totalMarketplaceItems = feeds.reduce((sum, f) => sum + (f.itemCount || 0), 0);
  const activeMarketplaceFeeds = feeds.filter((f) => f.status === "Active").length;
  const googleCountries = Object.values(GOOGLE_FEED_COUNTRIES);

  return (
    <div className="space-y-8 font-poppins">
      {/* Page Header */}
      <AdminPageHeader
        badge="Product Feeds & Syndication"
        title="Termékfeedek & Exportálás"
        count={googleCountries.length + feeds.length}
        description="Automatizált, élő termékfeedek a Google Merchant Centerhez (Shopping), valamint Amazon és Mirakl piacterekhez."
        actions={
          <button
            type="button"
            onClick={fetchFeeds}
            disabled={loading}
            className="p-2.5 bg-white border border-wbk-lightgrey hover:border-wbk-black text-wbk-black rounded-full transition-colors cursor-pointer shadow-2xs"
            title="Frissítés"
          >
            <IconRefresh size={16} className={loading ? "animate-spin" : ""} />
          </button>
        }
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-wbk-lightgrey/60 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab("google")}
          className={`flex items-center gap-2 pb-3 px-1 text-sm font-semibold transition-colors relative cursor-pointer ${
            activeTab === "google"
              ? "text-wbk-black border-b-2 border-wbk-black"
              : "text-wbk-brown hover:text-wbk-black"
          }`}
        >
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 text-blue-600">
            <IconBrandGoogle size={14} />
          </span>
          <span>Google Merchant Center (Shopping)</span>
          <span className="px-2 py-0.5 text-[11px] font-mono font-medium bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
            {googleCountries.length} ország
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("marketplaces")}
          className={`flex items-center gap-2 pb-3 px-1 text-sm font-semibold transition-colors relative cursor-pointer ${
            activeTab === "marketplaces"
              ? "text-wbk-black border-b-2 border-wbk-black"
              : "text-wbk-brown hover:text-wbk-black"
          }`}
        >
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-50 text-orange-600">
            <IconBuildingStore size={14} />
          </span>
          <span>Amazon & Piacterek</span>
          <span className="px-2 py-0.5 text-[11px] font-mono font-medium bg-gray-100 text-gray-700 rounded-full border border-gray-200">
            {feeds.length} csatorna
          </span>
        </button>
      </div>

      {/* TAB 1: GOOGLE MERCHANT CENTER FEEDS */}
      {activeTab === "google" && (
        <div className="space-y-8">
          {/* Highlight Banner / Info */}
          <div className="bg-white border border-wbk-lightgrey/70 shadow-xs p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <IconBrandGoogle size={22} />
                </span>
                <div>
                  <h3 className="font-poppins text-base font-semibold text-wbk-black">
                    Google Merchant Center Élő Termékfeedek
                  </h3>
                  <p className="text-xs text-wbk-brown">
                    Valós idejű, országonként elkülönített termékfeedek közvetlen Google Shopping integrációhoz.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Élő & Automatikusan Frissülő
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-mono font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  XML (RSS 2.0) & TSV
                </span>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-wbk-lightgrey/40 text-xs">
              <div className="flex items-start gap-2 text-wbk-brown">
                <IconCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-wbk-black block">Automatikus szinkronizáció</strong>
                  Amikor az adminban vagy adatbázisban változik egy termék, a feed a Google következő lekérésekor automatikusan a friss adatokat szolgáltatja.
                </div>
              </div>

              <div className="flex items-start gap-2 text-wbk-brown">
                <IconCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-wbk-black block">Nem publikus termékek kizárása</strong>
                  A rejtett (<code className="font-mono text-[10px]">hidden</code>), piszkozat vagy archivált termékeket a rendszer automatikusan kihagyja.
                </div>
              </div>

              <div className="flex items-start gap-2 text-wbk-brown">
                <IconCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-wbk-black block">10 Kötelező mező + Akciók</strong>
                  <code className="font-mono text-[10px]">id, title, description, link, image_link, availability, price, condition, brand, gtin</code> (valamint akciós ár és kategóriák).
                </div>
              </div>
            </div>

            {/* Toggleable Setup Guide */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowSetupGuide(!showSetupGuide)}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 cursor-pointer"
              >
                <IconInfoCircle size={15} />
                <span>Hogyan kell beállítani a Google Merchant Centerben?</span>
                {showSetupGuide ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
              </button>

              {showSetupGuide && (
                <div className="mt-3 bg-[#F8F9FA] border border-blue-100 p-4 rounded-none space-y-2 text-xs text-wbk-brown">
                  <div className="font-semibold text-wbk-black">
                    Beállítási lépések a Google Merchant Centerben (Ütemezett lekérés):
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                    <li>
                      Lépj be a Google Merchant Center fiókodba:{" "}
                      <a
                        href="https://merchants.google.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline font-medium"
                      >
                        merchants.google.com
                      </a>
                    </li>
                    <li>
                      A bal menüben válaszd: <strong>Termékek (Products) &gt; Termékcsatornák (Feeds)</strong>, majd kattints az <strong>Elsődleges csatorna hozzáadása (+)</strong> gombra.
                    </li>
                    <li>
                      Válaszd ki a <strong>Célországot</strong> és a <strong>Nyelvet</strong> (pl. <em>Egyesült Királyság – Angol</em> vagy <em>Németország – Német</em>).
                    </li>
                    <li>
                      A feltöltési módnál válaszd az <strong>Ütemezett lekérés (Scheduled fetch)</strong> opciót.
                    </li>
                    <li>
                      Másold ki az adott országhoz tartozó <strong>Feed URL</strong>-t alább, és illeszd be a <em>„Fájl URL-je”</em> mezőbe.
                    </li>
                    <li>
                      Állítsd be a lekérés gyakoriságát (pl. <strong>Naponta 02:00</strong>). Kész! A Google innentől magától letölti és frissíti a katalógust.
                    </li>
                  </ol>
                </div>
              )}
            </div>
          </div>

          {/* Country Feeds List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-poppins text-sm font-semibold uppercase tracking-wider text-wbk-black">
                Országonkénti Google Merchant Feedek ({googleCountries.length} ország)
              </h2>
              <span className="text-xs text-wbk-brown">
                Kattints a „URL Másolása” gombra az Ütemezett lekéréshez
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {googleCountries.map((country) => {
                const xmlUrl = `${baseUrl}/api/feeds/google/${country.code}`;
                const tsvUrl = `${baseUrl}/api/feeds/google/${country.code}?format=tsv`;
                const directXmlUrl = `/api/feeds/google/${country.code}`;
                const directTsvUrl = `/api/feeds/google/${country.code}?format=tsv&download=1`;

                return (
                  <div
                    key={country.code}
                    className="bg-white border border-wbk-lightgrey/70 shadow-xs p-5 flex flex-col justify-between hover:border-wbk-black transition-colors"
                  >
                    <div>
                      {/* Top Row: Country Info & Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl leading-none">{country.flag}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-poppins text-base font-semibold text-wbk-black">
                                {country.nameHu} ({country.name})
                              </h3>
                              <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 bg-gray-100 text-wbk-black border border-gray-200">
                                {country.countryCode}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-wbk-brown mt-0.5">
                              <span>Nyelv / Nyelvterület: <strong>{country.targetLanguage.toUpperCase()} ({country.locale})</strong></span>
                              <span>&bull;</span>
                              <span>Pénznem: <strong>{country.currency} ({country.currencySymbol})</strong></span>
                              <span>&bull;</span>
                              <span>Szállítási jegyzet: {country.defaultShippingNote}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Aktív & Élő
                          </span>
                        </div>
                      </div>

                      {/* Primary Feed URL Box (XML) */}
                      <div className="bg-[#F8F9FA] p-3.5 border border-wbk-lightgrey/60 space-y-2 mb-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] uppercase tracking-wider font-semibold text-wbk-black">
                            Google Merchant Center Feed URL (XML / RSS 2.0 – Ajánlott)
                          </label>
                          <span className="text-[10px] text-emerald-700 font-medium">
                            Automatikus szinkronizáció
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={xmlUrl}
                            className="flex-1 p-2 text-xs font-mono bg-white border border-wbk-lightgrey rounded-none text-wbk-black select-all focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleCopyText(xmlUrl, `xml_${country.code}`)}
                            className="px-3 py-2 bg-wbk-black text-white text-xs font-medium hover:bg-wbk-gold hover:text-wbk-black transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                            title="Feed URL másolása"
                          >
                            {copiedId === `xml_${country.code}` ? (
                              <>
                                <IconCheck size={14} className="text-emerald-400" />
                                <span>Másolva!</span>
                              </>
                            ) : (
                              <>
                                <IconCopy size={14} />
                                <span>URL Másolása</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Secondary TSV Format URL */}
                      <div className="bg-[#FAF8F5] p-3 border border-wbk-lightgrey/40 space-y-1.5 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-wbk-brown">
                            Alternatív TSV (Tabulátorral tagolt szöveg / .txt) formátum
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={tsvUrl}
                            className="flex-1 p-1.5 text-[11px] font-mono bg-white border border-wbk-lightgrey rounded-none text-wbk-black select-all focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleCopyText(tsvUrl, `tsv_${country.code}`)}
                            className="px-2.5 py-1.5 bg-white border border-wbk-lightgrey hover:border-wbk-black text-wbk-black text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                            title="TSV URL másolása"
                          >
                            {copiedId === `tsv_${country.code}` ? (
                              <>
                                <IconCheck size={13} className="text-emerald-600" />
                                <span>Másolva!</span>
                              </>
                            ) : (
                              <>
                                <IconCopy size={13} />
                                <span>TSV URL Másolása</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions: Test in browser & Direct Downloads */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-wbk-lightgrey/40 text-xs">
                      <div className="flex items-center gap-3 text-wbk-brown">
                        <span>Tesztelés & Letöltés:</span>
                        <a
                          href={directXmlUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium underline hover:text-wbk-black flex items-center gap-1 text-blue-700"
                        >
                          <IconExternalLink size={13} />
                          <span>Megnyitás böngészőben (XML)</span>
                        </a>
                        <span>|</span>
                        <a
                          href={`${directXmlUrl}?download=1`}
                          className="underline hover:text-wbk-black flex items-center gap-1"
                        >
                          <IconDownload size={13} />
                          <span>XML fájl letöltése</span>
                        </a>
                        <span>|</span>
                        <a
                          href={directTsvUrl}
                          className="underline hover:text-wbk-black flex items-center gap-1"
                        >
                          <IconDownload size={13} />
                          <span>TSV fájl letöltése</span>
                        </a>
                      </div>

                      <div className="text-[11px] text-wbk-brown font-mono">
                        Route: <code className="text-wbk-black">/api/feeds/google/{country.code}</code>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AMAZON & MARKETPLACE FEEDS */}
      {activeTab === "marketplaces" && (
        <div className="space-y-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 border border-wbk-lightgrey/50 shadow-xs">
              <div className="text-xs text-wbk-brown font-medium">Aktív Piactér Feedek</div>
              <div className="text-2xl font-bold font-poppins text-wbk-black mt-1">
                {activeMarketplaceFeeds} <span className="text-xs text-wbk-brown font-normal font-poppins">/ {feeds.length} csatorna</span>
              </div>
            </div>

            <div className="bg-white p-5 border border-wbk-lightgrey/50 shadow-xs">
              <div className="text-xs text-wbk-brown font-medium">Szindikált Termékek</div>
              <div className="text-2xl font-bold font-poppins text-wbk-black mt-1">
                {totalMarketplaceItems} <span className="text-xs text-wbk-brown font-normal font-poppins">kezelt SKU</span>
              </div>
            </div>

            <div className="bg-white p-5 border border-wbk-lightgrey/50 shadow-xs">
              <div className="text-xs text-wbk-brown font-medium">Piactér Protokoll</div>
              <div className="text-xs font-mono font-semibold text-wbk-black mt-2">
                Live HTTP TSV / CSV / JSON
              </div>
            </div>
          </div>

          {/* Feeds Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-poppins text-sm font-semibold uppercase tracking-wider text-wbk-black">
                Elérhető Piactér Integrációk
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
                              <span>Piactér: <strong>{feed.marketplace}</strong></span>
                              <span>&bull;</span>
                              <span>Ország: {feed.country}</span>
                              <span>&bull;</span>
                              <span>Pénznem: {feed.currency}</span>
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
                        Célkategória: <strong className="text-wbk-black font-mono">{feed.targetCategory}</strong>.
                        {feed.itemCount > 0 ? (
                          <span> Tartalma: <strong>{feed.itemCount}</strong> elem ({feed.parentCount} Fő termék + {feed.childCount} variáció).</span>
                        ) : (
                          <span> Csatorna készen áll a jövőbeli termékleképezésre.</span>
                        )}
                      </p>

                      {/* Live Feed URL Box */}
                      {isLive && (
                        <div className="bg-[#F4F2F0]/70 p-4 border border-wbk-lightgrey/60 space-y-2 mb-5">
                          <div className="flex items-center justify-between">
                            <label className="block text-[10px] uppercase tracking-wider font-semibold text-wbk-brown">
                              Élő Amazon Flat File Feed URL (TSV / Tab-Separated)
                            </label>
                            <span className="text-[10px] text-wbk-green font-medium">
                              Automatikus szinkronizáció
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
                              onClick={() => {
                                navigator.clipboard.writeText(fullFeedUrl);
                                setCopiedId(`${feed.id}_tsv`);
                                setTimeout(() => setCopiedId(null), 2500);
                              }}
                              className="px-3 py-2 bg-wbk-black text-white text-xs font-medium hover:bg-wbk-gold hover:text-wbk-black transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                              title="Feed URL másolása"
                            >
                              {copiedId === `${feed.id}_tsv` ? (
                                <>
                                  <IconCheck size={14} className="text-emerald-400" />
                                  <span>Másolva!</span>
                                </>
                              ) : (
                                <>
                                  <IconCopy size={14} />
                                  <span>URL Másolása</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="flex items-center gap-3 pt-1 text-[11px] text-wbk-brown">
                            <span>Közvetlen letöltés:</span>
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
                              <span>JSON Nézet</span>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Action */}
                    <div className="flex items-center justify-between pt-3 border-t border-wbk-lightgrey/40 mt-2">
                      <span className="text-[11px] text-wbk-brown">
                        Sablon forrás: <code className="font-mono text-[10px]">{feed.templateFile || "Egyéni leképezés"}</code>
                      </span>

                      <Link
                        href={`/admin/feeds/${feed.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-wbk-black text-white text-xs font-medium uppercase tracking-wider hover:bg-wbk-gold hover:text-wbk-black transition-colors"
                      >
                        <span>Termékek kezelése a feedben</span>
                        <IconArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
