
import { supabase } from "@/integrations/supabase/client";
import { RideStatus } from "@/lib/types";
import { toast } from "sonner";

export const rideService = {
  async updateRideStatus(rideId: string, status: RideStatus): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('rides')
        .update({ status })
        .eq('id', rideId);
        
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error: any) {
      console.error("Error updating ride status:", error.message);
      toast.error("Failed to update ride status");
      return false;
    }
  },
  
  async startRide(rideId: string): Promise<boolean> {
    return this.updateRideStatus(rideId, 'in-progress');
  },
  
  async completeRide(rideId: string): Promise<boolean> {
    const success = await this.updateRideStatus(rideId, 'completed');
    
    if (success) {
      try {
        // Get all bookings for this ride
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('id')
          .eq('ride_id', rideId);
          
        if (bookingsError) {
          throw bookingsError;
        }
        
        // Generate receipts for all bookings
        for (const booking of bookings) {
          await supabase.functions.invoke('generate-receipt', {
            body: { 
              bookingId: booking.id,
              paymentStatus: 'completed' 
            }
          });
        }
        
        return true;
      } catch (error: any) {
        console.error("Error generating receipts:", error.message);
        // Don't throw here, still consider ride completion successful
        return true;
      }
    }
    
    return false;
  },
  
  async cancelRide(rideId: string): Promise<boolean> {
    return this.updateRideStatus(rideId, 'cancelled');
  },
  
  async generateReceipt(bookingId: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-receipt', {
        body: { bookingId }
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error: any) {
      console.error("Error generating receipt:", error.message);
      toast.error("Failed to generate receipt");
      return null;
    }
  }
};
