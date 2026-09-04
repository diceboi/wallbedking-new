"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconUsers,
  IconShieldLock,
  IconUserCheck,
  IconMailCheck,
  IconSearch,
  IconRefresh,
  IconCheck,
  IconAlertCircle,
  IconDatabase,
  IconCopy,
  IconLoader2,
  IconShield,
  IconShoppingBag,
  IconCalendar,
  IconClock,
  IconHome,
  IconCube,
  IconPlus,
  IconTrash,
  IconEdit,
  IconExternalLink,
} from "@tabler/icons-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // 'all' | 'admin' | 'customer'
  const [hasProfilesTable, setHasProfilesTable] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [message, setMessage] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);

  // Address modal states for admin
  const [selectedUserForAddresses, setSelectedUserForAddresses] = useState(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
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
  const [addressModalError, setAddressModalError] = useState("");

  // 3D Designs modal state for admin
  const [selectedUserForConfigs, setSelectedUserForConfigs] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
        setHasProfilesTable(!!data.hasProfilesTable);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to load users." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error loading users." });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (user) => {
    const nextRole = user.role === "admin" ? "customer" : "admin";
    const confirmText =
      nextRole === "admin"
        ? `Grant Administrator privileges to ${user.email}?`
        : `Remove Administrator privileges from ${user.email} and switch to Customer?`;

    if (!window.confirm(confirmText)) return;

    setUpdatingUserId(user.id);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, role: nextRole }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u))
        );
        setMessage({
          type: "success",
          text: `Role for ${user.email} updated to ${nextRole.toUpperCase()}.`,
        });
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update role." });
      }
    } catch {
      setMessage({ type: "error", text: "Error communicating with server." });
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Open Addresses Modal
  const handleOpenAddressesModal = (u) => {
    setSelectedUserForAddresses(u);
    setIsEditingAddress(false);
    setAddressModalError("");
  };

  // Open Add Address Form inside Modal
  const handleOpenAddAddressForm = () => {
    setAddressForm({
      id: "",
      name: "Home",
      recipient: selectedUserForAddresses?.fullName || "",
      street: "",
      apartment: "",
      city: "",
      postcode: "",
      country: "United Kingdom",
      phone: selectedUserForAddresses?.phone || "",
      isDefault: !selectedUserForAddresses?.addresses?.length,
    });
    setAddressModalError("");
    setIsEditingAddress(true);
  };

  // Open Edit Address Form inside Modal
  const handleOpenEditAddressForm = (addr) => {
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
    setAddressModalError("");
    setIsEditingAddress(true);
  };

  // Save Address submission (Admin)
  const handleSaveAddressSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserForAddresses) return;
    if (!addressForm.recipient.trim() || !addressForm.street.trim() || !addressForm.city.trim()) {
      setAddressModalError("Please fill in recipient, street, and city.");
      return;
    }

    setAddressSaving(true);
    setAddressModalError("");

    const currentAddresses = Array.isArray(selectedUserForAddresses.addresses)
      ? [...selectedUserForAddresses.addresses]
      : [];

    const isNew = !addressForm.id;
    const addressId = addressForm.id || `addr-${Date.now()}`;
    const shouldBeDefault = addressForm.isDefault || currentAddresses.length === 0;

    let updatedAddresses;
    if (isNew) {
      const newAddr = {
        ...addressForm,
        id: addressId,
        isDefault: shouldBeDefault,
        createdAt: new Date().toISOString(),
      };
      if (shouldBeDefault) {
        updatedAddresses = [newAddr, ...currentAddresses.map((a) => ({ ...a, isDefault: false }))];
      } else {
        updatedAddresses = [...currentAddresses, newAddr];
      }
    } else {
      updatedAddresses = currentAddresses.map((a) => {
        if (a.id === addressId) {
          return {
            ...a,
            ...addressForm,
            id: addressId,
            isDefault: shouldBeDefault,
            updatedAt: new Date().toISOString(),
          };
        }
        return shouldBeDefault ? { ...a, isDefault: false } : a;
      });
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserForAddresses.id,
          addresses: updatedAddresses,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Update local users state
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUserForAddresses.id ? { ...u, addresses: updatedAddresses } : u
          )
        );
        setSelectedUserForAddresses((prev) =>
          prev ? { ...prev, addresses: updatedAddresses } : null
        );
        setIsEditingAddress(false);
      } else {
        setAddressModalError(data.error || "Failed to update address in database.");
      }
    } catch {
      setAddressModalError("Network error while saving address.");
    } finally {
      setAddressSaving(false);
    }
  };

  // Delete Address for user (Admin)
  const handleDeleteAddressForUser = async (addressId) => {
    if (!window.confirm("Remove this delivery address from the user profile?")) return;
    if (!selectedUserForAddresses) return;

    const currentAddresses = Array.isArray(selectedUserForAddresses.addresses)
      ? [...selectedUserForAddresses.addresses]
      : [];

    const updatedAddresses = currentAddresses.filter((a) => a.id !== addressId);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserForAddresses.id,
          addresses: updatedAddresses,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUserForAddresses.id ? { ...u, addresses: updatedAddresses } : u
          )
        );
        setSelectedUserForAddresses((prev) =>
          prev ? { ...prev, addresses: updatedAddresses } : null
        );
      }
    } catch (err) {
      console.error("Delete address error:", err);
    }
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        !q ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.fullName && u.fullName.toLowerCase().includes(q)) ||
        (u.id && u.id.toLowerCase().includes(q));

      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "admin" && u.role === "admin") ||
        (roleFilter === "customer" && u.role === "customer");

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // Summary counts
  const totalCount = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const customerCount = users.filter((u) => u.role === "customer").length;
  const verifiedCount = users.filter((u) => u.emailConfirmed).length;

  const sqlSchema = `-- WallBedKing: Supabase Profiles Table Schema & Trigger
-- Run this in your Supabase SQL Editor to make users, addresses, and 3D configs visible in Table Editor!

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  role text default 'customer' check (role in ('admin', 'customer')),
  phone text,
  addresses jsonb default '[]'::jsonb,
  saved_configs jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Service role full access" on public.profiles
  for all using (true);

-- Auto sync trigger from auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, addresses, saved_configs)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'customer'),
    coalesce(new.raw_user_meta_data->'addresses', '[]'::jsonb),
    coalesce(new.raw_user_meta_data->'saved_configs', '[]'::jsonb)
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(excluded.full_name, profiles.full_name),
      addresses = coalesce(excluded.addresses, profiles.addresses),
      saved_configs = coalesce(excluded.saved_configs, profiles.saved_configs);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill existing users into profiles
insert into public.profiles (id, email, full_name, role, addresses, saved_configs)
select 
  id, 
  email, 
  coalesce(raw_user_meta_data->>'full_name', ''), 
  coalesce(raw_user_meta_data->>'role', 'customer'),
  coalesce(raw_user_meta_data->'addresses', '[]'::jsonb),
  coalesce(raw_user_meta_data->'saved_configs', '[]'::jsonb)
from auth.users
on conflict (id) do update
set email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role,
    addresses = excluded.addresses,
    saved_configs = excluded.saved_configs;`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-wbk-lightgrey/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-new-york text-2xl sm:text-3xl text-wbk-black">
              Users & Roles / Felhasználók
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-wbk-black text-white text-[10px] font-semibold tracking-wider">
              {totalCount} Total
            </span>
          </div>
          <p className="text-xs text-wbk-brown mt-1">
            Manage registered store customers, delivery addresses, saved 3D designs, and administrator roles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowSqlModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-wbk-lightgrey hover:border-wbk-black text-wbk-black text-xs font-medium rounded-full cursor-pointer transition-colors shadow-2xs"
          >
            <IconDatabase size={15} className="text-wbk-gold" />
            <span>Supabase Schema</span>
          </button>

          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 bg-wbk-black text-white text-xs font-medium uppercase tracking-wider hover:bg-wbk-green transition-colors rounded-full cursor-pointer shadow-sm disabled:opacity-60"
          >
            <IconRefresh size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Alert message */}
      {message && (
        <div
          className={`p-4 text-xs flex items-center gap-2 border ${
            message.type === "error"
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          {message.type === "error" ? (
            <IconAlertCircle size={16} className="shrink-0 text-red-500" />
          ) : (
            <IconCheck size={16} className="shrink-0 text-emerald-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-wbk-lightgrey/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-wbk-brown">
            <span className="text-[11px] uppercase font-semibold tracking-wider">Total Users</span>
            <IconUsers size={18} />
          </div>
          <div className="text-2xl font-semibold text-wbk-black">{totalCount}</div>
          <p className="text-[10px] text-wbk-brown">All registered store accounts</p>
        </div>

        <div className="p-4 bg-white border border-wbk-lightgrey/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-wbk-gold">
            <span className="text-[11px] uppercase font-semibold tracking-wider text-wbk-black">Administrators</span>
            <IconShieldLock size={18} />
          </div>
          <div className="text-2xl font-semibold text-wbk-black">{adminCount}</div>
          <p className="text-[10px] text-wbk-brown">Full dashboard & product access</p>
        </div>

        <div className="p-4 bg-white border border-wbk-lightgrey/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-wbk-brown">
            <span className="text-[11px] uppercase font-semibold tracking-wider">Customers</span>
            <IconUserCheck size={18} />
          </div>
          <div className="text-2xl font-semibold text-wbk-black">{customerCount}</div>
          <p className="text-[10px] text-wbk-brown">Purchasing customers</p>
        </div>

        <div className="p-4 bg-white border border-wbk-lightgrey/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] uppercase font-semibold tracking-wider text-wbk-black">Email Verified</span>
            <IconMailCheck size={18} />
          </div>
          <div className="text-2xl font-semibold text-wbk-black">{verifiedCount}</div>
          <p className="text-[10px] text-wbk-brown">Confirmed email addresses</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border border-wbk-lightgrey/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <IconSearch
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-wbk-brown pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or user ID..."
            className="w-full h-10 pl-9 pr-3 text-xs bg-[#FBF9F8] border border-wbk-lightgrey focus:border-wbk-black focus:outline-none transition-colors"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 bg-[#F4F2F0] p-1 border border-wbk-lightgrey/80">
          <button
            type="button"
            onClick={() => setRoleFilter("all")}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              roleFilter === "all"
                ? "bg-white text-wbk-black shadow-2xs"
                : "text-wbk-brown hover:text-wbk-black"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("admin")}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              roleFilter === "admin"
                ? "bg-white text-wbk-black shadow-2xs"
                : "text-wbk-brown hover:text-wbk-black"
            }`}
          >
            Admins ({adminCount})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("customer")}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              roleFilter === "customer"
                ? "bg-white text-wbk-black shadow-2xs"
                : "text-wbk-brown hover:text-wbk-black"
            }`}
          >
            Customers ({customerCount})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-wbk-lightgrey/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <IconLoader2 size={28} className="animate-spin text-wbk-gold mx-auto" />
            <p className="text-xs text-wbk-brown">Loading registered users from Supabase...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <IconUsers size={32} className="text-wbk-brown/40 mx-auto" />
            <p className="text-sm font-semibold text-wbk-black">No users found</p>
            <p className="text-xs text-wbk-brown">Try modifying your search or role filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F7F5] border-b border-wbk-lightgrey/80 text-[10px] uppercase tracking-wider text-wbk-brown">
                <tr>
                  <th className="py-3 px-4 sm:px-6">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Data Assets</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wbk-lightgrey/60">
                {filteredUsers.map((u) => {
                  const initial = (u.fullName?.[0] || u.email?.[0] || "U").toUpperCase();
                  const isAdmin = u.role === "admin";
                  const isUpdating = updatingUserId === u.id;
                  const addressCount = Array.isArray(u.addresses) ? u.addresses.length : 0;
                  const configCount = Array.isArray(u.savedConfigs) ? u.savedConfigs.length : 0;

                  const formattedDate = u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—";

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-[#FCFBF9] transition-colors"
                    >
                      {/* User Column */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 ${
                              isAdmin
                                ? "bg-wbk-black text-wbk-gold border border-wbk-gold/30"
                                : "bg-[#F0EEEB] text-wbk-black border border-wbk-lightgrey"
                            }`}
                          >
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-wbk-black truncate flex items-center gap-1.5">
                              <span>{u.fullName}</span>
                              {isAdmin && (
                                <span className="inline-block px-1.5 py-0.2 rounded bg-wbk-black text-wbk-gold text-[9px] uppercase tracking-wider font-semibold">
                                  Staff
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-wbk-brown truncate">
                              {u.email}
                            </div>
                            {u.phone && (
                              <div className="text-[10px] text-wbk-brown/80 truncate">
                                Tel: {u.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-wbk-black text-wbk-gold font-semibold text-[10px] uppercase tracking-wider border border-wbk-gold/40 shadow-2xs">
                            <IconShield size={12} className="text-wbk-gold" />
                            <span>Admin</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F4F2F0] text-wbk-black text-[10px] uppercase tracking-wider border border-wbk-lightgrey font-medium">
                            <IconShoppingBag size={12} className="text-wbk-brown" />
                            <span>Customer</span>
                          </span>
                        )}
                      </td>

                      {/* Data Assets (Addresses & 3D Configs) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenAddressesModal(u)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-wbk-lightgrey hover:border-wbk-black bg-white text-[11px] font-medium transition-colors cursor-pointer"
                            title="View / Edit delivery addresses"
                          >
                            <IconHome size={13} className="text-wbk-gold" />
                            <span>{addressCount} Addr</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedUserForConfigs(u)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-wbk-lightgrey hover:border-wbk-black bg-white text-[11px] font-medium transition-colors cursor-pointer"
                            title="View saved 3D designs"
                          >
                            <IconCube size={13} className="text-wbk-brown" />
                            <span>{configCount} 3D</span>
                          </button>
                        </div>
                      </td>

                      {/* Email Status */}
                      <td className="py-3.5 px-4">
                        {u.emailConfirmed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                            <IconCheck size={14} className="text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-medium">
                            <IconClock size={14} className="text-amber-600" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-4 text-wbk-brown text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <IconCalendar size={13} className="text-wbk-brown/70" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleRole(u)}
                          disabled={isUpdating}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wide transition-colors cursor-pointer disabled:opacity-50 ${
                            isAdmin
                              ? "border border-red-200 text-red-700 hover:bg-red-50"
                              : "bg-wbk-black text-white hover:bg-wbk-green"
                          }`}
                        >
                          {isUpdating ? (
                            <span className="inline-flex items-center gap-1">
                              <IconLoader2 size={12} className="animate-spin" />
                              <span>Saving...</span>
                            </span>
                          ) : isAdmin ? (
                            <span>Demote to Customer</span>
                          ) : (
                            <span>Make Admin</span>
                          )}
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

      {/* Supabase Status Banner */}
      <div className="p-5 bg-white border border-wbk-lightgrey/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-wbk-gold/15 border border-wbk-gold/30 flex items-center justify-center shrink-0 mt-0.5">
            <IconDatabase size={18} className="text-wbk-gold" />
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-wbk-black">
              Supabase Integration Status:{" "}
              <span className={hasProfilesTable ? "text-emerald-700" : "text-amber-700 font-bold"}>
                {hasProfilesTable ? "public.profiles Active" : "auth.users metadata Mode"}
              </span>
            </h4>
            <p className="text-[11px] text-wbk-brown mt-0.5 leading-relaxed">
              Roles, delivery addresses, and saved 3D configurations are automatically stored and synchronized in Supabase.
              To inspect or edit them in the <strong>Supabase Table Editor</strong> spreadsheet, execute the SQL schema.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowSqlModal(true)}
          className="px-4 py-2 bg-[#F4F2F0] hover:bg-wbk-black hover:text-white text-wbk-black text-xs font-medium uppercase tracking-wider transition-colors rounded-full cursor-pointer shrink-0"
        >
          View SQL Script
        </button>
      </div>

      {/* User Delivery Addresses Modal (Admin) */}
      {selectedUserForAddresses && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-wbk-black/60 backdrop-blur-xs">
          <div className="bg-white max-w-xl w-full p-6 shadow-2xl border border-wbk-lightgrey space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-wbk-lightgrey">
              <div>
                <div className="flex items-center gap-2">
                  <IconHome size={20} className="text-wbk-gold" />
                  <h3 className="font-new-york text-xl text-wbk-black">
                    Delivery Addresses
                  </h3>
                </div>
                <p className="text-xs text-wbk-brown">
                  Customer: <strong>{selectedUserForAddresses.fullName}</strong> ({selectedUserForAddresses.email})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUserForAddresses(null)}
                className="w-7 h-7 flex items-center justify-center text-wbk-brown hover:text-wbk-black cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {addressModalError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs">
                {addressModalError}
              </div>
            )}

            {isEditingAddress ? (
              /* Inline Address Form for Admin */
              <form onSubmit={handleSaveAddressSubmit} className="space-y-4 text-xs bg-[#FBF9F8] p-4 border border-wbk-lightgrey">
                <div className="flex items-center justify-between pb-2 border-b border-wbk-lightgrey/80 font-semibold uppercase tracking-wider text-wbk-black">
                  <span>{addressForm.id ? "Edit Delivery Address" : "Add New Delivery Address"}</span>
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(false)}
                    className="text-wbk-brown hover:text-wbk-black text-xs underline cursor-pointer"
                  >
                    Back to addresses list
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-wbk-black mb-1">
                      Label (e.g. Home, Office)
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.name}
                      onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                      className="w-full h-9 px-2.5 bg-white border border-wbk-lightgrey text-wbk-black focus:outline-none focus:border-wbk-black transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-wbk-black mb-1">
                      Recipient Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.recipient}
                      onChange={(e) => setAddressForm({ ...addressForm, recipient: e.target.value })}
                      className="w-full h-9 px-2.5 bg-white border border-wbk-lightgrey text-wbk-black focus:outline-none focus:border-wbk-black transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-wbk-black mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    className="w-full h-9 px-2.5 bg-white border border-wbk-lightgrey text-wbk-black focus:outline-none focus:border-wbk-black transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-wbk-black mb-1">
                      Apartment / Unit
                    </label>
                    <input
                      type="text"
                      value={addressForm.apartment}
                      onChange={(e) => setAddressForm({ ...addressForm, apartment: e.target.value })}
                      className="w-full h-9 px-2.5 bg-white border border-wbk-lightgrey text-wbk-black focus:outline-none focus:border-wbk-black transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-wbk-black mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full h-9 px-2.5 bg-white border border-wbk-lightgrey text-wbk-black focus:outline-none focus:border-wbk-black transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-wbk-black mb-1">
                      Postcode
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.postcode}
                      onChange={(e) => setAddressForm({ ...addressForm, postcode: e.target.value })}
                      className="w-full h-9 px-2.5 bg-white border border-wbk-lightgrey text-wbk-black focus:outline-none focus:border-wbk-black transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-wbk-black mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      className="w-full h-9 px-2.5 bg-white border border-wbk-lightgrey text-wbk-black focus:outline-none focus:border-wbk-black transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-wbk-black mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full h-9 px-2.5 bg-white border border-wbk-lightgrey text-wbk-black focus:outline-none focus:border-wbk-black transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="adminDefaultAddr"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="w-4 h-4 text-wbk-black border-wbk-lightgrey rounded focus:ring-wbk-black cursor-pointer"
                  />
                  <label htmlFor="adminDefaultAddr" className="text-xs text-wbk-black cursor-pointer select-none">
                    Default shipping address for this customer
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-wbk-lightgrey/80">
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(false)}
                    className="px-3.5 py-2 text-xs text-wbk-brown hover:text-wbk-black cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addressSaving}
                    className="px-5 py-2 bg-wbk-black text-white text-xs font-medium uppercase tracking-wider hover:bg-wbk-green transition-colors rounded-full cursor-pointer disabled:opacity-60 flex items-center gap-1"
                  >
                    {addressSaving ? (
                      <>
                        <IconLoader2 size={14} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Address</span>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Address List inside Modal */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-wbk-black uppercase tracking-wider">
                    Saved Addresses ({selectedUserForAddresses.addresses?.length || 0})
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenAddAddressForm}
                    className="flex items-center gap-1 px-3 py-1.5 bg-wbk-black text-white hover:bg-wbk-green text-xs font-medium uppercase tracking-wider rounded-full transition-colors cursor-pointer"
                  >
                    <IconPlus size={14} />
                    <span>Add Address</span>
                  </button>
                </div>

                {(!selectedUserForAddresses.addresses || selectedUserForAddresses.addresses.length === 0) ? (
                  <div className="p-8 text-center text-xs text-wbk-brown border border-dashed border-wbk-lightgrey bg-[#FBF9F8]">
                    No addresses registered for this customer yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedUserForAddresses.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="p-3.5 bg-[#FBF9F8] border border-wbk-lightgrey flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <strong className="text-wbk-black font-semibold">{addr.recipient}</strong>
                            <span className="text-[10px] text-wbk-brown px-1.5 py-0.5 bg-white border border-wbk-lightgrey rounded">
                              {addr.name || "Home"}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-wbk-black text-wbk-gold rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="text-wbk-brown">
                            {addr.street} {addr.apartment && `, ${addr.apartment}`} • {addr.city}, {addr.postcode} • {addr.country}
                          </div>
                          {addr.phone && (
                            <div className="text-[11px] text-wbk-brown/80">
                              Tel: {addr.phone}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEditAddressForm(addr)}
                            className="p-1.5 text-wbk-brown hover:text-wbk-black hover:bg-white rounded cursor-pointer border border-transparent hover:border-wbk-lightgrey transition-colors"
                            title="Edit address"
                          >
                            <IconEdit size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddressForUser(addr.id)}
                            className="p-1.5 text-wbk-brown hover:text-red-600 hover:bg-white rounded cursor-pointer border border-transparent hover:border-wbk-lightgrey transition-colors"
                            title="Delete address"
                          >
                            <IconTrash size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-wbk-lightgrey flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUserForAddresses(null)}
                className="px-5 py-2 bg-wbk-black text-white text-xs font-medium uppercase tracking-wider hover:bg-wbk-green transition-colors rounded-full cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Saved 3D Designs Modal (Admin) */}
      {selectedUserForConfigs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-wbk-black/60 backdrop-blur-xs">
          <div className="bg-white max-w-xl w-full p-6 shadow-2xl border border-wbk-lightgrey space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-wbk-lightgrey">
              <div>
                <div className="flex items-center gap-2">
                  <IconCube size={20} className="text-wbk-gold" />
                  <h3 className="font-new-york text-xl text-wbk-black">
                    Saved 3D Configurations
                  </h3>
                </div>
                <p className="text-xs text-wbk-brown">
                  Customer: <strong>{selectedUserForConfigs.fullName}</strong> ({selectedUserForConfigs.email})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUserForConfigs(null)}
                className="w-7 h-7 flex items-center justify-center text-wbk-brown hover:text-wbk-black cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {(!selectedUserForConfigs.savedConfigs || selectedUserForConfigs.savedConfigs.length === 0) ? (
              <div className="p-8 text-center text-xs text-wbk-brown border border-dashed border-wbk-lightgrey bg-[#FBF9F8]">
                This customer has not saved any 3D furniture designs yet.
              </div>
            ) : (
              <div className="space-y-3">
                {selectedUserForConfigs.savedConfigs.map((cfg) => {
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
                      className="p-3.5 bg-[#FBF9F8] border border-wbk-lightgrey flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 bg-white border border-wbk-lightgrey/70 p-1 flex items-center justify-center shrink-0">
                          {cfg.thumbnail && (
                            <Image
                              src={cfg.thumbnail}
                              alt={cfg.title || "Design"}
                              width={40}
                              height={40}
                              className="object-contain"
                              unoptimized
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-wbk-black truncate">
                            {cfg.title || "Custom 3D Setup"}
                          </h4>
                          <span className="text-[11px] text-wbk-brown block">
                            Saved on {formattedDate} • Value: <strong className="text-wbk-black">£{cfg.totalPrice}</strong>
                          </span>
                          {cfg.summary && (
                            <span className="text-[10px] text-wbk-brown/80 truncate block">
                              {cfg.summary}
                            </span>
                          )}
                        </div>
                      </div>

                      <Link
                        href={`/configurator?config=${encodeURIComponent(cfg.configString || "")}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-wbk-black hover:bg-wbk-green text-white text-xs font-medium uppercase tracking-wider rounded-full transition-colors shrink-0"
                      >
                        <IconExternalLink size={13} />
                        <span>View 3D</span>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-3 border-t border-wbk-lightgrey flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUserForConfigs(null)}
                className="px-5 py-2 bg-wbk-black text-white text-xs font-medium uppercase tracking-wider hover:bg-wbk-green transition-colors rounded-full cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supabase SQL Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-wbk-black/60 backdrop-blur-xs">
          <div className="bg-white max-w-2xl w-full p-6 shadow-2xl border border-wbk-lightgrey space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-wbk-lightgrey">
              <div className="flex items-center gap-2">
                <IconDatabase size={20} className="text-wbk-gold" />
                <h3 className="font-new-york text-xl text-wbk-black">
                  Supabase Profiles Table SQL
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="w-7 h-7 flex items-center justify-center text-wbk-brown hover:text-wbk-black text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-wbk-brown leading-relaxed">
              Copy and paste this script into your <strong>Supabase Dashboard &gt; SQL Editor</strong> and click <strong>Run</strong>.
              This creates the <code className="bg-gray-100 px-1 py-0.5 rounded">public.profiles</code> table with columns for roles, delivery addresses, and saved 3D designs.
            </p>

            <div className="relative flex-1 overflow-hidden border border-wbk-lightgrey bg-[#0E1116] text-[#E6EDF3] p-4 font-mono text-[11px] rounded">
              <div className="overflow-y-auto max-h-[320px] custom-scrollbar">
                <pre>{sqlSchema}</pre>
              </div>

              <button
                type="button"
                onClick={copyToClipboard}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[11px] rounded transition-colors cursor-pointer"
              >
                {copiedSql ? (
                  <>
                    <IconCheck size={14} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <IconCopy size={14} />
                    <span>Copy SQL</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-wbk-lightgrey">
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="px-5 py-2 bg-wbk-black text-white text-xs font-medium uppercase tracking-wider hover:bg-wbk-green transition-colors rounded-full cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
