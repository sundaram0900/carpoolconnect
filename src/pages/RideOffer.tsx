
import { motion } from "framer-motion";
import RideForm from "@/components/RideForm";
import { Car, ArrowRight, Lightbulb } from "lucide-react";

const RideOffer = () => {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-semibold mb-4">Offer a Ride</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Share your journey with others, save money on travel costs, and help reduce carbon emissions
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col items-center text-center p-6"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Share Your Ride</h3>
              <p className="text-muted-foreground">
                Offer empty seats in your car to travelers going your way.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center text-center p-6"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <ArrowRight className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Instant Booking</h3>
              <p className="text-muted-foreground">
                Riders can book your offered seats directly through the platform.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col items-center text-center p-6"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Enjoy Benefits</h3>
              <p className="text-muted-foreground">
                Earn extra money while helping others and the environment.
              </p>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card rounded-xl p-6 md:p-8"
          >
            <RideForm type="offer" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-lg"
          >
            <div className="flex items-start">
              <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium mb-1">Tips for successful ride offers:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Provide accurate pickup and dropoff locations</li>
                  <li>Set a fair price per seat</li>
                  <li>Include any additional details about your car or the journey</li>
                  <li>Be punctual and communicate with your passengers</li>
                  <li>Keep your profile and car information up to date</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RideOffer;
