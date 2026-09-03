"use client";

import { useEffect, useState, useMemo } from "react";
import {
  IconTag,
  IconCoins,
  IconDeviceFloppy,
  IconRefresh,
  IconCheck,
  IconAlertCircle,
  IconWand,
  IconSearch,
} from "@tabler/icons-react";
import { FlagIcon } from "@/components/ui/FlagIcon";

export default function AdminPricingPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [search, setSearch] = useState("");
  const [batchCategory, setBatchCategory] = useState("all");
  const [batchDiscountPercent, setBatchDiscountPercent] = useState(30);
  const [applyingBatch, setApplyingBatch] = useState(false);
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
      setMessage({ type: "error", text: "Error loading pricing data." });
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (id, field, value) => {
    const num = value === "" ? null : Number(value);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: isNaN(num) ? null : num } : p))
    );
  };

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        String(p.id).includes(q) ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.slug && p.slug.toLowerCase().includes(q))
    );
  }, [products, search]);

  const handleSaveProduct = async (product) => {
    setSavingId(product.id);
    setMessage(null);

    const payload = {
      price_gbp: product.price_gbp,
      price_euro: product.price_euro,
      price_usd: product.price_usd,
      sale_percent: product.sale_percent,
      sale_price_gbp: product.sale_price_gbp,
      sale_price_euro: product.sale_price_euro,
      sale_price_usd: product.sale_price_usd,
    };

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `Product #${product.id} prices saved successfully to Supabase!` });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save prices." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error while saving." });
    } finally {
      setSavingId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleApplyBatchDiscount = async () => {
    if (!confirm(`Are you sure you want to apply a ${batchDiscountPercent}% discount to all products in "${batchCategory}"?`)) {
      return;
    }

    setApplyingBatch(true);
    setMessage(null);

    const targets = products.filter(
      (p) => batchCategory === "all" || p.parent_category === batchCategory
    );

    try {
      for (const p of targets) {
        await fetch(`/api/admin/products/${p.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sale_percent: Number(batchDiscountPercent) }),
        });
      }

      setProducts((prev) =>
        prev.map((p) =>
          batchCategory === "all" || p.parent_category === batchCategory
            ? { ...p, sale_percent: Number(batchDiscountPercent) }
            : p
        )
      );

      setMessage({
        type: "success",
        text: `Successfully applied -${batchDiscountPercent}% discount to ${targets.length} products in Supabase!`,
      });
    } catch (err) {
      setMessage({ type: "error", text: "Error applying batch discount." });
    } finally {
      setApplyingBatch(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6 font-poppins">
      {/* Page Header */}
      <div>
        <h2 className="font-new-york text-2xl font-medium text-wbk-black">
          Pricing & Discounts Manager
        </h2>
        <p className="text-xs text-wbk-brown">
          Manage regular prices, promotional discounts, and multi-currency rates (GBP, EUR, USD)
        </p>
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

      {/* Batch Tool Panel */}
      <div className="bg-white p-6 border border-wbk-lightgrey/60 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <IconWand size={18} className="text-wbk-gold" />
          <h3 className="font-new-york text-base font-medium text-wbk-black">
            Bulk Promotional Discounts
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-1">
          <div>
            <label className="block text-[11px] font-medium text-wbk-brown uppercase mb-1">
              Target Category
            </label>
            <select
              value={batchCategory}
              onChange={(e) => setBatchCategory(e.target.value)}
              className="p-2 text-xs border border-wbk-lightgrey bg-[#FBF9F8] rounded-none focus:outline-none"
            >
              <option value="all">All Categories (234 items)</option>
              <option value="beds">Murphy Beds</option>
              <option value="sofas">Sofas</option>
              <option value="mattresses">Mattresses</option>
              <option value="cabinets">Cabinets</option>
              <option value="extras">Extras & Accessories</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-wbk-brown uppercase mb-1">
              Discount Percentage (-%)
            </label>
            <input
              type="number"
              min="0"
              max="90"
              value={batchDiscountPercent}
              onChange={(e) => setBatchDiscountPercent(e.target.value)}
              className="p-2 text-xs w-32 border border-wbk-lightgrey bg-[#FBF9F8] rounded-none font-semibold focus:outline-none"
            />
          </div>

          <div className="sm:self-end">
            <button
              type="button"
              onClick={handleApplyBatchDiscount}
              disabled={applyingBatch}
              className="flex items-center gap-2 px-6 py-2.5 bg-wbk-black hover:bg-wbk-gold hover:text-wbk-black text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-colors cursor-pointer disabled:opacity-50"
            >
              {applyingBatch ? (
                <IconRefresh size={15} className="animate-spin" />
              ) : (
                <IconTag size={15} />
              )}
              <span>{applyingBatch ? "Applying..." : "Apply Category Discount"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Matrix Table with Search */}
      <div className="bg-white border border-wbk-lightgrey/60 shadow-xs overflow-x-auto">
        <div className="p-4 border-b border-wbk-lightgrey/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs text-wbk-black font-semibold uppercase tracking-wider block">
              Multi-Currency Price Matrix
            </span>
            <span className="text-[11px] text-wbk-brown">
              Showing {filteredProducts.length} of {products.length} products. Each row can be saved directly to Supabase.
            </span>
          </div>

          {/* Search Box for Pricing */}
          <div className="relative w-full sm:w-72">
            <IconSearch
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-wbk-brown"
            />
            <input
              type="text"
              placeholder="Search by product name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black"
            />
          </div>
        </div>

        <table className="w-full text-left text-xs border-collapse font-poppins">
          <thead>
            <tr className="bg-[#F4F2F0] border-b border-wbk-lightgrey text-wbk-black uppercase tracking-wider text-[10px] font-semibold select-none">
              <th className="py-3 px-3 w-16">ID</th>
              <th className="py-3 px-4 min-w-[200px]">Product Name</th>
              <th className="py-3 px-3 min-w-[150px]">
                <div className="flex items-center gap-1.5">
                  <FlagIcon country="en" size={13} />
                  <span>GBP Base / Sale (£)</span>
                </div>
              </th>
              <th className="py-3 px-3 min-w-[150px]">
                <div className="flex items-center gap-1.5">
                  <FlagIcon country="de" size={13} />
                  <span>EUR Base / Sale (€)</span>
                </div>
              </th>
              <th className="py-3 px-3 min-w-[150px]">
                <div className="flex items-center gap-1.5">
                  <FlagIcon country="us" size={13} />
                  <span>USD Base / Sale ($)</span>
                </div>
              </th>
              <th className="py-3 px-3 w-28 text-center">Discount (%)</th>
              <th className="py-3 px-3 w-24 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wbk-lightgrey/40">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-wbk-brown">
                  <IconRefresh size={20} className="animate-spin mx-auto mb-2" />
                  Loading pricing matrix...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-wbk-brown">
                  No products matched your search.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const isSaving = savingId === p.id;
                return (
                  <tr key={p.id} className="hover:bg-[#FBF9F8] transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-wbk-brown">
                      #{p.id}
                    </td>

                    <td className="py-3 px-4 font-medium text-wbk-black max-w-xs truncate">
                      {p.name}
                    </td>

                    {/* GBP */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={p.price_gbp ?? ""}
                          onChange={(e) => handlePriceChange(p.id, "price_gbp", e.target.value)}
                          className="w-20 p-1.5 text-xs bg-white border border-wbk-lightgrey font-semibold rounded-none focus:outline-none focus:border-wbk-black"
                          placeholder="Regular"
                        />
                        <input
                          type="number"
                          value={p.sale_price_gbp ?? ""}
                          onChange={(e) => handlePriceChange(p.id, "sale_price_gbp", e.target.value)}
                          className="w-20 p-1.5 text-xs bg-white border border-wbk-lightgrey text-red-600 rounded-none focus:outline-none focus:border-wbk-black"
                          placeholder="Sale"
                        />
                      </div>
                    </td>

                    {/* EUR */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={p.price_euro ?? ""}
                          onChange={(e) => handlePriceChange(p.id, "price_euro", e.target.value)}
                          className="w-20 p-1.5 text-xs bg-white border border-wbk-lightgrey font-semibold rounded-none focus:outline-none focus:border-wbk-black"
                          placeholder="Regular"
                        />
                        <input
                          type="number"
                          value={p.sale_price_euro ?? ""}
                          onChange={(e) => handlePriceChange(p.id, "sale_price_euro", e.target.value)}
                          className="w-20 p-1.5 text-xs bg-white border border-wbk-lightgrey text-red-600 rounded-none focus:outline-none focus:border-wbk-black"
                          placeholder="Sale"
                        />
                      </div>
                    </td>

                    {/* USD */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={p.price_usd ?? ""}
                          onChange={(e) => handlePriceChange(p.id, "price_usd", e.target.value)}
                          className="w-20 p-1.5 text-xs bg-white border border-wbk-lightgrey font-semibold rounded-none focus:outline-none focus:border-wbk-black"
                          placeholder="Regular"
                        />
                        <input
                          type="number"
                          value={p.sale_price_usd ?? ""}
                          onChange={(e) => handlePriceChange(p.id, "sale_price_usd", e.target.value)}
                          className="w-20 p-1.5 text-xs bg-white border border-wbk-lightgrey text-red-600 rounded-none focus:outline-none focus:border-wbk-black"
                          placeholder="Sale"
                        />
                      </div>
                    </td>

                    {/* Sale Percent */}
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="90"
                        value={p.sale_percent ?? ""}
                        onChange={(e) => handlePriceChange(p.id, "sale_percent", e.target.value)}
                        className="w-16 p-1.5 text-xs bg-white border border-wbk-lightgrey text-center font-bold text-red-600 rounded-none focus:outline-none"
                        placeholder="%"
                      />
                    </td>

                    {/* Save Button */}
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleSaveProduct(p)}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F4F2F0] hover:bg-wbk-black hover:text-white text-wbk-black rounded-full transition-colors cursor-pointer text-xs font-semibold disabled:opacity-50"
                        title="Save row to Supabase"
                      >
                        {isSaving ? (
                          <IconRefresh size={13} className="animate-spin" />
                        ) : (
                          <IconDeviceFloppy size={13} />
                        )}
                        <span>Save</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
