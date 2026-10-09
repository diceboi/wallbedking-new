"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  IconLayoutNavbar,
  IconPlus,
  IconEdit,
  IconTrash,
  IconArrowUp,
  IconArrowDown,
  IconEye,
  IconEyeOff,
  IconCheck,
  IconRefresh,
  IconFolder,
  IconLink,
  IconAlertCircle,
  IconX,
  IconExternalLink,
  IconLoader2,
  IconDatabase,
} from "@tabler/icons-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminNavigationPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [fromSupabase, setFromSupabase] = useState(false);
  const [dbTableMissing, setDbTableMissing] = useState(false);

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formState, setFormState] = useState({
    id: "",
    title: "",
    type: "category",
    category_id: "",
    slug: "",
    href: "",
    is_visible: true,
    has_submenu: true,
    badge: "",
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const loadNavigation = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/navigation");
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
        setCategories(data.categories || []);
        setFromSupabase(Boolean(data.fromSupabase));
        setDbTableMissing(Boolean(data.dbTableMissing));
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      console.error("Failed to load navigation:", err);
      showToast("Error loading navigation data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNavigation();
  }, []);

  const handleSaveAll = async (itemsToSave = items) => {
    setSaving(true);
    try {
      // Re-assign order numbers sequentially
      const ordered = itemsToSave.map((item, index) => ({
        ...item,
        order: index + 1,
      }));

      const res = await fetch("/api/admin/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: ordered }),
      });

      const data = await res.json();
      if (data.success) {
        setItems(data.items || ordered);
        setFromSupabase(Boolean(data.fromSupabase));
        setDbTableMissing(Boolean(data.dbTableMissing));
        setHasUnsavedChanges(false);
        showToast(
          data.fromSupabase
            ? "Navigation saved directly to Supabase database!"
            : "Navigation saved locally (database table not migrated yet)"
        );
      } else {
        alert(data.error || "Failed to save navigation");
      }
    } catch (err) {
      console.error("Failed to save navigation:", err);
      alert("Error occurred while saving navigation");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = (id) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, is_visible: !item.is_visible } : item
    );
    setItems(updated);
    setHasUnsavedChanges(true);
  };

  const handleMoveUp = (index) => {
    if (index <= 0) return;
    const newItems = [...items];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    setItems(newItems);
    setHasUnsavedChanges(true);
  };

  const handleMoveDown = (index) => {
    if (index >= items.length - 1) return;
    const newItems = [...items];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    setItems(newItems);
    setHasUnsavedChanges(true);
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormState({
      id: `nav-${Date.now()}`,
      title: "",
      type: "category",
      category_id: categories[0]?.id || "",
      slug: categories[0]?.slug || categories[0]?.id || "",
      href: categories[0]?.slug ? `/products/${categories[0].slug}` : "/products",
      is_visible: true,
      has_submenu: true,
      badge: "",
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormState({
      id: item.id,
      title: item.title,
      type: item.type || (item.category_id ? "category" : "custom"),
      category_id: item.category_id || "",
      slug: item.slug || item.id,
      href: item.href || `/products/${item.slug || item.id}`,
      is_visible: item.is_visible !== false,
      has_submenu: Boolean(item.has_submenu),
      badge: item.badge || "",
    });
    setModalOpen(true);
  };

  const handleCategoryChange = (catId) => {
    const cat = categories.find((c) => c.id === catId || c.slug === catId);
    if (!cat) return;
    setFormState((prev) => ({
      ...prev,
      category_id: cat.id || cat.slug,
      slug: cat.slug || cat.id,
      title: prev.title || cat.title || cat.name,
      href: `/products/${cat.slug || cat.id}`,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formState.title.trim()) {
      alert("Please enter a title for the menu item");
      return;
    }

    if (editingItem) {
      // Update existing item
      const updated = items.map((item) =>
        item.id === editingItem.id ? { ...item, ...formState } : item
      );
      setItems(updated);
    } else {
      // Add new item to end
      const newItem = {
        ...formState,
        order: items.length + 1,
      };
      setItems([...items, newItem]);
    }

    setHasUnsavedChanges(true);
    setModalOpen(false);
  };

  const handleDeleteItem = (id, title) => {
    if (!window.confirm(`Are you sure you want to remove "${title}" from the navigation menu?`)) {
      return;
    }
    const filtered = items.filter((item) => item.id !== id);
    setItems(filtered);
    setHasUnsavedChanges(true);
  };

  const visibleItems = items.filter((i) => i.is_visible !== false);
  const hiddenItems = items.filter((i) => i.is_visible === false);

  return (
    <div className="space-y-8 font-poppins pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 bg-[#090A0A] text-white border border-wbk-gold shadow-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <IconCheck size={16} className="text-wbk-gold" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <AdminPageHeader
        badge="Storefront Navigation"
        title="Navigation & Menu Manager"
        count={items.length}
        description="Organize the header navigation menu. Connect tabs to product categories or custom links, reorder tabs, toggle visibility, and control mega-menu behavior."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-wbk-lightgrey hover:border-wbk-black text-wbk-black text-xs font-semibold uppercase tracking-wider rounded-full transition-colors shadow-2xs cursor-pointer"
            >
              <IconPlus size={15} />
              <span>Add Menu Item</span>
            </button>
            <button
              type="button"
              onClick={() => handleSaveAll(items)}
              disabled={saving}
              className={`flex items-center gap-2 px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition-all shadow-md cursor-pointer ${
                hasUnsavedChanges
                  ? "bg-wbk-gold hover:bg-wbk-black text-wbk-black hover:text-white ring-2 ring-wbk-gold/50 animate-pulse"
                  : "bg-wbk-black hover:bg-wbk-gold hover:text-wbk-black text-white"
              }`}
            >
              {saving ? <IconLoader2 size={15} className="animate-spin" /> : <IconCheck size={15} />}
              <span>{hasUnsavedChanges ? "Publish Changes *" : "Save Menu"}</span>
            </button>
          </div>
        }
      />

      {/* Database Storage Status Banner */}
      {fromSupabase ? (
        <div className="bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <IconDatabase size={16} className="text-emerald-600 shrink-0" />
            <span className="font-semibold">Connected to Supabase Database:</span>
            <span>
              Menu items are stored in and served directly from{" "}
              <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono text-emerald-800">
                public.navigation_menu
              </code>
              .
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live DB Synced
          </span>
        </div>
      ) : dbTableMissing ? (
        <div className="bg-amber-50 border border-amber-300 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-start gap-2.5">
            <IconAlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">Database Table Setup Ready</p>
              <p className="text-amber-800 mt-0.5">
                To store your navigation menu directly in Supabase, run the migration script in{" "}
                <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-semibold">
                  supabase/navigation_menu.sql
                </code>{" "}
                in your Supabase SQL Editor. Currently operating in fallback cache mode.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText("supabase/navigation_menu.sql");
              showToast("Copied script path: supabase/navigation_menu.sql");
            }}
            className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 font-semibold rounded text-[11px] whitespace-nowrap transition-colors cursor-pointer self-start sm:self-center"
          >
            Copy Script Path
          </button>
        </div>
      ) : null}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 border border-wbk-lightgrey/60 shadow-2xs">
          <div className="flex items-center justify-between text-wbk-brown mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Total Menu Items</span>
            <IconLayoutNavbar size={18} className="text-wbk-gold" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-wbk-black">{items.length}</div>
          <span className="text-[11px] text-wbk-brown mt-1 block">Configured items</span>
        </div>

        <div className="bg-white p-5 border border-wbk-lightgrey/60 shadow-2xs">
          <div className="flex items-center justify-between text-wbk-brown mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Visible on Store</span>
            <IconEye size={18} className="text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700">{visibleItems.length}</div>
          <span className="text-[11px] text-wbk-brown mt-1 block">Currently in header</span>
        </div>

        <div className="bg-white p-5 border border-wbk-lightgrey/60 shadow-2xs">
          <div className="flex items-center justify-between text-wbk-brown mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Hidden Items</span>
            <IconEyeOff size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600">{hiddenItems.length}</div>
          <span className="text-[11px] text-wbk-brown mt-1 block">Disabled from storefront</span>
        </div>

        <div className="bg-white p-5 border border-wbk-lightgrey/60 shadow-2xs">
          <div className="flex items-center justify-between text-wbk-brown mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Category Links</span>
            <IconFolder size={18} className="text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-wbk-black">
            {items.filter((i) => i.type === "category" || i.category_id).length}
          </div>
          <span className="text-[11px] text-wbk-brown mt-1 block">Linked to catalog categories</span>
        </div>
      </div>

      {/* Live Storefront Menu Preview */}
      <div className="bg-white border border-wbk-lightgrey/80 p-5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider font-semibold text-wbk-black flex items-center gap-2">
            <span>Live Header Menu Preview (Customer View)</span>
          </span>
          <span className="text-[11px] text-wbk-brown">
            {visibleItems.length} active tabs displayed in order
          </span>
        </div>

        <div className="p-3 bg-[#FAF8F5] border border-wbk-lightgrey rounded-md">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1">
            {visibleItems.length === 0 ? (
              <span className="text-xs text-amber-600 italic">
                No items are currently visible. All tabs are hidden!
              </span>
            ) : (
              visibleItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="px-3.5 py-1.5 bg-white border border-wbk-lightgrey/90 text-xs font-medium uppercase tracking-[0.1em] text-wbk-black shrink-0 flex items-center gap-2 shadow-2xs"
                >
                  <span>{item.title}</span>
                  {item.has_submenu && (
                    <span className="text-[9px] px-1 bg-gray-100 text-gray-500 rounded font-mono">
                      mega
                    </span>
                  )}
                  {item.badge && (
                    <span className="text-[9px] px-1 bg-amber-100 text-amber-800 rounded font-semibold">
                      {item.badge}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Menu Items Management Table */}
      <div className="bg-white border border-wbk-lightgrey/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-wbk-lightgrey/60 flex items-center justify-between">
          <div>
            <h3 className="font-poppins text-base font-semibold text-wbk-black">
              Header Navigation Items
            </h3>
            <p className="text-xs text-wbk-brown mt-0.5">
              Use the arrows to reorder tabs. Click the eye icon to show or hide items on the live website.
            </p>
          </div>
          {hasUnsavedChanges && (
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 animate-pulse">
              ● Unsaved changes in menu order / visibility
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center text-wbk-brown">
            <IconLoader2 size={24} className="animate-spin mx-auto mb-2 text-wbk-gold" />
            <span className="text-xs">Loading navigation configuration...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm text-wbk-brown">No navigation items configured yet.</p>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-wbk-black text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-wbk-gold hover:text-wbk-black transition-colors"
            >
              Add First Menu Item
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-wbk-lightgrey text-[11px] uppercase tracking-wider text-wbk-brown font-semibold">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Order</th>
                  <th className="py-3 px-4">Menu Title</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Destination Link</th>
                  <th className="py-3 px-4 text-center">Submenu</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wbk-lightgrey/60 font-poppins">
                {items.map((item, index) => {
                  const isVisible = item.is_visible !== false;
                  const isCategory = item.type === "category" || Boolean(item.category_id);
                  const linkedCategory = categories.find(
                    (c) => c.id === item.category_id || c.slug === item.slug
                  );

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#FAF8F5]/80 transition-colors ${
                        !isVisible ? "opacity-60 bg-gray-50/50" : ""
                      }`}
                    >
                      {/* Order and Move Controls */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1 font-mono text-xs">
                          <span className="w-4 text-wbk-brown font-semibold">{index + 1}</span>
                          <div className="flex flex-col">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleMoveUp(index)}
                              className="p-0.5 text-wbk-brown hover:text-wbk-black disabled:opacity-20 transition-colors"
                              title="Move tab up"
                            >
                              <IconArrowUp size={12} />
                            </button>
                            <button
                              type="button"
                              disabled={index === items.length - 1}
                              onClick={() => handleMoveDown(index)}
                              className="p-0.5 text-wbk-brown hover:text-wbk-black disabled:opacity-20 transition-colors"
                              title="Move tab down"
                            >
                              <IconArrowDown size={12} />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-wbk-black text-xs sm:text-sm">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {isCategory && linkedCategory && (
                          <span className="text-[10px] text-wbk-brown block mt-0.5">
                            Category: {linkedCategory.name || linkedCategory.title}
                          </span>
                        )}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-4">
                        {isCategory ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-blue-50 text-blue-800 border border-blue-200">
                            <IconFolder size={11} />
                            <span>Category</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-purple-50 text-purple-800 border border-purple-200">
                            <IconLink size={11} />
                            <span>Custom Link</span>
                          </span>
                        )}
                      </td>

                      {/* Target Link */}
                      <td className="py-3.5 px-4">
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[11px] text-wbk-brown hover:text-wbk-black hover:underline flex items-center gap-1"
                        >
                          <span>{item.href}</span>
                          <IconExternalLink size={11} className="shrink-0" />
                        </a>
                      </td>

                      {/* Submenu Mega-Menu Indicator */}
                      <td className="py-3.5 px-4 text-center">
                        {item.has_submenu ? (
                          <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                            Mega Menu Active
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px]">
                            Direct Link
                          </span>
                        )}
                      </td>

                      {/* Visibility Switch */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(item.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wider transition-colors cursor-pointer ${
                            isVisible
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200"
                              : "bg-gray-200 text-gray-700 border border-gray-300 hover:bg-gray-300"
                          }`}
                          title={isVisible ? "Click to hide from store" : "Click to show on store"}
                        >
                          {isVisible ? (
                            <>
                              <IconEye size={12} className="text-emerald-700" />
                              <span>Visible</span>
                            </>
                          ) : (
                            <>
                              <IconEyeOff size={12} className="text-gray-600" />
                              <span>Hidden</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-wbk-brown hover:text-wbk-black hover:bg-gray-100 rounded transition-colors"
                            title="Edit menu item details"
                          >
                            <IconEdit size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id, item.title)}
                            className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Delete menu item"
                          >
                            <IconTrash size={15} />
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

      {/* Edit / Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full border border-wbk-lightgrey shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-[#090A0A] text-white p-4 px-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-semibold text-wbk-gold tracking-widest block">
                  Storefront Navigation
                </span>
                <h3 className="font-poppins text-base font-semibold text-white">
                  {editingItem ? `Edit: ${editingItem.title}` : "Add New Menu Item"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <IconX size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs font-poppins">
              {/* Type Selection */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                  Menu Item Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2 p-3 border cursor-pointer select-none rounded transition-colors ${
                      formState.type === "category"
                        ? "border-wbk-gold bg-amber-50/50 text-wbk-black font-semibold"
                        : "border-wbk-lightgrey text-wbk-brown hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="itemType"
                      value="category"
                      checked={formState.type === "category"}
                      onChange={() => {
                        setFormState((prev) => ({
                          ...prev,
                          type: "category",
                          category_id: categories[0]?.id || "",
                          slug: categories[0]?.slug || categories[0]?.id || "",
                          href: `/products/${categories[0]?.slug || categories[0]?.id || "beds"}`,
                        }));
                      }}
                      className="text-wbk-gold focus:ring-wbk-gold"
                    />
                    <IconFolder size={16} />
                    <span>Catalog Category</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-3 border cursor-pointer select-none rounded transition-colors ${
                      formState.type === "custom"
                        ? "border-wbk-gold bg-amber-50/50 text-wbk-black font-semibold"
                        : "border-wbk-lightgrey text-wbk-brown hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="itemType"
                      value="custom"
                      checked={formState.type === "custom"}
                      onChange={() => {
                        setFormState((prev) => ({
                          ...prev,
                          type: "custom",
                          category_id: "",
                          has_submenu: false,
                        }));
                      }}
                      className="text-wbk-gold focus:ring-wbk-gold"
                    />
                    <IconLink size={16} />
                    <span>Custom Link / Page</span>
                  </label>
                </div>
              </div>

              {/* Category Picker (if category type) */}
              {formState.type === "category" && (
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1">
                    Select Target Category
                  </label>
                  <select
                    value={formState.category_id}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-wbk-lightgrey bg-white text-xs text-wbk-black focus:border-wbk-black focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id || c.slug} value={c.id || c.slug}>
                        {c.name || c.title} ({c.slug || c.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Title Input */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1">
                  Menu Display Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wall Beds, Sofas, 3D Configurator"
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  className="w-full px-3 py-2 border border-wbk-lightgrey bg-white text-xs text-wbk-black focus:border-wbk-black focus:outline-none"
                />
              </div>

              {/* URL / Path Input */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1">
                  Destination URL / Path
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. /products/beds or /configurator"
                  value={formState.href}
                  onChange={(e) => setFormState({ ...formState, href: e.target.value })}
                  className="w-full px-3 py-2 border border-wbk-lightgrey bg-white text-xs font-mono text-wbk-black focus:border-wbk-black focus:outline-none"
                />
              </div>

              {/* Badge Input */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1">
                  Optional Badge / Tag (e.g. NEW, SALE)
                </label>
                <input
                  type="text"
                  placeholder="Leave empty if none"
                  value={formState.badge}
                  onChange={(e) => setFormState({ ...formState, badge: e.target.value })}
                  className="w-full px-3 py-2 border border-wbk-lightgrey bg-white text-xs text-wbk-black focus:border-wbk-black focus:outline-none"
                />
              </div>

              {/* Checkboxes: Submenu and Visibility */}
              <div className="pt-2 border-t border-wbk-lightgrey/60 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formState.has_submenu}
                    onChange={(e) => setFormState({ ...formState, has_submenu: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-wbk-gold focus:ring-wbk-gold"
                  />
                  <span className="text-xs font-medium text-wbk-black">
                    Enable Mega-Menu Submenu Dropdown (for categories with photo catalogs)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formState.is_visible}
                    onChange={(e) => setFormState({ ...formState, is_visible: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-wbk-gold focus:ring-wbk-gold"
                  />
                  <span className="text-xs font-medium text-wbk-black">
                    Visible immediately in header on the storefront
                  </span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-wbk-lightgrey/60">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-wbk-lightgrey text-wbk-black text-xs font-semibold uppercase tracking-wider hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-wbk-black hover:bg-wbk-gold hover:text-wbk-black text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
                >
                  {editingItem ? "Update Item" : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
