
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const cancelBookingService = {
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
          // Convert booked_by to a proper typed array
          let bookedByArray: string[] = [];
          
          // Handle different possible types of booked_by
          if (currentRide.booked_by) {
            if (Array.isArray(currentRide.booked_by)) {
              bookedByArray = [...currentRide.booked_by] as string[];
            } else if (typeof currentRide.booked_by === 'string') {
              try {
                bookedByArray = [currentRide.booked_by as string];
              } catch {
                bookedByArray = [];
              }
            }
          }
          
          // Filter out the user ID from the booked_by array
          const updatedBookedBy = bookedByArray.filter(id => id !== booking.user_id);
          
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
