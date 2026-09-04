"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  isUserDrawerOpen: false,
  drawerTab: "login", // 'login' | 'register' | 'forgot'
  isPasswordRecovery: false,
  setIsPasswordRecovery: () => {},
  openUserDrawer: () => {},
  closeUserDrawer: () => {},
  setDrawerTab: () => {},
  signInWithPassword: async () => {},
  signUpWithPassword: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
  updateProfile: async () => {},
  saveAddress: async () => {},
  deleteAddress: async () => {},
  save3DConfiguration: async () => {},
  delete3DConfiguration: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState("login"); // 'login' | 'register' | 'forgot'
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  // Initialize session and listen for auth state changes
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        if (!supabase) {
          setLoading(false);
          return;
        }

        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("[Auth] getSession warning:", error.message);
        }

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          setLoading(false);
        }
      } catch (err) {
        console.warn("[Auth] Init error:", err);
        if (mounted) setLoading(false);
      }
    }

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (mounted) {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);

        if (event === "PASSWORD_RECOVERY") {
          setIsPasswordRecovery(true);
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const openUserDrawer = useCallback((tab = "login") => {
    setDrawerTab(tab);
    setIsUserDrawerOpen(true);
  }, []);

  const closeUserDrawer = useCallback(() => {
    setIsUserDrawerOpen(false);
  }, []);

  // Sign In with email and password
  const signInWithPassword = useCallback(async (email, password) => {
    if (!supabase) throw new Error("Supabase client is not available.");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) throw error;
    setUser(data.user);
    setSession(data.session);
    return data;
  }, []);

  // Sign Up with email, password, and full name metadata
  const signUpWithPassword = useCallback(async (email, password, fullName = "") => {
    if (!supabase) throw new Error("Supabase client is not available.");

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) throw error;
    return data;
  }, []);

  // Sign Out
  const signOut = useCallback(async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("[Auth] signOut error:", err);
    }
    setUser(null);
    setSession(null);
  }, []);

  // Send password reset email
  const resetPassword = useCallback(async (email) => {
    if (!supabase) throw new Error("Supabase client is not available.");

    const { data, error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/account?mode=recovery` : undefined,
      }
    );

    if (error) throw error;
    return data;
  }, []);

  // Update password for currently authenticated or recovery session
  const updatePassword = useCallback(async (newPassword) => {
    if (!supabase) throw new Error("Supabase client is not available.");

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    if (data.user) {
      setUser(data.user);
    }
    return data;
  }, []);

  // Update user profile metadata
  const updateProfile = useCallback(async (updates) => {
    if (!supabase) throw new Error("Supabase client is not available.");

    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });

    if (error) throw error;
    if (data.user) {
      setUser(data.user);
    }
    return data;
  }, []);

  // Save or update a delivery address
  const saveAddress = useCallback(async (addressData) => {
    if (!user) throw new Error("You must be signed in to save an address.");

    const currentAddresses = Array.isArray(user?.user_metadata?.addresses)
      ? [...user.user_metadata.addresses]
      : [];

    const isNew = !addressData.id;
    const addressId = addressData.id || `addr-${Date.now()}`;
    const shouldBeDefault = addressData.isDefault ?? currentAddresses.length === 0;

    let updatedAddresses;

    if (isNew) {
      const newAddress = {
        ...addressData,
        id: addressId,
        isDefault: shouldBeDefault,
        createdAt: new Date().toISOString(),
      };

      if (shouldBeDefault) {
        updatedAddresses = [
          newAddress,
          ...currentAddresses.map((a) => ({ ...a, isDefault: false })),
        ];
      } else {
        updatedAddresses = [...currentAddresses, newAddress];
      }
    } else {
      updatedAddresses = currentAddresses.map((a) => {
        if (a.id === addressId) {
          return {
            ...a,
            ...addressData,
            id: addressId,
            isDefault: shouldBeDefault,
            updatedAt: new Date().toISOString(),
          };
        }
        return shouldBeDefault ? { ...a, isDefault: false } : a;
      });
    }

    return await updateProfile({ addresses: updatedAddresses });
  }, [user, updateProfile]);

  // Delete an address
  const deleteAddress = useCallback(async (addressId) => {
    if (!user) throw new Error("You must be signed in to delete an address.");

    const currentAddresses = Array.isArray(user?.user_metadata?.addresses)
      ? [...user.user_metadata.addresses]
      : [];

    const targetAddress = currentAddresses.find((a) => a.id === addressId);
    let updatedAddresses = currentAddresses.filter((a) => a.id !== addressId);

    // If deleting the default address and others remain, make the first one default
    if (targetAddress?.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0] = { ...updatedAddresses[0], isDefault: true };
    }

    return await updateProfile({ addresses: updatedAddresses });
  }, [user, updateProfile]);

  // Save or update a 3D Configuration
  const save3DConfiguration = useCallback(async (configData) => {
    if (!user) throw new Error("You must be signed in to save a 3D configuration.");

    const currentConfigs = Array.isArray(user?.user_metadata?.saved_configs)
      ? [...user.user_metadata.saved_configs]
      : [];

    const configId = configData.id || `cfg-${Date.now()}`;
    const existingIndex = currentConfigs.findIndex((c) => c.id === configId);

    const newConfigItem = {
      id: configId,
      title: configData.title || `Custom Design - ${new Date().toLocaleDateString()}`,
      configString: configData.configString,
      modulesCount: configData.modulesCount || 1,
      totalPrice: configData.totalPrice || 0,
      thumbnail: configData.thumbnail || "/sofa-configurator/sofa-800-thumbnail.webp",
      summary: configData.summary || "",
      createdAt: configData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updatedConfigs;
    if (existingIndex >= 0) {
      updatedConfigs = [...currentConfigs];
      updatedConfigs[existingIndex] = newConfigItem;
    } else {
      updatedConfigs = [newConfigItem, ...currentConfigs];
    }

    return await updateProfile({ saved_configs: updatedConfigs });
  }, [user, updateProfile]);

  // Delete a saved 3D Configuration
  const delete3DConfiguration = useCallback(async (configId) => {
    if (!user) throw new Error("You must be signed in to delete a configuration.");

    const currentConfigs = Array.isArray(user?.user_metadata?.saved_configs)
      ? [...user.user_metadata.saved_configs]
      : [];

    const updatedConfigs = currentConfigs.filter((c) => c.id !== configId);
    return await updateProfile({ saved_configs: updatedConfigs });
  }, [user, updateProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isUserDrawerOpen,
        drawerTab,
        isPasswordRecovery,
        setIsPasswordRecovery,
        openUserDrawer,
        closeUserDrawer,
        setDrawerTab,
        signInWithPassword,
        signUpWithPassword,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        saveAddress,
        deleteAddress,
        save3DConfiguration,
        delete3DConfiguration,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
