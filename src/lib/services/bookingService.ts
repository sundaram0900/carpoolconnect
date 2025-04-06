
import { supabase, mapDbRideToRide } from "@/integrations/supabase/client";
import { BookingFormData } from "@/lib/types";
import { toast } from "sonner";

export const bookingService = {
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
  
  async bookRide(rideId: string, userId: string, formData: BookingFormData): Promise<{ success: boolean, bookingId?: string }> {
    try {
      const isDriver = await this.isUserDriverOfRide(rideId, userId);
      if (isDriver) {
        console.error("Driver cannot book their own ride");
        toast.error("You cannot book your own ride");
        return { success: false };
      }
      
      const { data: ride, error: rideError } = await supabase
        .from("rides")
        .select("available_seats, status, driver_id, booked_by")
        .eq("id", rideId)
        .single();
      
      if (rideError || !ride) {
        console.error("Error fetching ride:", rideError);
        toast.error("Failed to book ride: Ride not found");
        return { success: false };
      }
      
      if (ride.available_seats < formData.seats) {
        toast.error(`Only ${ride.available_seats} seats available`);
        return { success: false };
      }
      
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          ride_id: rideId,
          user_id: userId,
          seats: formData.seats,
          notes: formData.notes,
          contact_phone: formData.contactPhone,
          payment_method: formData.paymentMethod
        })
        .select()
        .single();
      
      if (bookingError) {
        console.error("Error creating booking:", bookingError);
        toast.error("Failed to book ride");
        return { success: false };
      }
      
      const newAvailableSeats = ride.available_seats - formData.seats;
      console.log(`Updating available seats from ${ride.available_seats} to ${newAvailableSeats}`);
      
      // Fix: Properly handle the booked_by array by explicitly typing it
      let bookedBy: string[] = [];
      
      if (ride.booked_by) {
        if (Array.isArray(ride.booked_by)) {
          bookedBy = [...ride.booked_by] as string[];
        } else if (typeof ride.booked_by === 'string') {
          try {
            const parsed = JSON.parse(ride.booked_by as string);
            if (Array.isArray(parsed)) {
              bookedBy = [...parsed];
            } else {
              bookedBy = [ride.booked_by as string];
            }
          } catch {
            bookedBy = [ride.booked_by as string];
          }
        }
      }
      
      if (!bookedBy.includes(userId)) {
        bookedBy.push(userId);
      }
      
      const updateData: Record<string, any> = { 
        available_seats: newAvailableSeats,
        booked_by: bookedBy
      };
      
      if (newAvailableSeats === 0) {
        updateData.status = 'booked';
      }
      
      const { error: updateError } = await supabase
        .from("rides")
        .update(updateData)
        .eq("id", rideId);
      
      if (updateError) {
        console.error("Error updating ride seats:", updateError);
        toast.error("Booking created but seat count update failed");
        return { success: false, bookingId: bookingData.id };
      }
      
      try {
        const { data: rideDetails } = await supabase
          .from("rides")
          .select(`
            *,
            driver:driver_id(*)
          `)
          .eq("id", rideId)
          .single();
          
        const { data: userData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
          
        await supabase.functions.invoke('send-booking-notification', {
          body: { 
            booking: bookingData,
            ride: rideDetails,
            user: userData,
            seats: formData.seats
          }
        });
      } catch (emailError) {
        console.error("Error sending email notifications:", emailError);
      }
      
      toast.success("Ride booked successfully!");
      return { success: true, bookingId: bookingData.id };
    } catch (error) {
      console.error("Error in bookRide:", error);
      toast.error("An unexpected error occurred");
      return { success: false };
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
      console.log(`Updating available seats from ${booking.ride.available_seats} to ${newAvailableSeats}`);
      
      const updateData: Record<string, any> = { available_seats: newAvailableSeats };
      if (booking.ride.status === 'booked') {
        updateData.status = 'scheduled';
      }
      
      const { error: updateError } = await supabase
        .from("rides")
        .update(updateData)
        .eq("id", booking.ride_id);
      
      if (updateError) {
        console.error("Error updating ride seats:", updateError);
        toast.error("Booking cancelled but seat count update failed");
        return false;
      }
      
      try {
        const { data: currentRide } = await supabase
          .from("rides")
          .select("booked_by")
          .eq("id", booking.ride_id)
          .single();
          
        if (currentRide && currentRide.booked_by) {
          // Fix: Properly handle the booked_by array by explicitly typing it
          let bookedByArray: string[] = [];
          
          if (Array.isArray(currentRide.booked_by)) {
            bookedByArray = [...currentRide.booked_by] as string[];
          } else if (typeof currentRide.booked_by === 'string') {
            try {
              const parsed = JSON.parse(currentRide.booked_by as string);
              if (Array.isArray(parsed)) {
                bookedByArray = [...parsed];
              } else {
                bookedByArray = [currentRide.booked_by as string];
              }
            } catch {
              bookedByArray = [currentRide.booked_by as string];
            }
          }
          
          const updatedBookedBy = bookedByArray.filter(
            (id) => id !== booking.user_id
          );
          
          const { error: updateArrayError } = await supabase
            .from("rides")
            .update({ booked_by: updatedBookedBy })
            .eq("id", booking.ride_id);
            
          if (updateArrayError) {
            console.error("Error updating booked_by array:", updateArrayError);
          }
        }
      } catch (error) {
        console.error("Error updating booked_by array:", error);
      }
      
      toast.success("Booking cancelled successfully");
      return true;
    } catch (error) {
      console.error("Error in cancelBooking:", error);
      toast.error("An unexpected error occurred");
      return false;
    }
  }
};
