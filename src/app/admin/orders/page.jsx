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
  IconMail,
  IconBuildingBank,
  IconCircleX,
  IconReceiptRefund,
} from "@tabler/icons-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getBankDetails } from "@/lib/bank-details";

const STATUS_BADGES = {
  pending: { label: "Pending Payment", bg: "bg-amber-100 text-amber-900 border-amber-200" },
  paid: { label: "Paid / Confirmed", bg: "bg-emerald-100 text-emerald-900 border-emerald-200" },
  processing: { label: "In Production", bg: "bg-blue-100 text-blue-900 border-blue-200" },
  shipped: { label: "Dispatched", bg: "bg-purple-100 text-purple-900 border-purple-200" },
  completed: { label: "Delivered", bg: "bg-stone-100 text-stone-800 border-stone-200" },
  cancelled: { label: "Cancelled", bg: "bg-red-100 text-red-900 border-red-200" },
  refunded: { label: "Refunded", bg: "bg-gray-100 text-gray-700 border-gray-200" },
};

function getCurrencySymbol(currency) {
  const code = String(currency || "GBP").toUpperCase();
  if (code === "EUR") return "€";
  if (code === "USD") return "$";
  return "£";
}

function formatOrderDateParts(isoString) {
  if (!isoString) return { date: "N/A", time: "", full: "N/A" };
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) {
    return { date: String(isoString), time: "", full: String(isoString) };
  }
  const date = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return {
    date,
    time,
    full: `${date}, ${time}`,
  };
}

function extractOrderMarketMeta(order) {
  if (!order) return { locale: "EN", entity: "UK", currency: "GBP" };
  const notes = typeof order.admin_notes === "string" ? order.admin_notes : "";
  const locMatch = notes.match(/\[Locale:\s*([^\]]+)\]/i);
  const entMatch = notes.match(/\[Entity:\s*([^\]]+)\]/i);
  const locale = String(
    order.locale ||
      order.shipping_address?.locale ||
      (locMatch ? locMatch[1].trim() : "en")
  ).toUpperCase();
  const entity = String(
    order.shipping_address?.company_entity ||
      (entMatch ? entMatch[1].trim() : locale === "EN" ? "UK" : "INTERNATIONAL")
  );
  const currency = String(order.currency || "GBP").toUpperCase();
  return { locale, entity, currency };
}

function normalizeAddressLines(rawAddr) {
  if (!rawAddr) return null;
  let addr = rawAddr;
  if (typeof addr === "string") {
    try {
      addr = JSON.parse(addr);
    } catch {
      return { line1: addr, line2: "", city: "", postcode: "", country: "" };
    }
  }
  if (!addr || typeof addr !== "object") return null;
  const line1 = addr.address1 || addr.address || addr.line1 || "";
  const line2 = addr.address2 || addr.line2 || "";
  const city = addr.city || "";
  const postcode = addr.postcode || addr.postal_code || addr.zip || "";
  const country = addr.country || "United Kingdom";
  if (!line1 && !city && !postcode) return null;
  return { line1, line2, city, postcode, country };
}

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
  const [editTrackingCarrier, setEditTrackingCarrier] = useState("UPS");
  const [editAdminNotes, setEditAdminNotes] = useState("");
  const [sendUpdateEmail, setSendUpdateEmail] = useState(false);
  const [resendingEmailType, setResendingEmailType] = useState(null);

  const loadOrders = async (overrideSearch = null, autoOpenExact = false) => {
    setLoading(true);
    try {
      const effectiveSearch = overrideSearch !== null ? overrideSearch : searchQuery;
      const url = new URL("/api/admin/orders", window.location.origin);
      if (filterStatus !== "all") url.searchParams.set("status", filterStatus);
      if (effectiveSearch.trim()) url.searchParams.set("search", effectiveSearch.trim());

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        const list = data.orders || [];
        setOrders(list);
        if (data.stats) setStats(data.stats);
        if (autoOpenExact && effectiveSearch.trim() && list.length > 0) {
          const exact =
            list.find((o) => String(o.id).toLowerCase() === effectiveSearch.trim().toLowerCase()) ||
            (list.length === 1 ? list[0] : null);
          if (exact) {
            handleOpenDrawer(exact);
          }
        }
      }
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const urlSearch = params?.get("search") || "";
    if (urlSearch && !searchQuery && filterStatus === "all") {
      setSearchQuery(urlSearch);
      loadOrders(urlSearch, true);
    } else {
      loadOrders();
    }
  }, [filterStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOrders();
  };

  const handleOpenDrawer = (order) => {
    setSelectedOrder(order);
    setEditStatus(order.status || "pending");
    setEditTrackingNumber(order.tracking_number || "");
    setEditTrackingCarrier(order.tracking_carrier || "UPS");
    setEditAdminNotes(order.admin_notes || "");
    setSendUpdateEmail(false);
    setResendingEmailType(null);
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
          paymentStatus:
            editStatus === "paid"
              ? "paid"
              : editStatus === "refunded"
              ? "refunded"
              : undefined,
          trackingNumber: editTrackingNumber,
          trackingCarrier: editTrackingCarrier,
          adminNotes: editAdminNotes,
          sendUpdateEmail,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setSelectedOrder(data.order);
        setOrders((prev) => prev.map((o) => (o.id === data.order.id ? data.order : o)));
        setSendUpdateEmail(false);
        showToast(data.message || "Order status and tracking updated successfully!");
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

  const handleMarkAsPaid = async (orderId) => {
    const targetOrder = orderId ? orders.find((o) => o.id === orderId) : selectedOrder;
    if (!targetOrder) return;

    const curr = targetOrder.currency === "EUR" ? "€" : targetOrder.currency === "USD" ? "$" : "£";
    if (
      !window.confirm(
        `Confirm bank transfer payment received for Order ${targetOrder.id}?\n\nCustomer: ${targetOrder.customer_name || "Valued Customer"} (${targetOrder.customer_email})\nAmount: ${curr}${Number(targetOrder.total_amount || 0).toFixed(2)}\n\nThis will mark the payment status as PAID, advance the order to In Production, and immediately send the official payment confirmation email to the customer.`
      )
    ) {
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: targetOrder.id,
          status: "processing",
          paymentStatus: "paid",
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setSelectedOrder(data.order);
        setOrders((prev) => prev.map((o) => (o.id === data.order.id ? data.order : o)));
        showToast("✓ Bank payment confirmed! Official confirmation email sent to customer.");
      } else {
        alert(data.error || "Failed to confirm payment");
      }
    } catch (err) {
      console.error("Failed to mark order as paid:", err);
      alert("Error confirming payment");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResendEmail = async (emailType, isUpdate = true) => {
    if (!selectedOrder) return;
    const labels = {
      confirmation: "Order Confirmation",
      production: "In Production",
      shipped: "Dispatch & Tracking",
      delivery: "Delivered & Guides",
      cancelled: "Order Cancelled",
      refunded: "Order Refunded",
    };
    const typeLabel = labels[emailType] || emailType;

    const noticeText = isUpdate
      ? "marked with [UPDATED] tag and top update notice banner"
      : "in original standard format";

    if (
      !window.confirm(
        `Are you sure you want to resend this notification email to ${selectedOrder.customer_email}?\n\nEmail Type: ${typeLabel}\nFormat: ${noticeText}`
      )
    ) {
      return;
    }

    setResendingEmailType(emailType);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          action: "resend_email",
          emailType,
          isUpdate,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setSelectedOrder(data.order);
        setOrders((prev) => prev.map((o) => (o.id === data.order.id ? data.order : o)));
        showToast(data.message || `${typeLabel} email resent successfully!`);
      } else {
        alert(data.error || "Failed to resend email");
      }
    } catch (err) {
      console.error("Failed to resend email:", err);
      alert("Error occurred while resending email");
    } finally {
      setResendingEmailType(null);
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

      {/* Page Header */}
      <AdminPageHeader
        badge="Fulfillment & Dispatch"
        title="Orders Management"
        count={orders.length}
        description="Monitor incoming customer purchases, review delivery addresses, update manufacturing statuses, and assign tracking numbers for precision logistics."
        actions={
          <button
            type="button"
            onClick={loadOrders}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-wbk-lightgrey hover:border-wbk-black text-wbk-black text-xs font-semibold uppercase tracking-wider rounded-full transition-colors shadow-2xs cursor-pointer"
          >
            <IconRefresh size={15} className={loading ? "animate-spin" : ""} />
            <span>Refresh Orders</span>
          </button>
        }
      />

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
          {["all", "paid", "processing", "shipped", "completed", "pending", "cancelled", "refunded"].map((st) => (
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
            <h3 className="font-poppins text-lg font-semibold text-wbk-black">No orders found</h3>
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
                  <th className="p-4">Date &amp; Time</th>
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
                  const dateParts = formatOrderDateParts(ord.created_at);
                  const ordSymbol = getCurrencySymbol(ord.currency);
                  const ordMarket = extractOrderMarketMeta(ord);

                  return (
                    <tr key={ord.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="p-4 font-mono font-bold text-wbk-black whitespace-nowrap">
                        <span className="block">{ord.id}</span>
                        <span className="inline-block text-[10px] font-sans font-normal text-wbk-brown">
                          {ordMarket.locale} • {ordMarket.currency}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="block font-medium text-wbk-black">{dateParts.date}</span>
                        {dateParts.time && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-wbk-brown mt-0.5">
                            <IconClock size={12} className="text-wbk-gold shrink-0" />
                            <span>{dateParts.time}</span>
                          </span>
                        )}
                      </td>
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
                          {ord.items?.some((it) => it.options?.sofaIncluded) && (
                            <span className="inline-block text-[9px] font-bold bg-[#FAF5EA] text-wbk-gold border border-wbk-gold/40 px-1.5 py-0.5 rounded shrink-0">
                              + Sofa
                            </span>
                          )}
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
                        {(ord.payment_method || "").toLowerCase().includes("bank") && (ord.payment_status || "").toLowerCase() !== "paid" && (
                          <span className="block text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 border border-amber-200 mt-1 rounded-2xs">
                            🏦 Bank Unpaid
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right font-bold text-wbk-black font-poppins whitespace-nowrap">
                        {ordSymbol}
                        {Number(ord.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenDrawer(ord)}
                          className="px-3 py-1.5 bg-wbk-black hover:bg-wbk-gold hover:text-wbk-black text-white text-[11px] font-medium tracking-wider uppercase transition-colors"
                        >
                          Manage
                        </button>
                        {(ord.payment_method || "").toLowerCase().includes("bank") && (ord.payment_status || "").toLowerCase() !== "paid" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsPaid(ord.id);
                            }}
                            className="block mt-1 w-full px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider transition-colors shadow-2xs"
                            title="Confirm payment received and notify customer"
                          >
                            Mark Paid
                          </button>
                        )}
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
            <div className="p-6 bg-[#090A0A] text-white flex items-start justify-between border-b border-white/10 shrink-0">
              {(() => {
                const headerDate = formatOrderDateParts(selectedOrder.created_at);
                const headerMarket = extractOrderMarketMeta(selectedOrder);
                return (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-wbk-gold block">
                      Order Management
                    </span>
                    <h2 className="font-new-york text-xl sm:text-2xl text-white flex flex-wrap items-center gap-3">
                      <span>{selectedOrder.id}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedOrder.id, "Order ID")}
                        className="text-white/50 hover:text-wbk-gold transition-colors cursor-pointer"
                        title="Copy Order Reference"
                      >
                        <IconCopy size={15} />
                      </button>
                      <span
                        className={`text-[11px] font-sans px-2.5 py-0.5 border ${
                          STATUS_BADGES[selectedOrder.status]?.bg || STATUS_BADGES.pending.bg
                        }`}
                      >
                        {STATUS_BADGES[selectedOrder.status]?.label || selectedOrder.status}
                      </span>
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/75 font-mono pt-0.5">
                      <span className="inline-flex items-center gap-1.5">
                        <IconClock size={13} className="text-wbk-gold shrink-0" />
                        <span>Placed: {headerDate.full}</span>
                      </span>
                      <span className="text-white/30">•</span>
                      <span>
                        {headerMarket.locale} ({headerMarket.entity} / {headerMarket.currency})
                      </span>
                    </div>
                  </div>
                );
              })()}

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
              {(() => {
                const sentHistory = selectedOrder.shipping_address?.notifications_sent || {};
                const wasProcessingSent = Boolean(sentHistory.processing);
                const wasShippedSent = Boolean(selectedOrder.dispatched_at || sentHistory.shipped);
                const wasDeliveredSent = Boolean(selectedOrder.delivered_at || sentHistory.completed);
                const wasConfirmationSent = Boolean(sentHistory.confirmation);
                const wasCancelledSent = Boolean(sentHistory.cancelled);
                const wasRefundedSent = Boolean(sentHistory.refunded);
                const createdMeta = formatOrderDateParts(selectedOrder.created_at);
                const updatedMeta = selectedOrder.updated_at
                  ? formatOrderDateParts(selectedOrder.updated_at)
                  : null;
                const dispatchedMeta =
                  selectedOrder.dispatched_at || sentHistory.shipped
                    ? formatOrderDateParts(selectedOrder.dispatched_at || sentHistory.shipped)
                    : null;
                const deliveredMeta =
                  selectedOrder.delivered_at || sentHistory.completed
                    ? formatOrderDateParts(selectedOrder.delivered_at || sentHistory.completed)
                    : null;
                const marketMeta = extractOrderMarketMeta(selectedOrder);

                const formatNotificationDate = (isoString) => {
                  if (!isoString) return "";
                  try {
                    const d = new Date(isoString);
                    return d.toLocaleString("en-GB", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  } catch (e) {
                    return isoString;
                  }
                };

                return (
                  <>
                    {/* Order Metadata & Timestamps Card */}
                    <div className="p-4 border border-wbk-lightgrey/80 bg-white space-y-3">
                      <div className="flex items-center justify-between border-b border-wbk-lightgrey/60 pb-2">
                        <span className="text-[10px] uppercase font-semibold text-wbk-brown tracking-wider flex items-center gap-1.5">
                          <IconClock size={14} className="text-wbk-gold" />
                          <span>Order Timestamps &amp; Metadata</span>
                        </span>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-[#FAF8F5] border border-wbk-lightgrey text-wbk-black">
                          {marketMeta.locale} • {marketMeta.entity} • {marketMeta.currency}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[11px] text-wbk-brown block">Order Placed (Date &amp; Time):</span>
                          <span className="font-mono font-semibold text-wbk-black">{createdMeta.full}</span>
                        </div>
                        {updatedMeta && (
                          <div>
                            <span className="text-[11px] text-wbk-brown block">Last Modified:</span>
                            <span className="font-mono text-wbk-black">{updatedMeta.full}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-[11px] text-wbk-brown block">Delivery Method:</span>
                          <span className="font-medium text-wbk-black">
                            {selectedOrder.delivery_label || selectedOrder.delivery_option || "Standard Delivery"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-wbk-brown block">Payment Status &amp; Gateway:</span>
                          <span className="font-medium text-wbk-black capitalize">
                            {selectedOrder.payment_method || "Card"} •{" "}
                            <span
                              className={
                                (selectedOrder.payment_status || "").toLowerCase() === "paid"
                                  ? "text-emerald-700 font-semibold"
                                  : "text-amber-800 font-semibold"
                              }
                            >
                              {selectedOrder.payment_status || "Unpaid"}
                            </span>
                          </span>
                        </div>
                        {dispatchedMeta && (
                          <div>
                            <span className="text-[11px] text-wbk-brown block">Dispatched At:</span>
                            <span className="font-mono text-purple-800">{dispatchedMeta.full}</span>
                          </div>
                        )}
                        {deliveredMeta && (
                          <div>
                            <span className="text-[11px] text-wbk-brown block">Delivered At:</span>
                            <span className="font-mono text-emerald-800">{deliveredMeta.full}</span>
                          </div>
                        )}
                      </div>

                      {selectedOrder.customer_notes && (
                        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded text-xs">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-900 block mb-0.5">
                            Customer Checkout Notes:
                          </span>
                          <p className="text-amber-950 italic">{selectedOrder.customer_notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Status & Carrier Control Box */}
                    <div className="bg-[#FAF8F5] border border-wbk-lightgrey p-5 space-y-4">
                      <h3 className="font-poppins text-base text-wbk-black font-semibold">
                        Update Fulfillment & Tracking
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1">
                            Fulfillment Status
                          </label>
                          <select
                            value={editStatus}
                            onChange={(e) => {
                              setEditStatus(e.target.value);
                              setSendUpdateEmail(false);
                            }}
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
                            <option value="UPS">UPS (United Parcel Service)</option>
                            <option value="DHL">DHL Express / Logistics</option>
                            <option value="Own Delivery">Wall Bed King Dedicated Delivery (Internal Fleet)</option>
                          </select>
                        </div>

                        {editTrackingCarrier === "Own Delivery" ? (
                          <div className="sm:col-span-2 p-3 bg-amber-50/80 border border-amber-200 text-amber-900 rounded text-xs flex items-start gap-2.5">
                            <IconTruck size={17} className="shrink-0 mt-0.5 text-amber-700" />
                            <div className="space-y-0.5">
                              <span className="font-semibold block text-[11px] uppercase tracking-wider text-amber-900">
                                Internal Dedicated Delivery Fleet
                              </span>
                              <p className="text-[11px] text-amber-800 leading-relaxed">
                                Internal dedicated fleet delivery does not use external tracking numbers. The customer dispatch notification email will automatically include direct logistics delivery information and phone/SMS scheduling details.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="sm:col-span-2">
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black">
                                Tracking Reference / Waybill Number ({editTrackingCarrier})
                              </label>
                              {editTrackingNumber && (
                                <a
                                  href={
                                    editTrackingCarrier.toLowerCase().includes("ups")
                                      ? `https://www.ups.com/track?track=yes&trackNums=${encodeURIComponent(editTrackingNumber)}`
                                      : `https://www.dhl.com/en/express/tracking.html?AWB=${encodeURIComponent(editTrackingNumber)}&brand=DHL`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-wbk-gold hover:underline flex items-center gap-0.5"
                                >
                                  <span>Open {editTrackingCarrier} tracker ↗</span>
                                </a>
                              )}
                            </div>
                            <input
                              type="text"
                              placeholder={
                                editTrackingCarrier.toLowerCase().includes("ups")
                                  ? "e.g. 1Z9999999999999999"
                                  : "e.g. 1234567890"
                              }
                              value={editTrackingNumber}
                              onChange={(e) => setEditTrackingNumber(e.target.value)}
                              className="w-full px-3 py-2 border border-wbk-lightgrey bg-white text-xs font-mono text-wbk-black focus:border-wbk-black focus:outline-none"
                            />
                          </div>
                        )}

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1">
                            Internal Admin Notes
                          </label>
                          <textarea
                            rows={2}
                            value={editAdminNotes}
                            onChange={(e) => setEditAdminNotes(e.target.value)}
                            placeholder="Private administrative notes (not visible to customer)..."
                            className="w-full px-3 py-2 border border-wbk-lightgrey bg-white text-xs text-wbk-black focus:border-wbk-black focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Smart Status Notification Logic */}
                      {editStatus === "processing" && (
                        <>
                          {!wasProcessingSent ? (
                            <div className="p-3 bg-blue-50/90 border border-blue-200 text-blue-900 text-xs flex items-start gap-2.5">
                              <IconPackage size={17} className="shrink-0 mt-0.5 text-blue-600" />
                              <div className="space-y-0.5">
                                <span className="font-semibold block text-[11px] uppercase tracking-wider text-blue-900">
                                  ⚡ First-Time Status Change: Automatic Customer Notification
                                </span>
                                <p className="text-[11px] text-blue-800 leading-relaxed">
                                  When saving this order, the customer will automatically receive the official <strong>"In Production"</strong> email. <strong>No checkbox needed!</strong>
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3.5 bg-amber-50/90 border border-amber-200 text-amber-950 text-xs space-y-2">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-semibold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                                  <span>✉️ In Production email already sent on</span>
                                </span>
                                <span className="font-mono text-amber-800 text-[10px]">
                                  {formatNotificationDate(sentHistory.processing)}
                                </span>
                              </div>
                              <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={sendUpdateEmail}
                                  onChange={(e) => setSendUpdateEmail(e.target.checked)}
                                  className="mt-0.5 h-4 w-4 rounded border-amber-300 text-wbk-gold focus:ring-wbk-gold cursor-pointer"
                                />
                                <div className="space-y-0.5">
                                  <span className="font-semibold text-wbk-black block text-xs">
                                    Send update notification email to customer (marked as [UPDATED])
                                  </span>
                                  <span className="text-[11px] text-amber-800/90 block leading-normal">
                                    Tick this box if order details or production schedules changed and you want to resend an updated notification email. The customer will see a prominent update banner and an <strong>[UPDATED]</strong> subject tag.
                                  </span>
                                </div>
                              </label>
                            </div>
                          )}
                        </>
                      )}

                      {editStatus === "shipped" && (
                        <>
                          {!wasShippedSent ? (
                            <div className="p-3 bg-purple-50/90 border border-purple-200 text-purple-900 text-xs flex items-start gap-2.5">
                              <IconTruck size={17} className="shrink-0 mt-0.5 text-purple-600" />
                              <div className="space-y-0.5">
                                <span className="font-semibold block text-[11px] uppercase tracking-wider text-purple-900">
                                  ⚡ First Dispatch: Automatic Tracking Notification
                                </span>
                                <p className="text-[11px] text-purple-800 leading-relaxed">
                                  When saving this order, the customer will automatically receive the dispatch notification email ({editTrackingCarrier}{editTrackingNumber ? ` - ${editTrackingNumber}` : ""}). <strong>No checkbox needed!</strong>
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3.5 bg-amber-50/90 border border-amber-200 text-amber-950 text-xs space-y-2">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-semibold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                                  <span>✉️ Dispatch notification already sent on</span>
                                </span>
                                <span className="font-mono text-amber-800 text-[10px]">
                                  {formatNotificationDate(selectedOrder.dispatched_at || sentHistory.shipped)}
                                </span>
                              </div>
                              <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={sendUpdateEmail}
                                  onChange={(e) => setSendUpdateEmail(e.target.checked)}
                                  className="mt-0.5 h-4 w-4 rounded border-amber-300 text-wbk-gold focus:ring-wbk-gold cursor-pointer"
                                />
                                <div className="space-y-0.5">
                                  <span className="font-semibold text-wbk-black block text-xs">
                                    Send updated dispatch notification to customer (marked as [UPDATED])
                                  </span>
                                  <span className="text-[11px] text-amber-800/90 block leading-normal">
                                    Tick this box if the tracking number or courier service changed and you want to notify the customer with the new logistics details.
                                  </span>
                                </div>
                              </label>
                            </div>
                          )}
                        </>
                      )}

                      {editStatus === "completed" && (
                        <>
                          {!wasDeliveredSent ? (
                            <div className="p-3 bg-emerald-50/90 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
                              <IconCheck size={17} className="shrink-0 mt-0.5 text-emerald-600" />
                              <div className="space-y-0.5">
                                <span className="font-semibold block text-[11px] uppercase tracking-wider text-emerald-900">
                                  ⚡ First Completion: Automatic Delivery Confirmation
                                </span>
                                <p className="text-[11px] text-emerald-800 leading-relaxed">
                                  When saving this order, the customer will automatically receive the delivery confirmation email with installation guides and warranty details. <strong>No checkbox needed!</strong>
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3.5 bg-amber-50/90 border border-amber-200 text-amber-950 text-xs space-y-2">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-semibold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                                  <span>✉️ Delivery confirmation already sent on</span>
                                </span>
                                <span className="font-mono text-amber-800 text-[10px]">
                                  {formatNotificationDate(selectedOrder.delivered_at || sentHistory.completed)}
                                </span>
                              </div>
                              <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={sendUpdateEmail}
                                  onChange={(e) => setSendUpdateEmail(e.target.checked)}
                                  className="mt-0.5 h-4 w-4 rounded border-amber-300 text-wbk-gold focus:ring-wbk-gold cursor-pointer"
                                />
                                <div className="space-y-0.5">
                                  <span className="font-semibold text-wbk-black block text-xs">
                                    Send updated delivery confirmation to customer (marked as [UPDATED])
                                  </span>
                                  <span className="text-[11px] text-amber-800/90 block leading-normal">
                                    Tick this box if you wish to resend the delivery confirmation email to the customer.
                                  </span>
                                </div>
                              </label>
                            </div>
                          )}
                        </>
                      )}

                      {editStatus === "cancelled" && (
                        <>
                          {!wasCancelledSent ? (
                            <div className="p-3 bg-red-50/90 border border-red-200 text-red-900 text-xs flex items-start gap-2.5">
                              <IconCircleX size={17} className="shrink-0 mt-0.5 text-red-600" />
                              <div className="space-y-0.5">
                                <span className="font-semibold block text-[11px] uppercase tracking-wider text-red-900">
                                  ⚡ First Cancellation: Automatic Customer Notification
                                </span>
                                <p className="text-[11px] text-red-800 leading-relaxed">
                                  When saving this order, the customer will automatically receive the official <strong>Order Cancelled</strong> email in their storefront language. <strong>No checkbox needed!</strong>
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3.5 bg-amber-50/90 border border-amber-200 text-amber-950 text-xs space-y-2">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-semibold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                                  <span>✉️ Cancellation email already sent on</span>
                                </span>
                                <span className="font-mono text-amber-800 text-[10px]">
                                  {formatNotificationDate(sentHistory.cancelled)}
                                </span>
                              </div>
                              <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={sendUpdateEmail}
                                  onChange={(e) => setSendUpdateEmail(e.target.checked)}
                                  className="mt-0.5 h-4 w-4 rounded border-amber-300 text-wbk-gold focus:ring-wbk-gold cursor-pointer"
                                />
                                <div className="space-y-0.5">
                                  <span className="font-semibold text-wbk-black block text-xs">
                                    Send updated cancellation notice to customer (marked as [UPDATED])
                                  </span>
                                  <span className="text-[11px] text-amber-800/90 block leading-normal">
                                    Tick this box if you wish to resend the cancellation email to the customer.
                                  </span>
                                </div>
                              </label>
                            </div>
                          )}
                        </>
                      )}

                      {editStatus === "refunded" && (
                        <>
                          {!wasRefundedSent ? (
                            <div className="p-3 bg-blue-50/90 border border-blue-200 text-blue-900 text-xs flex items-start gap-2.5">
                              <IconReceiptRefund size={17} className="shrink-0 mt-0.5 text-blue-600" />
                              <div className="space-y-0.5">
                                <span className="font-semibold block text-[11px] uppercase tracking-wider text-blue-900">
                                  ⚡ First Refund: Automatic Refund Confirmation
                                </span>
                                <p className="text-[11px] text-blue-800 leading-relaxed">
                                  When saving this order, the customer will automatically receive the official <strong>Refund Confirmation</strong> email in their storefront language. <strong>No checkbox needed!</strong>
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3.5 bg-amber-50/90 border border-amber-200 text-amber-950 text-xs space-y-2">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-semibold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                                  <span>✉️ Refund confirmation already sent on</span>
                                </span>
                                <span className="font-mono text-amber-800 text-[10px]">
                                  {formatNotificationDate(sentHistory.refunded)}
                                </span>
                              </div>
                              <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={sendUpdateEmail}
                                  onChange={(e) => setSendUpdateEmail(e.target.checked)}
                                  className="mt-0.5 h-4 w-4 rounded border-amber-300 text-wbk-gold focus:ring-wbk-gold cursor-pointer"
                                />
                                <div className="space-y-0.5">
                                  <span className="font-semibold text-wbk-black block text-xs">
                                    Send updated refund confirmation to customer (marked as [UPDATED])
                                  </span>
                                  <span className="text-[11px] text-amber-800/90 block leading-normal">
                                    Tick this box if you wish to resend the refund confirmation email to the customer.
                                  </span>
                                </div>
                              </label>
                            </div>
                          )}
                        </>
                      )}

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

                    {/* Customer Email Notifications & Quick Resend Panel */}
                    <div className="bg-white border border-wbk-lightgrey/80 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-semibold text-wbk-brown tracking-wider flex items-center gap-1.5">
                          <IconMail size={14} className="text-wbk-black" />
                          <span>Customer Notification Emails & Quick Resend</span>
                        </span>
                        <span className="text-[10px] text-wbk-brown/70 font-mono">
                          {selectedOrder.customer_email}
                        </span>
                      </div>

                      <div className="space-y-2.5 divide-y divide-wbk-lightgrey/40 text-xs">
                        {/* 1. Confirmation */}
                        <div className="pt-2 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="font-semibold text-wbk-black flex items-center gap-2">
                              <span>1. Order Confirmation</span>
                              {wasConfirmationSent ? (
                                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-normal font-mono">
                                  Sent: {formatNotificationDate(sentHistory.confirmation)}
                                </span>
                              ) : (
                                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-normal">
                                  Automated on Checkout
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-wbk-brown mt-0.5">
                              Payment receipt with itemized cart and delivery address.
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              disabled={resendingEmailType !== null}
                              onClick={() => handleResendEmail("confirmation", true)}
                              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-medium rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                              title="Resend email with [UPDATED] warning banner"
                            >
                              {resendingEmailType === "confirmation" ? (
                                <IconLoader2 size={12} className="animate-spin" />
                              ) : (
                                <IconRefresh size={12} />
                              )}
                              <span>Resend [UPDATED]</span>
                            </button>
                            <button
                              type="button"
                              disabled={resendingEmailType !== null}
                              onClick={() => handleResendEmail("confirmation", false)}
                              className="px-2 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-medium rounded transition-colors disabled:opacity-50"
                              title="Resend original standard email"
                            >
                              <span>Standard</span>
                            </button>
                          </div>
                        </div>

                        {/* 2. In Production */}
                        <div className="pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="font-semibold text-wbk-black flex items-center gap-2">
                              <span>2. In Production</span>
                              {wasProcessingSent ? (
                                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-normal font-mono">
                                  Sent: {formatNotificationDate(sentHistory.processing)}
                                </span>
                              ) : (
                                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-normal">
                                  Not sent yet
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-wbk-brown mt-0.5">
                              Steel framing fabrication & gas piston calibration update.
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              disabled={resendingEmailType !== null}
                              onClick={() => handleResendEmail("production", true)}
                              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-medium rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                              title="Resend email with [UPDATED] warning banner"
                            >
                              {resendingEmailType === "production" ? (
                                <IconLoader2 size={12} className="animate-spin" />
                              ) : (
                                <IconRefresh size={12} />
                              )}
                              <span>Resend [UPDATED]</span>
                            </button>
                          </div>
                        </div>

                        {/* 3. Dispatch & Tracking */}
                        <div className="pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="font-semibold text-wbk-black flex items-center gap-2">
                              <span>3. Dispatch & Tracking</span>
                              {wasShippedSent ? (
                                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-normal font-mono">
                                  Sent: {formatNotificationDate(selectedOrder.dispatched_at || sentHistory.shipped)}
                                </span>
                              ) : (
                                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-normal">
                                  Not sent yet
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-wbk-brown mt-0.5">
                              Courier details ({selectedOrder.tracking_carrier || "UPS"}) and tracking number.
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              disabled={resendingEmailType !== null}
                              onClick={() => handleResendEmail("shipped", true)}
                              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-medium rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                              title="Resend email with [UPDATED] warning banner"
                            >
                              {resendingEmailType === "shipped" ? (
                                <IconLoader2 size={12} className="animate-spin" />
                              ) : (
                                <IconRefresh size={12} />
                              )}
                              <span>Resend [UPDATED]</span>
                            </button>
                          </div>
                        </div>

                        {/* 4. Delivered */}
                        <div className="pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="font-semibold text-wbk-black flex items-center gap-2">
                              <span>4. Delivered & Guarantee</span>
                              {wasDeliveredSent ? (
                                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-normal font-mono">
                                  Sent: {formatNotificationDate(selectedOrder.delivered_at || sentHistory.completed)}
                                </span>
                              ) : (
                                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-normal">
                                  Not sent yet
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-wbk-brown mt-0.5">
                              Assembly manuals, lifetime guarantee, and review invite.
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              disabled={resendingEmailType !== null}
                              onClick={() => handleResendEmail("delivery", true)}
                              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-medium rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                              title="Resend email with [UPDATED] warning banner"
                            >
                              {resendingEmailType === "delivery" ? (
                                <IconLoader2 size={12} className="animate-spin" />
                              ) : (
                                <IconRefresh size={12} />
                              )}
                              <span>Resend [UPDATED]</span>
                            </button>
                          </div>
                        </div>

                        {/* 5. Order Cancelled */}
                        <div className="pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="font-semibold text-wbk-black flex items-center gap-2">
                              <span>5. Order Cancelled</span>
                              {wasCancelledSent ? (
                                <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-800 rounded font-normal font-mono">
                                  Sent: {formatNotificationDate(sentHistory.cancelled)}
                                </span>
                              ) : (
                                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-normal">
                                  Not sent yet
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-wbk-brown mt-0.5">
                              Official order cancellation notice in the customer's language.
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              disabled={resendingEmailType !== null}
                              onClick={() => handleResendEmail("cancelled", true)}
                              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-medium rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                              title="Resend cancellation email with [UPDATED] warning banner"
                            >
                              {resendingEmailType === "cancelled" ? (
                                <IconLoader2 size={12} className="animate-spin" />
                              ) : (
                                <IconRefresh size={12} />
                              )}
                              <span>Resend [UPDATED]</span>
                            </button>
                            <button
                              type="button"
                              disabled={resendingEmailType !== null}
                              onClick={() => handleResendEmail("cancelled", false)}
                              className="px-2 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-medium rounded transition-colors disabled:opacity-50"
                              title="Send standard cancellation email"
                            >
                              <span>Standard</span>
                            </button>
                          </div>
                        </div>

                        {/* 6. Refund Confirmation */}
                        <div className="pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="font-semibold text-wbk-black flex items-center gap-2">
                              <span>6. Refund Confirmation</span>
                              {wasRefundedSent ? (
                                <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-normal font-mono">
                                  Sent: {formatNotificationDate(sentHistory.refunded)}
                                </span>
                              ) : (
                                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-normal">
                                  Not sent yet
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-wbk-brown mt-0.5">
                              Refund issued receipt & bank clearing timeline in the customer's language.
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              disabled={resendingEmailType !== null}
                              onClick={() => handleResendEmail("refunded", true)}
                              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-medium rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                              title="Resend refund confirmation with [UPDATED] warning banner"
                            >
                              {resendingEmailType === "refunded" ? (
                                <IconLoader2 size={12} className="animate-spin" />
                              ) : (
                                <IconRefresh size={12} />
                              )}
                              <span>Resend [UPDATED]</span>
                            </button>
                            <button
                              type="button"
                              disabled={resendingEmailType !== null}
                              onClick={() => handleResendEmail("refunded", false)}
                              className="px-2 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-medium rounded transition-colors disabled:opacity-50"
                              title="Send standard refund confirmation email"
                            >
                              <span>Standard</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Customer, Delivery & Billing Details */}
              {(() => {
                const shipAddr = normalizeAddressLines(selectedOrder.shipping_address);
                const billAddr = normalizeAddressLines(selectedOrder.billing_address);
                const currSymbol = getCurrencySymbol(selectedOrder.currency);
                const marketMeta = extractOrderMarketMeta(selectedOrder);
                const isSameBilling =
                  !billAddr ||
                  (shipAddr &&
                    billAddr.line1 === shipAddr.line1 &&
                    billAddr.postcode === shipAddr.postcode &&
                    billAddr.city === shipAddr.city);

                return (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 border border-wbk-lightgrey/80 bg-white space-y-2">
                        <span className="text-[10px] uppercase font-semibold text-wbk-brown tracking-wider block">
                          Customer Information
                        </span>
                        <p className="font-semibold text-wbk-black text-sm">{selectedOrder.customer_name}</p>
                        <p className="text-wbk-black break-all">{selectedOrder.customer_email}</p>
                        <p>Tel: {selectedOrder.customer_phone || "Not provided"}</p>
                      </div>

                      <div className="p-4 border border-wbk-lightgrey/80 bg-white space-y-2 relative">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-semibold text-wbk-brown tracking-wider block">
                            Delivery Address
                          </span>
                          {shipAddr && (
                            <button
                              type="button"
                              onClick={() => {
                                const formatted = [
                                  selectedOrder.customer_name,
                                  shipAddr.line1,
                                  shipAddr.line2,
                                  shipAddr.city,
                                  shipAddr.postcode,
                                  shipAddr.country,
                                ]
                                  .filter(Boolean)
                                  .join(", ");
                                copyToClipboard(formatted, "Address");
                              }}
                              className="text-wbk-brown hover:text-wbk-black text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <IconCopy size={13} />
                              <span>Copy</span>
                            </button>
                          )}
                        </div>
                        {shipAddr ? (
                          <div className="text-xs text-wbk-black leading-relaxed">
                            {shipAddr.line1 && <p>{shipAddr.line1}</p>}
                            {shipAddr.line2 && <p>{shipAddr.line2}</p>}
                            {(shipAddr.city || shipAddr.postcode) && (
                              <p>
                                {[shipAddr.city, shipAddr.postcode].filter(Boolean).join(", ")}
                              </p>
                            )}
                            {shipAddr.country && <p>{shipAddr.country}</p>}
                          </div>
                        ) : (
                          <p className="text-xs text-wbk-brown italic">Address provided via checkout</p>
                        )}
                        {!isSameBilling && billAddr && (
                          <div className="pt-2 mt-2 border-t border-wbk-lightgrey/60 text-[11px] text-wbk-brown">
                            <span className="uppercase font-semibold text-[10px] block text-wbk-black">
                              Billing Address:
                            </span>
                            <span>
                              {[billAddr.line1, billAddr.line2, billAddr.city, billAddr.postcode, billAddr.country]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          </div>
                        )}
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
                                  alt={item.title || item.name || "Wall Bed"}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <h4 className="font-poppins font-semibold text-wbk-black text-xs">
                                  {item.title || item.name}
                                </h4>
                                {item.sku && !/^\d+$/.test(String(item.sku).trim()) && (
                                  <span className="text-[11px] font-mono text-gray-500 font-medium block">
                                    SKU: {item.sku}
                                  </span>
                                )}
                                <span className="text-[11px] text-wbk-brown block">
                                  {item.options?.size || item.variant}{" "}
                                  {item.options?.orientation && `(${item.options.orientation})`}
                                </span>
                                {item.options?.sofaIncluded && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-[#FAF5EA] text-wbk-gold border border-wbk-gold/40 px-2 py-0.5 rounded mt-1">
                                    🛋️ + Front Sofa Included{" "}
                                    {item.options.sofaPrice
                                      ? `(+${currSymbol}${Number(item.options.sofaPrice).toFixed(2)})`
                                      : ""}
                                  </span>
                                )}
                                <span className="text-[11px] text-wbk-brown/80 block mt-0.5">
                                  Qty: {item.quantity} × {currSymbol}
                                  {Number(item.price || 0).toFixed(2)}
                                </span>
                              </div>
                            </div>

                            <span className="font-bold text-wbk-black font-poppins">
                              {currSymbol}
                              {(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Financial Summary */}
                      <div className="pt-3 border-t border-wbk-lightgrey space-y-1.5 text-right font-poppins">
                        <div className="flex justify-between text-xs">
                          <span>Subtotal:</span>
                          <span className="text-wbk-black font-medium">
                            {currSymbol}
                            {Number(selectedOrder.subtotal || selectedOrder.total_amount || 0).toFixed(2)}
                          </span>
                        </div>
                        {Number(selectedOrder.discount_amount) > 0 && (
                          <div className="flex justify-between text-xs text-wbk-green">
                            <span>Discount ({selectedOrder.promo_code}):</span>
                            <span>
                              -{currSymbol}
                              {Number(selectedOrder.discount_amount).toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-xs">
                          <span>Delivery ({selectedOrder.delivery_label || "Standard"}):</span>
                          <span className="text-wbk-black font-medium">
                            {Number(selectedOrder.shipping_amount || 0) === 0
                              ? "Free"
                              : `${currSymbol}${Number(selectedOrder.shipping_amount).toFixed(2)}`}
                          </span>
                        </div>
                        {Number(selectedOrder.vat_amount) > 0 && (
                          <div className="flex justify-between text-xs text-wbk-brown/70">
                            <span>Includes VAT:</span>
                            <span>
                              {currSymbol}
                              {Number(selectedOrder.vat_amount || 0).toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm font-bold text-wbk-black pt-2 border-t border-wbk-lightgrey">
                          <span>Total ({marketMeta.currency}):</span>
                          <span>
                            {currSymbol}
                            {Number(selectedOrder.total_amount || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bank Transfer Unpaid Callout */}
                    {(selectedOrder.payment_method || "").toLowerCase().includes("bank") &&
                      (selectedOrder.payment_status || "").toLowerCase() !== "paid" && (
                        <div className="p-4 bg-amber-50/90 border border-amber-300 text-amber-950 space-y-3 rounded-2xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-semibold text-xs text-amber-900">
                              <IconBuildingBank size={18} className="text-amber-700 shrink-0" />
                              <span>Awaiting Bank Wire / Transfer</span>
                            </div>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-amber-200/90 text-amber-900 rounded border border-amber-300">
                              Unpaid
                            </span>
                          </div>
                          <div className="text-xs text-amber-900 space-y-1">
                            <div>
                              • Expected Reference:{" "}
                              <strong className="font-mono bg-white px-1.5 py-0.5 border border-amber-200">
                                #{selectedOrder.id}
                              </strong>{" "}
                              or <strong>{selectedOrder.customer_email}</strong>
                            </div>
                            <div>
                              • Amount Due:{" "}
                              <strong>
                                {currSymbol}
                                {Number(selectedOrder.total_amount || 0).toFixed(2)}
                              </strong>
                            </div>
                            <div>
                              • Banking Destination:{" "}
                              <strong>
                                {getBankDetails(marketMeta.locale, marketMeta.currency).bankName}
                              </strong>{" "}
                              ({getBankDetails(marketMeta.locale, marketMeta.currency).accountName})
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleMarkAsPaid(selectedOrder.id)}
                            className="w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            {isUpdating ? <IconLoader2 size={15} className="animate-spin" /> : <IconCheck size={16} />}
                            <span>Confirm Bank Payment Received &amp; Notify Customer</span>
                          </button>
                        </div>
                      )}

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
                          <span className="text-wbk-brown block">Payment Status:</span>
                          <span
                            className={`font-semibold capitalize ${
                              (selectedOrder.payment_status || "").toLowerCase() === "paid"
                                ? "text-emerald-700"
                                : "text-amber-800"
                            }`}
                          >
                            {selectedOrder.payment_status || "Unpaid"}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-wbk-brown block">Transaction / Gateway Reference:</span>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-wbk-black truncate block">
                              {selectedOrder.payment_id || "Pending Confirmation"}
                            </span>
                            {selectedOrder.payment_id && (
                              <button
                                type="button"
                                onClick={() => copyToClipboard(selectedOrder.payment_id, "Transaction ID")}
                                className="text-wbk-brown hover:text-wbk-black text-[11px] flex items-center gap-1 shrink-0 cursor-pointer"
                              >
                                <IconCopy size={13} />
                                <span>Copy</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
