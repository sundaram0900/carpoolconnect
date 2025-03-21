
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { User } from "@/lib/types";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, username?: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, username: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  updateUsername: (username: string) => Promise<boolean>;
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

  // Mock authentication for demonstration
  useEffect(() => {
    const storedUser = localStorage.getItem("carpoolUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, username?: string) => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      if (email && password) {
        const mockUser: User = {
          id: "user-1",
          name: "Sundaram",
          email,
          username: username || "sundaram123",
          avatar: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
          phone: "+91 9876543210",
          rating: 4.8,
          reviewCount: 42,
          verifiedDriver: true,
          createdAt: new Date().toISOString()
        };
        
        setUser(mockUser);
        localStorage.setItem("carpoolUser", JSON.stringify(mockUser));
        toast.success("Successfully logged in!");
        return true;
      }
      
      throw new Error("Invalid credentials");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to login. Please check your credentials.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, username: string) => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (name && email && password && username) {
        const mockUser: User = {
          id: "user-" + Date.now(),
          name: "Sundaram", // Set name to Sundaram regardless of input
          email,
          username,
          avatar: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
          phone: "+91 9876543210",
          rating: 5.0,
          reviewCount: 12,
          verifiedDriver: true,
          createdAt: new Date().toISOString()
        };
        
        setUser(mockUser);
        localStorage.setItem("carpoolUser", JSON.stringify(mockUser));
        toast.success("Account created successfully!");
        return true;
      }
      
      throw new Error("Invalid signup information");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Failed to create account. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, this would integrate with Google OAuth
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful Google login
      const mockUser: User = {
        id: "google-user-" + Date.now(),
        name: "Sundaram",
        email: "sundaram.google@example.com",
        username: "sundaram_g",
        avatar: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
        phone: "+91 9876543210",
        rating: 4.9,
        reviewCount: 27,
        verifiedDriver: true,
        createdAt: new Date().toISOString()
      };
      
      setUser(mockUser);
      localStorage.setItem("carpoolUser", JSON.stringify(mockUser));
      toast.success("Successfully logged in with Google!");
      return true;
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Failed to login with Google. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUsername = async (username: string) => {
    try {
      if (!user) throw new Error("No user logged in");
      
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedUser = { ...user, username };
      setUser(updatedUser);
      localStorage.setItem("carpoolUser", JSON.stringify(updatedUser));
      toast.success("Username updated successfully!");
      return true;
    } catch (error) {
      console.error("Update username error:", error);
      toast.error("Failed to update username. Please try again.");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("carpoolUser");
    toast.success("Logged out successfully");
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
        updateUsername
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
