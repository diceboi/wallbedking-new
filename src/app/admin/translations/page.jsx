"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  IconSearch,
  IconPlus,
  IconDeviceFloppy,
  IconSparkles,
  IconTrash,
  IconCheck,
  IconAlertCircle,
  IconArrowBackUp,
  IconLanguage,
  IconRefresh,
} from "@tabler/icons-react";
import { FlagIcon } from "@/components/ui/FlagIcon";

const LOCALES = [
  { code: "en", label: "UK", name: "English (UK)", flag: "gb" },
  { code: "us", label: "US", name: "English (US)", flag: "us" },
  { code: "de", label: "DE", name: "German", flag: "de" },
  { code: "fr", label: "FR", name: "French", flag: "fr" },
  { code: "es", label: "ES", name: "Spanish", flag: "es" },
  { code: "por", label: "POR", name: "Portuguese", flag: "por" },
  { code: "it", label: "IT", name: "Italian", flag: "it" },
];

const CATEGORIES = [
  "all",
  "nav",
  "header",
  "common",
  "cart",
  "checkout",
  "product",
  "support",
  "footer",
];

export default function AdminTranslationsPage() {
  const [rows, setRows] = useState([]);
  const [originalRows, setOriginalRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeRowKey, setActiveRowKey] = useState(null);
  const [aiTranslatingKey, setAiTranslatingKey] = useState(null);

  // New key form modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newCategory, setNewCategory] = useState("common");
  const [newEnText, setNewEnText] = useState("");

  // Load translations on mount
  useEffect(() => {
    fetchTranslations();
  }, []);

  const fetchTranslations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/translations");
      const data = await res.json();
      if (data.success && Array.isArray(data.rows)) {
        setRows(data.rows);
        setOriginalRows(JSON.parse(JSON.stringify(data.rows)));
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load translations." });
    } finally {
      setLoading(false);
    }
  };

  // Has unsaved changes?
  const hasChanges = useMemo(() => {
    return JSON.stringify(rows) !== JSON.stringify(originalRows);
  }, [rows, originalRows]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const matchesCategory =
        selectedCategory === "all" || r.category === selectedCategory;
      const q = search.trim().toLowerCase();
      if (!q) return matchesCategory;

      const matchesSearch =
        r.key.toLowerCase().includes(q) ||
        LOCALES.some((l) => (r[l.code] || "").toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [rows, selectedCategory, search]);

  const handleCellChange = (key, locale, value) => {
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, [locale]: value } : r))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      if (data.success) {
        setOriginalRows(JSON.parse(JSON.stringify(rows)));
        setMessage({
          type: "success",
          text: data.supabaseSynced
            ? "Translations saved to local files & synced to Supabase!"
            : "Translations saved to local dictionaries.",
        });
      } else {
        setMessage({ type: "error", text: data.error || "Save failed." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error saving translations." });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleAddKey = (e) => {
    e.preventDefault();
    if (!newKey.trim()) return;

    const formattedKey = newKey.includes(".")
      ? newKey.trim()
      : `${newCategory}.${newKey.trim()}`;

    if (rows.some((r) => r.key === formattedKey)) {
      alert("This translation key already exists!");
      return;
    }

    const newRow = {
      key: formattedKey,
      category: newCategory,
      en: newEnText,
      us: newEnText,
      de: "",
      fr: "",
      es: "",
      por: "",
      it: "",
    };

    setRows((prev) => [newRow, ...prev]);
    setIsAddOpen(false);
    setNewKey("");
    setNewEnText("");
  };

  const handleDeleteRow = (key) => {
    if (confirm(`Are you sure you want to delete "${key}"?`)) {
      setRows((prev) => prev.filter((r) => r.key !== key));
    }
  };

  // AI translate row from English
  const handleAiTranslateRow = async (row) => {
    if (!row.en) {
      alert("English (en) text is required to translate to other languages.");
      return;
    }

    setAiTranslatingKey(row.key);
    const targetLocales = ["us", "de", "fr", "es", "por", "it"];

    try {
      for (const loc of targetLocales) {
        // Only translate if empty or requested
        if (!row[loc]) {
          const res = await fetch("/api/admin/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              englishText: row.en,
              targetLocale: loc,
              key: row.key,
            }),
          });
          const data = await res.json();
          if (data.success && data.translation) {
            handleCellChange(row.key, loc, data.translation);
          }
        }
      }
    } catch (err) {
      console.error("AI translation error", err);
    } finally {
      setAiTranslatingKey(null);
    }
  };

  return (
    <div className="space-y-6 font-poppins">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-new-york text-2xl font-medium text-wbk-black">
            Translation Hub
          </h2>
          <p className="text-xs text-wbk-brown">
            Manage dictionaries and 1-click AI translations across all 7 markets
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-xs text-wbk-gold font-medium flex items-center gap-1">
              <IconAlertCircle size={15} /> Unsaved changes
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-md cursor-pointer ${
              hasChanges
                ? "bg-wbk-black hover:bg-wbk-gold hover:text-wbk-black text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {saving ? (
              <IconRefresh size={16} className="animate-spin" />
            ) : (
              <IconDeviceFloppy size={16} />
            )}
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>
        {/* Banner notification */}
        {message && (
          <div
            className={`p-4 rounded-none text-xs font-medium flex items-center gap-2 border ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-red-50 border-red-300 text-red-800"
            }`}
          >
            {message.type === "success" ? (
              <IconCheck size={16} />
            ) : (
              <IconAlertCircle size={16} />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Toolbar & Filters */}
        <div className="bg-white p-5 border border-wbk-lightgrey/50 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider rounded-full transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-wbk-black text-white"
                      : "bg-[#F4F2F0] text-wbk-brown hover:text-wbk-black"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search + Add */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative flex-1 md:w-64">
              <IconSearch
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-wbk-brown"
              />
              <input
                type="text"
                placeholder="Search keys or words..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#FBF9F8] border border-wbk-lightgrey text-xs text-wbk-black rounded-none focus:outline-none focus:border-wbk-black"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#9A9A8C] hover:bg-wbk-black text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-colors shrink-0 cursor-pointer"
            >
              <IconPlus size={15} />
              <span>Add Key</span>
            </button>
          </div>
        </div>

        {/* Statistics Bar */}
        <div className="flex items-center justify-between text-xs text-wbk-brown px-1">
          <span>
            Showing <strong>{filteredRows.length}</strong> of{" "}
            <strong>{rows.length}</strong> translation keys across{" "}
            <strong>7 markets</strong>.
          </span>
          <span className="text-[11px] text-wbk-brown/70 italic">
            Click any cell to edit directly in real time.
          </span>
        </div>

        {/* Translations Matrix Table */}
        <div className="bg-white border border-wbk-lightgrey/60 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F4F2F0] border-b border-wbk-lightgrey text-wbk-black uppercase tracking-wider text-[10px] font-semibold select-none">
                <th className="py-3 px-4 w-44 shrink-0">Key / Category</th>
                {LOCALES.map((l) => (
                  <th key={l.code} className="py-3 px-3 min-w-[190px]">
                    <div className="flex items-center gap-1.5">
                      <FlagIcon country={l.code} size={14} />
                      <span>{l.label}</span>
                    </div>
                  </th>
                ))}
                <th className="py-3 px-3 w-20 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wbk-lightgrey/40">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-wbk-brown">
                    <IconRefresh size={24} className="animate-spin mx-auto mb-2" />
                    Loading translation hub...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-wbk-brown">
                    No translation keys match the filter.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const isAiTranslating = aiTranslatingKey === row.key;
                  return (
                    <tr
                      key={row.key}
                      className="hover:bg-[#FBF9F8] transition-colors group"
                    >
                      {/* Key & Category */}
                      <td className="py-3 px-4 align-top font-mono text-[11px] text-wbk-black">
                        <div className="font-semibold break-all">{row.key}</div>
                        <span className="inline-block mt-1 text-[9px] uppercase px-1.5 py-0.5 bg-wbk-lightgrey/60 text-wbk-brown rounded-xs">
                          {row.category}
                        </span>
                      </td>

                      {/* Language columns */}
                      {LOCALES.map((l) => {
                        const val = row[l.code] || "";
                        const isBase = l.code === "en";
                        return (
                          <td key={l.code} className="p-1.5 align-top">
                            <textarea
                              rows={val.length > 50 ? 3 : 1}
                              value={val}
                              onChange={(e) =>
                                handleCellChange(row.key, l.code, e.target.value)
                              }
                              placeholder={`Translate ${l.label}...`}
                              className={`w-full p-2 text-xs border rounded-none focus:outline-none transition-colors resize-y font-poppins leading-normal ${
                                isBase
                                  ? "bg-[#F4F2F0]/40 border-wbk-lightgrey/50 font-medium text-wbk-black"
                                  : "bg-white border-wbk-lightgrey/40 focus:border-wbk-black text-wbk-black"
                              } ${!val && !isBase ? "bg-amber-50/30 border-amber-200" : ""}`}
                            />
                          </td>
                        );
                      })}

                      {/* Row Action buttons */}
                      <td className="py-3 px-3 align-top text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            title="AI Auto-Translate missing fields from English"
                            onClick={() => handleAiTranslateRow(row)}
                            disabled={isAiTranslating}
                            className="p-1 text-wbk-gold hover:text-wbk-black hover:bg-wbk-lightgrey/40 rounded-full transition-colors cursor-pointer"
                          >
                            {isAiTranslating ? (
                              <IconRefresh size={15} className="animate-spin" />
                            ) : (
                              <IconSparkles size={15} />
                            )}
                          </button>
                          <button
                            type="button"
                            title="Delete translation key"
                            onClick={() => handleDeleteRow(row.key)}
                            className="p-1 text-wbk-brown hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                          >
                            <IconTrash size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      {/* Add Key Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-none border border-wbk-lightgrey shadow-xl space-y-4">
            <h3 className="font-new-york text-xl text-wbk-black">
              Add New Translation Key
            </h3>

            <form onSubmit={handleAddKey} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-wbk-brown uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 text-xs border border-wbk-lightgrey bg-[#FBF9F8] rounded-none focus:outline-none"
                >
                  {CATEGORIES.filter((c) => c !== "all").map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-wbk-brown uppercase tracking-wider mb-1">
                  Key Name (e.g. "freeUkDelivery" or "checkout.button")
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. springDiscountBanner"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="w-full p-2.5 text-xs border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-wbk-brown uppercase tracking-wider mb-1">
                  Base English Text
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter the English phrase..."
                  value={newEnText}
                  onChange={(e) => setNewEnText(e.target.value)}
                  className="w-full p-2.5 text-xs border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs text-wbk-brown hover:text-wbk-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-wbk-black text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-wbk-green hover:text-wbk-black transition-colors cursor-pointer"
                >
                  Add Translation Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
