import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/context/AuthContext";
import { AtSign, Lock, User, Loader2, UserCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const AuthForm = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isGoogleLogin, setIsGoogleLogin] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [loginAttempted, setLoginAttempted] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  
  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  
  const { login, signup, loginWithGoogle, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If login was attempted and authLoading becomes false, check for loginError
    if (loginAttempted && !authLoading && !loginError) {
      navigate("/profile");
    }
  }, [loginAttempted, authLoading, loginError, navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    if (!loginEmail && !loginUsername) {
      setLoginError("Please provide either an email or username");
      return;
    }
    
    if (!loginPassword) {
      setLoginError("Password is required");
      return;
    }
    
    try {
      setIsLoggingIn(true);
      setLoginAttempted(true);
      
      const success = await login(loginEmail, loginPassword, loginUsername);
      
      if (!success) {
        setLoginError("Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("An error occurred while logging in");
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    
    if (!signupName.trim()) {
      setSignupError("Name is required");
      return;
    }
    
    if (!signupEmail.trim()) {
      setSignupError("Email is required");
      return;
    }
    
    if (!signupUsername.trim()) {
      setSignupError("Username is required");
      return;
    }
    
    if (!signupPassword.trim()) {
      setSignupError("Password is required");
      return;
    }
    
    if (signupPassword.length < 8) {
      setSignupError("Password must be at least 8 characters");
      return;
    }
    
    try {
      setIsSigningUp(true);
      const success = await signup(signupName, signupEmail, signupPassword, signupUsername);
      
      if (success) {
        toast.success("Account created! You'll be redirected shortly.");
        setTimeout(() => {
          navigate("/profile");
        }, 1500);
      } else {
        setSignupError("Failed to create account. Please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setSignupError("An error occurred while creating your account");
    } finally {
      setIsSigningUp(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLogin(true);
      await loginWithGoogle();
      // Navigation happens in the auth callback
    } catch (error) {
      console.error("Google login error:", error);
    } finally {
      setIsGoogleLogin(false);
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
          {loginError && (
            <motion.div 
              variants={itemVariants}
              className="flex items-center p-3 text-sm bg-destructive/15 text-destructive rounded"
            >
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <p>{loginError}</p>
            </motion.div>
          )}
          
          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="login-email">Email (Optional if username is provided)</Label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="login-username">Username (Optional if email is provided)</Label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="login-username"
                placeholder="Enter your username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="pl-10"
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
          
          <motion.div variants={itemVariants} className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleGoogleLogin}
              disabled={isGoogleLogin}
            >
              {isGoogleLogin ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" fill="currentColor" />
                </svg>
              )}
              {isGoogleLogin ? "Signing in with Google..." : "Sign in with Google"}
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
          {signupError && (
            <motion.div 
              variants={itemVariants}
              className="flex items-center p-3 text-sm bg-destructive/15 text-destructive rounded"
            >
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <p>{signupError}</p>
            </motion.div>
          )}
          
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
            <Label htmlFor="signup-username">Username</Label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-username"
                placeholder="Choose a username"
                value={signupUsername}
                onChange={(e) => setSignupUsername(e.target.value)}
                className="pl-10"
                required
              />
              <div className="text-xs text-muted-foreground mt-1">
                This will be your public username on the platform
              </div>
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
          
          <motion.div variants={itemVariants} className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleGoogleLogin}
              disabled={isGoogleLogin}
            >
              {isGoogleLogin ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" fill="currentColor" />
                </svg>
              )}
              {isGoogleLogin ? "Signing up with Google..." : "Sign up with Google"}
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
