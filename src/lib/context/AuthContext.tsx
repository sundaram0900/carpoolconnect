
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { User } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, username?: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, username: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  updateUsername: (username: string) => Promise<boolean>;
  updateProfile: (profileData: Partial<User>) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for active session on mount
    setIsLoading(true);
    
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error fetching session:", error.message);
          return;
        }
        
        if (session) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error("Error fetching profile:", profileError.message);
            return;
          }
          
          if (profile) {
            setUser({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              username: profile.username || undefined,
              avatar: profile.avatar || undefined,
              phone: profile.phone || undefined,
              rating: profile.rating || 5.0,
              reviewCount: profile.review_count || 0,
              verifiedDriver: profile.verified_driver || false,
              bio: profile.bio || undefined,
              address: profile.address || undefined,
              city: profile.city || undefined,
              zipCode: profile.zip_code || undefined,
              createdAt: profile.created_at
            });
          }
        }
      } catch (err) {
        console.error("Session check error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error("Error fetching profile:", profileError.message);
            return;
          }
          
          if (profile) {
            setUser({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              username: profile.username || undefined,
              avatar: profile.avatar || undefined,
              phone: profile.phone || undefined,
              rating: profile.rating || 5.0,
              reviewCount: profile.review_count || 0,
              verifiedDriver: profile.verified_driver || false,
              bio: profile.bio || undefined,
              address: profile.address || undefined,
              city: profile.city || undefined,
              zipCode: profile.zip_code || undefined,
              createdAt: profile.created_at
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, username?: string) => {
    try {
      setIsLoading(true);
      
      let authResponse;
      
      // Try to log in with email first
      if (email) {
        authResponse = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }
      
      // If login with email fails or username is provided, try to find the email with the username
      if ((authResponse?.error || !email) && username) {
        // Find the user with the given username
        const { data: userProfile, error: userError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', username)
          .single();
        
        if (userError) {
          console.error("Error finding user with username:", userError.message);
          toast.error("Username not found");
          return false;
        }
        
        if (userProfile) {
          authResponse = await supabase.auth.signInWithPassword({
            email: userProfile.email,
            password,
          });
        }
      }
      
      if (authResponse?.error) {
        throw authResponse.error;
      }
      
      toast.success("Successfully logged in!");
      return true;
    } catch (error: any) {
      console.error("Login error:", error.message);
      toast.error(`Failed to login: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, username: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            username,
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Account created successfully! Check your email to confirm your account.");
      return true;
    } catch (error: any) {
      console.error("Signup error:", error.message);
      toast.error(`Failed to create account: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/profile',
        },
      });
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error: any) {
      console.error("Google login error:", error.message);
      toast.error(`Failed to login with Google: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUsername = async (username: string) => {
    try {
      if (!user) throw new Error("No user logged in");
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      setUser({
        ...user,
        username,
      });
      
      toast.success("Username updated successfully!");
      return true;
    } catch (error: any) {
      console.error("Update username error:", error.message);
      toast.error(`Failed to update username: ${error.message}`);
      return false;
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      if (!user) throw new Error("No user logged in");
      
      // Convert from frontend model to database model
      const dbProfileData: Record<string, any> = {};
      
      if (profileData.name) dbProfileData.name = profileData.name;
      if (profileData.phone) dbProfileData.phone = profileData.phone;
      if (profileData.avatar) dbProfileData.avatar = profileData.avatar;
      if (profileData.bio) dbProfileData.bio = profileData.bio;
      if (profileData.address) dbProfileData.address = profileData.address;
      if (profileData.city) dbProfileData.city = profileData.city;
      if (profileData.zipCode) dbProfileData.zip_code = profileData.zipCode;
      if (profileData.username) dbProfileData.username = profileData.username;
      
      const { data, error } = await supabase
        .from('profiles')
        .update(dbProfileData)
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      setUser({
        ...user,
        ...profileData,
      });
      
      toast.success("Profile updated successfully!");
      return true;
    } catch (error: any) {
      console.error("Update profile error:", error.message);
      toast.error(`Failed to update profile: ${error.message}`);
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error: any) {
      console.error("Logout error:", error.message);
      toast.error(`Failed to logout: ${error.message}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateUsername,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
