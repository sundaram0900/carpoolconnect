import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Search, Car, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="relative py-32 md:py-48 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white pointer-events-none" />
      
      {/* Animated circles */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-primary/5"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.2, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/3 left-1/4 h-96 w-96 rounded-full bg-blue-100/20"
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div 
          className="absolute top-1/2 right-1/3 h-48 w-48 rounded-full bg-primary/5"
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6">
              Share Rides, <span className="text-primary">Save Money</span>,<br />Reduce Emissions
            </h1>
          </motion.div>
          
          <motion.p 
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Connect with drivers and passengers going your way. 
            Ride and Share makes sharing rides simple, affordable, and eco-friendly.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button asChild size="lg" className="rounded-full px-8 gap-2">
              <Link to="/search">
                <Search className="h-5 w-5" /> Find Rides
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-8 gap-2">
              <Link to="/offer">
                <Car className="h-5 w-5" /> Offer a Ride
              </Link>
            </Button>
          </motion.div>
          
          <motion.div 
            className="mt-12 flex justify-center space-x-12 md:space-x-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary">1M+</p>
              <p className="text-muted-foreground">Users</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary">500K+</p>
              <p className="text-muted-foreground">Rides Shared</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary">20M+</p>
              <p className="text-muted-foreground">Miles Saved</p>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Wave shape at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 bg-white">
        <svg
          className="absolute bottom-0 left-0 right-0 w-full h-full"
          viewBox="0 0 1440 74"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0 24L60 28C120 32 240 38 360 50C480 62 600 74 720 68C840 62 960 32 1080 16C1200 0 1320 0 1380 0H1440V74H1380C1320 74 1200 74 1080 74C960 74 840 74 720 74C600 74 480 74 360 74C240 74 120 74 60 74H0V24Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
