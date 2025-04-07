
import { supabase } from "@/integrations/supabase/client";

export const rideBookingsService = {
  async fetchRideBookings(rideId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          user:user_id(*)
        `)
        .eq("ride_id", rideId);
        
      if (error) {
        console.error("Error fetching ride bookings:", error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error("Error in fetchRideBookings:", error);
      return [];
    }
  }
};
