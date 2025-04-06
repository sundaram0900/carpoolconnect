
import { supabase, mapDbRideToRide } from "@/integrations/supabase/client";
import { Ride } from "@/lib/types";
import { toast } from "sonner";

export const rideCreateService = {
  async fetchRideById(rideId: string): Promise<Ride | null> {
    try {
      const { data: ride, error } = await supabase
        .from("rides")
        .select(`
          *,
          driver:driver_id(*)
        `)
        .eq("id", rideId)
        .single();
      
      if (error) {
        console.error("Error fetching ride:", error);
        return null;
      }

      return mapDbRideToRide(ride);
    } catch (error) {
      console.error("Error in fetchRideById:", error);
      return null;
    }
  },
  
  async fetchUserRides(userId: string): Promise<Ride[]> {
    try {
      const { data, error } = await supabase
        .from("rides")
        .select(`
          *,
          driver:driver_id(*)
        `)
        .eq("driver_id", userId);
        
      if (error) {
        console.error("Error fetching user rides:", error);
        return [];
      }
      
      return data.map((ride) => mapDbRideToRide(ride)) || [];
    } catch (error) {
      console.error("Error in fetchUserRides:", error);
      return [];
    }
  },
  
  async createRide(data: any, userId: string): Promise<string | null> {
    try {
      const { data: ride, error } = await supabase
        .from("rides")
        .insert({
          driver_id: userId,
          start_address: data.startAddress,
          start_city: data.startCity,
          start_state: data.startState || null,
          end_address: data.endAddress,
          end_city: data.endCity,
          end_state: data.endState || null,
          date: data.date,
          time: data.time,
          available_seats: data.availableSeats,
          price: data.price,
          car_make: data.carMake || null,
          car_model: data.carModel || null,
          car_year: data.carYear || null,
          car_color: data.carColor || null,
          description: data.description || null,
          status: 'scheduled'
        })
        .select('id')
        .single();
      
      if (error) {
        console.error("Error creating ride:", error);
        toast.error("Failed to create ride");
        return null;
      }
      
      return ride.id;
    } catch (error) {
      console.error("Error in createRide:", error);
      toast.error("An unexpected error occurred");
      return null;
    }
  }
};
