
import { supabase, mapDbRideToRide } from "@/integrations/supabase/client";
import type { SearchParams, Ride } from "@/lib/types";

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
  }
};
