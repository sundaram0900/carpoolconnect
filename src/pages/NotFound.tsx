
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, Search } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen pt-24 flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
      <div className="container px-4">
        <div className="max-w-md mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-primary" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Page Not Found</h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              We couldn't find the page you're looking for.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/">
                  <Home className="h-5 w-5" />
                  Back to Home
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2">
                <Link to="/search">
                  <Search className="h-5 w-5" />
                  Find Rides
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
