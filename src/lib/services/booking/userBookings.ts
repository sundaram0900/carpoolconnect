
import { supabase, mapDbRideToRide } from "@/integrations/supabase/client";

export const userBookingsService = {
  async fetchUserBookings(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          ride:ride_id(
            *,
            driver:driver_id(*)
          )
        `)
        .eq("user_id", userId);
        
      if (error) {
        console.error("Error fetching user bookings:", error);
        return [];
      }
      
      return data.map(booking => ({
        ...booking,
        ride: mapDbRideToRide(booking.ride)
      })) || [];
    } catch (error) {
      console.error("Error in fetchUserBookings:", error);
      return [];
    }
  },
  
  async fetchUserReceipts(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_receipts', { user_id_param: userId });
        
      if (error) {
        console.error("Error fetching user receipts:", error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error("Error in fetchUserReceipts:", error);
      return [];
    }
  },
  
  async downloadReceipt(receiptId: string): Promise<Blob | null> {
    try {
      const { data, error } = await supabase.functions.invoke('download-receipt', {
        body: { receiptId }
      });
      
      if (error || !data) {
        console.error("Error downloading receipt:", error);
        return null;
      }
      
      const byteCharacters = atob(data.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: 'application/pdf' });
    } catch (error) {
      console.error("Error in downloadReceipt:", error);
      return null;
    }
  }
};
