
import { supabase } from "@/integrations/supabase/client";

export const bookingValidationService = {
  async checkExistingBooking(rideId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("id")
        .eq("ride_id", rideId)
        .eq("user_id", userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error checking existing booking:", error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error("Error in checkExistingBooking:", error);
      return false;
    }
  },
  
  async isUserDriverOfRide(rideId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("rides")
        .select("id")
        .eq("id", rideId)
        .eq("driver_id", userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error checking if user is driver:", error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error("Error in isUserDriverOfRide:", error);
      return false;
    }
  }
};
