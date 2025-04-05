
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Ride } from "@/lib/types";
import { databaseService } from "@/lib/services/database";
import { Loader2 } from "lucide-react";
import RideDetailsModal from "@/components/RideDetailsModal";
import BookingSuccessCard from "@/components/BookingSuccessCard";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const RideDetails = () => {
  const { rideId } = useParams<{ rideId: string }>();
  const navigate = useNavigate();
  const [ride, setRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const bookingSuccess = searchParams.get('booking_success') === 'true';
  const bookingId = searchParams.get('booking_id') || '';
  
  const loadRideDetails = async () => {
    if (!rideId) return;
    
    try {
      setIsLoading(true);
      setLoadError(null);
      
      console.log("Fetching ride details for ID:", rideId);
      const rideDetails = await databaseService.fetchRideById(rideId);
      console.log("Received ride details:", rideDetails);
      
      if (rideDetails) {
        setRide(rideDetails);
      } else {
        // If ride not found, navigate to not found page
        toast.error("Ride not found");
        navigate("/not-found", { replace: true });
      }
    } catch (error) {
      console.error("Error fetching ride details:", error);
      setLoadError("Failed to load ride details. Please try again later.");
      toast.error("Error loading ride details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRideDetails();
  }, [rideId, navigate]);

  const handleRideUpdate = (updatedRide: Ride) => {
    setRide(updatedRide);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-20 container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <span className="text-lg">Loading ride details...</span>
          </div>
          <RideDetailsSkeleton />
        </div>
      </div>
    );
  }
  
  if (loadError) {
    return (
      <div className="min-h-screen pt-24 pb-20 container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-destructive/10 p-6 rounded-lg border border-destructive/30">
            <h2 className="text-xl font-semibold text-destructive mb-2">Error</h2>
            <p>{loadError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-primary text-white px-4 py-2 rounded-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!ride) {
    return null; // Will redirect to not found via useEffect
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          {bookingSuccess ? (
            <div className="mb-8">
              <BookingSuccessCard bookingId={bookingId} rideId={rideId || ''} source="page" />
            </div>
          ) : null}
          
          {/* We're reusing the RideDetailsModal component but forcing it to be open */}
          <RideDetailsModal 
            ride={ride} 
            isOpenByDefault={true} 
            onRideUpdate={handleRideUpdate} 
          />
        </motion.div>
      </div>
    </div>
  );
};

// Skeleton loader for ride details while data is being fetched
const RideDetailsSkeleton = () => {
  return (
    <div className="bg-background border rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <Skeleton className="h-7 w-64 mb-2" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="h-6 w-24" />
      </div>
      
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <div className="min-w-8 flex flex-col items-center">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="h-14 border-l border-dashed border-primary/30 my-1"></div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          
          <div className="flex-1 space-y-4 w-full">
            <div>
              <Skeleton className="h-5 w-4/5 mb-1" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div>
              <Skeleton className="h-5 w-4/5 mb-1" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        
        <Skeleton className="h-px w-full" />
        
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        
        <div className="flex justify-between items-center pt-2">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
        
        <Skeleton className="h-10 w-full rounded-md mt-4" />
      </div>
    </div>
  );
};

export default RideDetails;
