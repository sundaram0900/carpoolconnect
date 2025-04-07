
import { useState } from "react";
import { databaseService } from "@/lib/services/database"; 
import { useAuth } from "@/lib/context/AuthContext";
import { BookingFormData } from "@/lib/types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useBookRide = (rideId: string) => {
  const [isBooking, setIsBooking] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string | undefined>(undefined);
  const { user } = useAuth();
  const navigate = useNavigate();

  const bookRide = async (formData: BookingFormData): Promise<{ success: boolean; bookingId?: string }> => {
    if (!user) {
      toast.error("You must be logged in to book a ride");
      return { success: false };
    }

    try {
      setIsBooking(true);
      
      // Call the bookRide method from the databaseService (proxied to bookingService)
      const result = await databaseService.bookRide(rideId, user.id, formData);
      
      if (result.success && result.bookingId) {
        setBookingId(result.bookingId);
        setBookingSuccess(true);
        
        // Navigate to the ride details page with success parameters
        navigate(`/ride/${rideId}?booking_success=true&booking_id=${result.bookingId}`);
      }
      
      return result;
    } catch (error) {
      console.error("Error in bookRide:", error);
      return { success: false };
    } finally {
      setIsBooking(false);
    }
  };

  const cancelBooking = async (bookingId: string): Promise<boolean> => {
    if (!user) {
      toast.error("You must be logged in to cancel a booking");
      return false;
    }

    try {
      setIsCancelling(true);
      const success = await databaseService.cancelBooking(bookingId, user.id);
      
      if (success) {
        // Reset booking state
        setBookingSuccess(false);
        setBookingId(undefined);
      }
      
      return success;
    } catch (error) {
      console.error("Error in cancelBooking:", error);
      return false;
    } finally {
      setIsCancelling(false);
    }
  };

  return {
    bookRide,
    cancelBooking,
    isBooking,
    isCancelling,
    bookingSuccess,
    bookingId,
    resetBookingState: () => {
      setBookingSuccess(false);
      setBookingId(undefined);
    }
  };
};

export default useBookRide;
