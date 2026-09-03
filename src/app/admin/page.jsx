"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconPackage,
  IconTag,
  IconCoins,
  IconLanguage,
  IconEdit,
  IconArrowRight,
  IconTrendingUp,
} from "@tabler/icons-react";
import { ProductEditDrawer } from "@/components/admin/ProductEditDrawer";
import { FlagIcon } from "@/components/ui/FlagIcon";

export default function AdminDashboardPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetch("/api/admin/products?limit=250")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      })
      .catch((err) => console.error("Error loading products:", err))
      .finally(() => setLoading(false));
  }, []);

  const totalCount = products.length;
  const onSaleCount = products.filter(
    (p) => p.sale_percent != null || p.sale_price_gbp != null
  ).length;
  const gbpCount = products.filter((p) => p.price_gbp != null).length;
  const euroCount = products.filter((p) => p.price_euro != null).length;
  const usdCount = products.filter((p) => p.price_usd != null).length;

  const recentProducts = products.slice(0, 8);

  const handleSaveSuccess = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p))
    );
  };

  return (
    <div className="space-y-8 font-poppins">
      {/* Welcome Banner */}
      <div className="bg-[#090A0A] text-white p-6 sm:p-8 border border-white/10 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-wbk-gold">
              WallBedKing Management Suite
            </span>
          </div>
          <h2 className="font-new-york text-2xl sm:text-3xl font-medium tracking-tight text-white">
            Welcome to the Dashboard
          </h2>
          <p className="text-xs text-white/70 max-w-xl leading-relaxed">
            Manage your catalog of 234 products, multi-currency prices (GBP, EUR, USD), promotional discounts, and 7-market localized dictionaries directly in Supabase.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/products"
            className="flex items-center gap-2 px-5 py-2.5 bg-wbk-gold hover:bg-white text-wbk-black text-xs font-semibold uppercase tracking-wider rounded-full transition-colors shadow-sm"
          >
            <span>Manage Products</span>
            <IconArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Metric Stat Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Products */}
        <div className="bg-white p-5 border border-wbk-lightgrey/60 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-wbk-brown">
            <span className="text-xs uppercase tracking-wider font-semibold">
              Total Products
            </span>
            <div className="p-2 bg-[#F4F2F0] rounded-full text-wbk-black">
              <IconPackage size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-semibold text-wbk-black font-poppins">
              {loading ? "…" : totalCount}
            </div>
            <p className="text-[11px] text-wbk-brown mt-1">
              Active items in Supabase
            </p>
          </div>
        </div>

        {/* Stat 2: Active Sales */}
        <div className="bg-white p-5 border border-wbk-lightgrey/60 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-wbk-brown">
            <span className="text-xs uppercase tracking-wider font-semibold">
              On-Sale Models
            </span>
            <div className="p-2 bg-red-50 text-red-600 rounded-full">
              <IconTag size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-semibold text-wbk-black font-poppins">
              {loading ? "…" : onSaleCount}
            </div>
            <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
              <IconTrendingUp size={14} /> Active promotional discounts
            </p>
          </div>
        </div>

        {/* Stat 3: Currencies Synchronized */}
        <div className="bg-white p-5 border border-wbk-lightgrey/60 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-wbk-brown">
            <span className="text-xs uppercase tracking-wider font-semibold">
              Currency Coverage
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-full">
              <IconCoins size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-semibold text-wbk-black font-poppins flex items-center gap-2">
              <span>3 / 3</span>
              <span className="text-xs font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                100% Synced
              </span>
            </div>
            <p className="text-[11px] text-wbk-brown mt-1 flex items-center gap-1.5">
              <span>GBP ({gbpCount})</span> &bull; <span>EUR ({euroCount})</span> &bull; <span>USD ({usdCount})</span>
            </p>
          </div>
        </div>

        {/* Stat 4: Multi-Language Markets */}
        <div className="bg-white p-5 border border-wbk-lightgrey/60 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-wbk-brown">
            <span className="text-xs uppercase tracking-wider font-semibold">
              Active Markets
            </span>
            <div className="p-2 bg-amber-50 text-wbk-gold rounded-full">
              <IconLanguage size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-semibold text-wbk-black font-poppins">
              7 Locales
            </div>
            <p className="text-[11px] text-wbk-brown mt-1">
              UK, US, DE, FR, ES, POR, IT
            </p>
          </div>
        </div>
      </div>

      {/* Currency Status Overview Table */}
      <div className="bg-white p-6 border border-wbk-lightgrey/60 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-new-york text-lg font-medium text-wbk-black">
              Markets & Currency Health
            </h3>
            <p className="text-xs text-wbk-brown">
              Database price columns populated per currency
            </p>
          </div>
          <Link
            href="/admin/pricing"
            className="text-xs font-semibold uppercase tracking-wider text-wbk-gold hover:text-wbk-black transition-colors"
          >
            Edit Prices &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* GBP Card */}
          <div className="p-4 bg-[#FBF9F8] border border-wbk-lightgrey/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-wbk-black">
                <FlagIcon country="en" size={16} />
                <span>United Kingdom (GBP - £)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {gbpCount} / {totalCount}
              </span>
            </div>
            <p className="text-[11px] text-wbk-brown">
              Columns: <code className="text-wbk-black">price_gbp</code> & <code className="text-wbk-black">sale_price_gbp</code>
            </p>
          </div>

          {/* EUR Card */}
          <div className="p-4 bg-[#FBF9F8] border border-wbk-lightgrey/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-wbk-black">
                <FlagIcon country="de" size={16} />
                <span>Europe (EUR - €)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {euroCount} / {totalCount}
              </span>
            </div>
            <p className="text-[11px] text-wbk-brown">
              Columns: <code className="text-wbk-black">price_euro</code> & <code className="text-wbk-black">sale_price_euro</code>
            </p>
          </div>

          {/* USD Card */}
          <div className="p-4 bg-[#FBF9F8] border border-wbk-lightgrey/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-wbk-black">
                <FlagIcon country="us" size={16} />
                <span>United States (USD - $)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {usdCount} / {totalCount}
              </span>
            </div>
            <p className="text-[11px] text-wbk-brown">
              Columns: <code className="text-wbk-black">price_usd</code> & <code className="text-wbk-black">sale_price_usd</code>
            </p>
          </div>
        </div>
      </div>

      {/* Recent Products Table */}
      <div className="bg-white border border-wbk-lightgrey/60 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-wbk-lightgrey/60 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-new-york text-lg font-medium text-wbk-black">
              Recent Products
            </h3>
            <p className="text-xs text-wbk-brown">
              Click edit on any product to update prices, dimensions, and specifications
            </p>
          </div>

          <Link
            href="/admin/products"
            className="px-4 py-2 bg-[#9A9A8C] hover:bg-wbk-black text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-colors"
          >
            View all {totalCount} products
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F4F2F0] border-b border-wbk-lightgrey text-wbk-black uppercase tracking-wider text-[10px] font-semibold">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Size (W x L)</th>
                <th className="py-3 px-4">Price (GBP)</th>
                <th className="py-3 px-4">Price (EUR)</th>
                <th className="py-3 px-4">Price (USD)</th>
                <th className="py-3 px-4 text-center">Sale</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wbk-lightgrey/40">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-wbk-brown">
                    Loading products from Supabase...
                  </td>
                </tr>
              ) : (
                recentProducts.map((p) => {
                  const isOnSale = p.sale_percent != null || p.sale_price_gbp != null;
                  return (
                    <tr key={p.id} className="hover:bg-[#FBF9F8] transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-wbk-brown">
                        #{p.id}
                      </td>
                      <td className="py-3 px-4 font-medium text-wbk-black max-w-xs truncate">
                        {p.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 text-[10px] uppercase font-semibold bg-[#F4F2F0] text-wbk-black rounded-none">
                          {p.parent_category || "beds"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-poppins text-wbk-brown">
                        {p.width && p.length ? `${Math.round(p.width / 10)}x${Math.round(p.length / 10)} cm` : "—"}
                      </td>
                      <td className="py-3 px-4 font-semibold text-wbk-black font-poppins">
                        £{p.price_gbp || 0}
                      </td>
                      <td className="py-3 px-4 font-semibold text-wbk-black font-poppins">
                        {p.price_euro || 0} €
                      </td>
                      <td className="py-3 px-4 font-semibold text-wbk-black font-poppins">
                        ${p.price_usd || 0}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isOnSale ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-700">
                            {p.sale_percent ? `-${p.sale_percent}%` : "Sale"}
                          </span>
                        ) : (
                          <span className="text-[11px] text-wbk-brown/60">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedProduct(p)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-wbk-lightgrey hover:border-wbk-black text-wbk-black rounded-full transition-colors cursor-pointer text-xs font-medium"
                        >
                          <IconEdit size={13} />
                          <span>Edit</span>
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

      {/* Edit Drawer Modal */}
      <ProductEditDrawer
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
}
