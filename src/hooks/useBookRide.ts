
import { useState } from "react";
import { databaseService } from "@/lib/services/database";
import { useAuth } from "@/lib/context/AuthContext";
import { BookingFormData } from "@/lib/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useBookRide = (rideId: string) => {
  const [isBooking, setIsBooking] = useState(false);
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
      
      // Check for existing booking
      const hasExistingBooking = await databaseService.checkExistingBooking(rideId, user.id);
      if (hasExistingBooking) {
        toast.error("You have already booked this ride");
        return { success: false };
      }

      // Book the ride
      const success = await databaseService.bookRide(rideId, user.id, formData);
      
      if (success) {
        // Fetch the booking ID for the newly created booking
        const { data: newBooking } = await supabase
          .from('bookings')
          .select('id')
          .eq('ride_id', rideId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (newBooking) {
          setBookingId(newBooking.id);
        }
        
        setBookingSuccess(true);
        return { success: true, bookingId: newBooking?.id };
      }
      
      return { success: false };
    } catch (error) {
      console.error("Error in bookRide:", error);
      return { success: false };
    } finally {
      setIsBooking(false);
    }
  };

  return {
    bookRide,
    isBooking,
    bookingSuccess,
    bookingId,
    resetBookingState: () => {
      setBookingSuccess(false);
      setBookingId(undefined);
    }
  };
};

export default useBookRide;
