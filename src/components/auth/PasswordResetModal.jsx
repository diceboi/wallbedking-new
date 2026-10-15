"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconKey,
  IconLock,
  IconEye,
  IconEyeOff,
  IconCheck,
  IconAlertCircle,
  IconLoader2,
  IconX,
  IconMail,
  IconArrowRight,
} from "@tabler/icons-react";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";

export function PasswordResetModal() {
  const {
    user,
    isPasswordRecovery,
    setIsPasswordRecovery,
    passwordRecoveryError,
    setPasswordRecoveryError,
    updatePassword,
    resetPassword,
  } = useAuth();
  const { t } = useLocale();

  const [mounted, setMounted] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Expired / Resend states
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync user email for resend if available
  useEffect(() => {
    if (user?.email && !resendEmail) {
      setResendEmail(user.email);
    }
  }, [user, resendEmail]);

  // Clean URL hash and recovery query params from address bar
  const cleanUrl = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const url = new URL(window.location.href);
      url.hash = "";
      url.searchParams.delete("mode");
      url.searchParams.delete("type");
      url.searchParams.delete("error");
      url.searchParams.delete("error_code");
      url.searchParams.delete("error_description");
      window.history.replaceState(null, "", url.pathname + (url.search ? url.search : ""));
    } catch (e) {
      console.warn("Could not clean URL params", e);
    }
  }, []);

  const handleClose = useCallback(() => {
    if (setIsPasswordRecovery) setIsPasswordRecovery(false);
    if (setPasswordRecoveryError) setPasswordRecoveryError(null);
    cleanUrl();
  }, [setIsPasswordRecovery, setPasswordRecoveryError, cleanUrl]);

  // Lock background scroll when modal is active
  const isOpen = mounted && (Boolean(isPasswordRecovery) || Boolean(passwordRecoveryError));

  useEffect(() => {
    if (!isOpen) return;

    const preventBackgroundScroll = (e) => {
      if (e.target.closest("[data-modal-card]")) return;
      e.preventDefault();
    };

    window.addEventListener("wheel", preventBackgroundScroll, { passive: false });
    window.addEventListener("touchmove", preventBackgroundScroll, { passive: false });

    return () => {
      window.removeEventListener("wheel", preventBackgroundScroll);
      window.removeEventListener("touchmove", preventBackgroundScroll);
    };
  }, [isOpen]);

  // Handle password update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (newPassword.length < 6) {
      setErrorMsg(t("auth.passwordMinLength", "Password must be at least 6 characters long."));
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg(t("auth.passwordsMismatch", "Passwords do not match. Please verify both fields."));
      return;
    }

    setLoading(true);
    try {
      await updatePassword(newPassword);
      setIsSuccess(true);
      cleanUrl();
    } catch (err) {
      console.error("[PasswordResetModal] Error updating password:", err);
      setErrorMsg(err.message || t("auth.passwordUpdateFailed", "Could not update password. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  // Handle resending a new password reset email
  const handleResend = async (e) => {
    e.preventDefault();
    setResendError("");
    setResendSuccess(false);

    if (!resendEmail.trim()) {
      setResendError("Please enter your email address.");
      return;
    }

    setResendLoading(true);
    try {
      await resetPassword(resendEmail.trim());
      setResendSuccess(true);
      cleanUrl();
    } catch (err) {
      console.error("[PasswordResetModal] Resend error:", err);
      setResendError(err.message || "Could not send reset email. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  if (!isOpen) return null;

  const isExpiredMode = Boolean(passwordRecoveryError) && !isPasswordRecovery;
  const passwordsMatch = newPassword.length >= 6 && newPassword === confirmPassword;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 font-poppins">
        {/* Dimmed backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={handleClose}
          className="fixed inset-0 bg-wbk-black/65 backdrop-blur-xs cursor-pointer"
          aria-hidden="true"
        />

        {/* Modal card */}
        <motion.div
          data-modal-card
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          className="relative z-10 w-full max-w-md bg-[#FBF9F8] border border-wbk-lightgrey shadow-2xl p-6 sm:p-8 space-y-6"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center border border-wbk-lightgrey/80 bg-white text-wbk-black hover:bg-wbk-black hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <IconX size={16} />
          </button>

          {/* ── View 1: Success State ── */}
          {isSuccess ? (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-300 text-emerald-600 flex items-center justify-center shadow-xs">
                <IconCheck size={32} strokeWidth={2.5} />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700 block">
                  {t("auth.statusUpdated", "Security Update Completed")}
                </span>
                <h2 className="font-new-york text-2xl sm:text-3xl text-wbk-black">
                  {t("auth.passwordUpdatedTitle", "Password Updated!")}
                </h2>
                <p className="text-xs text-wbk-brown leading-relaxed max-w-xs mx-auto">
                  {t(
                    "auth.passwordUpdatedMsg",
                    "Your new password is now active and your account is secure. You are currently signed in."
                  )}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-3.5 bg-wbk-black text-white text-xs font-semibold uppercase tracking-[0.16em] hover:bg-wbk-green transition-colors rounded-full cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <span>{t("auth.continueToStore", "Continue to WallBedKing")}</span>
                  <IconArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : isExpiredMode ? (
            /* ── View 2: Expired or Invalid Link State ── */
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 border border-amber-300/80 text-amber-600 flex items-center justify-center">
                  <IconAlertCircle size={28} />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700 block">
                  {t("auth.expiredBadge", "Link Expired or Invalid")}
                </span>
                <h2 className="font-new-york text-2xl text-wbk-black">
                  {t("auth.linkExpiredTitle", "Reset Link Expired")}
                </h2>
                <p className="text-xs text-wbk-brown leading-relaxed">
                  {t(
                    "auth.linkExpiredMsg",
                    "This password reset link is invalid or has expired. Please enter your email below to receive a new link."
                  )}
                </p>
              </div>

              {resendError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <IconAlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                  <span>{resendError}</span>
                </div>
              )}

              {resendSuccess ? (
                <div className="space-y-4 text-center py-2">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                    <div className="font-semibold flex items-center justify-center gap-1.5 text-emerald-800">
                      <IconCheck size={16} className="text-emerald-600" />
                      <span>{t("auth.newLinkSent", "New Reset Link Dispatched")}</span>
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      We have sent a fresh reset link to <strong>{resendEmail}</strong>. Please check your inbox and click the new link.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full py-3 bg-wbk-black text-white text-xs font-semibold uppercase tracking-[0.14em] hover:bg-wbk-green transition-colors rounded-full cursor-pointer"
                  >
                    {t("common.close", "Close")}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResend} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                      {t("auth.emailLabel", "Email Address")}
                    </label>
                    <div className="relative">
                      <IconMail
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-wbk-brown pointer-events-none"
                      />
                      <input
                        type="email"
                        required
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full h-11 pl-10 pr-3 text-xs bg-white border border-wbk-lightgrey text-wbk-black focus:outline-none focus:border-wbk-black transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resendLoading}
                    className="w-full py-3.5 bg-wbk-black text-white text-xs font-semibold uppercase tracking-[0.14em] hover:bg-wbk-green transition-colors disabled:opacity-60 flex items-center justify-center gap-2 rounded-full cursor-pointer shadow-sm"
                  >
                    {resendLoading ? (
                      <>
                        <IconLoader2 size={16} className="animate-spin" />
                        <span>Sending Link...</span>
                      </>
                    ) : (
                      <span>{t("auth.requestNewLink", "Send New Reset Link")}</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* ── View 3: Active Password Recovery Form ── */
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-full bg-wbk-gold/15 border border-wbk-gold/40 flex items-center justify-center text-wbk-black shadow-xs">
                  <IconKey size={26} className="text-wbk-gold" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-wbk-gold block">
                  {t("auth.recoveryBadge", "Password Recovery")}
                </span>
                <h2 className="font-new-york text-2xl sm:text-3xl text-wbk-black">
                  {t("auth.recoveryTitle", "Set New Password")}
                </h2>
                <p className="text-xs text-wbk-brown leading-relaxed max-w-xs mx-auto">
                  {t(
                    "auth.recoverySubtitle",
                    "You arrived via a verified password reset link. Please enter your new password below to secure your WallBedKing account."
                  )}
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <IconAlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-wbk-black">
                      {t("auth.newPassword", "New Password")}
                    </label>
                    <span className="text-[10px] text-wbk-brown">
                      {t("auth.passwordMinLength", "Min. 6 characters")}
                    </span>
                  </div>
                  <div className="relative">
                    <IconLock
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-wbk-brown pointer-events-none"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 pl-10 pr-10 text-xs bg-white border border-wbk-lightgrey text-wbk-black focus:outline-none focus:border-wbk-black transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-wbk-brown hover:text-wbk-black p-1 transition-colors cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-wbk-black">
                      {t("auth.confirmNewPassword", "Confirm New Password")}
                    </label>
                    {newPassword && confirmPassword && (
                      <span
                        className={`text-[10px] font-medium flex items-center gap-1 ${
                          passwordsMatch ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        {passwordsMatch ? (
                          <>
                            <IconCheck size={12} />
                            <span>{t("auth.passwordsMatch", "Passwords match")}</span>
                          </>
                        ) : (
                          <span>{t("auth.passwordsMismatch", "Passwords do not match")}</span>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <IconLock
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-wbk-brown pointer-events-none"
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full h-11 pl-10 pr-10 text-xs bg-white border text-wbk-black focus:outline-none transition-colors ${
                        confirmPassword && !passwordsMatch
                          ? "border-red-300 focus:border-red-500"
                          : "border-wbk-lightgrey focus:border-wbk-black"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-wbk-brown hover:text-wbk-black p-1 transition-colors cursor-pointer"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading || !passwordsMatch}
                  className="w-full py-3.5 bg-wbk-black text-white text-xs font-semibold uppercase tracking-[0.14em] hover:bg-wbk-green transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-full cursor-pointer shadow-sm mt-3"
                >
                  {loading ? (
                    <>
                      <IconLoader2 size={16} className="animate-spin" />
                      <span>{t("auth.updatingPassword", "Updating Password...")}</span>
                    </>
                  ) : (
                    <span>{t("auth.updatePasswordBtn", "Update Password & Continue")}</span>
                  )}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
