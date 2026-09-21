"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  IconX,
  IconCheck,
  IconAlertCircle,
  IconExternalLink,
  IconPhoto,
} from "@tabler/icons-react";

export function FeedItemEditDrawer({ feedId, item, isOpen, onClose, onSaveSuccess }) {
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
    }
  }, [item]);

  if (!isOpen || !formData) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
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
      const res = await fetch(`/api/admin/feeds/${feedId}/${encodeURIComponent(formData.item_sku)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Feed item saved successfully!" });
        onSaveSuccess?.(data.item || formData);
        setTimeout(() => {
          setMessage(null);
          onClose();
        }, 1200);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save feed item." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error while saving." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-poppins">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Container */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-[#090A0A] text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-wbk-gold uppercase tracking-wider font-mono">
                SKU: {formData.item_sku}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-medium ${
                  formData.parent_child === "parent"
                    ? "bg-purple-900/60 text-purple-200 border border-purple-500/40"
                    : "bg-blue-900/60 text-blue-200 border border-blue-500/40"
                }`}
              >
                {formData.parent_child || "child"}
              </span>
            </div>
            <h2 className="font-poppins text-base text-white font-semibold truncate max-w-md mt-1">
              {formData.item_name}
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
            {message.type === "success" ? <IconCheck size={16} /> : <IconAlertCircle size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form
          id="feedItemForm"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#FBF9F8]"
        >
          {/* Section 1: Identification & Variation */}
          <div className="bg-white p-5 border border-wbk-lightgrey/50 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-wbk-gold">
              1. Amazon Identification & Variation
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-wbk-black mb-1">
                  Item SKU
                </label>
                <input
                  type="text"
                  required
                  value={formData.item_sku || ""}
                  onChange={(e) => handleChange("item_sku", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey font-mono font-semibold text-wbk-black"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-wbk-black mb-1">
                  Barcode (EAN / UPC)
                </label>
                <input
                  type="text"
                  value={formData.external_product_id || ""}
                  onChange={(e) => handleChange("external_product_id", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey font-mono"
                  placeholder="e.g. 5061099648073"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-wbk-black mb-1">
                  Parent / Child Type
                </label>
                <select
                  value={formData.parent_child || "child"}
                  onChange={(e) => handleChange("parent_child", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey"
                >
                  <option value="parent">Parent Container</option>
                  <option value="child">Child Variation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-wbk-black mb-1">
                  Parent SKU
                </label>
                <input
                  type="text"
                  value={formData.parent_sku || ""}
                  onChange={(e) => handleChange("parent_sku", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey font-mono"
                  placeholder="e.g. PG-ClassicHorizontalMorphy"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-wbk-black mb-1">
                  Variation Size (size_name)
                </label>
                <input
                  type="text"
                  value={formData.size_name || ""}
                  onChange={(e) => handleChange("size_name", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey"
                  placeholder="e.g. 76 cm x 190 cm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-wbk-black mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={formData.brand_name || "WallBedKing"}
                  onChange={(e) => handleChange("brand_name", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey"
                />
              </div>
            </div>
          </div>

          {/* Section 2: French Content, Title & Bullets */}
          <div className="bg-white p-5 border border-wbk-lightgrey/50 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-wbk-gold">
                2. French Content, Title & Bullets
              </h3>
              <span className="text-[11px] text-wbk-brown">Market: Amazon FR</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-wbk-black mb-1">
                Product Title (item_name)
              </label>
              <textarea
                rows={2}
                value={formData.item_name || ""}
                onChange={(e) => handleChange("item_name", e.target.value)}
                className="w-full p-2.5 text-xs bg-[#FBF9F8] border border-wbk-lightgrey focus:outline-none focus:border-wbk-black leading-relaxed"
              />
            </div>

            {/* Bullet Points */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-wbk-black uppercase tracking-wider">
                Key Product Features / Bullet Points (1 - 5)
              </label>

              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num}>
                  <label className="block text-[10px] font-medium text-wbk-brown mb-0.5">
                    Bullet Point #{num}
                  </label>
                  <textarea
                    rows={2}
                    value={formData[`bullet_point${num}`] || ""}
                    onChange={(e) => handleChange(`bullet_point${num}`, e.target.value)}
                    className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey focus:outline-none focus:border-wbk-black leading-relaxed"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-wbk-black mb-1">
                HTML Product Description
              </label>
              <textarea
                rows={6}
                value={formData.product_description || ""}
                onChange={(e) => handleChange("product_description", e.target.value)}
                className="w-full p-2.5 text-xs bg-[#FBF9F8] border border-wbk-lightgrey font-mono text-[11px] leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-wbk-black mb-1">
                Search Terms / Generic Keywords (comma-separated)
              </label>
              <textarea
                rows={2}
                value={formData.generic_keywords || ""}
                onChange={(e) => handleChange("generic_keywords", e.target.value)}
                className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey"
              />
            </div>
          </div>

          {/* Section 3: Pricing, Stock & Logistics */}
          <div className="bg-white p-5 border border-wbk-lightgrey/50 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-wbk-gold">
              3. Pricing, Stock & Fulfillment
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-wbk-brown mb-1">
                  Price (EUR €)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.standard_price ?? ""}
                  onChange={(e) => handleNumberChange("standard_price", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey font-semibold text-wbk-black"
                  placeholder="e.g. 599.00"
                />
              </div>

              <div>
                <label className="block text-[11px] text-wbk-brown mb-1">
                  Currency
                </label>
                <input
                  type="text"
                  value={formData.currency || "EUR"}
                  onChange={(e) => handleChange("currency", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-wbk-brown mb-1">
                  Quantity (Stock)
                </label>
                <input
                  type="number"
                  value={formData.quantity ?? 10}
                  onChange={(e) => handleNumberChange("quantity", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey"
                />
              </div>

              <div>
                <label className="block text-[11px] text-wbk-brown mb-1">
                  Fulfillment
                </label>
                <input
                  type="text"
                  value={formData.fulfillment_channel || "MFN"}
                  onChange={(e) => handleChange("fulfillment_channel", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey uppercase font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] text-wbk-brown mb-1">
                  Browse Node ID
                </label>
                <input
                  type="text"
                  value={formData.recommended_browse_nodes || "2818609031"}
                  onChange={(e) => handleChange("recommended_browse_nodes", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-wbk-brown mb-1">
                  Country of Origin
                </label>
                <input
                  type="text"
                  value={formData.country_of_origin || "Allemagne"}
                  onChange={(e) => handleChange("country_of_origin", e.target.value)}
                  className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Image URLs */}
          <div className="bg-white p-5 border border-wbk-lightgrey/50 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-wbk-gold">
              4. High-Resolution Product Images
            </h3>

            <div>
              <label className="block text-xs font-medium text-wbk-black mb-1">
                Main Image URL (Amazon primary listing image)
              </label>
              <input
                type="text"
                value={formData.main_image_url || ""}
                onChange={(e) => handleChange("main_image_url", e.target.value)}
                className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey font-mono"
              />
              {formData.main_image_url && (
                <div className="mt-2 flex items-center gap-3 p-2 bg-[#F4F2F0] border border-wbk-lightgrey/40">
                  <div className="w-12 h-12 relative bg-white shrink-0">
                    <img
                      src={formData.main_image_url}
                      alt="Main view"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <a
                    href={formData.main_image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-wbk-brown hover:text-wbk-black underline truncate flex items-center gap-1"
                  >
                    <span>{formData.main_image_url}</span>
                    <IconExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-medium text-wbk-black">
                Gallery Images (Other 1 - 5)
              </label>
              {[1, 2, 3, 4, 5].map((idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-[10px] text-wbk-brown w-12 shrink-0">#{idx}</span>
                  <input
                    type="text"
                    placeholder={`Gallery Image ${idx} URL`}
                    value={formData[`other_image_url${idx}`] || ""}
                    onChange={(e) => handleChange(`other_image_url${idx}`, e.target.value)}
                    className="w-full p-1.5 text-xs bg-[#FBF9F8] border border-wbk-lightgrey font-mono"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Warranty & Safety Warnings */}
          <div className="bg-white p-5 border border-wbk-lightgrey/50 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-wbk-gold">
              5. Warranty, Care & Safety Warnings
            </h3>

            <div>
              <label className="block text-xs font-medium text-wbk-black mb-1">
                Warranty Description (Garantie)
              </label>
              <input
                type="text"
                value={formData.warranty_description || "Garantie à vie"}
                onChange={(e) => handleChange("warranty_description", e.target.value)}
                className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-wbk-black mb-1">
                Care Instructions (Entretien)
              </label>
              <input
                type="text"
                value={formData.care_instructions || ""}
                onChange={(e) => handleChange("care_instructions", e.target.value)}
                className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-wbk-black mb-1">
                Safety Warning (Avertissement de sécurité)
              </label>
              <textarea
                rows={2}
                value={formData.safety_warning || ""}
                onChange={(e) => handleChange("safety_warning", e.target.value)}
                className="w-full p-2 text-xs bg-[#FBF9F8] border border-wbk-lightgrey"
              />
            </div>
          </div>
        </form>

        {/* Drawer Footer Actions */}
        <div className="p-4 bg-white border-t border-wbk-lightgrey/60 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-wbk-brown hover:text-wbk-black font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="feedItemForm"
            disabled={saving}
            className="px-6 py-2.5 bg-wbk-black text-white text-xs font-semibold uppercase tracking-wider rounded-none hover:bg-wbk-gold hover:text-wbk-black transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving Changes..." : "Save Feed Item"}
          </button>
        </div>
      </div>
    </div>
  );
}
