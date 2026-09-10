"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  IconPackage,
  IconReceipt,
  IconTruck,
  IconClock,
  IconCheck,
  IconAlertCircle,
  IconSearch,
  IconFilter,
  IconChevronRight,
  IconX,
  IconCopy,
  IconPrinter,
  IconLoader2,
  IconRefresh,
} from "@tabler/icons-react";

const STATUS_BADGES = {
  pending: { label: "Pending Payment", bg: "bg-amber-100 text-amber-900 border-amber-200" },
  paid: { label: "Paid / Confirmed", bg: "bg-emerald-100 text-emerald-900 border-emerald-200" },
  processing: { label: "In Production", bg: "bg-blue-100 text-blue-900 border-blue-200" },
  shipped: { label: "Dispatched", bg: "bg-purple-100 text-purple-900 border-purple-200" },
  completed: { label: "Delivered", bg: "bg-stone-100 text-stone-800 border-stone-200" },
  cancelled: { label: "Cancelled", bg: "bg-red-100 text-red-900 border-red-200" },
  refunded: { label: "Refunded", bg: "bg-gray-100 text-gray-700 border-gray-200" },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ total: 0, revenue: 0, pending: 0, paid: 0, shipped: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Edit fields for drawer
  const [editStatus, setEditStatus] = useState("pending");
  const [editTrackingNumber, setEditTrackingNumber] = useState("");
  const [editTrackingCarrier, setEditTrackingCarrier] = useState("DX Freight");
  const [editAdminNotes, setEditAdminNotes] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/admin/orders", window.location.origin);
      if (filterStatus !== "all") url.searchParams.set("status", filterStatus);
      if (searchQuery.trim()) url.searchParams.set("search", searchQuery.trim());

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [filterStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOrders();
  };

  const handleOpenDrawer = (order) => {
    setSelectedOrder(order);
    setEditStatus(order.status || "pending");
    setEditTrackingNumber(order.tracking_number || "");
    setEditTrackingCarrier(order.tracking_carrier || "DX Freight");
    setEditAdminNotes(order.admin_notes || "");
  };

  const handleCloseDrawer = () => {
    setSelectedOrder(null);
  };

  const handleSaveOrderChanges = async () => {
    if (!selectedOrder) return;
    setIsUpdating(true);

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          status: editStatus,
          trackingNumber: editTrackingNumber,
          trackingCarrier: editTrackingCarrier,
          adminNotes: editAdminNotes,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setSelectedOrder(data.order);
        setOrders((prev) => prev.map((o) => (o.id === data.order.id ? data.order : o)));
        showToast("Order status and tracking updated successfully!");
      } else {
        alert(data.error || "Failed to update order");
      }
    } catch (err) {
      console.error("Failed to update order:", err);
      alert("Error saving order changes");
    } finally {
      setIsUpdating(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`);
  };

  return (
    <div className="space-y-8 font-poppins pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 bg-[#090A0A] text-white border border-wbk-gold shadow-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <IconCheck size={16} className="text-wbk-gold" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#090A0A] text-white p-6 sm:p-8 border border-white/10 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-wbk-gold">
              Fulfillment & Dispatch
            </span>
          </div>
          <h1 className="font-new-york text-2xl sm:text-3xl font-medium text-white">
            Orders Management
          </h1>
          <p className="text-xs text-white/70 max-w-xl leading-relaxed">
            Monitor incoming customer purchases, review delivery addresses, update manufacturing statuses, and assign tracking numbers for precision logistics.
          </p>
        </div>

        <button
          type="button"
          onClick={loadOrders}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-colors shrink-0"
        >
          <IconRefresh size={15} className={loading ? "animate-spin" : ""} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 border border-wbk-lightgrey/60 shadow-2xs">
          <div className="flex items-center justify-between text-wbk-brown mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Total Revenue</span>
            <IconReceipt size={18} className="text-wbk-gold" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-wbk-black">
            £{stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-wbk-brown mt-1 block">Paid and fulfilled orders</span>
        </div>

        <div className="bg-white p-5 border border-wbk-lightgrey/60 shadow-2xs">
          <div className="flex items-center justify-between text-wbk-brown mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Ready to Dispatch</span>
            <IconPackage size={18} className="text-wbk-green" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-wbk-black">{stats.paid}</div>
          <span className="text-[11px] text-wbk-brown mt-1 block">Payment confirmed</span>
        </div>

        <div className="bg-white p-5 border border-wbk-lightgrey/60 shadow-2xs">
          <div className="flex items-center justify-between text-wbk-brown mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">In Transit</span>
            <IconTruck size={18} className="text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-wbk-black">{stats.shipped}</div>
          <span className="text-[11px] text-wbk-brown mt-1 block">Dispatched with courier</span>
        </div>

        <div className="bg-white p-5 border border-wbk-lightgrey/60 shadow-2xs">
          <div className="flex items-center justify-between text-wbk-brown mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Pending Payment</span>
            <IconClock size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-wbk-black">{stats.pending}</div>
          <span className="text-[11px] text-wbk-brown mt-1 block">Awaiting checkout</span>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white p-4 sm:p-5 border border-wbk-lightgrey/60 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          {["all", "paid", "processing", "shipped", "completed", "pending", "cancelled"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-full capitalize font-medium transition-colors shrink-0 ${
                filterStatus === st
                  ? "bg-wbk-black text-white"
                  : "bg-[#F4F2F0] text-wbk-brown hover:text-wbk-black hover:bg-wbk-lightgrey/80"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-sm w-full">
          <div className="relative flex-1">
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-wbk-brown" />
            <input
              type="text"
              placeholder="Search by ID, name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-wbk-lightgrey focus:border-wbk-black focus:outline-none bg-white transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-wbk-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-wbk-gold hover:text-wbk-black transition-colors shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-wbk-lightgrey/60 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-wbk-brown gap-3">
            <IconLoader2 size={28} className="animate-spin text-wbk-gold" />
            <span className="text-xs">Loading orders database...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <IconPackage size={40} className="mx-auto text-wbk-lightgrey" />
            <h3 className="font-new-york text-xl text-wbk-black">No orders found</h3>
            <p className="text-xs text-wbk-brown max-w-sm mx-auto">
              No orders matched your active filter or search criteria. When customers complete checkout, their orders will appear here immediately.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-poppins">
              <thead className="bg-[#FBF9F8] border-b border-wbk-lightgrey/80 text-wbk-brown uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="p-4">Order Ref</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Delivery</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wbk-lightgrey/60">
                {orders.map((ord) => {
                  const badge = STATUS_BADGES[ord.status] || STATUS_BADGES.pending;
                  const firstItem = ord.items?.[0];
                  const formattedDate = new Date(ord.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <tr key={ord.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="p-4 font-mono font-bold text-wbk-black">{ord.id}</td>
                      <td className="p-4 text-wbk-brown whitespace-nowrap">{formattedDate}</td>
                      <td className="p-4">
                        <span className="block font-medium text-wbk-black">{ord.customer_name}</span>
                        <span className="block text-[11px] text-wbk-brown truncate max-w-[180px]">
                          {ord.customer_email}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {firstItem?.image ? (
                            <div className="relative w-8 h-8 rounded border border-wbk-lightgrey overflow-hidden shrink-0 bg-white">
                              <Image
                                src={firstItem.image}
                                alt={firstItem.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 shrink-0">
                              WBK
                            </div>
                          )}
                          <span className="text-wbk-black truncate max-w-[140px]">
                            {ord.items?.length || 1} {ord.items?.length === 1 ? "item" : "items"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-wbk-brown whitespace-nowrap">
                        {ord.delivery_label || "Standard"}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 text-[10px] font-semibold border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-wbk-black font-poppins whitespace-nowrap">
                        £{Number(ord.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenDrawer(ord)}
                          className="px-3 py-1.5 bg-wbk-black hover:bg-wbk-gold hover:text-wbk-black text-white text-[11px] font-medium tracking-wider uppercase transition-colors"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-6 bg-[#090A0A] text-white flex items-center justify-between border-b border-white/10 shrink-0">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-wbk-gold block">
                  Order Management
                </span>
                <h2 className="font-new-york text-xl sm:text-2xl text-white flex items-center gap-3">
                  <span>{selectedOrder.id}</span>
                  <span
                    className={`text-[11px] font-sans px-2.5 py-0.5 border ${
                      STATUS_BADGES[selectedOrder.status]?.bg || STATUS_BADGES.pending.bg
                    }`}
                  >
                    {STATUS_BADGES[selectedOrder.status]?.label || selectedOrder.status}
                  </span>
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCloseDrawer}
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                <IconX size={22} />
              </button>
            </div>

            {/* Drawer Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-wbk-brown font-poppins">
              {/* Status & Carrier Control Box */}
              <div className="bg-[#FAF8F5] border border-wbk-lightgrey p-5 space-y-4">
                <h3 className="font-new-york text-base text-wbk-black font-medium">
                  Update Fulfillment & Tracking
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1">
                      Fulfillment Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-wbk-lightgrey bg-white text-xs text-wbk-black focus:border-wbk-black focus:outline-none"
                    >
                      <option value="pending">Pending Payment</option>
                      <option value="paid">Paid / Confirmed</option>
                      <option value="processing">In Production</option>
                      <option value="shipped">Dispatched (Carrier Transit)</option>
                      <option value="completed">Delivered & Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1">
                      Carrier Partner
                    </label>
                    <select
                      value={editTrackingCarrier}
                      onChange={(e) => setEditTrackingCarrier(e.target.value)}
                      className="w-full px-3 py-2 border border-wbk-lightgrey bg-white text-xs text-wbk-black focus:border-wbk-black focus:outline-none"
                    >
                      <option value="DX Freight">DX Freight (UK Two-Man)</option>
                      <option value="DPD UK">DPD UK Express</option>
                      <option value="Royal Mail">Royal Mail Special</option>
                      <option value="FedEx">FedEx International</option>
                      <option value="Direct Fleet">WallBedKing Direct Van</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1">
                      Tracking Reference / Waybill Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. DX-9842103GB"
                      value={editTrackingNumber}
                      onChange={(e) => setEditTrackingNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-wbk-lightgrey bg-white text-xs font-mono text-wbk-black focus:border-wbk-black focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSaveOrderChanges}
                    disabled={isUpdating}
                    className="px-5 py-2.5 bg-wbk-black hover:bg-wbk-gold hover:text-wbk-black text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isUpdating ? <IconLoader2 size={15} className="animate-spin" /> : <IconCheck size={15} />}
                    <span>Save Order Changes</span>
                  </button>
                </div>
              </div>

              {/* Customer & Shipping Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border border-wbk-lightgrey/80 bg-white space-y-2">
                  <span className="text-[10px] uppercase font-semibold text-wbk-brown tracking-wider block">
                    Customer Information
                  </span>
                  <p className="font-semibold text-wbk-black text-sm">{selectedOrder.customer_name}</p>
                  <p className="text-wbk-black">{selectedOrder.customer_email}</p>
                  <p>Tel: {selectedOrder.customer_phone || "Not provided"}</p>
                </div>

                <div className="p-4 border border-wbk-lightgrey/80 bg-white space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-semibold text-wbk-brown tracking-wider block">
                      Delivery Address
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const addr = selectedOrder.shipping_address;
                        const formatted = `${selectedOrder.customer_name}, ${addr?.address1 || ""}, ${addr?.city || ""}, ${addr?.postcode || ""}`;
                        copyToClipboard(formatted, "Address");
                      }}
                      className="text-wbk-brown hover:text-wbk-black text-[11px] flex items-center gap-1"
                    >
                      <IconCopy size={13} />
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="text-xs text-wbk-black leading-relaxed">
                    <p>{selectedOrder.shipping_address?.address1}</p>
                    {selectedOrder.shipping_address?.address2 && (
                      <p>{selectedOrder.shipping_address.address2}</p>
                    )}
                    <p>
                      {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.postcode}
                    </p>
                    <p>{selectedOrder.shipping_address?.country || "United Kingdom"}</p>
                  </div>
                </div>
              </div>

              {/* Order Items List */}
              <div className="border border-wbk-lightgrey/80 bg-white p-4 space-y-3">
                <span className="text-[10px] uppercase font-semibold text-wbk-brown tracking-wider block">
                  Ordered Items ({selectedOrder.items?.length || 0})
                </span>

                <div className="space-y-3 divide-y divide-wbk-lightgrey/40">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="relative w-14 h-14 bg-gray-50 border border-wbk-lightgrey shrink-0 overflow-hidden">
                          <Image
                            src={item.image || "/sofa1.webp"}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold text-wbk-black text-xs">{item.title}</h4>
                          <span className="text-[11px] text-wbk-brown block">
                            {item.options?.size} {item.options?.orientation && `(${item.options.orientation})`}
                          </span>
                          <span className="text-[11px] text-wbk-brown/80 block mt-0.5">
                            Qty: {item.quantity} × £{Number(item.price || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <span className="font-bold text-wbk-black font-poppins">
                        £{(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Financial Summary */}
                <div className="pt-3 border-t border-wbk-lightgrey space-y-1.5 text-right font-poppins">
                  <div className="flex justify-between text-xs">
                    <span>Subtotal:</span>
                    <span className="text-wbk-black font-medium">
                      £{Number(selectedOrder.subtotal || 0).toFixed(2)}
                    </span>
                  </div>
                  {Number(selectedOrder.discount_amount) > 0 && (
                    <div className="flex justify-between text-xs text-wbk-green">
                      <span>Discount ({selectedOrder.promo_code}):</span>
                      <span>-£{Number(selectedOrder.discount_amount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span>Delivery ({selectedOrder.delivery_label || "Standard"}):</span>
                    <span className="text-wbk-black font-medium">
                      {Number(selectedOrder.shipping_amount) === 0
                        ? "Free"
                        : `£${Number(selectedOrder.shipping_amount).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-wbk-brown/70">
                    <span>Includes 20% VAT:</span>
                    <span>£{Number(selectedOrder.vat_amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-wbk-black pt-2 border-t border-wbk-lightgrey">
                    <span>Total Paid:</span>
                    <span>£{Number(selectedOrder.total_amount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="p-4 border border-wbk-lightgrey/80 bg-white space-y-2">
                <span className="text-[10px] uppercase font-semibold text-wbk-brown tracking-wider block">
                  Payment Transaction
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-wbk-brown block">Method:</span>
                    <span className="font-semibold text-wbk-black capitalize">
                      {selectedOrder.payment_method || "Card"}
                    </span>
                  </div>
                  <div>
                    <span className="text-wbk-brown block">Transaction ID:</span>
                    <span className="font-mono text-wbk-black truncate block">
                      {selectedOrder.payment_id || "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
