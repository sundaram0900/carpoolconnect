
import { supabase, mapDbProfileToUser, mapDbRideToRide } from "@/integrations/supabase/client";
import { Ride, RideRequest, User, BookingFormData, RideStatus, RequestStatus } from "@/lib/types";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

export const databaseService = {
  // User related functions
  async fetchUserProfile(userId: string): Promise<User | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      
      return mapDbProfileToUser(profile);
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
      return null;
    }
  },
  
  async updateUserProfile(userId: string, profileData: Partial<User>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          phone: profileData.phone,
          bio: profileData.bio,
          address: profileData.address,
          city: profileData.city,
          zip_code: profileData.zipCode,
          avatar: profileData.avatar
        })
        .eq('id', userId);
        
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error: any) {
      console.error("Error updating user profile:", error.message);
      toast.error("Failed to update profile");
      return false;
    }
  },

  async uploadProfilePicture(userId: string, file: File): Promise<User | null> {
    try {
      // Check if avatars bucket exists
      const { data: bucketExists } = await supabase.storage.getBucket('avatars');
      
      if (!bucketExists) {
        // Create avatars bucket if it doesn't exist
        const { error } = await supabase.storage.createBucket('avatars', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
        });
        if (error) throw error;
      }

      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${uuidv4()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL of the uploaded file
      const { data: publicURL } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      if (!publicURL) throw new Error("Failed to get public URL");
      
      // Update the user's avatar URL in the database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar: publicURL.publicUrl })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      // Fetch and return the updated user profile
      return await this.fetchUserProfile(userId);
    } catch (error: any) {
      console.error("Error uploading profile picture:", error.message);
      toast.error("Failed to upload profile picture");
      return null;
    }
  },
  
  // Ride related functions
  async fetchUserRides(userId: string): Promise<Ride[]> {
    try {
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          driver:driver_id(*)
        `)
        .eq('driver_id', userId)
        .order('date', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      return data.map((ride: any) => mapDbRideToRide(ride));
    } catch (error: any) {
      console.error("Error fetching user rides:", error.message);
      toast.error("Failed to fetch your rides");
      return [];
    }
  },
  
  async fetchAllAvailableRides(): Promise<Ride[]> {
    try {
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          driver:driver_id(*)
        `)
        .eq('status', 'scheduled')
        .gt('available_seats', 0)
        .order('date', { ascending: true });
        
      if (error) {
        throw error;
      }
      
      return data.map((ride: any) => mapDbRideToRide(ride));
    } catch (error: any) {
      console.error("Error fetching available rides:", error.message);
      toast.error("Failed to fetch available rides");
      return [];
    }
  },
  
  async fetchRideById(rideId: string): Promise<Ride | null> {
    try {
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          driver:driver_id(*)
        `)
        .eq('id', rideId)
        .single();
        
      if (error) {
        throw error;
      }
      
      return mapDbRideToRide(data);
    } catch (error: any) {
      console.error("Error fetching ride details:", error.message);
      toast.error("Failed to fetch ride details");
      return null;
    }
  },
  
  async createRide(rideData: any, userId: string): Promise<Ride | null> {
    try {
      const { data, error } = await supabase
        .from('rides')
        .insert({
          driver_id: userId,
          start_city: rideData.startCity,
          start_address: rideData.startAddress,
          end_city: rideData.endCity,
          end_address: rideData.endAddress,
          date: rideData.date,
          time: rideData.time,
          available_seats: rideData.availableSeats,
          price: rideData.price,
          car_make: rideData.carMake,
          car_model: rideData.carModel,
          car_year: rideData.carYear,
          car_color: rideData.carColor,
          description: rideData.description,
          status: 'scheduled'
        })
        .select(`
          *,
          driver:driver_id(*)
        `)
        .single();
        
      if (error) {
        throw error;
      }
      
      return mapDbRideToRide(data);
    } catch (error: any) {
      console.error("Error creating ride:", error.message);
      toast.error("Failed to create ride");
      return null;
    }
  },
  
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
  
  async updateRideSeats(rideId: string, seatsBooked: number): Promise<boolean> {
    try {
      const { data: ride, error: fetchError } = await supabase
        .from('rides')
        .select('available_seats')
        .eq('id', rideId)
        .single();
        
      if (fetchError) {
        throw fetchError;
      }
      
      const newAvailableSeats = ride.available_seats - seatsBooked;
      
      const { error } = await supabase
        .from('rides')
        .update({ 
          available_seats: newAvailableSeats,
          status: newAvailableSeats <= 0 ? 'booked' : undefined
        })
        .eq('id', rideId);
        
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error: any) {
      console.error("Error updating ride seats:", error.message);
      toast.error("Failed to update ride seats");
      return false;
    }
  },
  
  // Ride requests
  async fetchUserRideRequests(userId: string): Promise<RideRequest[]> {
    try {
      const { data, error } = await supabase
        .from('ride_requests')
        .select(`
          *,
          user:user_id(*)
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      return data.map((request: any) => ({
        id: request.id,
        user: mapDbProfileToUser(request.user),
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
        status: request.status as RequestStatus,
        description: request.description,
        createdAt: request.created_at
      }));
    } catch (error: any) {
      console.error("Error fetching user ride requests:", error.message);
      toast.error("Failed to fetch your ride requests");
      return [];
    }
  },
  
  async createRideRequest(requestData: any, userId: string): Promise<RideRequest | null> {
    try {
      const { data, error } = await supabase
        .from('ride_requests')
        .insert({
          user_id: userId,
          start_city: requestData.startCity,
          start_address: requestData.startAddress,
          end_city: requestData.endCity,
          end_address: requestData.endAddress,
          date: requestData.date,
          time: requestData.time,
          number_of_seats: requestData.numberOfSeats,
          max_price: requestData.maxPrice,
          description: requestData.description,
          status: 'open'
        })
        .select(`
          *,
          user:user_id(*)
        `)
        .single();
        
      if (error) {
        throw error;
      }
      
      return {
        id: data.id,
        user: mapDbProfileToUser(data.user),
        startLocation: {
          address: data.start_address,
          city: data.start_city,
          state: data.start_state,
          country: data.start_country,
          lat: data.start_lat,
          lng: data.start_lng
        },
        endLocation: {
          address: data.end_address,
          city: data.end_city,
          state: data.end_state,
          country: data.end_country,
          lat: data.end_lat,
          lng: data.end_lng
        },
        date: data.date,
        time: data.time,
        numberOfSeats: data.number_of_seats,
        maxPrice: data.max_price,
        status: data.status as RequestStatus,
        description: data.description,
        createdAt: data.created_at
      };
    } catch (error: any) {
      console.error("Error creating ride request:", error.message);
      toast.error("Failed to create ride request");
      return null;
    }
  },
  
  // Booking and payments
  async checkExistingBooking(rideId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('id')
        .eq('ride_id', rideId)
        .eq('user_id', userId)
        .single();
        
      return !!data;
    } catch (error) {
      return false;
    }
  },
  
  async bookRide(rideId: string, userId: string, bookingData: BookingFormData): Promise<{ success: boolean, bookingId?: string }> {
    try {
      const hasExistingBooking = await this.checkExistingBooking(rideId, userId);
      
      if (hasExistingBooking) {
        toast.error("You have already booked this ride");
        return { success: false };
      }
      
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          ride_id: rideId,
          user_id: userId,
          seats: bookingData.seats,
          contact_phone: bookingData.contactPhone,
          notes: bookingData.notes,
          payment_method: bookingData.paymentMethod || 'cash',
        })
        .select('id')
        .single();
        
      if (error) {
        throw error;
      }
      
      const updatedSeats = await this.updateRideSeats(rideId, bookingData.seats);
      
      if (!updatedSeats) {
        throw new Error("Failed to update ride seats");
      }
      
      const { error: updateError } = await supabase.rpc('add_user_to_booked_by', {
        ride_id_param: rideId,
        user_id_param: userId
      });
      
      if (updateError) {
        console.error("Error adding user to booked_by:", updateError);
      }
      
      // Auto-generate receipt after successful booking
      try {
        if (data && data.id) {
          await this.generateReceipt(data.id);
          return { success: true, bookingId: data.id };
        }
      } catch (receiptError) {
        console.error("Failed to auto-generate receipt:", receiptError);
        // Continue even if receipt generation fails
      }
      
      return { success: true, bookingId: data?.id };
    } catch (error: any) {
      console.error("Error booking ride:", error.message);
      toast.error("Failed to book ride");
      return { success: false };
    }
  },
  
  async fetchUserBookings(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          ride:ride_id(
            *,
            driver:driver_id(*)
          ),
          user:user_id(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error: any) {
      console.error("Error fetching user bookings:", error.message);
      toast.error("Failed to fetch your bookings");
      return [];
    }
  },
  
  async fetchRideBookings(rideId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          user:user_id(*)
        `)
        .eq('ride_id', rideId)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error: any) {
      console.error("Error fetching ride bookings:", error.message);
      toast.error("Failed to fetch bookings for this ride");
      return [];
    }
  },
  
  async fetchUserReceipts(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('get_user_receipts', {
        user_id_param: userId
      });
        
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error: any) {
      console.error("Error fetching user receipts:", error.message);
      toast.error("Failed to fetch your receipts");
      return [];
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
      
      return data?.receipt || null;
    } catch (error: any) {
      console.error("Error generating receipt:", error.message);
      toast.error("Failed to generate receipt");
      return null;
    }
  },
  
  async downloadReceipt(receiptId: string): Promise<Blob | null> {
    try {
      console.log("Downloading receipt with ID:", receiptId);
      
      const { data, error } = await supabase.functions.invoke('download-receipt', {
        body: { receiptId }
      });
        
      if (error) {
        console.error("Error from download-receipt function:", error);
        throw error;
      }
      
      if (!data || !data.pdf) {
        console.error("No PDF data returned from the function");
        throw new Error("No PDF data returned");
      }
      
      console.log("PDF data received, converting to Blob...");
      
      const base64Response = data.pdf;
      const binaryString = window.atob(base64Response);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      return new Blob([bytes], { type: 'application/pdf' });
    } catch (error: any) {
      console.error("Error downloading receipt:", error.message);
      toast.error("Failed to download receipt");
      return null;
    }
  },
  
  async fetchMessages(rideId: string, userId: string): Promise<any[]> {
    try {
      const response = await supabase.functions.invoke('ride-chat', {
        body: { method: 'list', userId, rideId }
      });
      
      if (response.error) {
        throw response.error;
      }
      
      return response.data || [];
    } catch (error: any) {
      console.error("Error fetching messages:", error.message);
      toast.error("Failed to fetch messages");
      return [];
    }
  },
  
  mapDbRideToRide(ride: any): Ride | null {
    return mapDbRideToRide(ride);
  }
};
