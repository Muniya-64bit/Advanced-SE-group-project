import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Check for demo user in localStorage first
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.id === "demo-user") {
          setUser(parsedUser);
          setLoading(false);
          return; // Skip Supabase check for demo users
        }
      } catch (e) {
        console.error("Error parsing stored user:", e);
        localStorage.removeItem("user");
      }
    }

    // Check active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign in with Google OAuth
  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  };

  // Sign in with Email (for demo/testing)
  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  // Sign up with Email
  const signUpWithEmail = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) throw error;
    return data;
  };

  // Sign out
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
    // Clear local storage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Demo login (for testing without Supabase setup)
  const demoLogin = () => {
    const demoUser = {
      id: "demo-user",
      email: "demo@example.com",
      user_metadata: {
        name: "Demo User",
        avatar_url:
          "https://ui-avatars.com/api/?name=Demo+User&background=00d9c0&color=fff",
      },
    };
    setUser(demoUser);
    localStorage.setItem("user", JSON.stringify(demoUser));
  };

  const value = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
    demoLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
