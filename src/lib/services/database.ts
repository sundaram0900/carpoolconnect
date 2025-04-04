import { supabase, mapDbProfileToUser, mapDbRideToRide } from "@/integrations/supabase/client";
import { BookingFormData, Ride, RideRequest, User } from "@/lib/types";
import { toast } from "sonner";

export const databaseService = {
  async fetchRideById(rideId: string): Promise<Ride | null> {
    try {
      const { data: ride, error } = await supabase
        .from('rides')
        .select(`
          *,
          driver:driver_id(*)
        `)
        .eq('id', rideId)
        .single();

      if (error || !ride) {
        console.error("Error fetching ride by ID:", error);
        return null;
      }

      const formattedRide: Ride = {
        id: ride.id,
        driver: mapDbProfileToUser(ride.driver),
        startLocation: {
          address: ride.start_address,
          city: ride.start_city,
          state: ride.start_state || '',
          country: ride.start_country || 'India',
          lat: ride.start_lat,
          lng: ride.start_lng,
        },
        endLocation: {
          address: ride.end_address,
          city: ride.end_city,
          state: ride.end_state || '',
          country: ride.end_country || 'India',
          lat: ride.end_lat,
          lng: ride.end_lng,
        },
        date: ride.date,
        time: ride.time,
        price: ride.price,
        availableSeats: ride.available_seats,
        description: ride.description || '',
        status: ride.status || 'scheduled',
        carInfo: {
          make: ride.car_make || '',
          model: ride.car_model || '',
          year: ride.car_year || 0,
          color: ride.car_color || '',
          licensePlate: ride.car_license_plate || '',
        },
        bookedBy: ride.booked_by || [],
        createdAt: ride.created_at,
      };

      return formattedRide;
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
      const { data: ride, error } = await supabase
        .from('rides')
        .select('booked_by')
        .eq('id', rideId)
        .single();

      if (error) {
        console.error("Error checking existing booking:", error);
        return false;
      }

      return ride.booked_by?.includes(userId) || false;
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
  
  async bookRide(
    rideId: string,
    userId: string,
    formData: BookingFormData
  ): Promise<boolean> {
    try {
      const isDriver = await this.isUserDriverOfRide(rideId, userId);
      if (isDriver) {
        console.error("Driver cannot book their own ride");
        toast.error("You cannot book your own ride");
        return false;
      }

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

      const newAvailableSeats = ride.available_seats - formData.seats;
      let updatedBookedBy = [...(ride.booked_by || [])];
      
      if (!updatedBookedBy.includes(userId)) {
        updatedBookedBy.push(userId);
      }

      const { error: updateError } = await supabase
        .from("rides")
        .update({ 
          available_seats: newAvailableSeats,
          booked_by: updatedBookedBy
        })
        .eq("id", rideId);
      
      if (updateError) {
        console.error("Error updating ride:", updateError);
        return false;
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
      
      const newAvailableSeats = booking.ride.available_seats + booking.seats;
      
      const { data: currentRide } = await supabase
        .from("rides")
        .select("booked_by")
        .eq("id", booking.ride_id)
        .single();
        
      const { data: remainingBookings } = await supabase
        .from("bookings")
        .select("id")
        .eq("ride_id", booking.ride_id)
        .eq("user_id", booking.user_id);
      
      let bookedBy = currentRide?.booked_by || [];
      
      if (!remainingBookings || remainingBookings.length === 0) {
        bookedBy = bookedBy.filter((id: string) => id !== booking.user_id);
      }
      
      const { error: updateError } = await supabase
        .from("rides")
        .update({ 
          available_seats: newAvailableSeats,
          booked_by: bookedBy
        })
        .eq("id", booking.ride_id);
      
      if (updateError) {
        console.error("Error updating ride:", updateError);
        return false;
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
        toast.error("Failed to create ride: " + error.message);
        return false;
      }
      
      return true;
    } catch (error: any) {
      console.error("Error in createRide:", error);
      toast.error("Failed to create ride: " + (error.message || "Unknown error"));
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
