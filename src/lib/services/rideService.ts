
import { supabase } from "@/integrations/supabase/client";
import { Ride } from "@/lib/types";
import { toast } from "sonner";

export const rideService = {
  async startRide(rideId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('rides')
        .update({ status: 'in-progress' })
        .eq('id', rideId);
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error: any) {
      console.error("Error starting ride:", error.message);
      toast.error("Failed to start ride");
      return false;
    }
  },
  
  async completeRide(rideId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('rides')
        .update({ status: 'completed' })
        .eq('id', rideId);
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error: any) {
      console.error("Error completing ride:", error.message);
      toast.error("Failed to complete ride");
      return false;
    }
  },
  
  async cancelRide(rideId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('rides')
        .update({ status: 'cancelled' })
        .eq('id', rideId);
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error: any) {
      console.error("Error cancelling ride:", error.message);
      toast.error("Failed to cancel ride");
      return false;
    }
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
