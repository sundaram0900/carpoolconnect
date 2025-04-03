
import { supabase, mapDbProfileToUser, mapDbRideToRide } from "@/integrations/supabase/client";
import { BookingFormData, Ride, RideRequest, User } from "@/lib/types";
import { toast } from "sonner";

export const databaseService = {
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
  
  async fetchUserRideRequests(userId: string): Promise<RideRequest[]> {
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
        user: { id: request.user_id } as User,
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
        status: request.status,
        description: request.description,
        createdAt: request.created_at,
      })) || [];
    } catch (error) {
      console.error("Error in fetchUserRideRequests:", error);
      return [];
    }
  },
  
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
      
      // Map the ride data using mapDbRideToRide
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
      
      // Convert base64 to blob
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
  },
  
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
  
  // Check if user is the driver of the ride
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
  },
  
  async bookRide(rideId: string, userId: string, formData: BookingFormData): Promise<boolean> {
    try {
      // Check if user is the driver of this ride
      const isDriver = await this.isUserDriverOfRide(rideId, userId);
      if (isDriver) {
        console.error("Driver cannot book their own ride");
        toast.error("You cannot book your own ride");
        return false;
      }
      
      // First, check if there are enough seats available
      const { data: ride, error: rideError } = await supabase
        .from("rides")
        .select("available_seats")
        .eq("id", rideId)
        .single();
      
      if (rideError || !ride) {
        console.error("Error fetching ride:", rideError);
        toast.error("Failed to book ride: Ride not found");
        return false;
      }
      
      if (ride.available_seats < formData.seats) {
        toast.error(`Only ${ride.available_seats} seats available`);
        return false;
      }
      
      // Create a booking
      const { error: bookingError } = await supabase
        .from("bookings")
        .insert({
          ride_id: rideId,
          user_id: userId,
          seats: formData.seats,
          notes: formData.notes,
          contact_phone: formData.contactPhone,
          payment_method: formData.paymentMethod
        });
      
      if (bookingError) {
        console.error("Error creating booking:", bookingError);
        toast.error("Failed to book ride");
        return false;
      }
      
      // Update ride's available seats
      const newAvailableSeats = ride.available_seats - formData.seats;
      const { error: updateError } = await supabase
        .from("rides")
        .update({ available_seats: newAvailableSeats })
        .eq("id", rideId);
      
      if (updateError) {
        console.error("Error updating ride seats:", updateError);
        // Don't return false here, as the booking was already created
      }
      
      // Add user to booked_by array
      const { error: bookedByError } = await supabase
        .rpc('add_user_to_booked_by', {
          ride_id: rideId,
          user_id: userId
        });
      
      if (bookedByError) {
        console.error("Error updating booked_by array:", bookedByError);
        // Don't return false here either
      }
      
      toast.success("Ride booked successfully!");
      return true;
    } catch (error) {
      console.error("Error in bookRide:", error);
      toast.error("An unexpected error occurred");
      return false;
    }
  },

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
  },
  
  async uploadProfilePicture(userId: string, file: File): Promise<User | null> {
    try {
      // Upload the file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        return null;
      }
      
      // Get the public URL of the uploaded file
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      if (!urlData.publicUrl) {
        console.error("Error getting public URL");
        return null;
      }
      
      // Update the user profile with the new avatar URL
      const { data, error } = await supabase
        .from("profiles")
        .update({ avatar: urlData.publicUrl })
        .eq("id", userId)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating profile:", error);
        return null;
      }
      
      return mapDbProfileToUser(data);
    } catch (error) {
      console.error("Error in uploadProfilePicture:", error);
      return null;
    }
  }
};
