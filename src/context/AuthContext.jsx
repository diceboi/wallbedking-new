"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  isUserDrawerOpen: false,
  drawerTab: "login", // 'login' | 'register' | 'forgot'
  openUserDrawer: () => {},
  closeUserDrawer: () => {},
  setDrawerTab: () => {},
  signInWithPassword: async () => {},
  signUpWithPassword: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState("login"); // 'login' | 'register' | 'forgot'

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (mounted) {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
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
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/account` : undefined,
      }
    );

    if (error) throw error;
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

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isUserDrawerOpen,
        drawerTab,
        openUserDrawer,
        closeUserDrawer,
        setDrawerTab,
        signInWithPassword,
        signUpWithPassword,
        signOut,
        resetPassword,
        updateProfile,
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
