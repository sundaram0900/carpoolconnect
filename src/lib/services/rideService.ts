
import { supabase, mapDbRideToRide } from "@/integrations/supabase/client";
import type { Ride } from "@/lib/types";

export interface SearchParams {
  startCity?: string;
  endCity?: string;
  date?: string;
  minSeats?: string | number;
  maxPrice?: string | number;
}

export const rideService = {
  async searchRides(params: SearchParams): Promise<Ride[]> {
    try {
      // Start building the query
      let query = supabase
        .from('rides')
        .select(`
          *,
          driver:driver_id(*)
        `)
        .gt('available_seats', 0) // Only get rides with available seats
        .eq('status', 'scheduled'); // Only get scheduled rides
      
      // Add filters based on params
      if (params.startCity) {
        query = query.ilike('start_city', `%${params.startCity}%`);
      }
      
      if (params.endCity) {
        query = query.ilike('end_city', `%${params.endCity}%`);
      }
      
      if (params.date) {
        query = query.eq('date', params.date);
      }
      
      if (params.minSeats && !isNaN(Number(params.minSeats))) {
        query = query.gte('available_seats', Number(params.minSeats));
      }
      
      if (params.maxPrice && !isNaN(Number(params.maxPrice))) {
        query = query.lte('price', Number(params.maxPrice));
      }
      
      // Order by date (newest first)
      query = query.order('date', { ascending: true });
      
      // Execute the query
      const { data, error } = await query;
      
      if (error) {
        console.error("Error searching rides:", error);
        return [];
      }
      
      return data.map(ride => mapDbRideToRide(ride)) || [];
    } catch (error) {
      console.error("Error in searchRides:", error);
      return [];
    }
  },
  
  async getRecommendedRides(limit = 6): Promise<Ride[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          driver:driver_id(*)
        `)
        .gt('available_seats', 0) // Only get rides with available seats
        .eq('status', 'scheduled')
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(limit);
      
      if (error) {
        console.error("Error fetching recommended rides:", error);
        return [];
      }
      
      return data.map(ride => mapDbRideToRide(ride)) || [];
    } catch (error) {
      console.error("Error in getRecommendedRides:", error);
      return [];
    }
  },

  async startRide(rideId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('rides')
        .update({ status: 'in-progress' })
        .eq('id', rideId);
      
      if (error) {
        console.error("Error starting ride:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in startRide:", error);
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
        console.error("Error completing ride:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in completeRide:", error);
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
        console.error("Error cancelling ride:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in cancelRide:", error);
      return false;
    }
  },
  
  async generateReceipt(bookingId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-receipt', {
        body: { bookingId }
      });
      
      if (error || !data?.success) {
        console.error("Error generating receipt:", error || data?.message);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in generateReceipt:", error);
      return false;
    }
  }
};
