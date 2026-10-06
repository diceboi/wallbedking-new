"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconExternalLink,
  IconRefresh,
  IconEye,
  IconEyeOff,
  IconAlertCircle,
  IconCheck,
  IconTag,
  IconX,
  IconAdjustments,
  IconDownload,
  IconFileSpreadsheet,
  IconWorld,
  IconArrowUp,
  IconArrowDown,
  IconArrowsSort,
  IconCopy,
} from "@tabler/icons-react";
import { ProductEditDrawer } from "@/components/admin/ProductEditDrawer";
import { BulkProductEditModal } from "@/components/admin/BulkProductEditModal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PRODUCT_EXPORT_COLUMNS, generateCsvContent, generateTsvContent } from "@/lib/product-export";

const CATEGORIES = [
  { id: "all", label: "All Categories" },
  { id: "beds", label: "Murphy Beds" },
  { id: "sofas", label: "Sofas" },
  { id: "tables", label: "Tables & Desks" },
  { id: "mattresses", label: "Mattresses" },
  { id: "cabinets", label: "Cabinets" },
  { id: "extras", label: "Extras & Accessories" },
];

const ORIENTATIONS = [
  { id: "all", label: "All Orientations" },
  { id: "Vertical", label: "Vertical" },
  { id: "Horizontal", label: "Horizontal" },
];

const TARGET_MARKETS = [
  { id: "all", label: "All Markets", flag: "🌍" },
  { id: "en", label: "UK (en)", flag: "🇬🇧" },
  { id: "us", label: "US (us)", flag: "🇺🇸" },
  { id: "de", label: "DE (de)", flag: "🇩🇪" },
  { id: "fr", label: "FR (fr)", flag: "🇫🇷" },
  { id: "es", label: "ES (es)", flag: "🇪🇸" },
  { id: "por", label: "POR (por)", flag: "🇵🇹" },
  { id: "it", label: "IT (it)", flag: "🇮🇹" },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedOrientation, setSelectedOrientation] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedMarket, setSelectedMarket] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Export state
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Bulk operations state
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  // Dynamic taxonomy state
  const [categoriesList, setCategoriesList] = useState([]);
  const [tagsList, setTagsList] = useState([]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("beds");
  const [newProductPrice, setNewProductPrice] = useState(799);
  const [newProductSku, setNewProductSku] = useState("");
  const [newProductWeight, setNewProductWeight] = useState("");
  const [newProductEan, setNewProductEan] = useState("");
  const [newProductType, setNewProductType] = useState("Classic");
  const [newProductOrientation, setNewProductOrientation] = useState("Vertical");
  const [newProductWidth, setNewProductWidth] = useState("");
  const [newProductLength, setNewProductLength] = useState("");
  const [newProductTags, setNewProductTags] = useState([]);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchTaxonomy();

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("action") === "export") {
        setIsExportOpen(true);
      }
    }
  }, []);

  const fetchTaxonomy = async () => {
    try {
      const [catRes, tagRes] = await Promise.all([
        fetch("/api/admin/categories"),
        fetch("/api/admin/tags"),
      ]);
      const catData = await catRes.json();
      const tagData = await tagRes.json();
      if (catData.success && Array.isArray(catData.categories)) {
        setCategoriesList(catData.categories);
      }
      if (tagData.success && Array.isArray(tagData.tags)) {
        setTagsList(tagData.tags);
      }
    } catch (e) {
      console.warn("Could not load taxonomy:", e);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products?limit=1000");
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load products from database." });
    } finally {
      setLoading(false);
    }
  };


  // Sorting handlers
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key !== key) {
        return { key, direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { key, direction: "desc" };
      }
      return { key: null, direction: "asc" };
    });
  };

  const handleResetSort = () => {
    setSortConfig({ key: null, direction: "asc" });
  };

  const getSortLabel = (key) => {
    switch (key) {
      case "id": return "ID";
      case "name": return "Product Name";
      case "category": return "Category";
      case "size": return "Size";
      case "price_gbp": return "Price GBP (£)";
      case "price_euro": return "Price EUR (€)";
      case "price_usd": return "Price USD ($)";
      case "stock": return "Stock";
      case "visibility": return "Visibility";
      default: return key;
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === "all" ||
        p.parent_category === selectedCategory ||
        (p.parent_category && p.parent_category.toLowerCase() === selectedCategory.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(selectedCategory.toLowerCase()));
      const matchesOrientation =
        selectedOrientation === "all" || p.orientation === selectedOrientation;
      const matchesTag =
        selectedTag === "all" ||
        (Array.isArray(p.tags) && p.tags.includes(selectedTag));
      const matchesMarket =
        selectedMarket === "all" ||
        (Array.isArray(p.available_locales) && p.available_locales.length > 0
          ? p.available_locales.includes(selectedMarket)
          : true);

      const q = search.trim().toLowerCase();
      if (!q) return matchesCategory && matchesOrientation && matchesTag && matchesMarket;

      const matchesSearch =
        String(p.id).includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.name_en && p.name_en.toLowerCase().includes(q)) ||
        (p.name_us && p.name_us.toLowerCase().includes(q)) ||
        (p.name_de && p.name_de.toLowerCase().includes(q)) ||
        (p.name_fr && p.name_fr.toLowerCase().includes(q)) ||
        (p.name_es && p.name_es.toLowerCase().includes(q)) ||
        (p.name_por && p.name_por.toLowerCase().includes(q)) ||
        (p.name_it && p.name_it.toLowerCase().includes(q)) ||
        (p.slug && p.slug.toLowerCase().includes(q)) ||
        (p.gtin_en && p.gtin_en.toLowerCase().includes(q)) ||
        (p.gtin_us && p.gtin_us.toLowerCase().includes(q)) ||
        (p.gtin_de && p.gtin_de.toLowerCase().includes(q)) ||
        (p.gtin_fr && p.gtin_fr.toLowerCase().includes(q)) ||
        (p.gtin_es && p.gtin_es.toLowerCase().includes(q)) ||
        (p.gtin_por && p.gtin_por.toLowerCase().includes(q)) ||
        (p.gtin_it && p.gtin_it.toLowerCase().includes(q)) ||
        (p.ean && p.ean.toLowerCase().includes(q)) ||
        (p.ean_uk && p.ean_uk.toLowerCase().includes(q)) ||
        (p.ean_us && p.ean_us.toLowerCase().includes(q)) ||
        (p.ean_de && p.ean_de.toLowerCase().includes(q)) ||
        (p.ean_fr && p.ean_fr.toLowerCase().includes(q)) ||
        (p.ean_es && p.ean_es.toLowerCase().includes(q)) ||
        (p.ean_it && p.ean_it.toLowerCase().includes(q)) ||
        (p.ean_pt && p.ean_pt.toLowerCase().includes(q)) ||
        (Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(q)));

      return matchesCategory && matchesOrientation && matchesTag && matchesMarket && matchesSearch;
    });
  }, [products, selectedCategory, selectedOrientation, selectedTag, selectedMarket, search]);

  // Apply column sorting to filtered products
  const sortedProducts = useMemo(() => {
    let result = [...filteredProducts];
    if (!sortConfig.key) return result;

    const { key, direction } = sortConfig;
    const mult = direction === "asc" ? 1 : -1;

    result.sort((a, b) => {
      if (key === "id") {
        return ((Number(a.id) || 0) - (Number(b.id) || 0)) * mult;
      }
      if (key === "name") {
        const cmp = (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });
        return (cmp !== 0 ? cmp : ((Number(a.id) || 0) - (Number(b.id) || 0))) * mult;
      }
      if (key === "category") {
        // If already filtered to a category, sort by subcategory / type / model name
        const catA = (selectedCategory !== "all" ? (a.sub_category || a.category || a.name || "") : (a.parent_category || ""));
        const catB = (selectedCategory !== "all" ? (b.sub_category || b.category || b.name || "") : (b.parent_category || ""));
        const cmp = catA.localeCompare(catB, undefined, { sensitivity: "base" });
        return (cmp !== 0 ? cmp : ((Number(a.id) || 0) - (Number(b.id) || 0))) * mult;
      }
      if (key === "size") {
        const areaA = (Number(a.width) || 0) * (Number(a.length) || 0);
        const areaB = (Number(b.width) || 0) * (Number(b.length) || 0);
        if (areaA !== areaB) return (areaA - areaB) * mult;
        if ((Number(a.width) || 0) !== (Number(b.width) || 0)) {
          return ((Number(a.width) || 0) - (Number(b.width) || 0)) * mult;
        }
        return ((Number(a.id) || 0) - (Number(b.id) || 0)) * mult;
      }
      if (key === "price_gbp") {
        const pA = Number(a.sale_price_gbp || a.price_gbp || 0);
        const pB = Number(b.sale_price_gbp || b.price_gbp || 0);
        if (pA !== pB) return (pA - pB) * mult;
        return ((Number(a.id) || 0) - (Number(b.id) || 0)) * mult;
      }
      if (key === "price_euro") {
        const pA = Number(a.sale_price_euro || a.price_euro || 0);
        const pB = Number(b.sale_price_euro || b.price_euro || 0);
        if (pA !== pB) return (pA - pB) * mult;
        return ((Number(a.id) || 0) - (Number(b.id) || 0)) * mult;
      }
      if (key === "price_usd") {
        const pA = Number(a.sale_price_usd || a.price_usd || 0);
        const pB = Number(b.sale_price_usd || b.price_usd || 0);
        if (pA !== pB) return (pA - pB) * mult;
        return ((Number(a.id) || 0) - (Number(b.id) || 0)) * mult;
      }
      if (key === "stock") {
        const sA = Number(a.stock) ?? 100;
        const sB = Number(b.stock) ?? 100;
        if (sA !== sB) return (sA - sB) * mult;
        return ((Number(a.id) || 0) - (Number(b.id) || 0)) * mult;
      }
      if (key === "visibility") {
        const vA = a.visibility || "Visible";
        const vB = b.visibility || "Visible";
        const cmp = vA.localeCompare(vB);
        return (cmp !== 0 ? cmp : ((Number(a.id) || 0) - (Number(b.id) || 0))) * mult;
      }
      return 0;
    });

    return result;
  }, [filteredProducts, sortConfig, selectedCategory]);

  // Export handlers
  const handleExportCSV = (target = "filtered") => {
    let exportItems = [];
    if (target === "selected" && selectedIds.length > 0) {
      exportItems = products.filter((p) => selectedIds.includes(p.id));
    } else if (target === "all") {
      exportItems = [...products];
    } else {
      exportItems = [...sortedProducts];
    }

    if (exportItems.length === 0) {
      alert("No products to export.");
      return;
    }

    const csvContent = generateCsvContent(exportItems, PRODUCT_EXPORT_COLUMNS);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `wallbedking-products-${target}-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setMessage({
      type: "success",
      text: `Exported ${exportItems.length} products to CSV with all ${PRODUCT_EXPORT_COLUMNS.length} columns (Excel & Google Sheets compatible)!`,
    });
    setIsExportOpen(false);
    setTimeout(() => setMessage(null), 4000);
  };

  const handleCopyForGoogleSheets = (target = "filtered") => {
    let exportItems = [];
    if (target === "selected" && selectedIds.length > 0) {
      exportItems = products.filter((p) => selectedIds.includes(p.id));
    } else if (target === "all") {
      exportItems = [...products];
    } else {
      exportItems = [...sortedProducts];
    }

    if (exportItems.length === 0) {
      alert("No products to copy.");
      return;
    }

    const fullTsv = generateTsvContent(exportItems, PRODUCT_EXPORT_COLUMNS);

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(fullTsv)
        .then(() => {
          setMessage({
            type: "success",
            text: `Copied ${exportItems.length} products (${PRODUCT_EXPORT_COLUMNS.length} columns) to clipboard! Just paste (Ctrl+V) into Google Sheets or Excel.`,
          });
          setIsExportOpen(false);
          setTimeout(() => setMessage(null), 5000);
        })
        .catch(() => {
          alert("Clipboard copy failed. Please use Download CSV instead.");
        });
    } else {
      alert("Clipboard access is not available. Please use Download CSV.");
    }
  };

  // Bulk selection handlers
  const toggleSelectProduct = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = sortedProducts.map((p) => p.id);
    const allSelected =
      filteredIds.length > 0 && filteredIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };
  const handleSelectAll = handleSelectAllFiltered;

  const handleBulkQuickVisibility = async (vis) => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedIds,
          action: "update",
          updates: { visibility: vis },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) =>
            selectedIds.includes(p.id) ? { ...p, visibility: vis } : p
          )
        );
        setMessage({
          type: "success",
          text: `Updated visibility to "${vis}" for ${selectedIds.length} products.`,
        });
        setSelectedIds([]);
        setTimeout(() => setMessage(null), 3500);
      }
    } catch (err) {
      alert("Error setting visibility");
    }
  };

  const handleBulkDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to permanently delete all ${selectedIds.length} selected products?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedIds,
          action: "delete",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
        setMessage({
          type: "success",
          text: `Successfully deleted ${selectedIds.length} products.`,
        });
        setSelectedIds([]);
        setTimeout(() => setMessage(null), 3500);
      } else {
        alert(data.error || "Failed to delete products.");
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  const handleBulkUpdateSuccess = (result) => {
    const updatedMap = new Map();
    if (Array.isArray(result.products)) {
      result.products.forEach((p) => updatedMap.set(p.id, p));
    }

    setProducts((prev) =>
      prev.map((p) => (updatedMap.has(p.id) ? { ...p, ...updatedMap.get(p.id) } : p))
    );

    setMessage({
      type: "success",
      text: `Bulk edit complete! Updated ${result.updatedCount || selectedIds.length} products.`,
    });
    setSelectedIds([]);
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSaveSuccess = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p))
    );
    setMessage({ type: "success", text: `"${updatedProduct.name}" updated successfully in Supabase & Catalog!` });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}" (ID: #${id}) from Supabase?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setMessage({ type: "success", text: `"${name}" removed from database and storefront catalog.` });
        setTimeout(() => setMessage(null), 3000);
      } else {
        alert(data.error || "Failed to delete product.");
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  const handleToggleVisibility = async (product) => {
    const newVis = product.visibility === "Hidden" ? "Visible" : "Hidden";
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: newVis }),
      });
      const data = await res.json();
      if (data.success) {
        handleSaveSuccess({ ...product, visibility: newVis });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProductName.trim()) return;
    setAdding(true);

    const slug = newProductName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const newProduct = {
      name: newProductName.trim(),
      slug,
      sku: newProductSku.trim() || null,
      weight: newProductWeight ? Number(newProductWeight) : null,
      ean: newProductEan.trim() || null,
      parent_category: newProductCategory,
      price_gbp: Number(newProductPrice),
      price_euro: Number(newProductPrice),
      price_usd: Number(newProductPrice),
      stock: 100,
      visibility: "Visible",
      orientation: newProductOrientation,
      type: newProductType,
      width: newProductWidth ? Number(newProductWidth) : null,
      length: newProductLength ? Number(newProductLength) : null,
      tags: newProductTags,
    };

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
      const data = await res.json();
      if (data.success && data.product) {
        setProducts((prev) => [data.product, ...prev]);
        setIsAddOpen(false);
        setNewProductName("");
        setNewProductSku("");
        setNewProductWeight("");
        setNewProductEan("");
        setNewProductWidth("");
        setNewProductLength("");
        setNewProductTags([]);
        setNewProductType("Classic");
        setNewProductOrientation("Vertical");
        setMessage({ type: "success", text: "Product created & synced to storefront catalog!" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        alert(data.error || "Error creating product.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6 font-poppins">
      {/* Page Header */}
      <AdminPageHeader
        badge="Catalog & Inventory"
        title="Product Management"
        count={products.length}
        description="Live catalog and inventory management directly from Supabase database"
        actions={
          <>

            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-wbk-lightgrey hover:border-wbk-black text-wbk-black text-xs font-semibold uppercase tracking-wider rounded-full transition-all shadow-xs cursor-pointer"
              title="Export database products to CSV, Excel, or Google Sheets"
            >
              <IconFileSpreadsheet size={15} className="text-emerald-700" />
              <span>Export</span>
            </button>

            <button
              type="button"
              onClick={fetchProducts}
              disabled={loading}
              className="p-2.5 bg-white border border-wbk-lightgrey hover:border-wbk-black text-wbk-black rounded-full transition-colors cursor-pointer"
              title="Refresh database records"
            >
              <IconRefresh size={16} className={loading ? "animate-spin" : ""} />
            </button>

            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-wbk-black hover:bg-wbk-gold hover:text-wbk-black text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-all shadow-sm cursor-pointer"
            >
              <IconPlus size={16} />
              <span>Add Product</span>
            </button>
          </>
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
          {message.type === "success" ? (
            <IconCheck size={16} />
          ) : (
            <IconAlertCircle size={16} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 border border-wbk-lightgrey/60 shadow-xs space-y-4">
        {/* Category tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {(() => {
            const allCats = [
              { id: "all", label: "All Categories" },
              ...categoriesList.map((c) => ({ id: c.id, label: c.name || c.title })),
            ];
            // If categoriesList is not yet loaded, use static fallback
            const displayCats = allCats.length > 1 ? allCats : CATEGORIES;

            return displayCats.map((c) => {
              const isSelected = selectedCategory === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider rounded-full transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-wbk-black text-white"
                      : "bg-[#F4F2F0] text-wbk-brown hover:text-wbk-black"
                  }`}
                >
                  {c.label}
                </button>
              );
            });
          })()}
        </div>

        {/* Orientation, Tag & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Orientation */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-wbk-brown uppercase font-medium">Orientation:</span>
              <div className="flex items-center gap-1">
                {ORIENTATIONS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setSelectedOrientation(o.id)}
                    className={`px-3 py-1 text-xs rounded-none border transition-colors cursor-pointer ${
                      selectedOrientation === o.id
                        ? "border-wbk-black bg-wbk-black text-white font-medium"
                        : "border-wbk-lightgrey bg-white text-wbk-brown hover:text-wbk-black"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tag Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-wbk-brown uppercase font-medium flex items-center gap-1">
                <IconTag size={13} className="text-wbk-gold" />
                <span>Tag:</span>
              </span>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="text-xs bg-[#FBF9F8] border border-wbk-lightgrey px-2.5 py-1 text-wbk-black rounded-none focus:outline-none"
              >
                <option value="all">All Tags ({tagsList.length})</option>
                {tagsList.map((tag) => (
                  <option key={tag.id} value={tag.id || tag.slug}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Market / Country Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-wbk-brown uppercase font-medium flex items-center gap-1">
                <IconWorld size={13} className="text-wbk-gold" />
                <span>Market:</span>
              </span>
              <select
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                className="text-xs bg-[#FBF9F8] border border-wbk-lightgrey px-2.5 py-1 text-wbk-black rounded-none focus:outline-none"
              >
                {TARGET_MARKETS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.flag} {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative w-full sm:w-80">
            <IconSearch
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-wbk-brown"
            />
            <input
              type="text"
              placeholder="Search name, SKU, tag, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FBF9F8] border border-wbk-lightgrey text-xs text-wbk-black rounded-none focus:outline-none focus:border-wbk-black"
            />
          </div>
        </div>
      </div>

      {/* Product Table Count Info & Bulk Trigger */}
      <div className="flex items-center justify-between text-xs text-wbk-brown px-1">
        <div className="flex items-center gap-3">
          <span>
            Showing <strong>{sortedProducts.length}</strong> of{" "}
            <strong>{products.length}</strong> products.
          </span>
          {selectedIds.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-wbk-gold text-wbk-black font-semibold text-[11px]">
              {selectedIds.length} selected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setIsBulkOpen(true)}
              className="flex items-center gap-1 px-3 py-1 bg-wbk-black text-white hover:bg-wbk-gold hover:text-wbk-black text-xs font-semibold uppercase tracking-wider rounded-full transition-all shadow-xs cursor-pointer"
            >
              <IconAdjustments size={13} />
              <span>Bulk Edit ({selectedIds.length})</span>
            </button>
          )}
          <span className="text-[11px] text-wbk-brown/70 italic hidden sm:inline">
            Check boxes on rows to bulk edit parameters. Click table headers to sort.
          </span>
        </div>
      </div>

      {/* Active Sort & Category Filter Indicator Banner */}
      {(sortConfig.key || selectedCategory !== "all") && (
        <div className="flex items-center justify-between bg-amber-50/90 border border-amber-200/90 px-4 py-2 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-3 flex-wrap">
            {selectedCategory !== "all" && (
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-wbk-black">Category Filter:</span>
                <span className="font-bold text-wbk-black px-2 py-0.5 bg-white border border-amber-300">
                  {categoriesList.find((c) => c.id === selectedCategory)?.name ||
                    CATEGORIES.find((c) => c.id === selectedCategory)?.label ||
                    selectedCategory}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className="text-[10px] text-wbk-brown hover:text-red-700 underline font-medium cursor-pointer"
                  title="Clear Category Filter"
                >
                  Clear
                </button>
              </div>
            )}

            {sortConfig.key && (
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-wbk-black">Active Sort:</span>
                <span className="font-bold text-wbk-black px-2 py-0.5 bg-white border border-amber-300">
                  {getSortLabel(sortConfig.key)}
                </span>
                <span className="text-[11px] font-semibold text-wbk-brown">
                  {sortConfig.direction === "asc"
                    ? "Ascending (A-Z, 0-9 ↑)"
                    : "Descending (Z-A, 9-0 ↓)"}
                </span>
                <button
                  type="button"
                  onClick={handleResetSort}
                  className="text-[10px] text-wbk-brown hover:text-red-700 underline font-medium cursor-pointer"
                  title="Reset Column Sort"
                >
                  Reset Sort
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              handleResetSort();
              setSelectedCategory("all");
            }}
            className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-wbk-black hover:text-white text-wbk-black text-xs font-semibold uppercase tracking-wider border border-amber-300 transition-all cursor-pointer shadow-2xs shrink-0"
            title="Reset both category filters and sorting to default order"
          >
            <IconX size={13} />
            <span>Reset All</span>
          </button>
        </div>
      )}

      {/* Interactive Products Table */}
      <div className="bg-white border border-wbk-lightgrey/60 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-poppins">
          <thead>
            <tr className="bg-[#F4F2F0] border-b border-wbk-lightgrey text-wbk-black uppercase tracking-wider text-[10px] font-semibold select-none">
              <th className="py-3 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={
                    sortedProducts.length > 0 &&
                    sortedProducts.every((p) => selectedIds.includes(p.id))
                  }
                  onChange={handleSelectAllFiltered}
                  className="accent-wbk-gold w-4 h-4 cursor-pointer"
                  title="Select / Deselect all filtered products"
                />
              </th>
              
              {/* ID */}
              <th
                onClick={() => handleSort("id")}
                className={`py-3 px-3 w-16 cursor-pointer hover:bg-[#EAE7E4] transition-colors group select-none ${
                  sortConfig.key === "id" ? "bg-amber-100/70 font-bold" : ""
                }`}
                title="Click to sort by ID (ascending / descending)"
              >
                <div className="flex items-center gap-1">
                  <span>ID</span>
                  {sortConfig.key === "id" ? (
                    sortConfig.direction === "asc" ? (
                      <IconArrowUp size={13} className="text-wbk-gold stroke-[2.5]" />
                    ) : (
                      <IconArrowDown size={13} className="text-wbk-gold stroke-[2.5]" />
                    )
                  ) : (
                    <IconArrowsSort size={12} className="opacity-0 group-hover:opacity-40 text-wbk-brown transition-opacity" />
                  )}
                </div>
              </th>

              {/* Image */}
              <th className="py-3 px-3 w-16">Image</th>

              {/* Name */}
              <th
                onClick={() => handleSort("name")}
                className={`py-3 px-4 min-w-[200px] cursor-pointer hover:bg-[#EAE7E4] transition-colors group select-none ${
                  sortConfig.key === "name" ? "bg-amber-100/70 font-bold" : ""
                }`}
                title="Click to sort by Product Name (A-Z / Z-A)"
              >
                <div className="flex items-center gap-1">
                  <span>Product Name & Tags</span>
                  {sortConfig.key === "name" ? (
                    sortConfig.direction === "asc" ? (
                      <IconArrowUp size={13} className="text-wbk-gold stroke-[2.5]" />
                    ) : (
                      <IconArrowDown size={13} className="text-wbk-gold stroke-[2.5]" />
                    )
                  ) : (
                    <IconArrowsSort size={12} className="opacity-0 group-hover:opacity-40 text-wbk-brown transition-opacity" />
                  )}
                </div>
              </th>

              {/* Category */}
              <th
                className={`py-2 px-3 transition-colors group select-none ${
                  sortConfig.key === "category" || selectedCategory !== "all"
                    ? "bg-amber-100/70 font-bold"
                    : "hover:bg-[#EAE7E4]"
                }`}
              >
                <div className="flex flex-col gap-1">
                  <div
                    onClick={() => handleSort("category")}
                    className="flex items-center gap-1 cursor-pointer"
                    title="Click to sort by Category / Subcategory"
                  >
                    <span>Category</span>
                    {sortConfig.key === "category" ? (
                      sortConfig.direction === "asc" ? (
                        <IconArrowUp size={13} className="text-wbk-gold stroke-[2.5]" />
                      ) : (
                        <IconArrowDown size={13} className="text-wbk-gold stroke-[2.5]" />
                      )
                    ) : (
                      <IconArrowsSort size={12} className="opacity-0 group-hover:opacity-40 text-wbk-brown transition-opacity" />
                    )}
                  </div>
                  {/* Category Filter selector in column header */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[9px] py-0.5 px-1 bg-white border border-wbk-lightgrey font-normal normal-case cursor-pointer focus:outline-none focus:border-wbk-black max-w-[110px]"
                    title="Filter list by Category"
                  >
                    <option value="all">All ({products.length})</option>
                    {(categoriesList.length > 0 ? categoriesList : CATEGORIES.slice(1)).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name || c.title || c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </th>

              {/* Size */}
              <th
                onClick={() => handleSort("size")}
                className={`py-3 px-3 cursor-pointer hover:bg-[#EAE7E4] transition-colors group select-none ${
                  sortConfig.key === "size" ? "bg-amber-100/70 font-bold" : ""
                }`}
                title="Click to sort by Size (by surface area and dimensions)"
              >
                <div className="flex items-center gap-1">
                  <span>Size</span>
                  {sortConfig.key === "size" ? (
                    sortConfig.direction === "asc" ? (
                      <IconArrowUp size={13} className="text-wbk-gold stroke-[2.5]" />
                    ) : (
                      <IconArrowDown size={13} className="text-wbk-gold stroke-[2.5]" />
                    )
                  ) : (
                    <IconArrowsSort size={12} className="opacity-0 group-hover:opacity-40 text-wbk-brown transition-opacity" />
                  )}
                </div>
              </th>

              {/* Price (GBP) */}
              <th
                onClick={() => handleSort("price_gbp")}
                className={`py-3 px-3 cursor-pointer hover:bg-[#EAE7E4] transition-colors group select-none ${
                  sortConfig.key === "price_gbp" ? "bg-amber-100/70 font-bold" : ""
                }`}
                title="Click to sort by GBP price (£)"
              >
                <div className="flex items-center gap-1">
                  <span>Price (GBP)</span>
                  {sortConfig.key === "price_gbp" ? (
                    sortConfig.direction === "asc" ? (
                      <IconArrowUp size={13} className="text-wbk-gold stroke-[2.5]" />
                    ) : (
                      <IconArrowDown size={13} className="text-wbk-gold stroke-[2.5]" />
                    )
                  ) : (
                    <IconArrowsSort size={12} className="opacity-0 group-hover:opacity-40 text-wbk-brown transition-opacity" />
                  )}
                </div>
              </th>

              {/* Price (EUR) */}
              <th
                onClick={() => handleSort("price_euro")}
                className={`py-3 px-3 cursor-pointer hover:bg-[#EAE7E4] transition-colors group select-none ${
                  sortConfig.key === "price_euro" ? "bg-amber-100/70 font-bold" : ""
                }`}
                title="Click to sort by EUR price (€)"
              >
                <div className="flex items-center gap-1">
                  <span>Price (EUR)</span>
                  {sortConfig.key === "price_euro" ? (
                    sortConfig.direction === "asc" ? (
                      <IconArrowUp size={13} className="text-wbk-gold stroke-[2.5]" />
                    ) : (
                      <IconArrowDown size={13} className="text-wbk-gold stroke-[2.5]" />
                    )
                  ) : (
                    <IconArrowsSort size={12} className="opacity-0 group-hover:opacity-40 text-wbk-brown transition-opacity" />
                  )}
                </div>
              </th>

              {/* Price (USD) */}
              <th
                onClick={() => handleSort("price_usd")}
                className={`py-3 px-3 cursor-pointer hover:bg-[#EAE7E4] transition-colors group select-none ${
                  sortConfig.key === "price_usd" ? "bg-amber-100/70 font-bold" : ""
                }`}
                title="Click to sort by USD price ($)"
              >
                <div className="flex items-center gap-1">
                  <span>Price (USD)</span>
                  {sortConfig.key === "price_usd" ? (
                    sortConfig.direction === "asc" ? (
                      <IconArrowUp size={13} className="text-wbk-gold stroke-[2.5]" />
                    ) : (
                      <IconArrowDown size={13} className="text-wbk-gold stroke-[2.5]" />
                    )
                  ) : (
                    <IconArrowsSort size={12} className="opacity-0 group-hover:opacity-40 text-wbk-brown transition-opacity" />
                  )}
                </div>
              </th>

              {/* Sale */}
              <th className="py-3 px-3 text-center">Sale</th>

              {/* Stock */}
              <th
                onClick={() => handleSort("stock")}
                className={`py-3 px-3 text-center cursor-pointer hover:bg-[#EAE7E4] transition-colors group select-none ${
                  sortConfig.key === "stock" ? "bg-amber-100/70 font-bold" : ""
                }`}
                title="Click to sort by Stock quantity"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Stock</span>
                  {sortConfig.key === "stock" ? (
                    sortConfig.direction === "asc" ? (
                      <IconArrowUp size={13} className="text-wbk-gold stroke-[2.5]" />
                    ) : (
                      <IconArrowDown size={13} className="text-wbk-gold stroke-[2.5]" />
                    )
                  ) : (
                    <IconArrowsSort size={12} className="opacity-0 group-hover:opacity-40 text-wbk-brown transition-opacity" />
                  )}
                </div>
              </th>

              {/* Target Markets */}
              <th className="py-3 px-2.5 text-center">
                <span title="Target Market Regional Storefronts">Markets</span>
              </th>

              {/* Visibility */}
              <th
                onClick={() => handleSort("visibility")}
                className={`py-3 px-3 text-center cursor-pointer hover:bg-[#EAE7E4] transition-colors group select-none ${
                  sortConfig.key === "visibility" ? "bg-amber-100/70 font-bold" : ""
                }`}
                title="Click to sort by Visibility status"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Visibility</span>
                  {sortConfig.key === "visibility" ? (
                    sortConfig.direction === "asc" ? (
                      <IconArrowUp size={13} className="text-wbk-gold stroke-[2.5]" />
                    ) : (
                      <IconArrowDown size={13} className="text-wbk-gold stroke-[2.5]" />
                    )
                  ) : (
                    <IconArrowsSort size={12} className="opacity-0 group-hover:opacity-40 text-wbk-brown transition-opacity" />
                  )}
                </div>
              </th>

              {/* Actions */}
              <th className="py-3 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wbk-lightgrey/40">
            {loading ? (
              <tr>
                <td colSpan={14} className="py-12 text-center text-wbk-brown">
                  <IconRefresh size={22} className="animate-spin mx-auto mb-2" />
                  Loading products from Supabase...
                </td>
              </tr>
            ) : sortedProducts.length === 0 ? (
              <tr>
                <td colSpan={14} className="py-12 text-center text-wbk-brown">
                  No products found matching the current filters.
                </td>
              </tr>
            ) : (
              sortedProducts.map((p) => {
                const isOnSale = p.sale_percent != null || p.sale_price_gbp != null;
                const isHidden = p.visibility === "Hidden";
                const isSelected = selectedIds.includes(p.id);
                const imgUrl = p.image || "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp";

                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-[#FBF9F8] transition-colors group ${
                      isSelected
                        ? "bg-amber-50/40"
                        : isHidden
                        ? "opacity-60 bg-gray-50/50"
                        : ""
                    }`}
                  >
                    {/* Selection Checkbox */}
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectProduct(p.id)}
                        className="accent-wbk-gold w-4 h-4 cursor-pointer"
                        title={`Select product #${p.id}`}
                      />
                    </td>

                    {/* ID */}
                    <td className="py-3 px-3 font-mono font-semibold text-wbk-brown">
                      #{p.id}
                    </td>

                    {/* Image Preview */}
                    <td className="py-3 px-3">
                      <div className="w-10 h-10 relative bg-[#F4F2F0] border border-wbk-lightgrey/60 overflow-hidden shrink-0">
                        <Image
                          src={imgUrl}
                          alt={p.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    </td>

                    {/* Name & Type & Tags */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-wbk-black line-clamp-1 max-w-xs">
                        {p.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-wbk-brown flex-wrap">
                        {p.sku && (
                          <>
                            <span className="font-mono text-wbk-black font-semibold bg-[#F4F2F0] px-1">
                              {p.sku}
                            </span>
                            <span>&bull;</span>
                          </>
                        )}
                        <span>{p.type || "Classic"}</span>
                        <span>&bull;</span>
                        <span>{p.orientation || "Vertical"}</span>
                        {p.weight && (
                          <>
                            <span>&bull;</span>
                            <span>{p.weight} kg</span>
                          </>
                        )}
                      </div>

                      {/* Tags Badges */}
                      {Array.isArray(p.tags) && p.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                          {p.tags.map((tId) => {
                            const tagObj = tagsList.find((t) => t.id === tId || t.slug === tId);
                            const color = tagObj?.color || "#D4AF37";
                            const name = tagObj?.name || tId;
                            return (
                              <span
                                key={tId}
                                className="text-[9px] px-1.5 py-0.2 rounded-xs font-semibold tracking-wide border flex items-center gap-1"
                                style={{
                                  borderColor: color,
                                  backgroundColor: `${color}15`,
                                  color: color,
                                }}
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full shrink-0"
                                  style={{ backgroundColor: color }}
                                />
                                <span>{name}</span>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => setSelectedCategory(p.parent_category || "beds")}
                        title={`Filter list by category: ${p.parent_category || "beds"}`}
                        className={`px-2 py-0.5 text-[10px] uppercase font-semibold transition-colors cursor-pointer ${
                          selectedCategory === (p.parent_category || "beds")
                            ? "bg-wbk-black text-white"
                            : "bg-[#F4F2F0] text-wbk-black hover:bg-wbk-gold hover:text-white"
                        }`}
                      >
                        {p.parent_category || "beds"}
                      </button>
                    </td>

                    {/* Dimensions */}
                    <td className="py-3 px-3 text-wbk-brown">
                      {p.width && p.length ? (
                        <span>{Math.round(p.width / 10)}x{Math.round(p.length / 10)} cm</span>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* GBP */}
                    <td className="py-3 px-3 font-semibold text-wbk-black">
                      £{p.price_gbp || 0}
                      {p.sale_price_gbp && (
                        <div className="text-[10px] text-red-600 font-normal">
                          Sale: £{p.sale_price_gbp}
                        </div>
                      )}
                    </td>

                    {/* EUR */}
                    <td className="py-3 px-3 font-semibold text-wbk-black">
                      {p.price_euro || 0} €
                      {p.sale_price_euro && (
                        <div className="text-[10px] text-red-600 font-normal">
                          Sale: {p.sale_price_euro} €
                        </div>
                      )}
                    </td>

                    {/* USD */}
                    <td className="py-3 px-3 font-semibold text-wbk-black">
                      ${p.price_usd || 0}
                      {p.sale_price_usd && (
                        <div className="text-[10px] text-red-600 font-normal">
                          Sale: ${p.sale_price_usd}
                        </div>
                      )}
                    </td>

                    {/* Sale Pill */}
                    <td className="py-3 px-3 text-center">
                      {isOnSale ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-700">
                          {p.sale_percent ? `-${p.sale_percent}%` : "Sale"}
                        </span>
                      ) : (
                        <span className="text-[11px] text-wbk-brown/50">—</span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                          (p.stock ?? 100) > 0
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-red-50 text-red-800"
                        }`}
                      >
                        {p.stock ?? 100} in stock
                      </span>
                    </td>

                    {/* Target Markets */}
                    <td className="py-3 px-2.5 text-center">
                      {(() => {
                        const locs =
                          Array.isArray(p.available_locales) && p.available_locales.length > 0
                            ? p.available_locales
                            : ["en", "us", "de", "fr", "es", "por", "it"];
                        const isAll = locs.length === 7;
                        const flagMap = {
                          en: "🇬🇧",
                          us: "🇺🇸",
                          de: "🇩🇪",
                          fr: "🇫🇷",
                          es: "🇪🇸",
                          por: "🇵🇹",
                          it: "🇮🇹",
                        };

                        if (isAll) {
                          return (
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold bg-[#F4F2F0] text-wbk-black rounded-xs border border-wbk-lightgrey/60"
                              title="Visible across all 7 markets: UK, US, DE, FR, ES, POR, IT"
                            >
                              <span>🌍</span>
                              <span>All (7)</span>
                            </span>
                          );
                        }

                        if (locs.length === 0) {
                          return (
                            <span
                              className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200"
                              title="Hidden from all markets"
                            >
                              None
                            </span>
                          );
                        }

                        return (
                          <div
                            className="flex items-center justify-center gap-0.5 flex-wrap max-w-[90px] mx-auto cursor-help"
                            title={`Megjelenik itt: ${locs.join(", ").toUpperCase()}`}
                          >
                            {locs.map((l) => (
                              <span key={l} className="text-xs" title={l.toUpperCase()}>
                                {flagMap[l] || l}
                              </span>
                            ))}
                          </div>
                        );
                      })()}
                    </td>

                    {/* Visibility Switch */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(p)}
                        className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                          isHidden
                            ? "text-wbk-brown hover:text-wbk-black hover:bg-wbk-lightgrey/40"
                            : "text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50"
                        }`}
                        title={isHidden ? "Hidden - click to publish" : "Visible - click to hide"}
                      >
                        {isHidden ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedProduct(p)}
                          className="p-1.5 text-wbk-black hover:bg-wbk-lightgrey/60 rounded-full transition-colors cursor-pointer"
                          title="Edit product"
                        >
                          <IconEdit size={16} />
                        </button>
                        <Link
                          href={`/products/${p.parent_category || "beds"}/${p.slug || p.id}`}
                          target="_blank"
                          className="p-1.5 text-wbk-brown hover:text-wbk-black hover:bg-wbk-lightgrey/60 rounded-full transition-colors"
                          title="View on storefront"
                        >
                          <IconExternalLink size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 text-wbk-brown hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                          title="Delete product"
                        >
                          <IconTrash size={16} />
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

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#090A0A] text-white px-5 py-3 shadow-2xl border border-white/10 flex items-center gap-4 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-wbk-gold animate-pulse" />
            <span className="text-xs font-semibold">
              <strong>{selectedIds.length}</strong> products selected
            </span>
          </div>

          <div className="h-4 w-px bg-white/20" />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsBulkOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-wbk-gold text-wbk-black hover:bg-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <IconAdjustments size={14} />
              <span>Bulk Edit Parameters</span>
            </button>

            <button
              type="button"
              onClick={() => handleBulkQuickVisibility("Visible")}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              Make Visible
            </button>

            <button
              type="button"
              onClick={() => handleBulkQuickVisibility("Hidden")}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              Make Hidden
            </button>

            <button
              type="button"
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-red-900/60 hover:bg-red-700 text-red-200 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              Delete Selected
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title="Deselect all"
            >
              <IconX size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Edit Drawer Modal */}
      <ProductEditDrawer
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onSaveSuccess={handleSaveSuccess}
      />

      {/* Bulk Product Edit Modal */}
      <BulkProductEditModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        selectedProductIds={selectedIds}
        onBulkUpdateSuccess={handleBulkUpdateSuccess}
      />

      {/* Add Product Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-none border border-wbk-lightgrey shadow-2xl space-y-4 font-poppins custom-scrollbar">
            <h3 className="font-poppins text-lg text-wbk-black font-semibold">
              Create New Product
            </h3>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-wbk-brown uppercase tracking-wider mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WallBedKing Classic Vertical King"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full p-2.5 text-xs border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-wbk-brown uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="w-full p-2.5 text-xs border border-wbk-lightgrey bg-[#FBF9F8] rounded-none focus:outline-none"
                  >
                    {categoriesList.length > 0 ? (
                      categoriesList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name || c.title}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="beds">Murphy Beds</option>
                        <option value="sofas">Sofas</option>
                        <option value="tables">Tables & Desks</option>
                        <option value="mattresses">Mattresses</option>
                        <option value="cabinets">Cabinets</option>
                        <option value="extras">Extras & Accessories</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-wbk-brown uppercase tracking-wider mb-1">
                    Type
                  </label>
                  <select
                    value={newProductType}
                    onChange={(e) => setNewProductType(e.target.value)}
                    className="w-full p-2.5 text-xs border border-wbk-lightgrey bg-[#FBF9F8] rounded-none focus:outline-none"
                  >
                    <option value="Classic">Classic</option>
                    <option value="Studio">Studio</option>
                    <option value="Integrated">Integrated</option>
                    <option value="Transforming">Transforming</option>
                    <option value="Wall-Mounted">Wall-Mounted</option>
                    <option value="Extending">Extending</option>
                    <option value="Coffee & Side">Coffee & Side</option>
                    <option value="Modular">Modular</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-wbk-brown uppercase tracking-wider mb-1">
                    Orientation
                  </label>
                  <select
                    value={newProductOrientation}
                    onChange={(e) => setNewProductOrientation(e.target.value)}
                    className="w-full p-2.5 text-xs border border-wbk-lightgrey bg-[#FBF9F8] rounded-none focus:outline-none"
                  >
                    <option value="Vertical">Vertical</option>
                    <option value="Horizontal">Horizontal</option>
                  </select>
                </div>
              </div>

              {/* Dimensions for grouping into size variants */}
              <div className="p-3 bg-[#FBF9F8] border border-wbk-lightgrey/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-wbk-black uppercase tracking-wider">
                    Dimensions (for Storefront Size Dropdown)
                  </span>
                  <span className="text-[10px] text-wbk-brown">
                    e.g. 1400 x 2000 mm creates 140x200 cm variant
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-wbk-brown mb-0.5">
                      Width (mm)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 1400"
                      value={newProductWidth}
                      onChange={(e) => setNewProductWidth(e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-wbk-brown mb-0.5">
                      Length (mm)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 2000"
                      value={newProductLength}
                      onChange={(e) => setNewProductLength(e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-wbk-brown uppercase tracking-wider mb-1">
                    Base Price (£ / € / $)
                  </label>
                  <input
                    type="number"
                    required
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className="w-full p-2.5 text-xs border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-wbk-brown uppercase tracking-wider mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MORPHY-V-D"
                    value={newProductSku}
                    onChange={(e) => setNewProductSku(e.target.value)}
                    className="w-full p-2.5 text-xs border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-wbk-brown uppercase tracking-wider mb-1">
                    Net Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 52.5"
                    value={newProductWeight}
                    onChange={(e) => setNewProductWeight(e.target.value)}
                    className="w-full p-2.5 text-xs border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-wbk-brown uppercase tracking-wider mb-1">
                    Barcode (EAN)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5070502507993"
                    value={newProductEan}
                    onChange={(e) => setNewProductEan(e.target.value)}
                    className="w-full p-2.5 text-xs border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-mono"
                  />
                </div>
              </div>

              {/* Tag Picker */}
              {tagsList.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-medium text-wbk-brown uppercase tracking-wider flex items-center gap-1">
                    <IconTag size={13} className="text-wbk-gold" />
                    <span>Assign Tags ({newProductTags.length} selected)</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-2.5 bg-[#FBF9F8] border border-wbk-lightgrey">
                    {tagsList.map((tag) => {
                      const isSel = newProductTags.includes(tag.id || tag.slug);
                      const col = tag.color || "#D4AF37";
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() =>
                            setNewProductTags((prev) =>
                              prev.includes(tag.id || tag.slug)
                                ? prev.filter((t) => t !== (tag.id || tag.slug))
                                : [...prev, tag.id || tag.slug]
                            )
                          }
                          style={{
                            borderColor: isSel ? col : undefined,
                            backgroundColor: isSel ? `${col}18` : undefined,
                          }}
                          className={`flex items-center gap-1.5 px-2 py-1 text-xs transition-all border cursor-pointer ${
                            isSel
                              ? "font-medium text-wbk-black border-2"
                              : "bg-white border-wbk-lightgrey text-wbk-brown hover:border-wbk-black"
                          }`}
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: col }}
                          />
                          <span>{tag.name}</span>
                          {isSel && <IconCheck size={12} className="stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs text-wbk-brown hover:text-wbk-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="px-5 py-2.5 bg-wbk-black text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-wbk-gold hover:text-wbk-black transition-colors cursor-pointer disabled:opacity-50"
                >
                  {adding ? "Creating..." : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Catalog Modal */}
      {isExportOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg p-6 rounded-none border border-wbk-lightgrey shadow-2xl space-y-5 font-poppins animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-wbk-lightgrey/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded-full">
                  <IconFileSpreadsheet size={20} />
                </div>
                <div>
                  <h3 className="font-poppins text-base text-wbk-black font-semibold">
                    Export Product Catalog
                  </h3>
                  <p className="text-[11px] text-wbk-brown">
                    Spreadsheet compatible with Microsoft Excel & Google Sheets &bull; Complete database export ({PRODUCT_EXPORT_COLUMNS.length} columns)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExportOpen(false)}
                className="p-1.5 text-wbk-brown hover:text-wbk-black rounded-full hover:bg-[#F4F2F0] transition-colors cursor-pointer"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Scope Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase text-wbk-black tracking-wider">
                Export Scope:
              </label>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 border cursor-pointer select-none bg-[#FBF9F8] hover:border-wbk-black transition-colors">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="exportScope"
                      value="filtered"
                      defaultChecked
                      id="scope-filtered"
                      className="accent-wbk-gold w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-semibold text-wbk-black">
                        Currently Filtered Products
                      </div>
                      <div className="text-[11px] text-wbk-brown">
                        {sortedProducts.length} products (matching active search, category, and sort)
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-white border border-wbk-lightgrey">
                    {sortedProducts.length} items
                  </span>
                </label>

                {selectedIds.length > 0 && (
                  <label className="flex items-center justify-between p-3 border cursor-pointer select-none bg-amber-50/50 border-amber-300 hover:border-wbk-black transition-colors">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="exportScope"
                        value="selected"
                        id="scope-selected"
                        className="accent-wbk-gold w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-semibold text-wbk-black">
                          Selected Products Only
                        </div>
                        <div className="text-[11px] text-wbk-brown">
                          {selectedIds.length} checked products from table
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 bg-wbk-gold text-wbk-black">
                      {selectedIds.length} items
                    </span>
                  </label>
                )}

                <label className="flex items-center justify-between p-3 border cursor-pointer select-none bg-[#FBF9F8] hover:border-wbk-black transition-colors">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="exportScope"
                      value="all"
                      id="scope-all"
                      className="accent-wbk-gold w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-semibold text-wbk-black">
                        Complete Catalog
                      </div>
                      <div className="text-[11px] text-wbk-brown">
                        All active products in database
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-white border border-wbk-lightgrey">
                    {products.length} items
                  </span>
                </label>
              </div>
            </div>

            {/* Export Action Options */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold uppercase text-wbk-black tracking-wider">
                Choose Export Format:
              </label>

              {/* Action 1: Download CSV */}
              <button
                type="button"
                onClick={() => {
                  const selectedScope =
                    document.querySelector('input[name="exportScope"]:checked')?.value || "filtered";
                  handleExportCSV(selectedScope);
                }}
                className="w-full flex items-center justify-between p-3.5 bg-wbk-black text-white hover:bg-wbk-gold hover:text-wbk-black transition-all cursor-pointer shadow-sm group"
              >
                <div className="flex items-center gap-3 text-left">
                  <IconDownload size={18} className="text-wbk-gold group-hover:text-wbk-black transition-colors" />
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider">
                      Download CSV File (.csv)
                    </div>
                    <div className="text-[10px] text-white/70 group-hover:text-wbk-black/80">
                      UTF-8 encoded with BOM, all {PRODUCT_EXPORT_COLUMNS.length} columns, opens in Excel & Google Sheets
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold uppercase">&rarr;</span>
              </button>

              {/* Action 2: Copy to Clipboard for Google Sheets */}
              <button
                type="button"
                onClick={() => {
                  const selectedScope =
                    document.querySelector('input[name="exportScope"]:checked')?.value || "filtered";
                  handleCopyForGoogleSheets(selectedScope);
                }}
                className="w-full flex items-center justify-between p-3.5 bg-[#F4F2F0] hover:bg-[#EAE7E4] text-wbk-black border border-wbk-lightgrey transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 text-left">
                  <IconCopy size={18} className="text-wbk-brown group-hover:text-wbk-black" />
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider">
                      Copy to Clipboard (Google Sheets &bull; Ctrl+V)
                    </div>
                    <div className="text-[10px] text-wbk-brown">
                      Instantly paste all {PRODUCT_EXPORT_COLUMNS.length} columns into any Google Sheet or Excel spreadsheet
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold uppercase">&rarr;</span>
              </button>
            </div>

            {/* Direct API Info */}
            <div className="p-3 bg-[#FBF9F8] border border-wbk-lightgrey/80 text-[11px] text-wbk-brown space-y-1">
              <div className="font-semibold text-wbk-black flex items-center gap-1.5">
                <span>💡</span>
                <span>Automated Google Sheets Live Import:</span>
              </div>
              <p className="font-mono text-[10px] bg-white p-1.5 border border-wbk-lightgrey select-all break-all">
                =IMPORTDATA(&quot;{typeof window !== "undefined" ? window.location.origin : ""}/api/admin/products/export&quot;)
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsExportOpen(false)}
                className="px-4 py-2 text-xs font-medium text-wbk-brown hover:text-wbk-black cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
