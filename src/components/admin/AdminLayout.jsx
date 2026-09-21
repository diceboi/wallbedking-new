"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { useAuth } from "@/context/AuthContext";
import { IconLock, IconShieldLock, IconArrowLeft, IconUser } from "@tabler/icons-react";

export function AdminLayout({ children, title }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, loading, roleLoading, role, isAdmin, openUserDrawer } = useAuth();

  if (loading || (user && roleLoading && role === null)) {
    return (
      <div className="min-h-screen bg-[#090A0A] flex flex-col items-center justify-center text-white font-poppins">
        <div className="w-10 h-10 border-2 border-wbk-gold border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-white/70">Verifying Admin Privileges...</p>
      </div>
    );
  }

  // Access Denied if not logged in or not admin
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#090A0A] text-white flex items-center justify-center p-6 font-poppins">
        <div className="max-w-md w-full bg-[#121314] border border-white/10 p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center">
            <IconShieldLock size={32} />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-wbk-gold block">
              Restricted Area
            </span>
            <h1 className="font-new-york text-2xl text-white">
              Administrator Access Required
            </h1>
            <p className="text-xs text-white/60 leading-relaxed">
              {user
                ? `Signed in as ${user.email} (Role: ${role ? role.toUpperCase() : "CUSTOMER"}). This account does not have administrator privileges. Only registered users with the 'admin' role can access the management console.`
                : "You must be signed in with an authorized Wall Bed King administrator account to view this management console."}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            {!user ? (
              <button
                type="button"
                onClick={() => openUserDrawer("login")}
                className="w-full py-3 bg-wbk-gold hover:bg-white text-wbk-black text-xs font-semibold uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <IconLock size={15} />
                <span>Sign In as Admin</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openUserDrawer("login")}
                className="w-full py-3 border border-white/20 hover:border-white text-white text-xs font-medium uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <IconUser size={15} />
                <span>Switch Account</span>
              </button>
            )}

            <Link
              href="/"
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-medium uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              <IconArrowLeft size={15} />
              <span>Return to Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-scope min-h-screen bg-[#FBF9F8] text-wbk-black flex font-poppins antialiased">
      {/* Sidebar Navigation */}
      <AdminSidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <AdminHeader
          title={title}
          onOpenMobile={() => setIsMobileOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
