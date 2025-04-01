
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Ride } from "@/lib/types";
import { databaseService } from "@/lib/services/database";
import { Loader2 } from "lucide-react";
import RideDetailsModal from "@/components/RideDetailsModal";
import BookingSuccessCard from "@/components/BookingSuccessCard";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";

const RideDetails = () => {
  const { rideId } = useParams<{ rideId: string }>();
  const navigate = useNavigate();
  const [ride, setRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const bookingSuccess = searchParams.get('booking_success') === 'true';
  const bookingId = searchParams.get('booking_id') || '';

  useEffect(() => {
    const loadRideDetails = async () => {
      if (!rideId) return;
      
      try {
        setIsLoading(true);
        const rideDetails = await databaseService.fetchRideById(rideId);
        
        if (rideDetails) {
          setRide(rideDetails);
        } else {
          // If ride not found, navigate to not found page
          navigate("/not-found", { replace: true });
        }
      } catch (error) {
        console.error("Error fetching ride details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRideDetails();
  }, [rideId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          <RideDetailsModal ride={ride} isOpenByDefault={true} />
        </motion.div>
      </div>
    </div>
  );
};

export default RideDetails;
