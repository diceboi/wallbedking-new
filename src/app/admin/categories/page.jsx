"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  IconFolder,
  IconTag,
  IconPlus,
  IconEdit,
  IconTrash,
  IconExternalLink,
  IconArrowRight,
  IconRefresh,
  IconCheck,
  IconAlertCircle,
  IconX,
  IconDatabase,
  IconEye,
  IconEyeOff,
  IconUpload,
  IconPhoto,
  IconArrowUp,
  IconArrowDown,
  IconSearch,
  IconLoader2,
  IconChecklist,
  IconLanguage,
  IconCopy,
} from "@tabler/icons-react";
import { FlagIcon } from "@/components/ui/FlagIcon";
import { CATEGORY_SLUGS } from "@/data/slugs";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { TagBadge, TagIcon } from "@/components/ui/TagBadge";
import { getTagIconName } from "@/lib/tags";
import { StorageMediaModal } from "@/components/admin/StorageMediaModal";

export const LOCALES_CONFIG = [
  { code: "en", label: "UK", name: "English (UK)", flag: "en" },
  { code: "us", label: "US", name: "English (US)", flag: "us" },
  { code: "de", label: "DE", name: "Deutsch", flag: "de" },
  { code: "fr", label: "FR", name: "Français", flag: "fr" },
  { code: "es", label: "ES", name: "Español", flag: "es" },
  { code: "por", label: "POR", name: "Português", flag: "por" },
  { code: "it", label: "IT", name: "Italiano", flag: "it" },
];

const AVAILABLE_TAG_ICONS = [
  { id: "flame", label: "Flame", hint: "Popular / Best Seller" },
  { id: "sparkles", label: "Sparkles", hint: "New Arrival" },
  { id: "maximize", label: "Maximize", hint: "Space Saver" },
  { id: "crown", label: "Crown", hint: "Premium Edition" },
  { id: "truck", label: "Truck", hint: "Quick Ship" },
  { id: "tag", label: "Tag", hint: "Special Offer / Sale" },
  { id: "star", label: "Star", hint: "Top Rated" },
  { id: "award", label: "Award", hint: "Featured Award" },
];

const PRESET_COLORS = [
  "#D4AF37", // WBK Gold
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#F59E0B", // Amber
  "#06B6D4", // Cyan
  "#64748B", // Slate
  "#EC4899", // Pink
  "#111827", // Dark
];

export default function AdminCategoriesPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "tags" ? "tags" : "categories";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Search & Filtering for Categories
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryVisibilityFilter, setCategoryVisibilityFilter] = useState("all"); // 'all' | 'visible' | 'hidden'

  // Category Edit / Create Modal State
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [uploadingCatImage, setUploadingCatImage] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState(null);
  const fileInputRef = useRef(null);
  const [activeCatLangTab, setActiveCatLangTab] = useState("en");
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  const [catForm, setCatForm] = useState({
    id: "",
    name: "",
    title: "",
    title_en: "",
    title_us: "",
    title_de: "",
    title_fr: "",
    title_es: "",
    title_por: "",
    title_it: "",
    description: "",
    description_en: "",
    description_us: "",
    description_de: "",
    description_fr: "",
    description_es: "",
    description_por: "",
    description_it: "",
    slug: "",
    href: "",
    subcategories: "",
    image: "",
    display_order: 0,
    is_visible: true,
  });

  // Tag Edit / Create Modal State
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [tagForm, setTagForm] = useState({
    id: "",
    name: "",
    slug: "",
    icon: "tag",
    color: "#D4AF37",
    description: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, tagRes] = await Promise.all([
        fetch("/api/admin/categories"),
        fetch("/api/admin/tags"),
      ]);
      const catData = await catRes.json();
      const tagData = await tagRes.json();

      if (catData.success && Array.isArray(catData.categories)) {
        setCategories(catData.categories);
      }
      if (tagData.success && Array.isArray(tagData.tags)) {
        setTags(tagData.tags);
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load categories or tags." });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncToSupabase = async () => {
    setSyncing(true);
    try {
      let catSynced = 0;
      let tagSynced = 0;

      for (const cat of categories) {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cat),
        });
        if (res.ok) catSynced++;
      }

      for (const tag of tags) {
        const res = await fetch("/api/admin/tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tag),
        });
        if (res.ok) tagSynced++;
      }

      setMessage({
        type: "success",
        text: `Sync complete! Synced ${catSynced} categories and ${tagSynced} tags to Supabase.`,
      });
      fetchData();
    } catch (err) {
      setMessage({ type: "error", text: "Error during sync to Supabase." });
    } finally {
      setSyncing(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  // --- Category Handlers ---
  const openNewCategoryModal = () => {
    setEditingCategory(null);
    setUploadFeedback(null);
    setActiveCatLangTab("en");
    setCatForm({
      id: "",
      name: "",
      title: "",
      title_en: "",
      title_us: "",
      title_de: "",
      title_fr: "",
      title_es: "",
      title_por: "",
      title_it: "",
      description: "",
      description_en: "",
      description_us: "",
      description_de: "",
      description_fr: "",
      description_es: "",
      description_por: "",
      description_it: "",
      slug: "",
      href: "",
      subcategories: "",
      image: "https://unrqbejocbteebsworuq.supabase.co/storage/v1/object/public/CategoryImages/morphy-beds.webp",
      display_order: categories.length + 1,
      is_visible: true,
    });
    setCatModalOpen(true);
  };

  const openEditCategoryModal = (cat) => {
    setEditingCategory(cat);
    setUploadFeedback(null);
    setActiveCatLangTab("en");
    setCatForm({
      id: cat.id,
      name: cat.name || cat.title || "",
      title: cat.title || cat.name || "",
      title_en: cat.title_en || cat.title || cat.name || "",
      title_us: cat.title_us || cat.title_en || cat.title || cat.name || "",
      title_de: cat.title_de || "",
      title_fr: cat.title_fr || "",
      title_es: cat.title_es || "",
      title_por: cat.title_por || cat.title_pt || "",
      title_it: cat.title_it || "",
      description: cat.description || "",
      description_en: cat.description_en || cat.description || "",
      description_us: cat.description_us || cat.description_en || cat.description || "",
      description_de: cat.description_de || "",
      description_fr: cat.description_fr || "",
      description_es: cat.description_es || "",
      description_por: cat.description_por || cat.description_pt || "",
      description_it: cat.description_it || "",
      slug: cat.slug || cat.id,
      href: cat.href || (cat.slug?.startsWith("/") ? cat.slug : `/products/${cat.slug || cat.id}`),
      subcategories: Array.isArray(cat.subcategories)
        ? cat.subcategories.join(", ")
        : typeof cat.subcategories === "string"
        ? cat.subcategories
        : "",
      image: cat.image || "",
      display_order: Number(cat.display_order ?? 0),
      is_visible: cat.is_visible !== false,
    });
    setCatModalOpen(true);
  };

  const handleCopyEnglishToAll = () => {
    const enTitle = catForm.title_en?.trim() || catForm.title?.trim() || catForm.name?.trim() || "";
    const enDesc = catForm.description_en?.trim() || catForm.description?.trim() || "";
    setCatForm((prev) => ({
      ...prev,
      title_us: prev.title_us || enTitle,
      title_de: prev.title_de || enTitle,
      title_fr: prev.title_fr || enTitle,
      title_es: prev.title_es || enTitle,
      title_por: prev.title_por || enTitle,
      title_it: prev.title_it || enTitle,
      description_us: prev.description_us || enDesc,
      description_de: prev.description_de || enDesc,
      description_fr: prev.description_fr || enDesc,
      description_es: prev.description_es || enDesc,
      description_por: prev.description_por || enDesc,
      description_it: prev.description_it || enDesc,
    }));
  };

  // Direct Supabase Storage Image Upload
  const handleUploadCategoryFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCatImage(true);
    setUploadFeedback(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "CategoryImages");
      formData.append("folder", "");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setCatForm((prev) => ({
          ...prev,
          image: data.url,
        }));
        setUploadFeedback({
          type: "success",
          text: `Image uploaded to Supabase Storage: ${data.fileName}`,
        });
      } else {
        setUploadFeedback({
          type: "error",
          text: data.error || "Failed to upload image to Supabase Storage.",
        });
      }
    } catch (err) {
      setUploadFeedback({
        type: "error",
        text: "Network error during upload.",
      });
    } finally {
      setUploadingCatImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleToggleVisibility = async (cat) => {
    const newVis = cat.is_visible === false ? true : false;
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: newVis }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, is_visible: newVis } : c))
        );
        setMessage({
          type: "success",
          text: `Category "${cat.name || cat.title}" is now ${newVis ? "Visible" : "Hidden"}.`,
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        alert(data.error || "Failed to update category visibility.");
      }
    } catch (err) {
      alert("Network error updating visibility.");
    }
  };

  const handleMoveOrder = async (cat, direction) => {
    const sorted = [...categories].sort(
      (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
    );
    const index = sorted.findIndex((c) => c.id === cat.id);
    if (index === -1) return;

    if (direction === "up" && index > 0) {
      const target = sorted[index - 1];
      const tempOrder = cat.display_order ?? index + 1;
      cat.display_order = target.display_order ?? index;
      target.display_order = tempOrder;
    } else if (direction === "down" && index < sorted.length - 1) {
      const target = sorted[index + 1];
      const tempOrder = cat.display_order ?? index + 1;
      cat.display_order = target.display_order ?? index + 2;
      target.display_order = tempOrder;
    } else {
      return;
    }

    // Save both updated categories
    try {
      await Promise.all(
        sorted.map((item, idx) =>
          fetch(`/api/admin/categories/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ display_order: idx + 1 }),
          })
        )
      );
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) return;
    setSubmitting(true);

    try {
      const isEdit = Boolean(editingCategory);
      const url = isEdit
        ? `/api/admin/categories/${editingCategory.id}`
        : "/api/admin/categories";
      const method = isEdit ? "PATCH" : "POST";

      const titleEn = catForm.title_en?.trim() || catForm.title?.trim() || catForm.name.trim();
      const descEn = catForm.description_en?.trim() || catForm.description?.trim() || "";

      const payload = {
        ...catForm,
        name: catForm.name.trim(),
        title: titleEn,
        title_en: titleEn,
        title_us: catForm.title_us?.trim() || titleEn,
        title_de: catForm.title_de?.trim() || "",
        title_fr: catForm.title_fr?.trim() || "",
        title_es: catForm.title_es?.trim() || "",
        title_por: catForm.title_por?.trim() || "",
        title_pt: catForm.title_por?.trim() || "",
        title_it: catForm.title_it?.trim() || "",
        description: descEn,
        description_en: descEn,
        description_us: catForm.description_us?.trim() || descEn,
        description_de: catForm.description_de?.trim() || "",
        description_fr: catForm.description_fr?.trim() || "",
        description_es: catForm.description_es?.trim() || "",
        description_por: catForm.description_por?.trim() || "",
        description_pt: catForm.description_por?.trim() || "",
        description_it: catForm.description_it?.trim() || "",
        slug: catForm.slug.trim() || catForm.id,
        href: catForm.href.trim() || `/products/${catForm.slug.trim() || catForm.id}`,
        subcategories: catForm.subcategories
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        display_order: Number(catForm.display_order || 0),
        is_visible: catForm.is_visible !== false,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({
          type: "success",
          text: `Category "${payload.name}" ${isEdit ? "updated" : "created"} successfully!`,
        });
        setCatModalOpen(false);
        fetchData();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save category." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error while saving category." });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(null), 3500);
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (
      !confirm(
        `Are you sure you want to delete category "${cat.name || cat.title}" (${cat.id})? Products in this category will keep their records.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `Category "${cat.name}" removed.` });
        setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      } else {
        alert(data.error || "Failed to delete category.");
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  // --- Tag Handlers ---
  const openNewTagModal = () => {
    setEditingTag(null);
    setTagForm({
      id: "",
      name: "",
      slug: "",
      icon: "tag",
      color: "#090A0A",
      description: "",
    });
    setTagModalOpen(true);
  };

  const openEditTagModal = (tag) => {
    setEditingTag(tag);
    setTagForm({
      id: tag.id,
      name: tag.name,
      slug: tag.slug || tag.id,
      icon: tag.icon || getTagIconName(tag.id || tag.slug),
      color: tag.color || "#090A0A",
      description: tag.description || "",
    });
    setTagModalOpen(true);
  };

  const handleSaveTag = async (e) => {
    e.preventDefault();
    if (!tagForm.name.trim()) return;
    setSubmitting(true);

    try {
      const isEdit = Boolean(editingTag);
      const url = isEdit ? `/api/admin/tags/${editingTag.id}` : "/api/admin/tags";
      const method = isEdit ? "PATCH" : "POST";

      const payload = {
        ...tagForm,
        name: tagForm.name.trim(),
        slug:
          tagForm.slug.trim() ||
          tagForm.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-"),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({
          type: "success",
          text: `Tag "${payload.name}" ${isEdit ? "updated" : "created"} successfully!`,
        });
        setTagModalOpen(false);
        fetchData();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save tag." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error while saving tag." });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(null), 3500);
    }
  };

  const handleDeleteTag = async (tag) => {
    if (!confirm(`Are you sure you want to delete tag "${tag.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/tags/${tag.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `Tag "${tag.name}" removed.` });
        setTags((prev) => prev.filter((t) => t.id !== tag.id));
      } else {
        alert(data.error || "Failed to delete tag.");
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return [...categories]
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
      .filter((cat) => {
        if (categoryVisibilityFilter === "visible" && cat.is_visible === false) return false;
        if (categoryVisibilityFilter === "hidden" && cat.is_visible !== false) return false;

        if (categorySearch.trim()) {
          const q = categorySearch.toLowerCase().trim();
          const matchName = (cat.name || "").toLowerCase().includes(q);
          const matchTitle = (cat.title || "").toLowerCase().includes(q);
          const matchId = (cat.id || "").toLowerCase().includes(q);
          const matchSlug = (cat.slug || "").toLowerCase().includes(q);
          const matchDesc = (cat.description || "").toLowerCase().includes(q);
          return matchName || matchTitle || matchId || matchSlug || matchDesc;
        }
        return true;
      });
  }, [categories, categorySearch, categoryVisibilityFilter]);

  return (
    <div className="space-y-6 font-poppins">
      {/* Page Header */}
      <AdminPageHeader
        badge="Store Taxonomy"
        title="Category & Taxonomy Manager"
        count={activeTab === "categories" ? categories.length : tags.length}
        description="Manage product categories, Supabase image assets, storefront visibility, and marketing tags"
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSyncToSupabase}
              disabled={syncing || loading}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-wbk-lightgrey hover:border-wbk-black text-wbk-black text-xs font-semibold uppercase tracking-wider rounded-full transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Push all categories and tags to Supabase database"
            >
              <IconDatabase size={15} className={syncing ? "animate-spin text-wbk-gold" : "text-wbk-gold"} />
              <span>{syncing ? "Syncing..." : "Sync DB"}</span>
            </button>

            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="p-2.5 bg-white border border-wbk-lightgrey hover:border-wbk-black text-wbk-black rounded-full transition-colors cursor-pointer"
              title="Refresh taxonomy"
            >
              <IconRefresh size={16} className={loading ? "animate-spin" : ""} />
            </button>

            {activeTab === "categories" ? (
              <button
                type="button"
                onClick={openNewCategoryModal}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-wbk-black hover:bg-wbk-gold hover:text-wbk-black text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-all shadow-sm cursor-pointer"
              >
                <IconPlus size={16} />
                <span>Add Category</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={openNewTagModal}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-wbk-black hover:bg-wbk-gold hover:text-wbk-black text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-all shadow-sm cursor-pointer"
              >
                <IconPlus size={16} />
                <span>Add Tag</span>
              </button>
            )}
          </div>
        }
      />

      {/* Status banner */}
      {message && (
        <div
          className={`p-3.5 text-xs font-medium flex items-center gap-2 border ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" ? <IconCheck size={16} /> : <IconAlertCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="bg-white p-2 border border-wbk-lightgrey/60 shadow-xs flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "categories"
              ? "bg-wbk-black text-white shadow-xs"
              : "bg-transparent text-wbk-brown hover:text-wbk-black"
          }`}
        >
          <IconFolder size={16} />
          <span>Categories ({categories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tags")}
          className={`flex items-center gap-2 px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "tags"
              ? "bg-wbk-black text-white shadow-xs"
              : "bg-transparent text-wbk-brown hover:text-wbk-black"
          }`}
        >
          <IconTag size={16} />
          <span>Product Tags & Badges ({tags.length})</span>
        </button>
      </div>

      {/* TAB 1: CATEGORIES VIEW (LIST / TABLE) */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          {/* Controls Bar: Search & Status Filters */}
          <div className="bg-white p-4 border border-wbk-lightgrey/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-wbk-brown">Visibility:</span>
              <button
                type="button"
                onClick={() => setCategoryVisibilityFilter("all")}
                className={`px-3 py-1 text-xs font-medium border cursor-pointer transition-colors ${
                  categoryVisibilityFilter === "all"
                    ? "bg-wbk-black text-white border-wbk-black"
                    : "bg-[#FBF9F8] text-wbk-black border-wbk-lightgrey hover:border-wbk-black"
                }`}
              >
                All ({categories.length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryVisibilityFilter("visible")}
                className={`px-3 py-1 text-xs font-medium border cursor-pointer transition-colors flex items-center gap-1.5 ${
                  categoryVisibilityFilter === "visible"
                    ? "bg-emerald-700 text-white border-emerald-700"
                    : "bg-[#FBF9F8] text-emerald-800 border-wbk-lightgrey hover:border-emerald-700"
                }`}
              >
                <IconEye size={13} />
                <span>Visible ({categories.filter((c) => c.is_visible !== false).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setCategoryVisibilityFilter("hidden")}
                className={`px-3 py-1 text-xs font-medium border cursor-pointer transition-colors flex items-center gap-1.5 ${
                  categoryVisibilityFilter === "hidden"
                    ? "bg-neutral-800 text-white border-neutral-800"
                    : "bg-[#FBF9F8] text-neutral-600 border-wbk-lightgrey hover:border-neutral-800"
                }`}
              >
                <IconEyeOff size={13} />
                <span>Hidden ({categories.filter((c) => c.is_visible === false).length})</span>
              </button>
            </div>

            <div className="relative w-full sm:w-80">
              <IconSearch
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-wbk-brown"
              />
              <input
                type="text"
                placeholder="Search category name, slug, description..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#FBF9F8] border border-wbk-lightgrey text-xs text-wbk-black rounded-none focus:outline-none focus:border-wbk-black"
              />
            </div>
          </div>

          {/* Categories Table (List layout, identical design system to Products table) */}
          <div className="bg-white border border-wbk-lightgrey/60 shadow-xs overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-wbk-brown">
                <IconRefresh size={24} className="animate-spin mx-auto mb-2 text-wbk-gold" />
                Loading categories...
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="p-12 text-center text-wbk-brown">
                No categories match your search or filter.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse font-poppins">
                <thead>
                  <tr className="bg-[#F4F2F0] border-b border-wbk-lightgrey text-wbk-black uppercase tracking-wider text-[10px] font-semibold select-none">
                    <th className="py-3 px-3 w-14 text-center">Order</th>
                    <th className="py-3 px-3 w-20 text-center">Image</th>
                    <th className="py-3 px-4 min-w-[220px]">Category & ID</th>
                    <th className="py-3 px-4 min-w-[200px]">Storefront URL (Href)</th>
                    <th className="py-3 px-3 w-28 text-center">Status</th>
                    <th className="py-3 px-3 w-32 text-center">Subcategories</th>
                    <th className="py-3 px-3 w-24 text-center">Products</th>
                    <th className="py-3 px-4 w-32 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wbk-lightgrey/50">
                  {filteredCategories.map((cat, idx) => {
                    const isVisible = cat.is_visible !== false;
                    const subcats = Array.isArray(cat.subcategories) ? cat.subcategories : [];
                    const href = cat.href || (cat.slug?.startsWith("/") ? cat.slug : `/products/${cat.slug || cat.id}`);
                    const imageSrc = cat.image || "/category-images/morphy-beds.webp";

                    return (
                      <tr
                        key={cat.id || idx}
                        className={`hover:bg-[#FBF9F8] transition-colors group ${
                          !isVisible ? "bg-neutral-50/60 opacity-75" : ""
                        }`}
                      >
                        {/* Order & Reorder arrows */}
                        <td className="py-3 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="font-mono font-semibold text-wbk-brown text-xs w-5">
                              {cat.display_order ?? idx + 1}
                            </span>
                            <div className="flex flex-col gap-0.5">
                              <button
                                type="button"
                                onClick={() => handleMoveOrder(cat, "up")}
                                disabled={idx === 0}
                                className="p-0.5 text-wbk-brown hover:text-wbk-black disabled:opacity-20 cursor-pointer"
                                title="Move category up"
                              >
                                <IconArrowUp size={11} stroke={2.5} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveOrder(cat, "down")}
                                disabled={idx === filteredCategories.length - 1}
                                className="p-0.5 text-wbk-brown hover:text-wbk-black disabled:opacity-20 cursor-pointer"
                                title="Move category down"
                              >
                                <IconArrowDown size={11} stroke={2.5} />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Image Thumbnail */}
                        <td className="py-3 px-3 text-center">
                          <div className="relative w-16 h-12 mx-auto overflow-hidden bg-[#F4F2F0] border border-wbk-lightgrey/60 rounded-xs">
                            <img
                              src={imageSrc}
                              alt={cat.name || cat.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>
                        </td>

                        {/* Category Name & ID */}
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-wbk-black text-sm">
                                {cat.name || cat.title}
                              </h4>
                              {cat.is_featured !== false && (
                                <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded-xs font-medium">
                                  Featured
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-mono text-wbk-brown">
                              <span className="bg-[#F4F2F0] px-1.5 py-0.5 border border-wbk-lightgrey/50">
                                ID: <strong>{cat.id}</strong>
                              </span>
                            </div>
                            {cat.description && (
                              <p className="text-[11px] text-wbk-brown/90 line-clamp-1 max-w-md pt-0.5">
                                {cat.description}
                              </p>
                            )}
                            <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
                              {LOCALES_CONFIG.map((loc) => {
                                const hasT = Boolean(cat[`title_${loc.code}`]);
                                const hasD = Boolean(cat[`description_${loc.code}`]);
                                const isReady = hasT && hasD;
                                return (
                                  <span
                                    key={loc.code}
                                    title={`${loc.name} (${loc.label}): ${
                                      isReady
                                        ? `Title: "${cat[`title_${loc.code}`]}"`
                                        : hasT
                                        ? `Title only`
                                        : "Not translated"
                                    }`}
                                    className={`inline-flex items-center gap-0.5 px-1 py-0.2 border text-[9px] font-semibold transition-opacity select-none ${
                                      isReady
                                        ? "bg-white border-emerald-300 text-emerald-900 shadow-2xs"
                                        : hasT
                                        ? "bg-amber-50/60 border-amber-300 text-amber-900"
                                        : "opacity-35 grayscale border-transparent bg-transparent"
                                    }`}
                                  >
                                    <FlagIcon country={loc.flag} size={11} />
                                    <span>{loc.label}</span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </td>

                        {/* Target Route (Href) */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-wbk-brown">
                            <span className="bg-[#F8F7F5] px-2 py-0.5 border border-wbk-lightgrey/60 truncate max-w-[220px]">
                              {href}
                            </span>
                            <Link
                              href={href}
                              target="_blank"
                              className="text-wbk-brown hover:text-wbk-black p-1 transition-colors"
                              title="Open on storefront"
                            >
                              <IconExternalLink size={14} />
                            </Link>
                          </div>
                        </td>

                        {/* Status (Visible / Hidden with 1-click toggle) */}
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleVisibility(cat)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold border rounded-full transition-colors cursor-pointer select-none ${
                              isVisible
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                                : "bg-neutral-100 text-neutral-600 border-neutral-300 hover:bg-neutral-200"
                            }`}
                            title={`Click to ${isVisible ? "Hide" : "Show"} on storefront`}
                          >
                            {isVisible ? <IconEye size={12} /> : <IconEyeOff size={12} />}
                            <span>{isVisible ? "Visible" : "Hidden"}</span>
                          </button>
                        </td>

                        {/* Subcategories */}
                        <td className="py-3 px-3 text-center">
                          <span className="text-xs text-wbk-brown">
                            {subcats.length > 0 ? (
                              <span className="px-2 py-0.5 bg-[#F4F2F0] border border-wbk-lightgrey/60 rounded-xs">
                                {subcats.length} models
                              </span>
                            ) : (
                              "—"
                            )}
                          </span>
                        </td>

                        {/* Products count */}
                        <td className="py-3 px-3 text-center">
                          <Link
                            href={`/admin/products?category=${cat.id}`}
                            className="inline-block px-2.5 py-0.5 bg-wbk-gold/30 hover:bg-wbk-gold text-wbk-black font-semibold text-xs rounded-full transition-colors"
                            title="Filter products in this category"
                          >
                            {cat.count ?? 0}
                          </Link>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditCategoryModal(cat)}
                              className="p-1.5 text-wbk-brown hover:text-wbk-black hover:bg-[#F4F2F0] transition-colors rounded-xs"
                              title="Edit category"
                            >
                              <IconEdit size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat)}
                              className="p-1.5 text-wbk-brown hover:text-red-600 hover:bg-red-50 transition-colors rounded-xs"
                              title="Delete category"
                            >
                              <IconTrash size={16} />
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
        </div>
      )}

      {/* TAB 2: TAGS VIEW */}
      {activeTab === "tags" && (
        <div className="space-y-6">
          {loading ? (
            <div className="p-12 text-center text-wbk-brown bg-white border border-wbk-lightgrey">
              <IconRefresh size={24} className="animate-spin mx-auto mb-2 text-wbk-gold" />
              Loading tags...
            </div>
          ) : tags.length === 0 ? (
            <div className="p-12 text-center text-wbk-brown bg-white border border-wbk-lightgrey">
              No tags found. Click &quot;Add Tag&quot; to create your first product tag.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tags.map((tag) => {
                return (
                  <div
                    key={tag.id}
                    className="bg-white p-5 border border-wbk-lightgrey/60 shadow-xs flex flex-col justify-between space-y-4 hover:border-wbk-black transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#F4F2F0] border border-wbk-lightgrey flex items-center justify-center text-wbk-black shrink-0">
                            <TagIcon tagIdOrSlug={tag.id} iconName={tag.icon} size={15} />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-wbk-black">
                              {tag.name}
                            </h3>
                            <span className="text-[10px] font-mono text-wbk-brown">
                              slug: <code>{tag.slug || tag.id}</code>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-medium px-2 py-0.5 border border-wbk-lightgrey/80 bg-[#FBF9F8] text-wbk-black">
                            {tag.count ?? 0} items
                          </span>
                          <button
                            type="button"
                            onClick={() => openEditTagModal(tag)}
                            className="p-1 text-wbk-brown hover:text-wbk-black hover:bg-[#F4F2F0] transition-colors"
                            title="Edit tag"
                          >
                            <IconEdit size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTag(tag)}
                            className="p-1 text-wbk-brown hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete tag"
                          >
                            <IconTrash size={15} />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-wbk-brown mt-2.5 leading-relaxed">
                        {tag.description || "No description provided."}
                      </p>

                      {/* Tag Preview Badge */}
                      <div className="mt-4 pt-3 border-t border-wbk-lightgrey/40 flex items-center justify-between">
                        <span className="text-[10px] uppercase font-semibold text-wbk-brown">
                          Storefront Badge:
                        </span>
                        <TagBadge tagIdOrSlug={tag.id} variant="micro" />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-wbk-lightgrey/40">
                      <Link
                        href={`/admin/products?tag=${tag.id || tag.slug}`}
                        className="text-xs font-semibold uppercase tracking-wider text-wbk-black hover:text-wbk-gold transition-colors flex items-center justify-between"
                      >
                        <span>Filter Products with Tag</span>
                        <IconArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- CATEGORY EDIT / CREATE MODAL WITH SUPABASE STORAGE UPLOAD --- */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setCatModalOpen(false)}
          />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl z-50 flex flex-col font-poppins border border-wbk-lightgrey">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#090A0A] text-white flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <IconFolder size={18} className="text-wbk-gold" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-wbk-gold">
                  {editingCategory ? `Edit Category: ${editingCategory.name || editingCategory.title}` : "Create New Category"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCatModalOpen(false)}
                className="text-white/70 hover:text-white cursor-pointer"
              >
                <IconX size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4 bg-[#FBF9F8]">
              {/* Category Image Upload Area (Supabase Storage) */}
              <div className="bg-white p-4 border border-wbk-lightgrey/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-wbk-black flex items-center gap-1.5">
                    <IconPhoto size={15} className="text-wbk-gold" />
                    <span>Category Image (Supabase Storage)</span>
                  </label>
                  <span className="text-[10px] text-wbk-brown">
                    Bucket: <code>CategoryImages</code>
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  {/* Image Preview */}
                  <div className="relative w-28 h-20 bg-[#F4F2F0] border border-wbk-lightgrey overflow-hidden shrink-0 flex items-center justify-center">
                    {catForm.image ? (
                      <img
                        src={catForm.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <IconPhoto size={28} className="text-wbk-brown/40" />
                    )}
                  </div>

                  {/* Action buttons & file input */}
                  <div className="flex-1 space-y-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* 1. Open Media Library Button */}
                      <button
                        type="button"
                        onClick={() => setIsMediaModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-wbk-gold hover:bg-[#C29D26] text-wbk-black text-xs font-semibold rounded-none transition-colors cursor-pointer shadow-xs"
                      >
                        <IconPhoto size={15} />
                        <span>Browse Media Library</span>
                      </button>

                      {/* 2. Direct File Upload Button */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleUploadCategoryFile}
                        accept="image/webp,image/png,image/jpeg,image/avif"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingCatImage}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#090A0A] text-white hover:bg-neutral-800 text-xs font-semibold rounded-none transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {uploadingCatImage ? (
                          <IconLoader2 size={14} className="animate-spin" />
                        ) : (
                          <IconUpload size={14} />
                        )}
                        <span>{uploadingCatImage ? "Uploading..." : "Upload New File"}</span>
                      </button>

                      {/* 3. Clear button if image is present */}
                      {catForm.image && (
                        <button
                          type="button"
                          onClick={() => setCatForm((p) => ({ ...p, image: "" }))}
                          className="px-2 py-1.5 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                          title="Remove image"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <p className="text-[10px] text-wbk-brown leading-relaxed">
                      Choose existing image from Supabase Storage buckets (CategoryImages or ProductImages), or upload a new WebP / PNG.
                    </p>

                    {uploadFeedback && (
                      <div
                        className={`text-[11px] p-2 flex items-center gap-1.5 border ${
                          uploadFeedback.type === "success"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : "bg-red-50 border-red-200 text-red-800"
                        }`}
                      >
                        {uploadFeedback.type === "success" ? <IconCheck size={13} /> : <IconAlertCircle size={13} />}
                        <span>{uploadFeedback.text}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct URL input */}
                <div>
                  <label className="block text-[10px] font-semibold text-wbk-brown mb-0.5">
                    Or paste direct Image URL:
                  </label>
                  <input
                    type="text"
                    value={catForm.image}
                    onChange={(e) => setCatForm((p) => ({ ...p, image: e.target.value }))}
                    placeholder="https://...supabase.co/.../categories/..."
                    className="w-full p-2 text-xs bg-white border border-wbk-lightgrey font-mono text-wbk-black rounded-none focus:outline-none focus:border-wbk-black"
                  />
                </div>
              </div>

              {/* Category Name & ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-wbk-black mb-1">
                    Internal Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MORPHY™ Beds"
                    value={catForm.name}
                    onChange={(e) => setCatForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black"
                  />
                  <span className="text-[10px] text-wbk-brown mt-0.5 block">
                    Admin reference & default fallback name.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-wbk-black mb-1">
                    Category ID (Slug) *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingCategory)}
                    placeholder="e.g. morphy-beds"
                    value={catForm.id}
                    onChange={(e) => setCatForm((p) => ({ ...p, id: e.target.value }))}
                    className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none font-mono disabled:bg-gray-100"
                  />
                  <span className="text-[10px] text-wbk-brown mt-0.5 block">
                    Database primary key & URL parameter.
                  </span>
                </div>
              </div>

              {/* Target Href & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-wbk-black mb-1">
                    Target Route / URL (Href)
                  </label>
                  <input
                    type="text"
                    placeholder="/products/beds?collection=morphy"
                    value={catForm.href}
                    onChange={(e) => setCatForm((p) => ({ ...p, href: e.target.value }))}
                    className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none font-mono focus:outline-none focus:border-wbk-black"
                  />
                  <span className="text-[10px] text-wbk-brown mt-0.5 block">
                    Where the category tile navigates to.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-wbk-black mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={catForm.display_order}
                    onChange={(e) => setCatForm((p) => ({ ...p, display_order: e.target.value }))}
                    className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none"
                  />
                  <span className="text-[10px] text-wbk-brown mt-0.5 block">
                    Sorting index (Top 4 are featured on homepage grid).
                  </span>
                </div>
              </div>

              {/* Visibility Switch */}
              <div className="bg-white p-3 border border-wbk-lightgrey/80 flex items-center justify-between">
                <div>
                  <label className="block text-xs font-semibold text-wbk-black">
                    Storefront Visibility
                  </label>
                  <span className="text-[10px] text-wbk-brown">
                    Hidden categories are excluded from homepage and archive grids.
                  </span>
                </div>
                <div className="flex items-center gap-2 w-48">
                  <button
                    type="button"
                    onClick={() => setCatForm((p) => ({ ...p, is_visible: true }))}
                    className={`flex-1 py-1.5 px-3 text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      catForm.is_visible
                        ? "bg-emerald-700 text-white border-emerald-700"
                        : "bg-white text-neutral-600 border-wbk-lightgrey hover:border-emerald-700"
                    }`}
                  >
                    <IconEye size={13} />
                    <span>Visible</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCatForm((p) => ({ ...p, is_visible: false }))}
                    className={`flex-1 py-1.5 px-3 text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      !catForm.is_visible
                        ? "bg-neutral-800 text-white border-neutral-800"
                        : "bg-white text-neutral-600 border-wbk-lightgrey hover:border-neutral-800"
                    }`}
                  >
                    <IconEyeOff size={13} />
                    <span>Hidden</span>
                  </button>
                </div>
              </div>

              {/* Multilingual Storefront Content (Title & Description per Language) */}
              <div className="bg-white p-4 border border-wbk-lightgrey/80 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <IconLanguage size={18} className="text-wbk-gold shrink-0" />
                    <div>
                      <h4 className="text-xs font-semibold text-wbk-black uppercase tracking-wider">
                        Multilingual Title & Description
                      </h4>
                      <p className="text-[10px] text-wbk-brown">
                        Localized title & description displayed on storefront archive pages and category cards.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyEnglishToAll}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-wbk-black hover:text-wbk-gold bg-[#F4F2F0] hover:bg-[#EAE7E4] px-2.5 py-1 border border-wbk-lightgrey/80 transition-colors cursor-pointer"
                    title="Fill empty languages with English title & description"
                  >
                    <IconCopy size={13} />
                    <span>Copy UK to empty languages</span>
                  </button>
                </div>

                {/* Language Switcher Tabs */}
                <div className="flex flex-wrap gap-1.5 border-b border-wbk-lightgrey pb-2.5 pt-1">
                  {LOCALES_CONFIG.map((loc) => {
                    const hasTitle = Boolean(catForm[`title_${loc.code}`]?.trim());
                    const hasDesc = Boolean(catForm[`description_${loc.code}`]?.trim());
                    const isComplete = hasTitle && hasDesc;
                    const isActive = activeCatLangTab === loc.code;
                    return (
                      <button
                        key={loc.code}
                        type="button"
                        onClick={() => setActiveCatLangTab(loc.code)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all cursor-pointer border ${
                          isActive
                            ? "bg-[#090A0A] text-white border-[#090A0A] shadow-xs"
                            : "bg-[#FBF9F8] text-wbk-black border-wbk-lightgrey/80 hover:bg-[#F4F2F0]"
                        }`}
                      >
                        <FlagIcon country={loc.flag} size={14} />
                        <span>{loc.label}</span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isComplete
                              ? "bg-emerald-500"
                              : hasTitle || hasDesc
                              ? "bg-amber-500"
                              : "bg-neutral-300"
                          }`}
                          title={
                            isComplete
                              ? "Both title and description filled"
                              : hasTitle || hasDesc
                              ? "Partially filled"
                              : "Empty"
                          }
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Active Language Inputs */}
                {LOCALES_CONFIG.map((loc) => {
                  if (activeCatLangTab !== loc.code) return null;
                  const isEn = loc.code === "en";
                  return (
                    <div key={loc.code} className="space-y-3 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-wbk-brown bg-[#F9F8F6] px-3 py-1.5 border border-wbk-lightgrey/50">
                        <span className="font-semibold text-wbk-black flex items-center gap-2">
                          <FlagIcon country={loc.flag} size={16} />
                          <span>Editing: {loc.name} ({loc.label})</span>
                        </span>
                        <span className="text-[10px] font-mono">
                          Live Route: <code>/{loc.code}/products/{catForm.slug || catForm.id || "..."}</code>
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-wbk-black mb-1">
                          Storefront Category Title ({loc.label}) *
                        </label>
                        <input
                          type="text"
                          placeholder={
                            isEn
                              ? "e.g. Traditional Wall Beds"
                              : loc.code === "de"
                              ? "e.g. Traditionelle Schrankbetten"
                              : loc.code === "fr"
                              ? "e.g. Lits Escamotables Traditionnels"
                              : `Title in ${loc.name}...`
                          }
                          value={catForm[`title_${loc.code}`] || ""}
                          onChange={(e) =>
                            setCatForm((p) => ({
                              ...p,
                              [`title_${loc.code}`]: e.target.value,
                              ...(isEn ? { title: e.target.value } : {}),
                            }))
                          }
                          className="w-full p-2.5 text-xs bg-[#FBF9F8] border border-wbk-lightgrey focus:bg-white focus:outline-none focus:border-wbk-black"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-wbk-black mb-1">
                          Category Description ({loc.label})
                        </label>
                        <textarea
                          rows={3}
                          placeholder={`Header description for ${loc.name} market...`}
                          value={catForm[`description_${loc.code}`] || ""}
                          onChange={(e) =>
                            setCatForm((p) => ({
                              ...p,
                              [`description_${loc.code}`]: e.target.value,
                              ...(isEn ? { description: e.target.value } : {}),
                            }))
                          }
                          className="w-full p-2.5 text-xs bg-[#FBF9F8] border border-wbk-lightgrey focus:bg-white focus:outline-none focus:border-wbk-black leading-relaxed"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Subcategories */}
              <div>
                <label className="block text-xs font-semibold text-wbk-black mb-1">
                  Subcategories / Models (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Classic Vertical, Classic Horizontal, Studio Desk Bed"
                  value={catForm.subcategories}
                  onChange={(e) => setCatForm((p) => ({ ...p, subcategories: e.target.value }))}
                  className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-wbk-lightgrey flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-4 py-2 text-xs text-wbk-brown hover:text-wbk-black font-semibold uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-wbk-black hover:bg-wbk-gold hover:text-wbk-black text-white text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- TAG EDIT / CREATE MODAL --- */}
      {tagModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setTagModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col font-poppins border border-wbk-lightgrey">
            <div className="px-6 py-4 bg-[#090A0A] text-white flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-wbk-gold">
                {editingTag ? `Edit Tag: ${editingTag.name}` : "Create New Marketing Tag"}
              </h3>
              <button
                type="button"
                onClick={() => setTagModalOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <IconX size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTag} className="p-6 space-y-4 bg-[#FBF9F8]">
              <div>
                <label className="block text-xs font-semibold text-wbk-black mb-1">
                  Tag Label Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Best Seller, New Arrival, Space Saver"
                  value={tagForm.name}
                  onChange={(e) => setTagForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-wbk-black mb-1">
                  Slug / Identifier *
                </label>
                <input
                  type="text"
                  required
                  disabled={Boolean(editingTag)}
                  placeholder="e.g. best-seller, space-saver"
                  value={tagForm.slug}
                  onChange={(e) => setTagForm((p) => ({ ...p, slug: e.target.value }))}
                  className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none font-mono disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-wbk-black mb-1">
                  Tag Icon (Storefront & Filters)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {AVAILABLE_TAG_ICONS.map((ic) => (
                    <button
                      key={ic.id}
                      type="button"
                      onClick={() => setTagForm((p) => ({ ...p, icon: ic.id }))}
                      className={`p-2 border text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        tagForm.icon === ic.id
                          ? "border-wbk-black bg-white shadow-xs font-semibold text-wbk-black"
                          : "border-wbk-lightgrey bg-[#FBF9F8] text-wbk-brown hover:border-wbk-brown"
                      }`}
                    >
                      <TagIcon iconName={ic.id} size={16} />
                      <span className="text-[10px]">{ic.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-wbk-black mb-1">
                  Badge Color
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setTagForm((p) => ({ ...p, color: col }))}
                      className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                        tagForm.color === col ? "scale-125 border-wbk-black" : "border-transparent"
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                  <input
                    type="color"
                    value={tagForm.color}
                    onChange={(e) => setTagForm((p) => ({ ...p, color: e.target.value }))}
                    className="w-8 h-8 p-0 border border-wbk-lightgrey rounded-none cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-wbk-black mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Where and why this tag is shown..."
                  value={tagForm.description}
                  onChange={(e) => setTagForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none"
                />
              </div>

              <div className="pt-4 border-t border-wbk-lightgrey flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTagModalOpen(false)}
                  className="px-4 py-2 text-xs text-wbk-brown hover:text-wbk-black font-semibold uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-wbk-black hover:bg-wbk-gold hover:text-wbk-black text-white text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save Tag"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- REUSABLE SUPABASE STORAGE MEDIA LIBRARY MODAL --- */}
      <StorageMediaModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(url, file) => {
          setCatForm((prev) => ({ ...prev, image: url }));
          setUploadFeedback({
            type: "success",
            text: `Selected "${file?.name || url.split("/").pop()}" from Supabase Media Library.`,
          });
        }}
        selectedUrl={catForm.image}
        initialBucket="CategoryImages"
        initialFolder=""
        title="Category Images Media Library"
      />
    </div>
  );
}
