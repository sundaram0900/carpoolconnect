
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
        status: request.status as any,
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
      const isDriver = await this.isUserDriverOfRide(rideId, userId);
      if (isDriver) {
        console.error("Driver cannot book their own ride");
        toast.error("You cannot book your own ride");
        return false;
      }
      
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
      
      // Calculate new available seats
      const newAvailableSeats = ride.available_seats - formData.seats;
      
      // Update ride status to 'booked' if no seats remaining
      const updateData: any = { available_seats: newAvailableSeats };
      if (newAvailableSeats === 0) {
        updateData.status = 'booked';
      }
      
      const { error: updateError } = await supabase
        .from("rides")
        .update(updateData)
        .eq("id", rideId);
      
      if (updateError) {
        console.error("Error updating ride seats:", updateError);
      }
      
      const { error: bookedByError } = await supabase
        .rpc('add_user_to_booked_by', {
          ride_id: rideId,
          user_id: userId
        });
      
      if (bookedByError) {
        console.error("Error updating booked_by array:", bookedByError);
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
  
  async cancelBooking(bookingId: string, userId: string): Promise<boolean> {
    try {
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .select(`
          *,
          ride:ride_id(
            *
          )
        `)
        .eq("id", bookingId)
        .single();
      
      if (bookingError || !booking) {
        console.error("Error fetching booking:", bookingError);
        toast.error("Failed to cancel booking: Booking not found");
        return false;
      }
      
      const isBookingUser = booking.user_id === userId;
      const isRideDriver = booking.ride.driver_id === userId;
      
      if (!isBookingUser && !isRideDriver) {
        toast.error("You are not authorized to cancel this booking");
        return false;
      }
      
      const { error: deleteError } = await supabase
        .from("bookings")
        .delete()
        .eq("id", bookingId);
      
      if (deleteError) {
        console.error("Error deleting booking:", deleteError);
        toast.error("Failed to cancel booking");
        return false;
      }
      
      // Calculate new available seats
      const newAvailableSeats = booking.ride.available_seats + booking.seats;
      
      // Update ride data - restore status to 'scheduled' if it was 'booked'
      const updateData: any = { available_seats: newAvailableSeats };
      if (booking.ride.status === 'booked') {
        updateData.status = 'scheduled';
      }
      
      const { error: updateError } = await supabase
        .from("rides")
        .update(updateData)
        .eq("id", booking.ride_id);
      
      if (updateError) {
        console.error("Error updating ride seats:", updateError);
      }
      
      const { data: remainingBookings } = await supabase
        .from("bookings")
        .select("id")
        .eq("ride_id", booking.ride_id)
        .eq("user_id", booking.user_id);
      
      if (!remainingBookings || remainingBookings.length === 0) {
        // Use raw SQL query to remove user from booked_by array
        const { error: bookedByError } = await supabase
          .from("rides")
          .update({
            booked_by: supabase.rpc('array_remove', { 
              arr: booking.ride.booked_by, 
              item: booking.user_id 
            })
          })
          .eq("id", booking.ride_id);
        
        if (bookedByError) {
          console.error("Error updating booked_by array:", bookedByError);
        }
      }
      
      toast.success("Booking cancelled successfully");
      return true;
    } catch (error) {
      console.error("Error in cancelBooking:", error);
      toast.error("An unexpected error occurred");
      return false;
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
  },
  
  // Add the missing updateUserProfile method
  async updateUserProfile(userId: string, userData: Partial<User>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: userData.name,
          phone: userData.phone,
          bio: userData.bio,
          address: userData.address,
          city: userData.city,
          zip_code: userData.zipCode,
          avatar: userData.avatar
        })
        .eq("id", userId);
      
      if (error) {
        console.error("Error updating profile:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in updateUserProfile:", error);
      return false;
    }
  },
  
  async uploadProfilePicture(userId: string, file: File): Promise<User | null> {
    try {
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
      
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      if (!urlData.publicUrl) {
        console.error("Error getting public URL");
        return null;
      }
      
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
