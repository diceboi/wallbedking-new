"use client";

import { useState, useEffect } from "react";
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
} from "@tabler/icons-react";
import { CATEGORY_SLUGS } from "@/data/slugs";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { TagBadge, TagIcon } from "@/components/ui/TagBadge";
import { getTagIconName } from "@/lib/tags";

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

  // Category Edit / Create Modal State
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catForm, setCatForm] = useState({
    id: "",
    name: "",
    title: "",
    description: "",
    subcategories: "",
    image: "",
    display_order: 0,
  });

  // Tag Edit / Create Modal State
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [tagForm, setTagForm] = useState({
    id: "",
    name: "",
    slug: "",
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
    setCatForm({
      id: "",
      name: "",
      title: "",
      description: "",
      subcategories: "",
      image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
      display_order: categories.length + 1,
    });
    setCatModalOpen(true);
  };

  const openEditCategoryModal = (cat) => {
    setEditingCategory(cat);
    setCatForm({
      id: cat.id,
      name: cat.name || cat.title || "",
      title: cat.title || cat.name || "",
      description: cat.description || "",
      subcategories: Array.isArray(cat.subcategories)
        ? cat.subcategories.join(", ")
        : cat.subcategories || "",
      image: cat.image || "",
      display_order: cat.display_order || 0,
    });
    setCatModalOpen(true);
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

      const payload = {
        ...catForm,
        name: catForm.name.trim(),
        title: catForm.title.trim() || catForm.name.trim(),
        subcategories: catForm.subcategories
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        display_order: Number(catForm.display_order || 0),
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

  return (
    <div className="space-y-6 font-poppins">
      {/* Page Header */}
      <AdminPageHeader
        badge="Store Taxonomy"
        title="Taxonomy & Tag Manager"
        count={activeTab === "categories" ? categories.length : tags.length}
        description="Manage product categories, subcategories, and marketing tags synchronized with Supabase"
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

      {/* TAB 1: CATEGORIES VIEW */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          {loading ? (
            <div className="p-12 text-center text-wbk-brown bg-white border border-wbk-lightgrey">
              <IconRefresh size={24} className="animate-spin mx-auto mb-2 text-wbk-gold" />
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center text-wbk-brown bg-white border border-wbk-lightgrey">
              No categories found. Click &quot;Add Category&quot; to create your first one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {categories.map((cat) => {
                const deSlug = CATEGORY_SLUGS[cat.id]?.de || cat.id;
                const frSlug = CATEGORY_SLUGS[cat.id]?.fr || cat.id;
                const esSlug = CATEGORY_SLUGS[cat.id]?.es || cat.id;
                const subcats = Array.isArray(cat.subcategories) ? cat.subcategories : [];

                return (
                  <div
                    key={cat.id}
                    className="bg-white p-6 border border-wbk-lightgrey/60 shadow-xs flex flex-col justify-between space-y-4 hover:border-wbk-gold/60 transition-colors group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2.5 bg-[#F4F2F0] text-wbk-black rounded-full group-hover:bg-wbk-gold/20 transition-colors">
                            <IconFolder size={18} />
                          </div>
                          <div>
                            <h3 className="font-poppins text-base font-semibold text-wbk-black">
                              {cat.name || cat.title}
                            </h3>
                            <span className="text-[11px] font-mono text-wbk-brown">
                              slug: <code className="text-wbk-black font-bold font-mono">{cat.id}</code>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-wbk-gold text-wbk-black shrink-0">
                            {cat.count ?? 0} products
                          </span>
                          <button
                            type="button"
                            onClick={() => openEditCategoryModal(cat)}
                            className="p-1.5 text-wbk-brown hover:text-wbk-black hover:bg-[#F4F2F0] rounded-none transition-colors"
                            title="Edit category"
                          >
                            <IconEdit size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 text-wbk-brown hover:text-red-600 hover:bg-red-50 rounded-none transition-colors"
                            title="Delete category"
                          >
                            <IconTrash size={16} />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-wbk-brown mt-3 leading-relaxed">
                        {cat.description || "No description provided."}
                      </p>

                      {/* Subcategories list */}
                      {subcats.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-wbk-lightgrey/40 space-y-1.5">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-wbk-brown block">
                            Subcategories & Models ({subcats.length}):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {subcats.map((sub, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] bg-[#F4F2F0] text-wbk-black px-2 py-0.5 border border-wbk-lightgrey/40"
                              >
                                {sub}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Localized slugs */}
                      <div className="mt-4 pt-3 border-t border-wbk-lightgrey/40 space-y-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-wbk-brown block">
                          URL Route:
                        </span>
                        <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono text-wbk-brown">
                          <span className="px-2 py-0.5 bg-[#F4F2F0] text-wbk-black">
                            EN: /{cat.id}
                          </span>
                          <span className="px-2 py-0.5 bg-[#F4F2F0] text-wbk-black">
                            DE: /{deSlug}
                          </span>
                          <span className="px-2 py-0.5 bg-[#F4F2F0] text-wbk-black">
                            FR: /{frSlug}
                          </span>
                          <span className="px-2 py-0.5 bg-[#F4F2F0] text-wbk-black">
                            ES: /{esSlug}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-wbk-lightgrey/40 flex items-center justify-between">
                      <Link
                        href={`/admin/products?category=${cat.id}`}
                        className="text-xs font-semibold uppercase tracking-wider text-wbk-black hover:text-wbk-gold transition-colors flex items-center gap-1"
                      >
                        <span>Filter Products</span>
                        <IconArrowRight size={14} />
                      </Link>

                      <Link
                        href={`/products/${cat.id}`}
                        target="_blank"
                        className="p-1.5 text-wbk-brown hover:text-wbk-black transition-colors flex items-center gap-1 text-xs"
                        title="View category on storefront"
                      >
                        <span>Storefront</span>
                        <IconExternalLink size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
                const tagColor = tag.color || "#D4AF37";

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

      {/* --- CATEGORY EDIT / CREATE MODAL --- */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setCatModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col font-poppins border border-wbk-lightgrey">
            <div className="px-6 py-4 bg-[#090A0A] text-white flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-wbk-gold">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : "Create New Category"}
              </h3>
              <button
                type="button"
                onClick={() => setCatModalOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <IconX size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4 bg-[#FBF9F8]">
              <div>
                <label className="block text-xs font-semibold text-wbk-black mb-1">
                  Category Name / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Murphy Beds (Wall Beds)"
                  value={catForm.name}
                  onChange={(e) => setCatForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-wbk-black mb-1">
                  Category ID / Slug *
                </label>
                <input
                  type="text"
                  required
                  disabled={Boolean(editingCategory)}
                  placeholder="e.g. beds or sofas"
                  value={catForm.id}
                  onChange={(e) => setCatForm((p) => ({ ...p, id: e.target.value }))}
                  className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none font-mono disabled:bg-gray-100"
                />
                <span className="text-[10px] text-wbk-brown mt-0.5 block">
                  Used as `parent_category` key and URL route identifier.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-wbk-black mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Short description of this product line..."
                  value={catForm.description}
                  onChange={(e) => setCatForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black"
                />
              </div>

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

              <div className="grid grid-cols-2 gap-3">
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
                </div>

                <div>
                  <label className="block text-xs font-semibold text-wbk-black mb-1">
                    Cover Image URL
                  </label>
                  <input
                    type="text"
                    placeholder="/product-images/..."
                    value={catForm.image}
                    onChange={(e) => setCatForm((p) => ({ ...p, image: e.target.value }))}
                    className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-wbk-lightgrey flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-4 py-2 text-xs text-wbk-brown hover:text-wbk-black font-semibold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-wbk-black hover:bg-wbk-gold hover:text-wbk-black text-white text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
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
          <div className="relative w-full max-w-md bg-white shadow-2xl z-50 flex flex-col font-poppins border border-wbk-lightgrey">
            <div className="px-6 py-4 bg-[#090A0A] text-white flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-wbk-gold">
                {editingTag ? `Edit Tag: ${editingTag.name}` : "Create New Product Tag"}
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
                  Tag Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Best Seller, Clearance, Space Saver"
                  value={tagForm.name}
                  onChange={(e) => setTagForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-wbk-black mb-1">
                  Slug / Identifier
                </label>
                <input
                  type="text"
                  placeholder="e.g. best-seller (auto-generated if empty)"
                  value={tagForm.slug}
                  onChange={(e) => setTagForm((p) => ({ ...p, slug: e.target.value }))}
                  className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-wbk-black mb-1.5">
                  Micro-Icon Selection (Monochrome Storefront)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {AVAILABLE_TAG_ICONS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTagForm((p) => ({ ...p, icon: item.id }))}
                      className={`flex flex-col items-center justify-center p-2.5 border text-center transition-all cursor-pointer ${
                        tagForm.icon === item.id
                          ? "border-wbk-black bg-[#F4F2F0] text-wbk-black shadow-xs font-semibold ring-1 ring-wbk-black"
                          : "border-wbk-lightgrey/80 bg-white text-wbk-brown hover:border-wbk-black hover:text-wbk-black"
                      }`}
                      title={item.hint}
                    >
                      <TagIcon iconName={item.id} size={18} stroke={1.8} />
                      <span className="text-[10px] mt-1 capitalize leading-tight">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-wbk-black mb-1.5">
                  Live Storefront Preview
                </label>
                <div className="p-3 bg-white border border-wbk-lightgrey/80 flex items-center justify-between">
                  <span className="text-xs text-wbk-brown font-mono">
                    icon: <code>{tagForm.icon || "tag"}</code>
                  </span>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F4F2F0] border border-[#E7E2DD] text-[10px] font-medium tracking-wide uppercase text-wbk-black select-none">
                    <TagIcon iconName={tagForm.icon || "tag"} size={11} className="text-wbk-black/75 shrink-0" />
                    <span>{tagForm.name || "Preview"}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-wbk-black mb-1">
                  Description / Internal Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="When to apply this tag..."
                  value={tagForm.description}
                  onChange={(e) => setTagForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-wbk-lightgrey flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTagModalOpen(false)}
                  className="px-4 py-2 text-xs text-wbk-brown hover:text-wbk-black font-semibold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-wbk-black hover:bg-wbk-gold hover:text-wbk-black text-white text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Tag"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
