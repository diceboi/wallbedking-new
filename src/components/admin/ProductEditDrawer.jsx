"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  IconX,
  IconDeviceFloppy,
  IconCheck,
  IconAlertCircle,
  IconRefresh,
} from "@tabler/icons-react";
import { FlagIcon } from "@/components/ui/FlagIcon";

export function ProductEditDrawer({ product, isOpen, onClose, onSaveSuccess }) {
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (product) {
      setFormData({ ...product });
    }
  }, [product]);

  if (!isOpen || !formData) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value === "" ? null : value,
    }));
  };

  const handleNumberChange = (field, value) => {
    const parsed = value === "" ? null : Number(value);
    setFormData((prev) => ({
      ...prev,
      [field]: isNaN(parsed) ? null : parsed,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/products/${formData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Product saved successfully to Supabase!" });
        onSaveSuccess?.(data.product || formData);
        setTimeout(() => {
          setMessage(null);
          onClose();
        }, 1200);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save product." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error while saving." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Container */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl z-50 flex flex-col font-poppins overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-[#090A0A] text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-wbk-gold uppercase tracking-wider">
                ID: #{formData.id}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white uppercase font-medium">
                {formData.parent_category || "beds"}
              </span>
            </div>
            <h2 className="font-new-york text-lg text-white font-medium truncate max-w-md mt-0.5">
              {formData.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Status banner */}
        {message && (
          <div
            className={`p-3 text-xs font-medium flex items-center gap-2 border-b shrink-0 ${
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

        {/* Scrollable Form Body */}
        <form
          id="productEditForm"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-[#FBF9F8]"
        >
          {/* Section 1: Basic Information */}
          <div className="bg-white p-5 border border-wbk-lightgrey/50 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-wbk-gold">
              1. Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-wbk-black mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full p-2.5 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-wbk-black mb-1">
                  SEO Slug (URL identifier)
                </label>
                <input
                  type="text"
                  value={formData.slug || ""}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-wbk-black mb-1">
                  EAN Barcode
                </label>
                <input
                  type="text"
                  value={formData.ean || ""}
                  onChange={(e) => handleChange("ean", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-wbk-black mb-1">
                  Bed Type
                </label>
                <select
                  value={formData.type || "Classic"}
                  onChange={(e) => handleChange("type", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none focus:outline-none"
                >
                  <option value="Classic">Classic</option>
                  <option value="Studio">Studio</option>
                  <option value="Integrated">Integrated</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-wbk-black mb-1">
                  Orientation
                </label>
                <select
                  value={formData.orientation || "Vertical"}
                  onChange={(e) => handleChange("orientation", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none focus:outline-none"
                >
                  <option value="Vertical">Vertical</option>
                  <option value="Horizontal">Horizontal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-wbk-black mb-1">
                  Stock Units
                </label>
                <input
                  type="number"
                  value={formData.stock ?? 100}
                  onChange={(e) => handleNumberChange("stock", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-wbk-black mb-1">
                  Visibility Status
                </label>
                <select
                  value={formData.visibility || "Visible"}
                  onChange={(e) => handleChange("visibility", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none focus:outline-none"
                >
                  <option value="Visible">Visible (Published)</option>
                  <option value="Hidden">Hidden (Draft)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Multi-Currency Pricing & Discounts */}
          <div className="bg-white p-5 border border-wbk-lightgrey/50 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-wbk-gold">
                2. Multi-Currency Pricing & Discounts
              </h3>
              <span className="text-[10px] text-wbk-brown">
                Direct Supabase columns
              </span>
            </div>

            {/* GBP Market (UK) */}
            <div className="p-3.5 bg-[#F4F2F0]/50 border border-wbk-lightgrey/50 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-wbk-black">
                <FlagIcon country="en" size={14} />
                <span>UK Market (GBP - £)</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-wbk-brown mb-1">
                    Regular Price (price_gbp)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-xs text-wbk-brown">£</span>
                    <input
                      type="number"
                      value={formData.price_gbp ?? ""}
                      onChange={(e) => handleNumberChange("price_gbp", e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 text-xs bg-white border border-wbk-lightgrey rounded-none font-semibold focus:outline-none focus:border-wbk-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-wbk-brown mb-1">
                    Sale Price (sale_price_gbp)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-xs text-wbk-brown">£</span>
                    <input
                      type="number"
                      placeholder="Optional"
                      value={formData.sale_price_gbp ?? ""}
                      onChange={(e) => handleNumberChange("sale_price_gbp", e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* EUR Market (DE, FR, ES, POR, IT) */}
            <div className="p-3.5 bg-[#F4F2F0]/50 border border-wbk-lightgrey/50 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-wbk-black">
                <FlagIcon country="de" size={14} />
                <span>European Market (EUR - €)</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-wbk-brown mb-1">
                    Regular Price (price_euro)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-xs text-wbk-brown">€</span>
                    <input
                      type="number"
                      value={formData.price_euro ?? ""}
                      onChange={(e) => handleNumberChange("price_euro", e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 text-xs bg-white border border-wbk-lightgrey rounded-none font-semibold focus:outline-none focus:border-wbk-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-wbk-brown mb-1">
                    Sale Price (sale_price_euro)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-xs text-wbk-brown">€</span>
                    <input
                      type="number"
                      placeholder="Optional"
                      value={formData.sale_price_euro ?? ""}
                      onChange={(e) => handleNumberChange("sale_price_euro", e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* USD Market (US) */}
            <div className="p-3.5 bg-[#F4F2F0]/50 border border-wbk-lightgrey/50 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-wbk-black">
                <FlagIcon country="us" size={14} />
                <span>US Market (USD - $)</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-wbk-brown mb-1">
                    Regular Price (price_usd)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-xs text-wbk-brown">$</span>
                    <input
                      type="number"
                      value={formData.price_usd ?? ""}
                      onChange={(e) => handleNumberChange("price_usd", e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 text-xs bg-white border border-wbk-lightgrey rounded-none font-semibold focus:outline-none focus:border-wbk-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-wbk-brown mb-1">
                    Sale Price (sale_price_usd)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-xs text-wbk-brown">$</span>
                    <input
                      type="number"
                      placeholder="Optional"
                      value={formData.sale_price_usd ?? ""}
                      onChange={(e) => handleNumberChange("sale_price_usd", e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 text-xs bg-white border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Percentage Discount */}
            <div className="pt-2">
              <label className="block text-xs font-medium text-wbk-black mb-1">
                Discount Percentage (sale_percent)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="99"
                  placeholder="e.g. 30 (for -30%)"
                  value={formData.sale_percent ?? ""}
                  onChange={(e) => handleNumberChange("sale_percent", e.target.value)}
                  className="w-36 p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none focus:outline-none font-semibold"
                />
                <span className="text-xs text-wbk-brown">
                  {formData.sale_percent ? `Active discount: -${formData.sale_percent}%` : "No percentage discount"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Technical Dimensions */}
          <div className="bg-white p-5 border border-wbk-lightgrey/50 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-wbk-gold">
              3. Dimensions (in mm)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-wbk-brown mb-1">
                  Width (mm)
                </label>
                <input
                  type="number"
                  value={formData.width ?? ""}
                  onChange={(e) => handleNumberChange("width", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-wbk-brown mb-1">
                  Length (mm)
                </label>
                <input
                  type="number"
                  value={formData.length ?? ""}
                  onChange={(e) => handleNumberChange("length", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-wbk-brown mb-1">
                  Folded-up Height
                </label>
                <input
                  type="number"
                  value={formData.folded_up_height ?? ""}
                  onChange={(e) => handleNumberChange("folded_up_height", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-wbk-brown mb-1">
                  Folded-up Projection
                </label>
                <input
                  type="number"
                  value={formData.folded_up_projection ?? ""}
                  onChange={(e) => handleNumberChange("folded_up_projection", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-wbk-brown mb-1">
                  Folded-down Projection
                </label>
                <input
                  type="number"
                  value={formData.folded_down_projection ?? ""}
                  onChange={(e) => handleNumberChange("folded_down_projection", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-wbk-brown mb-1">
                  Max Mattress Depth
                </label>
                <input
                  type="number"
                  value={formData.maximum_mattress_depth ?? 300}
                  onChange={(e) => handleNumberChange("maximum_mattress_depth", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Description & Media */}
          <div className="bg-white p-5 border border-wbk-lightgrey/50 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-wbk-gold">
              4. Description & Images
            </h3>

            <div>
              <label className="block text-xs font-medium text-wbk-black mb-1">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full p-2.5 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none focus:outline-none focus:border-wbk-black font-poppins"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-wbk-black mb-1">
                  Primary Image Path
                </label>
                <input
                  type="text"
                  value={formData.image || ""}
                  onChange={(e) => handleChange("image", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-wbk-black mb-1">
                  Hover Image Path
                </label>
                <input
                  type="text"
                  value={formData.hover_image || ""}
                  onChange={(e) => handleChange("hover_image", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey rounded-none"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Drawer Footer Actions */}
        <div className="p-4 bg-white border-t border-wbk-lightgrey/70 flex items-center justify-between shrink-0 shadow-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-wbk-brown hover:text-wbk-black transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="productEditForm"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-wbk-black hover:bg-wbk-gold hover:text-wbk-black text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <IconRefresh size={16} className="animate-spin" />
            ) : (
              <IconDeviceFloppy size={16} />
            )}
            <span>{saving ? "Saving..." : "Save to Supabase"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
