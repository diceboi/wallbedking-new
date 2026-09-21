"use client";

import { useState } from "react";
import {
  IconMail,
  IconSend,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconExternalLink,
  IconCheck,
  IconAlertCircle,
  IconTruck,
  IconBellRinging,
  IconMessageCircle,
  IconRefresh,
  IconStar,
  IconHeartHandshake,
} from "@tabler/icons-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const LOCALES = [
  { code: "en", label: "UK (English)" },
  { code: "us", label: "US (English)" },
  { code: "de", label: "DE (Deutsch)" },
  { code: "fr", label: "FR (Français)" },
  { code: "es", label: "ES (Español)" },
  { code: "it", label: "IT (Italiano)" },
  { code: "por", label: "POR (Português)" },
];

const EMAIL_TEMPLATES = [
  {
    id: "order_confirmation",
    title: "Order Confirmation",
    audience: "Customer",
    audienceColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: IconMail,
    trigger: "Triggered automatically when a Stripe checkout or PayPal payment succeeds.",
    recipient: "Customer's checkout email address",
    subject: "Wall Bed King Order Confirmation - #WBK-84920",
    supportsLocale: true,
  },
  {
    id: "shipping",
    title: "Shipping & Tracking",
    audience: "Customer",
    audienceColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: IconTruck,
    trigger: "Triggered from Admin Orders dashboard when status is changed to 'shipped' with tracking number.",
    recipient: "Customer's checkout email address",
    subject: "Your Wall Bed King Order #WBK-84920 Has Been Dispatched!",
    supportsLocale: false,
  },
  {
    id: "review_request",
    title: "Post-Purchase Review Request",
    audience: "Customer",
    audienceColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: IconHeartHandshake,
    trigger: "Sent ~7 days after parcel dispatch/delivery, asking customer for feedback and setup photos.",
    recipient: "Customer's email address",
    subject: "How is your Wall Bed King Murphy bed? (Order #WBK-84920)",
    supportsLocale: false,
  },
  {
    id: "admin_alert",
    title: "Admin Order Alert",
    audience: "Store Support",
    audienceColor: "bg-amber-50 text-amber-800 border-amber-200",
    icon: IconBellRinging,
    trigger: "Triggered in parallel with customer confirmation whenever an order is successfully paid.",
    recipient: "support@wallbedking.com",
    subject: "🚨 NEW ORDER RECEIVED: #WBK-84920 (£1,449.00)",
    supportsLocale: false,
  },
  {
    id: "contact",
    title: "Contact Form Submission",
    audience: "Store Support",
    audienceColor: "bg-amber-50 text-amber-800 border-amber-200",
    icon: IconMessageCircle,
    trigger: "Triggered whenever a visitor submits an inquiry on the /contact page.",
    recipient: "support@wallbedking.com (Includes One-Click Reply Button to Customer)",
    subject: "📩 Contact Form Submission: Ceiling height inquiry from Emily Watson",
    supportsLocale: false,
  },
  {
    id: "review_alert",
    title: "New Review Moderation Alert",
    audience: "Store Support",
    audienceColor: "bg-amber-50 text-amber-800 border-amber-200",
    icon: IconStar,
    trigger: "Triggered when a customer submits a new product review with star rating & optional photos.",
    recipient: "support@wallbedking.com (Links to /admin/reviews for 1-click approval)",
    subject: "⭐ NEW REVIEW SUBMITTED: Marcus Vance (5 Stars)",
    supportsLocale: false,
  },
];

export default function AdminEmailsPage() {
  const [activeTemplateId, setActiveTemplateId] = useState("order_confirmation");
  const [selectedLocale, setSelectedLocale] = useState("en");
  const [deviceMode, setDeviceMode] = useState("desktop"); // 'desktop' | 'mobile'
  const [testEmail, setTestEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);
  const [iframeKey, setIframeKey] = useState(0);

  const activeTemplate = EMAIL_TEMPLATES.find((t) => t.id === activeTemplateId) || EMAIL_TEMPLATES[0];

  const previewUrl = `/api/admin/email-preview?type=${activeTemplateId}&locale=${selectedLocale}`;

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmail || !testEmail.includes("@")) {
      setSendStatus({
        type: "error",
        message: "Please enter a valid email address!",
      });
      return;
    }

    setIsSending(true);
    setSendStatus(null);

    try {
      const res = await fetch("/api/admin/email-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeTemplateId,
          recipientEmail: testEmail.trim(),
          locale: selectedLocale,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send test email.");
      }

      setSendStatus({
        type: "success",
        message: `Test email successfully sent to ${testEmail}`,
      });
    } catch (err) {
      setSendStatus({
        type: "error",
        message: err.message || "An error occurred while sending the test email.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 text-wbk-black font-poppins pb-16">
      {/* Header */}
      <AdminPageHeader
        badge="Notifications & Communications"
        title="Email Templates & Live Preview"
        count={EMAIL_TEMPLATES.length}
        description={
          <>
            Customer Support: <strong className="text-wbk-black">support@wallbedking.com</strong> • Phone: <strong className="text-wbk-black">01928 583 469</strong> • Lifetime Mechanism Warranty
          </>
        }
        actions={
          <>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-wbk-lightgrey/20 border border-wbk-lightgrey/80 text-xs font-medium text-wbk-black rounded-full transition-colors shadow-2xs"
            >
              <IconExternalLink size={14} />
              <span>Open in New Tab</span>
            </a>
            <button
              onClick={() => setIframeKey((k) => k + 1)}
              className="p-2.5 bg-white hover:bg-wbk-lightgrey/20 border border-wbk-lightgrey/80 text-wbk-black rounded-full transition-colors shadow-2xs cursor-pointer"
              title="Reload Preview"
            >
              <IconRefresh size={16} />
            </button>
          </>
        }
      />

      {/* Template Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {EMAIL_TEMPLATES.map((tmpl) => {
          const Icon = tmpl.icon;
          const isActive = activeTemplateId === tmpl.id;
          return (
            <button
              key={tmpl.id}
              onClick={() => {
                setActiveTemplateId(tmpl.id);
                setSendStatus(null);
              }}
              className={`p-4 text-left border transition-all relative cursor-pointer ${
                isActive
                  ? "bg-white border-2 border-wbk-gold shadow-md"
                  : "bg-white border-wbk-lightgrey/70 hover:border-wbk-brown/40 hover:bg-[#FBF9F8] shadow-2xs"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`p-1.5 rounded ${isActive ? "bg-wbk-gold text-white" : "bg-wbk-lightgrey/40 text-wbk-black"}`}>
                  <Icon size={16} />
                </span>
                <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 border ${tmpl.audienceColor}`}>
                  {tmpl.audience}
                </span>
              </div>
              <h3 className="font-poppins font-semibold text-sm text-wbk-black mb-1">{tmpl.title}</h3>
              <p className="text-[11px] text-wbk-brown line-clamp-2 leading-relaxed">
                {tmpl.trigger}
              </p>
            </button>
          );
        })}
      </div>

      {/* Language Switcher for Order Confirmation */}
      {activeTemplate.supportsLocale && (
        <div className="p-3 bg-white border border-wbk-lightgrey/70 flex flex-wrap items-center gap-2 text-xs shadow-2xs">
          <span className="text-wbk-brown font-medium mr-2">Confirmation Language:</span>
          {LOCALES.map((loc) => (
            <button
              key={loc.code}
              onClick={() => setSelectedLocale(loc.code)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                selectedLocale === loc.code
                  ? "bg-wbk-black text-white font-semibold shadow-xs"
                  : "bg-white hover:bg-wbk-lightgrey/20 text-wbk-black border border-wbk-lightgrey/60"
              }`}
            >
              {loc.label}
            </button>
          ))}
        </div>
      )}

      {/* Active Template Meta & Test Sender */}
      <div className="bg-white border border-wbk-lightgrey/70 p-5 grid grid-cols-1 lg:grid-cols-3 gap-6 shadow-2xs">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="font-poppins text-base font-semibold text-wbk-black">{activeTemplate.title} Details</h2>
            <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 border ${activeTemplate.audienceColor}`}>
              {activeTemplate.audience}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#FBF9F8] border border-wbk-lightgrey/60">
              <span className="text-wbk-brown block text-[10px] uppercase tracking-wider font-semibold">Trigger Event:</span>
              <span className="text-wbk-black font-normal mt-0.5 block">{activeTemplate.trigger}</span>
            </div>
            <div className="p-3 bg-[#FBF9F8] border border-wbk-lightgrey/60">
              <span className="text-wbk-brown block text-[10px] uppercase tracking-wider font-semibold">Recipient:</span>
              <span className="text-wbk-black font-normal mt-0.5 block">{activeTemplate.recipient}</span>
            </div>
          </div>

          <div className="p-3 bg-[#FBF9F8] border border-wbk-lightgrey/60 text-xs">
            <span className="text-wbk-brown block text-[10px] uppercase tracking-wider font-semibold">Email Subject:</span>
            <span className="text-wbk-gold font-mono font-medium mt-0.5 block">{activeTemplate.subject}</span>
          </div>
        </div>

        {/* Test Sender */}
        <div className="bg-[#FBF9F8] border border-wbk-lightgrey/60 p-4 flex flex-col justify-between">
          <div>
            <h3 className="font-poppins text-xs font-semibold uppercase tracking-wider text-wbk-gold mb-1">
              Send Test Email
            </h3>
            <p className="text-[11px] text-wbk-brown mb-3">
              Test real email delivery directly to your inbox!
            </p>

            <form onSubmit={handleSendTestEmail} className="space-y-2">
              <input
                type="email"
                placeholder="you@domain.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-wbk-lightgrey text-xs text-wbk-black placeholder:text-wbk-brown/50 focus:outline-none focus:border-wbk-gold"
              />
              <button
                type="submit"
                disabled={isSending}
                className="w-full py-2 bg-wbk-black hover:bg-wbk-green text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isSending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <IconSend size={14} />
                    <span>Send Test Email</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {sendStatus && (
            <div
              className={`mt-3 p-2.5 text-xs border flex items-start gap-2 ${
                sendStatus.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {sendStatus.type === "success" ? <IconCheck size={16} className="shrink-0 mt-0.5" /> : <IconAlertCircle size={16} className="shrink-0 mt-0.5" />}
              <span className="leading-tight font-medium">{sendStatus.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Preview Device Controls & Frame */}
      <div className="bg-white border border-wbk-lightgrey/70 shadow-2xs">
        <div className="p-3 border-b border-wbk-lightgrey/60 flex items-center justify-between bg-[#FBF9F8]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-wbk-brown uppercase tracking-wider font-semibold">
              Device View:
            </span>
            <div className="flex items-center bg-white border border-wbk-lightgrey/60 p-0.5 rounded">
              <button
                onClick={() => setDeviceMode("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  deviceMode === "desktop" ? "bg-wbk-black text-white" : "text-wbk-brown hover:text-wbk-black"
                }`}
              >
                <IconDeviceDesktop size={14} />
                <span>Desktop</span>
              </button>
              <button
                onClick={() => setDeviceMode("mobile")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  deviceMode === "mobile" ? "bg-wbk-black text-white" : "text-wbk-brown hover:text-wbk-black"
                }`}
              >
                <IconDeviceMobile size={14} />
                <span>Mobile (390px)</span>
              </button>
            </div>
          </div>

          <span className="text-[11px] text-wbk-brown font-mono">
            Rendered: <code className="text-wbk-black">{previewUrl}</code>
          </span>
        </div>

        <div className="p-6 bg-[#F4F2F0] flex justify-center min-h-[680px]">
          <div
            className={`transition-all duration-300 bg-white rounded shadow-xl overflow-hidden ${
              deviceMode === "mobile" ? "w-[390px] border-8 border-[#333] rounded-[32px] h-[720px]" : "w-full max-w-[700px] h-[750px] border border-wbk-lightgrey/60"
            }`}
          >
            <iframe
              key={`${activeTemplateId}-${selectedLocale}-${iframeKey}`}
              src={previewUrl}
              title="Email Template Preview"
              className="w-full h-full border-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
