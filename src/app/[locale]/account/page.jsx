"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  IconUser,
  IconPackage,
  IconCube,
  IconMapPin,
  IconLock,
  IconLogout,
  IconCheck,
  IconTruck,
  IconCalendar,
  IconShieldCheck,
  IconArrowRight,
  IconPhone,
  IconMail,
  IconEdit,
  IconKey,
  IconEye,
  IconEyeOff,
  IconAlertCircle,
  IconLoader2,
  IconTrash,
  IconPlus,
  IconBookmark,
  IconHome,
  IconExternalLink,
  IconStar,
} from "@tabler/icons-react";
import { Container } from "@/components/ui/Container";
import { useAuth } from "@/context/AuthContext";

// Sample mock orders for authenticated demonstration
const SAMPLE_ORDERS = [
  {
    id: "WBK-89241",
    date: "24 Aug 2026",
    status: "Delivered",
    statusColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    total: "£1,449.00",
    items: [
      {
        name: "Classic Vertical Wall Bed",
        size: "King (150x200 cm)",
        finish: "Natural White / Beech Slats",
        price: "£1,449.00",
        image: "/product-images/MORPHY-Bed-Vertical-Classic-200x200-6.webp",
      },
    ],
    trackingNumber: "DX-9923841GB",
    estimatedDelivery: "Delivered on 28 Aug 2026",
  },
  {
    id: "WBK-77192",
    date: "12 May 2026",
    status: "Completed",
    statusColor: "bg-stone-100 text-stone-800 border-stone-200",
    total: "£799.00",
    items: [
      {
        name: "Studio Horizontal Wall Bed",
        size: "Double (135x190 cm)",
        finish: "Matte Anthracite Front Panel",
        price: "£799.00",
        image: "/product-images/morphy-integrated/160x200.jpg",
      },
    ],
    trackingNumber: "DX-8812034GB",
    estimatedDelivery: "Delivered on 16 May 2026",
  },
];

export default function AccountPage() {
  const {
    user,
    loading,
    signOut,
    openUserDrawer,
    updateProfile,
    updatePassword,
    isPasswordRecovery,
    setIsPasswordRecovery,
    saveAddress,
    deleteAddress,
    delete3DConfiguration,
  } = useAuth();
  const [activeTab, setActiveTab] = useState("orders"); // 'orders' | 'configs' | 'addresses' | 'profile'
  const [recoveryFromUrl, setRecoveryFromUrl] = useState(false);

  // Detect tab or recovery mode from URL or AuthContext
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash || "";
      const tabParam = params.get("tab");
      if (tabParam && ["orders", "configs", "addresses", "profile"].includes(tabParam)) {
        setActiveTab(tabParam);
      }
      if (params.get("mode") === "recovery" || hash.includes("type=recovery")) {
        setRecoveryFromUrl(true);
        setActiveTab("profile");
      }
    }
  }, []);

  const isRecoveryMode = isPasswordRecovery || recoveryFromUrl;

  // Profile edit states
  const [fullNameInput, setFullNameInput] = useState(
    user?.user_metadata?.full_name || ""
  );
  const [phoneInput, setPhoneInput] = useState(
    user?.user_metadata?.phone || "+44 7911 123456"
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Password change states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Delivery Addresses state
  const defaultFallbackAddress = {
    id: "addr-default-1",
    name: "Main Residence",
    recipient: user?.user_metadata?.full_name || "Valued Customer",
    street: "14 Kensington High Street",
    apartment: "Apartment 4B",
    city: "London",
    postcode: "W8 4SG",
    country: "United Kingdom",
    phone: user?.user_metadata?.phone || "+44 20 7946 0912",
    isDefault: true,
  };

  const userAddresses =
    Array.isArray(user?.user_metadata?.addresses) && user.user_metadata.addresses.length > 0
      ? user.user_metadata.addresses
      : [defaultFallbackAddress];

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    id: "",
    name: "Home",
    recipient: "",
    street: "",
    apartment: "",
    city: "",
    postcode: "",
    country: "United Kingdom",
    phone: "",
    isDefault: false,
  });
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressFeedback, setAddressFeedback] = useState("");
  const [addressError, setAddressError] = useState("");

  // Saved 3D Configurations
  const savedConfigs = Array.isArray(user?.user_metadata?.saved_configs)
    ? user.user_metadata.saved_configs
    : [];

  const handleOpenAddAddress = () => {
    setAddressForm({
      id: "",
      name: "Home",
      recipient: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "",
      street: "",
      apartment: "",
      city: "",
      postcode: "",
      country: "United Kingdom",
      phone: user?.user_metadata?.phone || "",
      isDefault: userAddresses.length === 0,
    });
    setAddressError("");
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (addr) => {
    setAddressForm({
      id: addr.id || "",
      name: addr.name || "Home",
      recipient: addr.recipient || "",
      street: addr.street || "",
      apartment: addr.apartment || "",
      city: addr.city || "",
      postcode: addr.postcode || "",
      country: addr.country || "United Kingdom",
      phone: addr.phone || "",
      isDefault: !!addr.isDefault,
    });
    setAddressError("");
    setShowAddressModal(true);
  };

  const handleSaveAddressSubmit = async (e) => {
    e.preventDefault();
    if (!addressForm.recipient.trim() || !addressForm.street.trim() || !addressForm.city.trim()) {
      setAddressError("Please fill in all required address fields.");
      return;
    }

    setAddressSaving(true);
    setAddressError("");
    try {
      await saveAddress(addressForm);
      setShowAddressModal(false);
      setAddressFeedback("Address updated successfully!");
      setTimeout(() => setAddressFeedback(""), 3000);
    } catch (err) {
      console.error("Save address error:", err);
      setAddressError(err.message || "Could not save address. Please try again.");
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddressClick = async (addressId) => {
    if (!confirm("Are you sure you want to remove this delivery address?")) return;
    try {
      await deleteAddress(addressId);
      setAddressFeedback("Address removed.");
      setTimeout(() => setAddressFeedback(""), 2500);
    } catch (err) {
      console.error("Delete address error:", err);
    }
  };

  const handleSetDefaultAddressClick = async (addr) => {
    try {
      await saveAddress({ ...addr, isDefault: true });
      setAddressFeedback("Default shipping address updated!");
      setTimeout(() => setAddressFeedback(""), 2500);
    } catch (err) {
      console.error("Set default address error:", err);
    }
  };

  const handleDeleteConfigClick = async (configId) => {
    if (!confirm("Are you sure you want to delete this saved 3D design?")) return;
    try {
      await delete3DConfiguration(configId);
    } catch (err) {
      console.error("Delete config error:", err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        full_name: fullNameInput,
        phone: phoneInput,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error("Save profile error:", err);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      await updatePassword(newPassword);
      setPasswordSuccess("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
      if (isPasswordRecovery && setIsPasswordRecovery) {
        setIsPasswordRecovery(false);
      }
      setRecoveryFromUrl(false);
    } catch (err) {
      console.error("Update password error:", err);
      setPasswordError(err.message || "Could not update password. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const userDisplayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Valued Customer";

  const userInitial = (userDisplayName[0] || "U").toUpperCase();

  // If in Password Recovery Mode (from email reset link)
  if (isRecoveryMode && (!user || isPasswordRecovery || recoveryFromUrl)) {
    return (
      <div className="bg-wbk-white min-h-screen pt-32 pb-24 font-poppins">
        <Container size="sm">
          <div className="max-w-md mx-auto p-6 sm:p-8 border border-wbk-lightgrey bg-[#FBF9F8] shadow-md space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-wbk-gold/15 border border-wbk-gold/40 flex items-center justify-center text-wbk-black">
                <IconKey size={26} className="text-wbk-gold" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-wbk-gold block">
                Password Recovery
              </span>
              <h1 className="font-new-york text-2xl sm:text-3xl text-wbk-black">
                Set New Password
              </h1>
              <p className="text-xs text-wbk-brown leading-relaxed">
                You arrived via a verified password reset link. Please enter your new password below to secure your WallBedKing account.
              </p>
            </div>

            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <IconAlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess ? (
              <div className="space-y-4 text-center py-2">
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <IconCheck size={18} className="text-emerald-600 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPasswordSuccess("");
                    setRecoveryFromUrl(false);
                    if (setIsPasswordRecovery) setIsPasswordRecovery(false);
                    openUserDrawer("login");
                  }}
                  className="w-full py-3 bg-wbk-black text-white text-xs font-medium uppercase tracking-[0.14em] hover:bg-wbk-green transition-colors rounded-full cursor-pointer shadow-sm"
                >
                  Sign In with New Password
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                    New Password (min. 6 characters)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-10 px-3 pr-10 text-xs bg-white border border-wbk-lightgrey text-wbk-black focus:outline-none focus:border-wbk-black transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-wbk-brown hover:text-wbk-black cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 px-3 text-xs bg-white border border-wbk-lightgrey text-wbk-black focus:outline-none focus:border-wbk-black transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full py-3 bg-wbk-black text-white text-xs font-medium uppercase tracking-[0.14em] hover:bg-wbk-green transition-colors disabled:opacity-60 flex items-center justify-center gap-2 rounded-full cursor-pointer shadow-sm mt-2"
                >
                  {passwordLoading ? (
                    <>
                      <IconLoader2 size={16} className="animate-spin" />
                      <span>Saving Password...</span>
                    </>
                  ) : (
                    <span>Save New Password</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </Container>
      </div>
    );
  }

  // If not logged in, prompt user to sign in
  if (!loading && !user) {
    return (
      <div className="bg-wbk-white min-h-screen pt-32 pb-24 font-poppins">
        <Container size="md">
          <div className="text-center space-y-3 mb-10">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-wbk-gold">
              WallBedKing Members
            </span>
            <h1 className="font-new-york text-4xl text-wbk-black">
              Sign In to Your Account
            </h1>
            <p className="text-xs text-wbk-brown max-w-md mx-auto leading-relaxed">
              Track your deliveries, review saved 3D Murphy bed configurations, and manage your delivery addresses in one place.
            </p>
          </div>

          <div className="max-w-md mx-auto p-8 border border-wbk-lightgrey bg-[#FBF9F8] shadow-sm text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#F4F2F0] border border-wbk-lightgrey flex items-center justify-center text-wbk-black">
              <IconUser size={28} strokeWidth={1.5} />
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => openUserDrawer("login")}
                className="w-full py-3.5 bg-wbk-black text-white text-xs font-medium uppercase tracking-[0.14em] hover:bg-wbk-green transition-colors cursor-pointer shadow-sm rounded-full"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => openUserDrawer("register")}
                className="w-full py-3.5 border border-wbk-lightgrey bg-white text-wbk-black text-xs font-medium uppercase tracking-[0.14em] hover:border-wbk-black transition-colors cursor-pointer rounded-full"
              >
                Create an Account
              </button>
            </div>

            <div className="pt-4 border-t border-wbk-lightgrey/70 flex items-center justify-center gap-2 text-[11px] text-wbk-brown">
              <IconShieldCheck size={16} className="text-wbk-gold" />
              <span>Protected by Supabase SSL Authentication</span>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-wbk-white min-h-screen pt-32 pb-24 font-poppins">
      <Container size="xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-wbk-brown">
            <li>
              <Link href="/" className="hover:text-wbk-black transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="text-wbk-black font-medium">My Account</li>
          </ol>
        </nav>

        {/* Account Header Banner */}
        <div className="p-6 sm:p-8 bg-[#FBF9F8] border border-wbk-lightgrey flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 rounded-full bg-wbk-black text-wbk-white font-new-york text-2xl flex items-center justify-center shrink-0 shadow-sm">
              {userInitial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-new-york text-2xl sm:text-3xl text-wbk-black">
                  {userDisplayName}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Active
                </span>
              </div>
              <p className="text-xs text-wbk-brown mt-0.5">
                {user?.email} • Member since 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/configurator"
              className="px-4 py-2.5 bg-wbk-green text-white text-xs font-medium uppercase tracking-wider hover:bg-wbk-black transition-colors flex items-center gap-2 rounded-full"
            >
              <IconCube size={15} />
              <span>Open 3D Configurator</span>
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="px-4 py-2.5 border border-wbk-lightgrey bg-white text-wbk-black text-xs font-medium uppercase tracking-wider hover:border-wbk-black transition-colors flex items-center gap-2 cursor-pointer rounded-full"
            >
              <IconLogout size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Dashboard Tabs & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Nav */}
          <div className="lg:col-span-1">
            <div className="border border-wbk-lightgrey divide-y divide-wbk-lightgrey/70 bg-wbk-white">
              <button
                type="button"
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center gap-3 p-3.5 text-xs font-semibold uppercase tracking-wider text-left transition-colors cursor-pointer ${
                  activeTab === "orders"
                    ? "bg-wbk-black text-white"
                    : "text-wbk-black hover:bg-[#FBF9F8]"
                }`}
              >
                <IconPackage size={17} strokeWidth={1.5} />
                <span>Orders & Tracking</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("configs")}
                className={`w-full flex items-center gap-3 p-3.5 text-xs font-semibold uppercase tracking-wider text-left transition-colors cursor-pointer ${
                  activeTab === "configs"
                    ? "bg-wbk-black text-white"
                    : "text-wbk-black hover:bg-[#FBF9F8]"
                }`}
              >
                <IconCube size={17} strokeWidth={1.5} />
                <span>Saved 3D Designs</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("addresses")}
                className={`w-full flex items-center gap-3 p-3.5 text-xs font-semibold uppercase tracking-wider text-left transition-colors cursor-pointer ${
                  activeTab === "addresses"
                    ? "bg-wbk-black text-white"
                    : "text-wbk-black hover:bg-[#FBF9F8]"
                }`}
              >
                <IconMapPin size={17} strokeWidth={1.5} />
                <span>Delivery Addresses</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 p-3.5 text-xs font-semibold uppercase tracking-wider text-left transition-colors cursor-pointer ${
                  activeTab === "profile"
                    ? "bg-wbk-black text-white"
                    : "text-wbk-black hover:bg-[#FBF9F8]"
                }`}
              >
                <IconUser size={17} strokeWidth={1.5} />
                <span>Account & Security</span>
              </button>
            </div>

            {/* Specialist Help Card */}
            <div className="mt-6 p-5 border border-wbk-lightgrey bg-[#FBF9F8] space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-wbk-black">
                Need Help with an Order?
              </div>
              <p className="text-[11px] text-wbk-brown leading-relaxed">
                Our UK-based wall bed specialists are available Monday to Friday, 9:00 - 17:00.
              </p>
              <a
                href="tel:08000288940"
                className="inline-flex items-center gap-2 text-xs font-semibold text-wbk-black hover:text-wbk-green transition-colors"
              >
                <IconPhone size={14} />
                <span>0800 028 8940</span>
              </a>
            </div>
          </div>

          {/* Main Tab Content */}
          <div className="lg:col-span-3">
            {/* ── TAB 1: ORDERS ── */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-new-york text-2xl text-wbk-black">
                    Your Orders & Tracking
                  </h2>
                  <p className="text-xs text-wbk-brown mt-0.5">
                    View order status, download VAT invoices, and follow DX Freight tracking.
                  </p>
                </div>

                <div className="space-y-4">
                  {SAMPLE_ORDERS.map((order) => (
                    <div
                      key={order.id}
                      className="border border-wbk-lightgrey bg-wbk-white overflow-hidden shadow-2xs"
                    >
                      {/* Order Header */}
                      <div className="p-4 sm:p-5 bg-[#FBF9F8] border-b border-wbk-lightgrey flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <span className="text-[10px] uppercase font-semibold text-wbk-brown block">
                              Order ID
                            </span>
                            <span className="text-xs font-bold text-wbk-black">
                              #{order.id}
                            </span>
                          </div>
                          <div className="hidden sm:block h-6 w-px bg-wbk-lightgrey" />
                          <div>
                            <span className="text-[10px] uppercase font-semibold text-wbk-brown block">
                              Date Placed
                            </span>
                            <span className="text-xs text-wbk-black">
                              {order.date}
                            </span>
                          </div>
                          <div className="hidden sm:block h-6 w-px bg-wbk-lightgrey" />
                          <div>
                            <span className="text-[10px] uppercase font-semibold text-wbk-brown block">
                              Total Amount
                            </span>
                            <span className="text-xs font-bold text-wbk-black">
                              {order.total}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${order.statusColor}`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Order Item */}
                      <div className="p-4 sm:p-5 divide-y divide-wbk-lightgrey/50">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-4 sm:gap-6 py-2"
                          >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#F4F2F0] border border-wbk-lightgrey/60 p-2 shrink-0 flex items-center justify-center">
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={64}
                                height={64}
                                className="object-contain"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-wbk-black">
                                {item.name}
                              </h3>
                              <p className="text-xs text-wbk-brown mt-0.5">
                                {item.size} • {item.finish}
                              </p>
                              <div className="flex items-center gap-2 mt-2 text-[11px] text-wbk-green font-medium">
                                <IconTruck size={14} />
                                <span>{order.estimatedDelivery}</span>
                              </div>
                            </div>
                            <div className="text-sm font-bold text-wbk-black">
                              {item.price}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Actions */}
                      <div className="px-4 sm:px-5 py-3 bg-[#F4F2F0]/40 border-t border-wbk-lightgrey/60 flex items-center justify-between text-xs text-wbk-brown">
                        <span>Tracking: <strong className="text-wbk-black">{order.trackingNumber}</strong></span>
                        <Link
                          href="/support/contact"
                          className="text-wbk-black hover:text-wbk-green underline font-medium"
                        >
                          Request Support
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB 2: SAVED CONFIGS ── */}
            {activeTab === "configs" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-new-york text-2xl text-wbk-black">
                      Saved 3D Configurations
                    </h2>
                    <p className="text-xs text-wbk-brown mt-0.5">
                      Your customized wall bed mechanisms, sofas, and cabinet setups.
                    </p>
                  </div>

                  <Link
                    href="/configurator"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-wbk-black text-white text-xs font-medium uppercase tracking-wider hover:bg-wbk-green transition-colors rounded-full cursor-pointer shadow-sm self-start sm:self-auto"
                  >
                    <IconPlus size={14} />
                    <span>Create New Design</span>
                  </Link>
                </div>

                {savedConfigs.length === 0 ? (
                  <div className="p-8 border border-dashed border-wbk-lightgrey text-center space-y-4 bg-[#FBF9F8]">
                    <div className="w-12 h-12 mx-auto rounded-full bg-white border border-wbk-lightgrey flex items-center justify-center text-wbk-black">
                      <IconCube size={24} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-wbk-black">
                        No Saved 3D Designs Yet
                      </div>
                      <p className="text-xs text-wbk-brown max-w-sm mx-auto">
                        Design modular sofas and Murphy beds in our real-time 3D studio, and click &ldquo;Save to Account&rdquo; to store your design here.
                      </p>
                    </div>
                    <Link
                      href="/configurator"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-wbk-black text-white text-xs font-medium uppercase tracking-[0.14em] hover:bg-wbk-green transition-colors rounded-full"
                    >
                      <span>Launch 3D Configurator</span>
                      <IconArrowRight size={15} />
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedConfigs.map((cfg) => {
                      const formattedDate = cfg.createdAt
                        ? new Date(cfg.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "Recent";

                      return (
                        <div
                          key={cfg.id}
                          className="border border-wbk-lightgrey bg-white overflow-hidden shadow-2xs flex flex-col justify-between"
                        >
                          <div className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-14 h-14 bg-[#F4F2F0] border border-wbk-lightgrey/70 p-1 flex items-center justify-center shrink-0">
                                  {cfg.thumbnail && (
                                    <Image
                                      src={cfg.thumbnail}
                                      alt={cfg.title || "Design"}
                                      width={48}
                                      height={48}
                                      className="object-contain"
                                      unoptimized
                                    />
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-sm text-wbk-black line-clamp-1">
                                    {cfg.title || "Custom 3D Setup"}
                                  </h3>
                                  <span className="text-[11px] text-wbk-brown block">
                                    Saved: {formattedDate}
                                  </span>
                                  {cfg.summary && (
                                    <span className="text-[10px] text-wbk-brown/80 line-clamp-1">
                                      {cfg.summary}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteConfigClick(cfg.id)}
                                className="p-1 text-wbk-brown hover:text-red-600 transition-colors cursor-pointer"
                                title="Delete saved design"
                              >
                                <IconTrash size={16} />
                              </button>
                            </div>

                            <div className="pt-2 border-t border-wbk-lightgrey/60 flex items-center justify-between">
                              <span className="text-xs text-wbk-brown">
                                Value: <strong className="text-wbk-black">£{cfg.totalPrice}</strong>
                              </span>
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#F4F2F0] text-wbk-black rounded-full">
                                {cfg.modulesCount || 1} Modules
                              </span>
                            </div>
                          </div>

                          <div className="p-3 bg-[#FBF9F8] border-t border-wbk-lightgrey/60 flex items-center justify-end gap-2">
                            <Link
                              href={`/configurator?config=${encodeURIComponent(cfg.configString || "")}`}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-wbk-black text-white hover:bg-wbk-green text-xs font-medium uppercase tracking-wider rounded-full transition-colors"
                            >
                              <IconExternalLink size={14} />
                              <span>Open in 3D Studio</span>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 3: ADDRESSES ── */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-new-york text-2xl text-wbk-black">
                      Delivery Addresses
                    </h2>
                    <p className="text-xs text-wbk-brown mt-0.5">
                      Manage default shipping addresses for fast and reliable checkout.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenAddAddress}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-wbk-black text-white text-xs font-medium uppercase tracking-wider hover:bg-wbk-green transition-colors rounded-full cursor-pointer shadow-sm self-start sm:self-auto"
                  >
                    <IconPlus size={14} />
                    <span>Add New Address</span>
                  </button>
                </div>

                {addressFeedback && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <IconCheck size={16} className="text-emerald-600" />
                    <span>{addressFeedback}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-5 bg-white relative space-y-3 transition-shadow border ${
                        addr.isDefault
                          ? "border-wbk-black shadow-xs"
                          : "border-wbk-lightgrey hover:border-wbk-black/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <IconHome size={16} className="text-wbk-gold" />
                          <span className="font-semibold text-xs text-wbk-black uppercase tracking-wider">
                            {addr.name || "Shipping Address"}
                          </span>
                        </div>

                        {addr.isDefault && (
                          <span className="px-2 py-0.5 text-[9px] uppercase font-semibold tracking-wider bg-wbk-black text-wbk-gold rounded-full">
                            Default Shipping
                          </span>
                        )}
                      </div>

                      <div className="font-semibold text-sm text-wbk-black">
                        {addr.recipient}
                      </div>

                      <div className="text-xs text-wbk-brown leading-relaxed min-h-[48px]">
                        {addr.street}
                        {addr.apartment && <>, {addr.apartment}</>}
                        <br />
                        {addr.city}, {addr.postcode}
                        <br />
                        {addr.country}
                      </div>

                      {addr.phone && (
                        <div className="text-xs text-wbk-brown pt-2 border-t border-wbk-lightgrey/60">
                          Phone: {addr.phone}
                        </div>
                      )}

                      <div className="pt-3 border-t border-wbk-lightgrey/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditAddress(addr)}
                            className="inline-flex items-center gap-1 text-wbk-black hover:text-wbk-green font-medium cursor-pointer"
                          >
                            <IconEdit size={14} />
                            <span>Edit</span>
                          </button>

                          {userAddresses.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteAddressClick(addr.id)}
                              className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 ml-2 cursor-pointer"
                            >
                              <IconTrash size={14} />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>

                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddressClick(addr)}
                            className="text-[11px] text-wbk-brown hover:text-wbk-black underline cursor-pointer"
                          >
                            Set as default
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Add New Address Card */}
                  <div
                    onClick={handleOpenAddAddress}
                    className="p-5 border border-dashed border-wbk-lightgrey hover:border-wbk-black bg-[#FBF9F8] flex flex-col items-center justify-center text-center space-y-2 min-h-[180px] cursor-pointer transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white border border-wbk-lightgrey group-hover:border-wbk-black flex items-center justify-center text-wbk-brown group-hover:text-wbk-black transition-colors">
                      <IconPlus size={20} />
                    </div>
                    <span className="text-xs font-semibold text-wbk-black uppercase tracking-wider">
                      Add New Address
                    </span>
                    <span className="text-[10px] text-wbk-brown">
                      Secondary home, office or project site
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 4: PROFILE & SECURITY ── */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-new-york text-2xl text-wbk-black">
                    Account & Security Settings
                  </h2>
                  <p className="text-xs text-wbk-brown mt-0.5">
                    Update your personal contact information and password.
                  </p>
                </div>

                <form
                  onSubmit={handleSaveProfile}
                  className="p-6 border border-wbk-lightgrey bg-[#FBF9F8] space-y-5"
                >
                  {saveSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                      <IconCheck size={16} className="text-emerald-600" />
                      <span>Profile information updated successfully!</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullNameInput}
                        onChange={(e) => setFullNameInput(e.target.value)}
                        className="w-full h-10 px-3 text-xs bg-white border border-wbk-lightgrey text-wbk-black focus:outline-none focus:border-wbk-black transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className="w-full h-10 px-3 text-xs bg-white border border-wbk-lightgrey text-wbk-black focus:outline-none focus:border-wbk-black transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ""}
                      className="w-full h-10 px-3 text-xs bg-[#F4F2F0] border border-wbk-lightgrey/80 text-wbk-brown cursor-not-allowed"
                    />
                    <span className="text-[10px] text-wbk-brown mt-1 block">
                      Email is managed securely through your Supabase account.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="py-3 px-6 bg-wbk-black text-white text-xs font-medium uppercase tracking-[0.14em] hover:bg-wbk-green transition-colors cursor-pointer shadow-sm rounded-full"
                  >
                    Save Changes
                  </button>
                </form>

                {/* ── Password Change Section ── */}
                <div className="p-6 border border-wbk-lightgrey bg-[#FBF9F8] space-y-5">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-wbk-lightgrey/80">
                    <IconLock size={18} className="text-wbk-black" />
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-wbk-black">
                        Change Password / Jelszó megváltoztatása
                      </h3>
                      <p className="text-[11px] text-wbk-brown mt-0.5">
                        Choose a secure password of at least 6 characters.
                      </p>
                    </div>
                  </div>

                  {passwordError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                      <IconAlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                      <IconCheck size={16} className="text-emerald-600 shrink-0" />
                      <span>{passwordSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full h-10 px-3 pr-10 text-xs bg-white border border-wbk-lightgrey text-wbk-black focus:outline-none focus:border-wbk-black transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-wbk-brown hover:text-wbk-black cursor-pointer"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                          Confirm New Password
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-10 px-3 text-xs bg-white border border-wbk-lightgrey text-wbk-black focus:outline-none focus:border-wbk-black transition-colors"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="py-3 px-6 bg-wbk-black text-white text-xs font-medium uppercase tracking-[0.14em] hover:bg-wbk-green transition-colors disabled:opacity-60 flex items-center gap-2 rounded-full cursor-pointer shadow-sm"
                    >
                      {passwordLoading ? (
                        <>
                          <IconLoader2 size={16} className="animate-spin" />
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <span>Update Password</span>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>

      {/* Address Add / Edit Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-wbk-black/60 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full p-6 shadow-2xl border border-wbk-lightgrey space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-wbk-lightgrey">
              <div className="flex items-center gap-2">
                <IconHome size={20} className="text-wbk-gold" />
                <h3 className="font-new-york text-xl text-wbk-black">
                  {addressForm.id ? "Edit Delivery Address" : "Add New Delivery Address"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="w-7 h-7 flex items-center justify-center text-wbk-brown hover:text-wbk-black cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {addressError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <IconAlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{addressError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAddressSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                    Address Label (e.g., Home, Office)
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    placeholder="Home / Primary"
                    className="w-full h-10 px-3 bg-[#FBF9F8] border border-wbk-lightgrey text-wbk-black focus:outline-none focus:border-wbk-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                    Recipient Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.recipient}
                    onChange={(e) => setAddressForm({ ...addressForm, recipient: e.target.value })}
                    placeholder="Full Name"
                    className="w-full h-10 px-3 bg-[#FBF9F8] border border-wbk-lightgrey text-wbk-black focus:outline-none focus:border-wbk-black transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  placeholder="House number and street name"
                  className="w-full h-10 px-3 bg-[#FBF9F8] border border-wbk-lightgrey text-wbk-black focus:outline-none focus:border-wbk-black transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                    Apartment, Suite, Unit (optional)
                  </label>
                  <input
                    type="text"
                    value={addressForm.apartment}
                    onChange={(e) => setAddressForm({ ...addressForm, apartment: e.target.value })}
                    placeholder="Flat / Apt 4B"
                    className="w-full h-10 px-3 bg-[#FBF9F8] border border-wbk-lightgrey text-wbk-black focus:outline-none focus:border-wbk-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                    Town / City
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder="London"
                    className="w-full h-10 px-3 bg-[#FBF9F8] border border-wbk-lightgrey text-wbk-black focus:outline-none focus:border-wbk-black transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                    Postcode / ZIP
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.postcode}
                    onChange={(e) => setAddressForm({ ...addressForm, postcode: e.target.value })}
                    placeholder="W8 4SG"
                    className="w-full h-10 px-3 bg-[#FBF9F8] border border-wbk-lightgrey text-wbk-black focus:outline-none focus:border-wbk-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    placeholder="United Kingdom"
                    className="w-full h-10 px-3 bg-[#FBF9F8] border border-wbk-lightgrey text-wbk-black focus:outline-none focus:border-wbk-black transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-wbk-black mb-1.5">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  placeholder="+44 20 7946 0912"
                  className="w-full h-10 px-3 bg-[#FBF9F8] border border-wbk-lightgrey text-wbk-black focus:outline-none focus:border-wbk-black transition-colors"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefaultAddr"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="w-4 h-4 text-wbk-black border-wbk-lightgrey rounded focus:ring-wbk-black cursor-pointer"
                />
                <label htmlFor="isDefaultAddr" className="text-xs text-wbk-black cursor-pointer select-none">
                  Set as default shipping address
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-wbk-lightgrey">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2.5 text-xs text-wbk-brown hover:text-wbk-black cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressSaving}
                  className="px-6 py-2.5 bg-wbk-black text-white text-xs font-medium uppercase tracking-wider hover:bg-wbk-green transition-colors rounded-full cursor-pointer disabled:opacity-60 shadow-sm flex items-center gap-1.5"
                >
                  {addressSaving ? (
                    <>
                      <IconLoader2 size={14} className="animate-spin" />
                      <span>Saving Address...</span>
                    </>
                  ) : (
                    <span>Save Address</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
