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
        .select("available_seats, booked_by")
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
      
      // Start a transaction by using a stored procedure or multiple operations in sequence
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
      
      // Create or update the booked_by array
      let bookedBy = ride.booked_by || [];
      if (!bookedBy.includes(userId)) {
        bookedBy.push(userId);
      }
      
      const { error: updateError } = await supabase
        .from("rides")
        .update({ 
          available_seats: newAvailableSeats,
          booked_by: bookedBy
        })
        .eq("id", rideId);
      
      if (updateError) {
        console.error("Error updating ride:", updateError);
        // Don't return false here, as the booking was already created
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
      // First, get the booking details to check if user is authorized and get seat count
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
      
      // Check if user is authorized to cancel (is the booking user or the ride driver)
      const isBookingUser = booking.user_id === userId;
      const isRideDriver = booking.ride.driver_id === userId;
      
      if (!isBookingUser && !isRideDriver) {
        toast.error("You are not authorized to cancel this booking");
        return false;
      }
      
      // Delete the booking
      const { error: deleteError } = await supabase
        .from("bookings")
        .delete()
        .eq("id", bookingId);
      
      if (deleteError) {
        console.error("Error deleting booking:", deleteError);
        toast.error("Failed to cancel booking");
        return false;
      }
      
      // Return the seats to the available pool
      const newAvailableSeats = booking.ride.available_seats + booking.seats;
      
      // Get current booked_by array to update it
      const { data: currentRide } = await supabase
        .from("rides")
        .select("booked_by")
        .eq("id", booking.ride_id)
        .single();
        
      // Remove user from booked_by array if they no longer have any active bookings for this ride
      const { data: remainingBookings } = await supabase
        .from("bookings")
        .select("id")
        .eq("ride_id", booking.ride_id)
        .eq("user_id", booking.user_id);
      
      let bookedBy = currentRide?.booked_by || [];
      
      if (!remainingBookings || remainingBookings.length === 0) {
        // User has no more bookings for this ride, remove from booked_by
        bookedBy = bookedBy.filter((id: string) => id !== booking.user_id);
      }
      
      // Update the ride
      const { error: updateError } = await supabase
        .from("rides")
        .update({ 
          available_seats: newAvailableSeats,
          booked_by: bookedBy
        })
        .eq("id", booking.ride_id);
      
      if (updateError) {
        console.error("Error updating ride:", updateError);
        // Don't return false here as the booking was already deleted
      }
      
      toast.success("Booking cancelled successfully");
      return true;
    } catch (error) {
      console.error("Error in cancelBooking:", error);
      toast.error("An unexpected error occurred");
      return false;
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
  },
  
  async createRide(rideData: any, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("rides")
        .insert({
          driver_id: userId,
          start_address: rideData.startAddress,
          start_city: rideData.startCity,
          start_state: rideData.startState || null,
          end_address: rideData.endAddress,
          end_city: rideData.endCity,
          end_state: rideData.endState || null,
          date: rideData.date,
          time: rideData.time,
          available_seats: rideData.availableSeats,
          price: rideData.price,
          car_make: rideData.carMake || null,
          car_model: rideData.carModel || null,
          car_year: rideData.carYear || null,
          car_color: rideData.carColor || null,
          description: rideData.description || null,
          booked_by: []
        });
        
      if (error) {
        console.error("Error creating ride:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in createRide:", error);
      return false;
    }
  },
  
  async createRideRequest(requestData: any, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("ride_requests")
        .insert({
          user_id: userId,
          start_address: requestData.startAddress,
          start_city: requestData.startCity,
          start_state: requestData.startState || null,
          end_address: requestData.endAddress,
          end_city: requestData.endCity,
          end_state: requestData.endState || null,
          date: requestData.date,
          time: requestData.time,
          number_of_seats: requestData.numberOfSeats,
          max_price: requestData.maxPrice || null,
          description: requestData.description || null
        });
        
      if (error) {
        console.error("Error creating ride request:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in createRideRequest:", error);
      return false;
    }
  },
  
  async updateUserProfile(userId: string, profileData: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          name: profileData.name,
          username: profileData.username,
          bio: profileData.bio,
          phone: profileData.phone,
          address: profileData.address,
          city: profileData.city,
          zip_code: profileData.zipCode
        })
        .eq("id", userId)
        .select()
        .single();
        
      if (error) {
        console.error("Error updating profile:", error);
        return null;
      }
      
      return mapDbProfileToUser(data);
    } catch (error) {
      console.error("Error in updateUserProfile:", error);
      return null;
    }
  }
};
