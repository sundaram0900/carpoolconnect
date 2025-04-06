
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const rideRequestService = {
  async fetchUserRideRequests(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("ride_requests")
        .select("*")
        .eq("user_id", userId);
        
      if (error) {
        console.error("Error fetching user ride requests:", error);
        return [];
      }
      
      return data.map((request) => ({
        id: request.id,
        user: { id: request.user_id } as any,
        startLocation: {
          address: request.start_address,
          city: request.start_city,
          state: request.start_state,
          country: request.start_country,
          lat: request.start_lat,
          lng: request.start_lng
        },
        endLocation: {
          address: request.end_address,
          city: request.end_city,
          state: request.end_state,
          country: request.end_country,
          lat: request.end_lat,
          lng: request.end_lng
        },
        date: request.date,
        time: request.time,
        numberOfSeats: request.number_of_seats,
        maxPrice: request.max_price,
        status: request.status as any,
        description: request.description,
        createdAt: request.created_at,
      })) || [];
    } catch (error) {
      console.error("Error in fetchUserRideRequests:", error);
      return [];
    }
  },
  
  async createRideRequest(data: any, userId: string): Promise<string | null> {
    try {
      const { data: request, error } = await supabase
        .from("ride_requests")
        .insert({
          user_id: userId,
          start_address: data.startAddress,
          start_city: data.startCity,
          start_state: data.startState || null,
          end_address: data.endAddress,
          end_city: data.endCity,
          end_state: data.endState || null,
          date: data.date,
          time: data.time,
          number_of_seats: data.numberOfSeats,
          max_price: data.maxPrice || null,
          description: data.description || null,
          status: 'open'
        })
        .select('id')
        .single();
      
      if (error) {
        console.error("Error creating ride request:", error);
        toast.error("Failed to create ride request");
        return null;
      }
      
      return request.id;
    } catch (error) {
      console.error("Error in createRideRequest:", error);
      toast.error("An unexpected error occurred");
      return null;
    }
  }
};
