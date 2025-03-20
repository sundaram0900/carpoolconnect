
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/context/AuthContext";
import AuthForm from "@/components/AuthForm";
import { motion } from "framer-motion";
import { Shield, Zap, Users } from "lucide-react";

const Auth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/profile");
    }
  }, [isLoading, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1"
          >
            <div className="max-w-md">
              <h1 className="text-3xl md:text-4xl font-semibold mb-6">
                Welcome to Ride and Share
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                Join our community of drivers and passengers sharing rides, saving money, and reducing carbon emissions.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Secure and Safe</h3>
                    <p className="text-muted-foreground">
                      Verified users, secure payments, and a trusted community.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Fast and Convenient</h3>
                    <p className="text-muted-foreground">
                      Quickly find or offer rides with our intuitive platform.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Growing Community</h3>
                    <p className="text-muted-foreground">
                      Join thousands of users already sharing rides across the country.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-xl p-8 w-full max-w-md"
          >
            <AuthForm />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
