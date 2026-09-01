"use client";

import { useState } from "react";
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
  const { user, loading, signOut, openUserDrawer, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("orders"); // 'orders' | 'configs' | 'addresses' | 'profile'

  // Profile edit states
  const [fullNameInput, setFullNameInput] = useState(
    user?.user_metadata?.full_name || ""
  );
  const [phoneInput, setPhoneInput] = useState(
    user?.user_metadata?.phone || "+44 7911 123456"
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  const userDisplayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Valued Customer";

  const userInitial = (userDisplayName[0] || "U").toUpperCase();

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
                className="w-full py-3.5 bg-wbk-black text-white text-xs font-medium uppercase tracking-[0.14em] hover:bg-wbk-green transition-colors cursor-pointer shadow-sm"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => openUserDrawer("register")}
                className="w-full py-3.5 border border-wbk-lightgrey bg-white text-wbk-black text-xs font-medium uppercase tracking-[0.14em] hover:border-wbk-black transition-colors cursor-pointer"
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
              className="px-4 py-2.5 bg-wbk-green text-white text-xs font-medium uppercase tracking-wider hover:bg-wbk-black transition-colors flex items-center gap-2"
            >
              <IconCube size={15} />
              <span>Open 3D Configurator</span>
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="px-4 py-2.5 border border-wbk-lightgrey bg-white text-wbk-black text-xs font-medium uppercase tracking-wider hover:border-wbk-black transition-colors flex items-center gap-2 cursor-pointer"
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
                <div>
                  <h2 className="font-new-york text-2xl text-wbk-black">
                    Saved 3D Configurations
                  </h2>
                  <p className="text-xs text-wbk-brown mt-0.5">
                    Your customized wall bed mechanisms and cabinet setups.
                  </p>
                </div>

                <div className="p-8 border border-dashed border-wbk-lightgrey text-center space-y-4 bg-[#FBF9F8]">
                  <div className="w-12 h-12 mx-auto rounded-full bg-white border border-wbk-lightgrey flex items-center justify-center text-wbk-black">
                    <IconCube size={24} strokeWidth={1.5} />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-wbk-black">
                      Design Your Bespoke Wall Bed in 3D
                    </div>
                    <p className="text-xs text-wbk-brown max-w-sm mx-auto">
                      Choose mechanism dimensions, frame finishes, and optional integrated sofa seating in our real-time 3D studio.
                    </p>
                  </div>
                  <Link
                    href="/configurator"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-wbk-black text-white text-xs font-medium uppercase tracking-[0.14em] hover:bg-wbk-green transition-colors"
                  >
                    <span>Launch 3D Configurator</span>
                    <IconArrowRight size={15} />
                  </Link>
                </div>
              </div>
            )}

            {/* ── TAB 3: ADDRESSES ── */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-new-york text-2xl text-wbk-black">
                    Delivery Addresses
                  </h2>
                  <p className="text-xs text-wbk-brown mt-0.5">
                    Manage default shipping addresses for rapid checkout.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 border border-wbk-black bg-white relative space-y-3">
                    <span className="absolute top-4 right-4 px-2 py-0.5 text-[9px] uppercase font-semibold tracking-wider bg-[#F4F2F0] text-wbk-black">
                      Default Shipping
                    </span>
                    <div className="font-semibold text-sm text-wbk-black">
                      {userDisplayName}
                    </div>
                    <div className="text-xs text-wbk-brown leading-relaxed">
                      14 Kensington High Street<br />
                      Apartment 4B<br />
                      London, W8 4SG<br />
                      United Kingdom
                    </div>
                    <div className="text-xs text-wbk-brown pt-2 border-t border-wbk-lightgrey/60">
                      Phone: +44 20 7946 0912
                    </div>
                  </div>

                  <div className="p-5 border border-dashed border-wbk-lightgrey bg-[#FBF9F8] flex flex-col items-center justify-center text-center space-y-2 min-h-[160px]">
                    <div className="w-9 h-9 rounded-full bg-white border border-wbk-lightgrey flex items-center justify-center text-wbk-brown">
                      <IconMapPin size={18} />
                    </div>
                    <span className="text-xs font-medium text-wbk-black">
                      Add Secondary Address
                    </span>
                    <span className="text-[10px] text-wbk-brown">
                      Work, office or holiday residence
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
                    className="py-3 px-6 bg-wbk-black text-white text-xs font-medium uppercase tracking-[0.14em] hover:bg-wbk-green transition-colors cursor-pointer shadow-sm"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
