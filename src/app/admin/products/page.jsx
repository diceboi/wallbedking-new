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
} from "@tabler/icons-react";
import { ProductEditDrawer } from "@/components/admin/ProductEditDrawer";

const CATEGORIES = [
  { id: "all", label: "All Categories" },
  { id: "beds", label: "Murphy Beds" },
  { id: "sofas", label: "Sofas" },
  { id: "mattresses", label: "Mattresses" },
  { id: "cabinets", label: "Cabinets" },
  { id: "extras", label: "Extras & Accessories" },
];

const ORIENTATIONS = [
  { id: "all", label: "All Orientations" },
  { id: "Vertical", label: "Vertical" },
  { id: "Horizontal", label: "Horizontal" },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedOrientation, setSelectedOrientation] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("beds");
  const [newProductPrice, setNewProductPrice] = useState(799);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products?limit=250");
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

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === "all" || p.parent_category === selectedCategory;
      const matchesOrientation =
        selectedOrientation === "all" || p.orientation === selectedOrientation;
      const q = search.trim().toLowerCase();
      if (!q) return matchesCategory && matchesOrientation;

      const matchesSearch =
        String(p.id).includes(q) ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.slug && p.slug.toLowerCase().includes(q)) ||
        (p.ean && p.ean.toLowerCase().includes(q));

      return matchesCategory && matchesOrientation && matchesSearch;
    });
  }, [products, selectedCategory, selectedOrientation, search]);

  const handleSaveSuccess = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p))
    );
    setMessage({ type: "success", text: `"${updatedProduct.name}" updated successfully in Supabase!` });
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
        setMessage({ type: "success", text: `"${name}" removed from database.` });
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
      parent_category: newProductCategory,
      price_gbp: Number(newProductPrice),
      price_euro: Number(newProductPrice),
      price_usd: Number(newProductPrice),
      stock: 100,
      visibility: "Visible",
      orientation: "Vertical",
      type: "Classic",
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
        setMessage({ type: "success", text: "Product created successfully in Supabase!" });
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-new-york text-2xl font-medium text-wbk-black">
            Product Management
          </h2>
          <p className="text-xs text-wbk-brown">
            Live catalog and inventory management directly synced with Supabase
          </p>
        </div>

        <div className="flex items-center gap-3">
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
        </div>
      </div>

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
          {CATEGORIES.map((c) => {
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
          })}
        </div>

        {/* Orientation & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1">
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

          <div className="relative w-full sm:w-80">
            <IconSearch
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-wbk-brown"
            />
            <input
              type="text"
              placeholder="Search by name, SKU, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FBF9F8] border border-wbk-lightgrey text-xs text-wbk-black rounded-none focus:outline-none focus:border-wbk-black"
            />
          </div>
        </div>
      </div>

      {/* Product Table Count Info */}
      <div className="flex items-center justify-between text-xs text-wbk-brown px-1">
        <span>
          Showing <strong>{filteredProducts.length}</strong> of{" "}
          <strong>{products.length}</strong> products.
        </span>
        <span className="text-[11px] text-wbk-brown/70 italic">
          Click the edit icon on any row to open the full product drawer.
        </span>
      </div>

      {/* Interactive Products Table */}
      <div className="bg-white border border-wbk-lightgrey/60 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-poppins">
          <thead>
            <tr className="bg-[#F4F2F0] border-b border-wbk-lightgrey text-wbk-black uppercase tracking-wider text-[10px] font-semibold select-none">
              <th className="py-3 px-3 w-16">ID</th>
              <th className="py-3 px-3 w-16">Image</th>
              <th className="py-3 px-4 min-w-[200px]">Product Name & Type</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Size</th>
              <th className="py-3 px-3">Price (GBP)</th>
              <th className="py-3 px-3">Price (EUR)</th>
              <th className="py-3 px-3">Price (USD)</th>
              <th className="py-3 px-3 text-center">Sale</th>
              <th className="py-3 px-3 text-center">Stock</th>
              <th className="py-3 px-3 text-center">Visibility</th>
              <th className="py-3 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wbk-lightgrey/40">
            {loading ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-wbk-brown">
                  <IconRefresh size={22} className="animate-spin mx-auto mb-2" />
                  Loading products from Supabase...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-wbk-brown">
                  No products found matching the current filters.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const isOnSale = p.sale_percent != null || p.sale_price_gbp != null;
                const isHidden = p.visibility === "Hidden";
                const imgUrl = p.image || "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp";

                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-[#FBF9F8] transition-colors group ${
                      isHidden ? "opacity-60 bg-gray-50/50" : ""
                    }`}
                  >
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

                    {/* Name & Type */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-wbk-black line-clamp-1 max-w-xs">
                        {p.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-wbk-brown">
                        <span>{p.type || "Classic"}</span>
                        <span>&bull;</span>
                        <span>{p.orientation || "Vertical"}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 text-[10px] uppercase font-semibold bg-[#F4F2F0] text-wbk-black">
                        {p.parent_category || "beds"}
                      </span>
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

      {/* Edit Drawer Modal */}
      <ProductEditDrawer
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onSaveSuccess={handleSaveSuccess}
      />

      {/* Add Product Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-none border border-wbk-lightgrey shadow-2xl space-y-4 font-poppins">
            <h3 className="font-new-york text-xl text-wbk-black font-medium">
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

              <div>
                <label className="block text-xs font-medium text-wbk-brown uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={newProductCategory}
                  onChange={(e) => setNewProductCategory(e.target.value)}
                  className="w-full p-2.5 text-xs border border-wbk-lightgrey bg-[#FBF9F8] rounded-none focus:outline-none"
                >
                  <option value="beds">Murphy Beds</option>
                  <option value="sofas">Sofas</option>
                  <option value="mattresses">Mattresses</option>
                  <option value="cabinets">Cabinets</option>
                  <option value="extras">Extras & Accessories</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-wbk-brown uppercase tracking-wider mb-1">
                  Base Price (GBP / EUR / USD)
                </label>
                <input
                  type="number"
                  required
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(e.target.value)}
                  className="w-full p-2.5 text-xs border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-semibold"
                />
              </div>

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
    </div>
  );
}
