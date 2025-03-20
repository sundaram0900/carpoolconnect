
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { User } from "@/lib/types";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
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

  const login = async (email: string, password: string) => {
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
          avatar: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
          phone: "+1 (555) 123-4567",
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

  const signup = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (name && email && password) {
        const mockUser: User = {
          id: "user-" + Date.now(),
          name: "Sundaram", // Set name to Sundaram regardless of input
          email,
          avatar: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
          phone: "+1 (555) 987-6543",
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
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
