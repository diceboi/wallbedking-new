"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  IconArrowLeft,
  IconLock,
  IconCheck,
  IconBuildingBank,
  IconCreditCard,
  IconBrandPaypal,
  IconBox,
  IconAlertCircle,
  IconCopy,
} from "@tabler/icons-react";
import { Container } from "@/components/ui/Container";
import { useLocale } from "@/context/LocaleContext";
import { useAuth } from "@/context/AuthContext";
import { useWholesale } from "@/context/WholesaleContext";
import { formatWholesaleMoney } from "@/lib/wholesale-constants";
import { getBankDetails } from "@/lib/bank-details";

export default function WholesaleCheckoutPage() {
  const { locale, localizedHref } = useLocale();
  const { user, session, openUserDrawer } = useAuth();
  const {
    authorized,
    partner,
    paymentSettings,
    wholesaleItems,
    wholesaleSubtotal,
    wholesaleCurrency,
    clearWholesaleCart,
  } = useWholesale();

  const [form, setForm] = useState({
    companyName: "",
    vatNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address1: "",
    city: "",
    postcode: "",
    country: "United Kingdom",
    notes: "",
    paymentMethod: "bank",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [completedOrder, setCompletedOrder] = useState(null);
  const [copiedKey, setCopiedKey] = useState("");

  useEffect(() => {
    if (partner || user) {
      const nameParts = String(partner?.fullName || user?.user_metadata?.full_name || "").trim().split(" ");
      setForm((prev) => ({
        ...prev,
        companyName: prev.companyName || partner?.companyName || "",
        vatNumber: prev.vatNumber || partner?.vatNumber || "",
        firstName: prev.firstName || nameParts[0] || "",
        lastName: prev.lastName || nameParts.slice(1).join(" ") || "",
        email: prev.email || partner?.email || user?.email || "",
      }));
    }
  }, [partner, user]);

  useEffect(() => {
    if (!paymentSettings) return;
    const enabledMethods = [];
    if (paymentSettings.bankTransfer?.enabled) enabledMethods.push("bank");
    if (paymentSettings.paypal?.enabled) enabledMethods.push("paypal");
    if (paymentSettings.stripe?.enabled) enabledMethods.push("stripe");
    if (enabledMethods.length > 0 && !enabledMethods.includes(form.paymentMethod)) {
      setForm((prev) => ({ ...prev, paymentMethod: enabledMethods[0] }));
    }
  }, [paymentSettings]);

  const handleCopy = (text, key) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 2000);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (wholesaleItems.length === 0) {
      setError("Your wholesale cart is empty.");
      return;
    }
    if (!form.email || !form.address1 || !form.city || !form.postcode) {
      setError("Please fill in your email and delivery address fields.");
      return;
    }

    setSubmitting(true);
    try {
      const headers = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }
      const res = await fetch("/api/wholesale/checkout", {
        method: "POST",
        headers,
        body: JSON.stringify({
          items: wholesaleItems,
          customer: {
            email: form.email,
            phone: form.phone,
            name: `${form.firstName} ${form.lastName}`.trim() || form.companyName || "Wholesale Partner",
          },
          shippingAddress: {
            firstName: form.firstName,
            lastName: form.lastName,
            address1: form.address1,
            city: form.city,
            postcode: form.postcode,
            country: form.country,
            phone: form.phone,
          },
          companyName: form.companyName,
          vatNumber: form.vatNumber,
          paymentMethod: form.paymentMethod,
          locale: partner?.wholesaleMarket || locale,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to place wholesale order.");
      }
      clearWholesaleCart();
      if (data.stripeUrl) {
        window.location.href = data.stripeUrl;
        return;
      }
      setCompletedOrder(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message || "Error placing wholesale order.");
    } finally {
      setSubmitting(false);
    }
  };

  if (completedOrder) {
    const bankDetails = getBankDetails(partner?.wholesaleMarket || locale, completedOrder.currency);
    return (
      <div className="min-h-screen bg-wbk-white pt-10 pb-20 font-poppins">
        <Container>
          <div className="max-w-2xl mx-auto bg-white border border-wbk-lightgrey p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 text-emerald-800">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <IconCheck size={22} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 block">
                  B2B Wholesale Order Confirmed
                </span>
                <h1 className="font-new-york text-2xl text-wbk-black">
                  Order #{completedOrder.orderId} Received
                </h1>
              </div>
            </div>

            <div className="p-4 bg-[#FAF8F5] border border-wbk-lightgrey text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-wbk-brown">Net Total (Excl. VAT):</span>
                <strong className="text-base text-wbk-black">
                  {formatWholesaleMoney(completedOrder.total, completedOrder.currency)} (Excl. VAT)
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-wbk-brown">VAT:</span>
                <span className="font-semibold text-wbk-black">0% — Net B2B Price (Excl. VAT)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-wbk-brown">Shipping / Freight:</span>
                <span className="font-semibold text-wbk-black">Arranged separately</span>
              </div>
            </div>

            {form.paymentMethod === "bank" && (
              <div className="p-5 bg-amber-50/70 border border-amber-300 space-y-3 text-xs">
                <div className="font-bold text-wbk-black uppercase tracking-wider">
                  Bank Wire Transfer Details (Reference: {completedOrder.orderId})
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Account Holder", val: bankDetails.accountName, k: "acc" },
                    { label: "Bank Name", val: bankDetails.bankName, k: "bank" },
                    { label: "IBAN", val: bankDetails.ibanFormatted, copyVal: bankDetails.iban, k: "iban" },
                    { label: "BIC / SWIFT", val: bankDetails.bic, k: "bic" },
                    ...(bankDetails.isUkAccount
                      ? [
                          { label: "Sort Code", val: bankDetails.sortCode, k: "sort" },
                          { label: "Account Number", val: bankDetails.accountNumber, k: "accnum" },
                        ]
                      : []),
                  ].map((r) => (
                    <div key={r.k} className="flex items-center justify-between border-b border-amber-200/70 pb-1.5">
                      <span className="text-wbk-brown">{r.label}:</span>
                      <div className="flex items-center gap-2 font-mono font-bold text-wbk-black">
                        <span>{r.val}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(r.copyVal || r.val, r.k)}
                          className="p-1 text-wbk-brown hover:text-wbk-black cursor-pointer"
                        >
                          {copiedKey === r.k ? <IconCheck size={13} className="text-emerald-600" /> : <IconCopy size={13} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {form.paymentMethod === "paypal" && (
              <div className="p-5 bg-indigo-50/70 border border-indigo-200 space-y-2 text-xs text-indigo-950">
                <div className="font-bold uppercase tracking-wider">
                  PayPal Business Settlement (Reference: {completedOrder.orderId})
                </div>
                <p>
                  Your B2B wholesale order has been registered at the Net (Excl. VAT) total above. Our wholesale desk will send a PayPal Business invoice / payment link to <strong>{form.email}</strong> along with freight coordination details.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={localizedHref("/wholesale")}
                className="px-5 py-2.5 bg-wbk-black hover:bg-wbk-green text-white text-xs font-semibold uppercase tracking-wider rounded-full"
              >
                Back to Wholesale Catalog
              </Link>
              <Link
                href={localizedHref("/account")}
                className="px-5 py-2.5 border border-wbk-lightgrey hover:border-wbk-black text-xs font-semibold text-wbk-black rounded-full"
              >
                View My Orders
              </Link>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-wbk-white pt-10 pb-20 font-poppins">
        <Container>
          <div className="max-w-lg mx-auto bg-white border border-wbk-lightgrey p-8 text-center space-y-4">
            <IconLock size={32} className="mx-auto text-amber-700" />
            <h1 className="font-new-york text-2xl text-wbk-black">Wholesale Account Required</h1>
            <p className="text-xs text-wbk-brown">
              Please log in with an approved wholesale partner account to complete B2B checkout.
            </p>
            <button
              type="button"
              onClick={() => openUserDrawer("login")}
              className="px-6 py-2.5 bg-wbk-black text-white text-xs font-semibold uppercase tracking-wider rounded-full cursor-pointer"
            >
              Log In
            </button>
          </div>
        </Container>
      </div>
    );
  }

  const enabledGateways = [
    paymentSettings?.bankTransfer?.enabled && {
      id: "bank",
      label: paymentSettings.bankTransfer.label || "Bank Transfer / Proforma Wire",
      sublabel: paymentSettings.bankTransfer.sublabel || "B2B Net Invoice • Wire Transfer",
      icon: IconBuildingBank,
    },
    paymentSettings?.paypal?.enabled && {
      id: "paypal",
      label: paymentSettings.paypal.label || "PayPal Business",
      sublabel: paymentSettings.paypal.sublabel || "PayPal Settlement",
      icon: IconBrandPaypal,
    },
    paymentSettings?.stripe?.enabled && {
      id: "stripe",
      label: paymentSettings.stripe.label || "Credit / Debit Card (Stripe)",
      sublabel: paymentSettings.stripe.sublabel || "Corporate Card Payment",
      icon: IconCreditCard,
    },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-wbk-white pt-10 pb-20 font-poppins">
      <Container size="xl">
        <Link
          href={localizedHref("/wholesale")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-wbk-brown hover:text-wbk-black mb-5"
        >
          <IconArrowLeft size={15} />
          <span>Back to Wholesale Catalog</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: B2B Checkout Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white border border-wbk-lightgrey p-6 space-y-5">
            <div className="border-b border-wbk-lightgrey pb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-wbk-green">
                B2B Wholesale Checkout • Net Prices (Excl. VAT)
              </span>
              <h1 className="font-new-york text-2xl text-wbk-black mt-0.5">
                Company & Delivery Details
              </h1>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                <IconAlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  placeholder="Company Ltd / GmbH / SAS"
                  className="w-full px-3 py-2 text-xs border border-wbk-lightgrey focus:border-wbk-black outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1">
                  VAT / Tax ID (Optional)
                </label>
                <input
                  type="text"
                  value={form.vatNumber}
                  onChange={(e) => setForm({ ...form, vatNumber: e.target.value })}
                  placeholder="e.g. GB123456789 / FR..."
                  className="w-full px-3 py-2 text-xs border border-wbk-lightgrey focus:border-wbk-black outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-wbk-lightgrey focus:border-wbk-black outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-wbk-lightgrey focus:border-wbk-black outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1">
                  Business Email *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-wbk-lightgrey focus:border-wbk-black outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1">
                  Phone *
                </label>
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-wbk-lightgrey focus:border-wbk-black outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1">
                Delivery / Warehouse Address *
              </label>
              <input
                type="text"
                required
                value={form.address1}
                onChange={(e) => setForm({ ...form, address1: e.target.value })}
                placeholder="Street address, unit / dock number"
                className="w-full px-3 py-2 text-xs border border-wbk-lightgrey focus:border-wbk-black outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-wbk-lightgrey focus:border-wbk-black outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1">
                  Postcode / ZIP *
                </label>
                <input
                  type="text"
                  required
                  value={form.postcode}
                  onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-wbk-lightgrey focus:border-wbk-black outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  required
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-wbk-lightgrey focus:border-wbk-black outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1">
                Freight / Order Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Preferred freight forwarder, incoterms, target delivery window..."
                className="w-full px-3 py-2 text-xs border border-wbk-lightgrey focus:border-wbk-black outline-none"
              />
            </div>

            {/* Payment Method Selection (Controlled by Admin Wholesale Settings) */}
            <div className="space-y-2.5 pt-2 border-t border-wbk-lightgrey">
              <h2 className="text-xs font-bold uppercase tracking-wider text-wbk-black">
                Wholesale Payment Method
              </h2>
              {enabledGateways.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  No payment methods are currently enabled for Wholesale. Please contact our B2B team.
                </div>
              ) : (
                <div className="space-y-2">
                  {enabledGateways.map((gw) => {
                    const Icon = gw.icon;
                    const active = form.paymentMethod === gw.id;
                    return (
                      <label
                        key={gw.id}
                        className={`flex items-center gap-3 p-3.5 border cursor-pointer transition-colors ${
                          active ? "border-wbk-black bg-[#FAF8F5]" : "border-wbk-lightgrey hover:border-wbk-black/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="wholesalePaymentMethod"
                          value={gw.id}
                          checked={active}
                          onChange={() => setForm({ ...form, paymentMethod: gw.id })}
                          className="accent-wbk-black"
                        />
                        <Icon size={18} className="text-wbk-black shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-wbk-black">{gw.label}</div>
                          <div className="text-[11px] text-wbk-brown">{gw.sublabel}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || wholesaleItems.length === 0 || enabledGateways.length === 0}
              className="w-full py-3.5 px-6 bg-wbk-black hover:bg-wbk-green text-white text-xs font-semibold uppercase tracking-widest rounded-full transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting
                ? "Submitting Wholesale Order..."
                : `Submit Wholesale Order • ${formatWholesaleMoney(wholesaleSubtotal, wholesaleCurrency)} (Excl. VAT)`}
            </button>
          </form>

          {/* Right: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-wbk-lightgrey p-6 space-y-4 sticky top-24">
              <div className="flex items-center justify-between border-b border-wbk-lightgrey pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-wbk-black">
                  Wholesale Order Summary
                </h2>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-bold uppercase">
                  Net • Excl. VAT
                </span>
              </div>

              {wholesaleItems.length === 0 ? (
                <p className="text-xs text-wbk-brown py-6 text-center">No items in wholesale cart.</p>
              ) : (
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {wholesaleItems.map((it) => {
                    const isContainer = it.options?.orderUnit === "container";
                    const pcs = isContainer ? (it.options?.unitsPerContainer || 1) * it.quantity : it.quantity;
                    return (
                      <div key={it.lineKey} className="flex items-start gap-3 pb-3 border-b border-wbk-lightgrey/60">
                        <div className="relative w-12 h-12 bg-[#F4F2F0] border border-wbk-lightgrey shrink-0 overflow-hidden">
                          {it.image && <Image src={it.image} alt={it.title} fill className="object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-wbk-black line-clamp-2">{it.title}</div>
                          <div className="text-[10px] text-wbk-brown mt-0.5 flex items-center gap-1.5">
                            {isContainer ? (
                              <span className="inline-flex items-center gap-1 font-semibold text-amber-900">
                                <IconBox size={11} />
                                {it.quantity} Container ({pcs} pcs)
                              </span>
                            ) : (
                              <span>{it.quantity} pcs</span>
                            )}
                            <span>• Excl. VAT</span>
                          </div>
                        </div>
                        <div className="text-xs font-bold text-wbk-black whitespace-nowrap">
                          {formatWholesaleMoney(Number(it.price) * Number(it.quantity), it.currency)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="space-y-2 text-xs pt-2">
                <div className="flex justify-between text-wbk-brown">
                  <span>Partner Role:</span>
                  <span className="font-mono font-bold text-wbk-black uppercase">
                    {partner?.roleKey || "B2B"}
                  </span>
                </div>
                <div className="flex justify-between text-wbk-brown">
                  <span>Retail Promotions / Coupons:</span>
                  <span className="text-wbk-black">Not applicable (B2B Net)</span>
                </div>
                <div className="flex justify-between text-wbk-brown">
                  <span>Shipping / Freight:</span>
                  <span className="font-semibold text-wbk-black">Arranged Separately</span>
                </div>
                <div className="flex justify-between text-wbk-brown">
                  <span>VAT:</span>
                  <span className="font-semibold text-emerald-800">0% (All prices Net, Excl. VAT)</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-wbk-lightgrey text-base font-bold text-wbk-black">
                  <span>Net Total (Excl. VAT)</span>
                  <span>{formatWholesaleMoney(wholesaleSubtotal, wholesaleCurrency)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
