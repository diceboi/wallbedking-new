"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  IconX,
  IconBell,
  IconCheck,
  IconLoader2,
  IconAlertCircle,
  IconClock,
  IconShieldCheck,
} from "@tabler/icons-react";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";

export function WaitlistModal({
  isOpen,
  onClose,
  product,
  selectedVariant = null,
  productSize = "",
}) {
  const { user } = useAuth();
  const { locale, t } = useLocale();

  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
    if (user?.user_metadata?.full_name) {
      setName(user.user_metadata.full_name);
    }
  }, [user]);

  // Prevent background scroll when open WITHOUT breaking sticky headers
  useEffect(() => {
    if (!isOpen) return;

    const preventBackgroundScroll = (e) => {
      if (e.target.closest("[data-modal-card]") || e.target.closest(".custom-scrollbar")) {
        return;
      }
      e.preventDefault();
    };

    window.addEventListener("wheel", preventBackgroundScroll, { passive: false });
    window.addEventListener("touchmove", preventBackgroundScroll, { passive: false });

    return () => {
      window.removeEventListener("wheel", preventBackgroundScroll);
      window.removeEventListener("touchmove", preventBackgroundScroll);
    };
  }, [isOpen]);

  if (!isOpen || !mounted || typeof document === "undefined") return null;

  const productName = product?.title || product?.name || "Wall Bed King Murphy Bed";
  const productSlug = product?.slug || "";
  const productId = product?.id || selectedVariant?.id || null;
  const productImage = product?.image || selectedVariant?.image || "/sofa1.webp";
  const variantLabel = selectedVariant?.sizeLabel || productSize || selectedVariant?.name || "";

  // Translated strings via t() helper with fallback
  const txtOutOfStock = t("waitlist.outOfStock", "Out of Stock");
  const txtJoinWaitlist = t("waitlist.joinWaitlist", "Join the Waitlist");
  const txtReplenishing = t("waitlist.replenishing", "Replenishment in progress");
  const txtSize = t("waitlist.size", "Size");
  const txtDescription = t(
    "waitlist.description",
    "Be the first to know when this item is back in stock. We'll send an instant email notification directly to your inbox with a priority reservation link."
  );
  const txtEmailLabel = t("waitlist.emailLabel", "Your Email Address *");
  const txtNameLabel = t("waitlist.nameLabel", "Your Name (Optional)");
  const txtNamePlaceholder = t("waitlist.namePlaceholder", "e.g. John Smith");
  const txtSubmitting = t("waitlist.submitting", "Adding to Waitlist...");
  const txtSubmitBtn = t("waitlist.notifyMe", "Notify Me When In Stock");
  const txtNoSpam = t(
    "waitlist.noSpam",
    "No spam. We will only email you when this specific model is available."
  );
  const txtSuccessTitle = t("waitlist.successTitle", "You're on the list!");
  const txtSuccessMsg = t(
    "waitlist.successMsg",
    "You're on the waitlist! We will notify you the moment stock arrives."
  );
  const txtDone = t("waitlist.done", "Done");
  const txtEmailInvalid = t(
    "waitlist.emailInvalid",
    "Please enter a valid email address."
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setStatusFeedback({
        type: "error",
        message: txtEmailInvalid,
      });
      return;
    }

    setLoading(true);
    setStatusFeedback(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || null,
          customerEmail: email.trim(),
          customerName: name.trim() || user?.user_metadata?.full_name || "",
          productId,
          productSlug,
          productName,
          productImage,
          variantName: variantLabel,
          options: {
            size: productSize,
            format: product?.format || "Vertical",
          },
          locale: locale || "en",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusFeedback({
          type: "success",
          message: data.message || txtSuccessMsg,
        });
      } else {
        setStatusFeedback({
          type: "error",
          message: data.error || "Unable to join waitlist. Please try again.",
        });
      }
    } catch (err) {
      console.error("[Waitlist Submit Error]", err);
      setStatusFeedback({
        type: "error",
        message: "Network error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-wbk-black/40 backdrop-blur-[4px] overflow-y-auto overscroll-contain flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        data-modal-card="true"
        className="bg-white max-w-md w-full rounded-2xl border border-wbk-lightgrey/80 shadow-2xl relative my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-4 border-b border-wbk-lightgrey/60 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-wbk-gold/15 text-wbk-black border border-wbk-gold/30 flex items-center justify-center">
              <IconBell size={16} className="text-wbk-gold" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-wbk-brown block">
                {txtOutOfStock}
              </span>
              <h3 className="font-new-york text-lg text-wbk-black">
                {txtJoinWaitlist}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-wbk-brown hover:text-wbk-black hover:bg-black/5 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Product preview box */}
        <div className="p-5 bg-[#FAF9F7] border-b border-wbk-lightgrey/60 flex items-center gap-3.5">
          <div className="relative w-16 h-16 bg-white border border-wbk-lightgrey/70 rounded-lg overflow-hidden shrink-0">
            <img
              src={productImage}
              alt={productName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-poppins font-semibold text-xs text-wbk-black truncate">
              {productName}
            </h4>
            {variantLabel && (
              <span className="text-[11px] text-wbk-brown font-poppins block truncate mt-0.5">
                {txtSize}: {variantLabel}
              </span>
            )}
            <div className="inline-flex items-center gap-1.5 text-[10px] text-wbk-black font-medium bg-wbk-gold/15 border border-wbk-gold/30 px-2 py-0.5 rounded mt-1.5">
              <IconClock size={11} className="text-wbk-gold" />
              <span>{txtReplenishing}</span>
            </div>
          </div>
        </div>

        {/* Content Body / Form */}
        <div className="p-5 sm:p-6 space-y-4 text-xs font-poppins">
          {statusFeedback?.type === "success" ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-wbk-gold/15 border border-wbk-gold/30 text-wbk-gold mx-auto flex items-center justify-center">
                <IconCheck size={24} strokeWidth={2.5} className="text-wbk-gold" />
              </div>
              <h4 className="text-sm font-semibold text-wbk-black">
                {txtSuccessTitle}
              </h4>
              <p className="text-xs text-wbk-brown max-w-xs mx-auto leading-relaxed">
                {statusFeedback.message}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-2.5 bg-wbk-gold hover:bg-wbk-black text-wbk-black hover:text-white border border-wbk-gold hover:border-wbk-black text-xs font-semibold uppercase tracking-wider rounded-full transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                >
                  {txtDone}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-wbk-brown leading-relaxed">
                {txtDescription}
              </p>

              <div>
                <label className="block text-[11px] font-medium text-wbk-black mb-1">
                  {txtEmailLabel}
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 border border-wbk-lightgrey/80 rounded-lg bg-[#FBF9F8] text-wbk-black focus:outline-none focus:border-wbk-gold focus:bg-white text-xs transition-colors"
                />
              </div>

              {!user && (
                <div>
                  <label className="block text-[11px] font-medium text-wbk-black mb-1">
                    {txtNameLabel}
                  </label>
                  <input
                    type="text"
                    placeholder={txtNamePlaceholder}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-wbk-lightgrey/80 rounded-lg bg-[#FBF9F8] text-wbk-black focus:outline-none focus:border-wbk-gold focus:bg-white text-xs transition-colors"
                  />
                </div>
              )}

              {user && (
                <div className="flex items-center gap-1.5 text-[11px] text-wbk-black bg-[#F4F2F0] p-2.5 rounded-lg border border-wbk-lightgrey/80">
                  <IconShieldCheck size={15} className="text-wbk-gold shrink-0" />
                  <span>
                    {t(
                      "waitlist.linkedAccount",
                      `Linked to your account (${user.email}). View in your profile anytime.`
                    ).replace("{email}", user.email)}
                  </span>
                </div>
              )}

              {statusFeedback?.type === "error" && (
                <div className="p-3 text-xs bg-red-50 border border-red-300 text-red-800 rounded-lg flex items-start gap-2">
                  <IconAlertCircle size={15} className="text-red-600 shrink-0 mt-0.5" />
                  <span>{statusFeedback.message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-wbk-gold hover:bg-wbk-black text-wbk-black hover:text-white border border-wbk-gold hover:border-wbk-black text-xs font-semibold uppercase tracking-wider rounded-full transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg group"
              >
                {loading ? (
                  <>
                    <IconLoader2 size={15} className="animate-spin" />
                    <span>{txtSubmitting}</span>
                  </>
                ) : (
                  <>
                    <IconBell size={15} className="transition-transform group-hover:scale-110" />
                    <span>{txtSubmitBtn}</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-wbk-brown/80 text-center">
                {txtNoSpam}
              </p>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
