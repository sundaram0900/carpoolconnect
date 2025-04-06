
import { useState } from "react";
import { bookingService } from "@/lib/services/bookingService"; 
import { useAuth } from "@/lib/context/AuthContext";
import { BookingFormData } from "@/lib/types";
import { toast } from "sonner";

export const useBookRide = (rideId: string) => {
  const [isBooking, setIsBooking] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string | undefined>(undefined);
  const { user } = useAuth();

  const bookRide = async (formData: BookingFormData): Promise<{ success: boolean; bookingId?: string }> => {
    if (!user) {
      toast.error("You must be logged in to book a ride");
      return { success: false };
    }

    try {
      setIsBooking(true);
      
      // Call the bookRide method from the bookingService
      const result = await bookingService.bookRide(rideId, user.id, formData);
      
      if (result.success && result.bookingId) {
        setBookingId(result.bookingId);
        setBookingSuccess(true);
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
      const success = await bookingService.cancelBooking(bookingId, user.id);
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
