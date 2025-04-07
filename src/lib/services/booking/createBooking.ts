
import { supabase } from "@/integrations/supabase/client";
import { BookingFormData } from "@/lib/types";
import { toast } from "sonner";
import { bookingValidationService } from "./bookingValidation";

export const createBookingService = {
  async bookRide(rideId: string, userId: string, formData: BookingFormData): Promise<{ success: boolean, bookingId?: string }> {
    try {
      const isDriver = await bookingValidationService.isUserDriverOfRide(rideId, userId);
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
      
      // Convert booked_by to a proper typed array
      let bookedByArray: string[] = [];
      
      // Handle different possible types of booked_by
      if (ride.booked_by) {
        if (Array.isArray(ride.booked_by)) {
          bookedByArray = [...ride.booked_by] as string[];
        } else if (typeof ride.booked_by === 'string') {
          try {
            bookedByArray = [ride.booked_by as string];
          } catch {
            bookedByArray = [];
          }
        }
      }
      
      // Add the user ID to the booked_by array if not already present
      if (!bookedByArray.includes(userId)) {
        bookedByArray.push(userId);
      }
      
      const updateData: Record<string, any> = { 
        available_seats: newAvailableSeats,
        booked_by: bookedByArray
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
          
        // Send booking notification to both driver and passenger
        await supabase.functions.invoke('send-booking-notification', {
          body: { 
            booking: bookingData,
            ride: rideDetails,
            user: userData,
            seats: formData.seats
          }
        });
        
        console.log("Booking notification sent successfully");
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
  }
};
