
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/context/AuthContext";
import { AtSign, Lock, User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const AuthForm = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoggingIn(true);
      const success = await login(loginEmail, loginPassword);
      
      if (success) {
        navigate("/profile");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSigningUp(true);
      const success = await signup(signupName, signupEmail, signupPassword);
      
      if (success) {
        navigate("/profile");
      }
    } finally {
      setIsSigningUp(false);
    }
  };
  
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <Tabs
      defaultValue="login"
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full max-w-md"
    >
      <TabsList className="grid grid-cols-2 w-full mb-8">
        <TabsTrigger value="login">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Create Account</TabsTrigger>
      </TabsList>
      
      <TabsContent value="login">
        <motion.form
          variants={formVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleLogin}
          className="space-y-6"
        >
          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="text-right">
            <a href="#" className="text-sm text-primary hover:underline">
              Forgot password?
            </a>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </motion.div>
        </motion.form>
      </TabsContent>
      
      <TabsContent value="signup">
        <motion.form
          variants={formVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSignup}
          className="space-y-6"
        >
          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="signup-name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-name"
                placeholder="Enter your full name"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-email"
                type="email"
                placeholder="Enter your email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-password"
                type="password"
                placeholder="Create a password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="pl-10"
                minLength={8}
                required
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Password must be at least 8 characters
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Button type="submit" className="w-full" disabled={isSigningUp}>
              {isSigningUp ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </motion.div>
          
          <motion.p variants={itemVariants} className="text-center text-sm text-muted-foreground">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </motion.p>
        </motion.form>
      </TabsContent>
    </Tabs>
  );
};

export default AuthForm;
