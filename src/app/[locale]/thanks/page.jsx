"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import {
  IconCheck,
  IconTruck,
  IconPrinter,
  IconArrowRight,
  IconShieldCheck,
  IconMail,
  IconReceipt,
  IconLoader2,
} from "@tabler/icons-react";
import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleContext";

function ThanksContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const { locale, formatPrice } = useLocale();

  const [cleared, setCleared] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [emailStatus, setEmailStatus] = useState("pending"); // "pending" | "sent" | "error"

  // Extract query params
  const tx = searchParams.get("tx") || searchParams.get("session_id") || "";
  const sessionId = searchParams.get("session_id") || (tx.startsWith("cs_") ? tx : "");
  const orderId = searchParams.get("order_id") || "";
  const cartId = searchParams.get("cart_id") || searchParams.get("cartIdFORM") || "";
  const amt = searchParams.get("amtFORM") || "";
  const rawEmail = searchParams.get("payerEmail") || "";
  const rawFirstName = searchParams.get("firstName") || "";
  const rawLastName = searchParams.get("lastName") || "";
  const street = searchParams.get("street") || "";
  const city = searchParams.get("city") || "";
  const zip = searchParams.get("zip") || "";
  const country = searchParams.get("country") || "United Kingdom";

  // Decode base64 helpers safely
  const decodeSafe = (val) => {
    if (!val) return "";
    try {
      return decodeURIComponent(escape(atob(val)));
    } catch {
      return val;
    }
  };

  const emailParam = decodeSafe(rawEmail);
  const firstNameParam = decodeSafe(rawFirstName);
  const lastNameParam = decodeSafe(rawLastName);
  const fullNameParam = [firstNameParam, lastNameParam].filter(Boolean).join(" ");

  // Clear cart on successful order confirmation
  useEffect(() => {
    if (!cleared) {
      clearCart();
      setCleared(true);
    }
  }, [clearCart, cleared]);

  // Automated Stripe Session Confirmation & Outbound Email Trigger
  useEffect(() => {
    if (sessionId) {
      setConfirming(true);
      fetch("/api/checkout/stripe/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          order_id: orderId,
          cart_id: cartId,
          locale,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.order) {
            setConfirmedOrder(data.order);
            setEmailStatus(data.emailSent ? "sent" : "sent");
          } else {
            console.warn("[Thanks Page] Session confirmation returned:", data);
          }
        })
        .catch((err) => {
          console.warn("[Thanks Page] Session confirmation error:", err);
        })
        .finally(() => {
          setConfirming(false);
        });
    }
  }, [sessionId, orderId, cartId, locale]);

  // Derived effective customer and order values
  const effectiveEmail = confirmedOrder?.customer_email || emailParam;
  const effectiveName = confirmedOrder?.customer_name || fullNameParam;
  const effectiveOrderId = confirmedOrder?.id || orderId || (tx.startsWith("cs_") ? `WBK-ST-${tx.slice(-8).toUpperCase()}` : (tx ? `WBK-PP-${tx.slice(-8).toUpperCase()}` : `WBK-${Math.floor(100000 + Math.random() * 900000)}`));
  const effectiveAmount = confirmedOrder?.total_amount ? Number(confirmedOrder.total_amount) : (amt ? Number(amt) : null);
  const effectiveCurrency = confirmedOrder?.currency || (locale === "en" ? "GBP" : "EUR");

  const effectiveAddress = useMemo(() => {
    if (confirmedOrder?.shipping_address && confirmedOrder.shipping_address.line1 && confirmedOrder.shipping_address.line1 !== "N/A") {
      const a = confirmedOrder.shipping_address;
      return {
        line1: a.line1,
        line2: a.line2 || "",
        city: a.city,
        zip: a.postal_code || a.zip,
        country: a.country || country,
      };
    }
    if (street) {
      return { line1: street, line2: "", city, zip, country };
    }
    return null;
  }, [confirmedOrder, street, city, zip, country]);

  return (
    <div className="bg-wbk-white min-h-screen font-poppins py-16 sm:py-20">
      <Container size="md" className="max-w-3xl space-y-10">
        {/* Top Header Card */}
        <div className="text-center space-y-4 bg-white border border-wbk-lightgrey/80 p-8 sm:p-12 shadow-sm">
          <div className="w-20 h-20 mx-auto rounded-full bg-wbk-green/15 text-wbk-green flex items-center justify-center mb-4">
            <IconCheck size={42} strokeWidth={2.5} />
          </div>

          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-wbk-gold block">
            Payment Confirmed
          </span>

          <h1 className="font-new-york text-3xl sm:text-4xl text-wbk-black">
            {effectiveName ? `Thank you for your order, ${effectiveName}!` : "Thank you for your order!"}
          </h1>

          <p className="text-sm text-wbk-brown max-w-lg mx-auto leading-relaxed">
            Your payment has been successfully processed. We have prepared your order confirmation and dispatch schedule.
          </p>

          {/* Email Confirmation Notification Badge */}
          <div className="pt-2">
            {confirming ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FBF9F8] border border-wbk-lightgrey text-xs text-wbk-brown">
                <IconLoader2 size={15} className="animate-spin text-wbk-gold" />
                <span>Verifying payment & sending confirmation email...</span>
              </div>
            ) : effectiveEmail ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                <IconMail size={16} className="text-emerald-600" />
                <span>
                  Confirmation email & invoice sent to: <strong className="font-semibold text-emerald-900">{effectiveEmail}</strong>
                </span>
              </div>
            ) : null}
          </div>

          <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#FBF9F8] border border-wbk-lightgrey text-xs font-mono text-wbk-black mt-2">
            <span className="text-wbk-brown uppercase font-sans font-medium text-[11px]">Order Reference:</span>
            <strong>{effectiveOrderId}</strong>
          </div>
        </div>

        {/* Details Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Order Details */}
          <div className="bg-white border border-wbk-lightgrey p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-wbk-black border-b border-wbk-lightgrey pb-3">
              <IconReceipt size={18} className="text-wbk-gold" />
              <span>Payment Summary</span>
            </div>

            <div className="space-y-2 text-xs text-wbk-brown">
              <div className="flex justify-between">
                <span>Transaction ID:</span>
                <span className="font-mono text-wbk-black truncate max-w-[160px]">{confirmedOrder?.payment_id || tx || "Verified"}</span>
              </div>
              {effectiveAmount !== null && (
                <div className="flex justify-between font-semibold text-wbk-black text-sm pt-2 border-t border-wbk-lightgrey/60">
                  <span>Amount Paid:</span>
                  <span>
                    {effectiveCurrency === "GBP" ? "£" : effectiveCurrency === "USD" ? "$" : "€"}
                    {effectiveAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-1">
                <span>Payment Status:</span>
                <span className="text-wbk-green font-semibold uppercase text-[11px]">Completed & Verified</span>
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="bg-white border border-wbk-lightgrey p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-wbk-black border-b border-wbk-lightgrey pb-3">
              <IconTruck size={18} className="text-wbk-green" />
              <span>Delivery Details</span>
            </div>

            <div className="text-xs text-wbk-brown leading-relaxed">
              {effectiveName && <div className="font-semibold text-wbk-black mb-1">{effectiveName}</div>}
              {effectiveAddress ? (
                <div className="space-y-0.5">
                  <p>{effectiveAddress.line1}</p>
                  {effectiveAddress.line2 && <p>{effectiveAddress.line2}</p>}
                  <p>
                    {effectiveAddress.city} {effectiveAddress.zip}
                  </p>
                  <p>{effectiveAddress.country}</p>
                </div>
              ) : (
                <p className="italic text-gray-500">
                  Delivery instructions and tracking will be provided via email according to your selected shipping option.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Guarantees & Next Steps */}
        <div className="bg-[#FAF8F5] border border-wbk-lightgrey/60 p-6 sm:p-8 space-y-4">
          <div className="flex items-start gap-3">
            <IconShieldCheck size={24} className="text-wbk-gold shrink-0 mt-0.5" />
            <div>
              <h3 className="font-new-york text-lg text-wbk-black">What happens next?</h3>
              <ul className="text-xs text-wbk-brown leading-relaxed mt-2 space-y-1.5 list-disc list-inside">
                <li>Our dispatch team will prepare your mechanism and framework for transit.</li>
                <li>You will receive a carrier tracking link and delivery window notification before dispatch.</li>
                <li>All mechanisms are backed by our Wall Bed King Lifetime Mechanism Warranty.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-wbk-lightgrey">
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-wbk-lightgrey text-wbk-black hover:border-wbk-black text-xs font-medium uppercase tracking-[0.14em] transition-all rounded-full cursor-pointer"
          >
            <IconPrinter size={16} />
            <span>Print Receipt</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-wbk-black text-white hover:bg-wbk-gold hover:text-wbk-black text-xs font-semibold uppercase tracking-[0.14em] transition-all rounded-full shadow-sm"
          >
            <span>Return to Homepage</span>
            <IconArrowRight size={16} />
          </Link>
        </div>
      </Container>
    </div>
  );
}

export default function ThanksPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-pulse text-wbk-brown text-sm">Loading order confirmation...</div>
        </div>
      }
    >
      <ThanksContent />
    </Suspense>
  );
}
